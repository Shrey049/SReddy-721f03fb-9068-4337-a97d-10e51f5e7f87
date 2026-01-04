
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { UserOrganization, OrganizationRole } from './entities/user-organization.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, Role } from '@turbovets-workspace/data';
import { AuthenticatedUser } from '@turbovets-workspace/auth';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>,
        @InjectRepository(UserOrganization)
        private userOrganizationsRepository: Repository<UserOrganization>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Helper: Get user's role in a specific organization (from JWT)
     */
    private getUserOrgRole(user: AuthenticatedUser, orgId: string): OrganizationRole | null {
        const membership = user.organizations?.find(o => o.organizationId === orgId);
        return membership ? membership.role as OrganizationRole : null;
    }

    /**
     * Helper: Get user's role in a specific organization (from database)
     * Use this for operations where the JWT might be stale (e.g., after creating an org)
     */
    private async getUserOrgRoleFromDb(userId: string, orgId: string): Promise<OrganizationRole | null> {
        const membership = await this.userOrganizationsRepository.findOne({
            where: { userId, organizationId: orgId }
        });
        return membership ? membership.role : null;
    }

    /**
     * Helper: Check if user is owner of a specific organization (from JWT)
     */
    private isOrgOwner(user: AuthenticatedUser, orgId: string): boolean {
        return this.getUserOrgRole(user, orgId) === OrganizationRole.OWNER;
    }

    /**
     * Helper: Check if user is owner of a specific organization (from database)
     */
    private async isOrgOwnerFromDb(userId: string, orgId: string): Promise<boolean> {
        const role = await this.getUserOrgRoleFromDb(userId, orgId);
        return role === OrganizationRole.OWNER;
    }

    /**
     * Helper: Check if user is admin of a specific organization
     */
    private isOrgAdmin(user: AuthenticatedUser, orgId: string): boolean {
        return this.getUserOrgRole(user, orgId) === OrganizationRole.ADMIN;
    }

    /**
     * Helper: Check if user is member of a specific organization
     */
    private isOrgMember(user: AuthenticatedUser, orgId: string): boolean {
        return user.organizations?.some(o => o.organizationId === orgId) || false;
    }

    /**
     * Create a new organization
     * - Any authenticated user can create an org and become owner
     */
    async create(createOrganizationDto: CreateOrganizationDto, user: AuthenticatedUser) {
        const org = this.organizationsRepository.create(createOrganizationDto);
        const savedOrg = await this.organizationsRepository.save(org);

        // Add creator as owner of the organization
        const membership = this.userOrganizationsRepository.create({
            userId: user.id,
            organizationId: savedOrg.id,
            role: OrganizationRole.OWNER,
        });
        await this.userOrganizationsRepository.save(membership);

        return savedOrg;
    }

    /**
     * Find all organizations the user has access to
     * - Super Admin sees all organizations
     * - Other users see only organizations they are members of (from database, not JWT)
     */
    async findAll(user: AuthenticatedUser) {
        // Super Admin can see all orgs
        if (user.role === Role.SUPER_ADMIN) {
            return this.organizationsRepository.find();
        }

        // Get user's org IDs from database (not JWT) to get fresh data
        const memberships = await this.userOrganizationsRepository.find({
            where: { userId: user.id },
            select: ['organizationId']
        });

        const orgIds = memberships.map(m => m.organizationId);
        if (orgIds.length === 0) {
            return [];
        }

        return this.organizationsRepository.find({
            where: { id: In(orgIds) }
        });
    }

    /**
     * Find a specific organization by ID with members
     */
    async findOne(id: string) {
        const org = await this.organizationsRepository.findOne({
            where: { id },
            relations: ['userOrganizations', 'userOrganizations.user']
        });
        if (!org) {
            throw new NotFoundException(`Organization #${id} not found`);
        }

        // Transform to include users with roles
        const users = org.userOrganizations?.map(uo => ({
            id: uo.user.id,
            email: uo.user.email,
            firstName: uo.user.firstName,
            lastName: uo.user.lastName,
            role: uo.role,
            isActive: uo.user.isActive,
        })) || [];

        return {
            ...org,
            users,
            userOrganizations: undefined, // Remove raw relation from response
        };
    }

    /**
     * Update organization
     * - Super Admin can update any org
     * - Owner can update their org
     */
    async update(id: string, updateOrganizationDto: UpdateOrganizationDto, user: AuthenticatedUser) {
        if (user.role !== Role.SUPER_ADMIN && !this.isOrgOwner(user, id)) {
            throw new ForbiddenException('Only organization owners can update organizations');
        }

        const org = await this.organizationsRepository.findOne({ where: { id } });
        if (!org) {
            throw new NotFoundException(`Organization #${id} not found`);
        }

        Object.assign(org, updateOrganizationDto);
        return this.organizationsRepository.save(org);
    }

    /**
     * Delete organization
     * - Super Admin can delete any org
     * - Owner can delete their org
     */
    async remove(id: string, user: AuthenticatedUser) {
        // Check JWT first, then fall back to database check (for newly created orgs)
        const isOwner = this.isOrgOwner(user, id) || await this.isOrgOwnerFromDb(user.id, id);
        if (user.role !== Role.SUPER_ADMIN && !isOwner) {
            throw new ForbiddenException('Only organization owners can delete organizations');
        }

        const org = await this.organizationsRepository.findOne({ where: { id } });
        if (!org) {
            throw new NotFoundException(`Organization #${id} not found`);
        }

        // Delete all memberships first (cascade should handle this but being explicit)
        await this.userOrganizationsRepository.delete({ organizationId: id });

        return this.organizationsRepository.remove(org);
    }

    /**
     * Add a member to an organization
     * - Super Admin can add to any org with any role
     * - Owner can add members with any role (owner, admin, viewer)
     * - Admin can add members as admin or viewer (not owner)
     */
    async addMember(orgId: string, userId: string, role: string, currentUser: AuthenticatedUser) {
        // Authorization check
        if (currentUser.role !== Role.SUPER_ADMIN) {
            const userOrgRole = this.getUserOrgRole(currentUser, orgId);

            if (!userOrgRole) {
                throw new ForbiddenException('You are not a member of this organization');
            }

            if (userOrgRole === OrganizationRole.VIEWER) {
                throw new ForbiddenException('Viewers cannot add members');
            }

            // Admin cannot add owners
            if (userOrgRole === OrganizationRole.ADMIN && role === OrganizationRole.OWNER) {
                throw new ForbiddenException('Admins cannot add owners');
            }
        }

        // Validate role
        if (!Object.values(OrganizationRole).includes(role as OrganizationRole)) {
            throw new BadRequestException('Invalid role');
        }

        // Check if organization exists
        const org = await this.organizationsRepository.findOne({ where: { id: orgId } });
        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        // Check if user exists
        const targetUser = await this.usersRepository.findOne({ where: { id: userId } });
        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        // Check if user already is a member of this org
        const existingMembership = await this.userOrganizationsRepository.findOne({
            where: { userId, organizationId: orgId }
        });
        if (existingMembership) {
            throw new BadRequestException('User is already a member of this organization');
        }

        // Create membership
        const membership = this.userOrganizationsRepository.create({
            userId,
            organizationId: orgId,
            role: role as OrganizationRole,
        });
        await this.userOrganizationsRepository.save(membership);

        return { message: 'Member added successfully', userId, orgId, role };
    }

    /**
     * Update a member's role in an organization
     * - Super Admin can update any member
     * - Owner can update any member's role
     * - Admin cannot change roles
     */
    async updateMemberRole(orgId: string, userId: string, role: string, currentUser: AuthenticatedUser) {
        // Authorization check
        if (currentUser.role !== Role.SUPER_ADMIN && !this.isOrgOwner(currentUser, orgId)) {
            throw new ForbiddenException('Only owners can update member roles');
        }

        // Validate role
        if (!Object.values(OrganizationRole).includes(role as OrganizationRole)) {
            throw new BadRequestException('Invalid role');
        }

        const membership = await this.userOrganizationsRepository.findOne({
            where: { userId, organizationId: orgId }
        });
        if (!membership) {
            throw new NotFoundException('User is not a member of this organization');
        }

        // Prevent demoting yourself if you're the only owner
        if (membership.role === OrganizationRole.OWNER && role !== OrganizationRole.OWNER) {
            const ownerCount = await this.userOrganizationsRepository.count({
                where: { organizationId: orgId, role: OrganizationRole.OWNER }
            });
            if (ownerCount === 1 && membership.userId === currentUser.id) {
                throw new BadRequestException('Cannot demote the only owner');
            }
        }

        membership.role = role as OrganizationRole;
        await this.userOrganizationsRepository.save(membership);

        return { message: 'Member role updated successfully', userId, orgId, role };
    }

    /**
     * Remove a member from an organization
     * - Super Admin can remove from any org
     * - Owner can remove any member except themselves if they're the only owner
     * - Admin can remove viewer members
     */
    async removeMember(orgId: string, userId: string, currentUser: AuthenticatedUser) {
        // Authorization check
        const currentUserOrgRole = this.getUserOrgRole(currentUser, orgId);

        if (currentUser.role !== Role.SUPER_ADMIN) {
            if (!currentUserOrgRole || currentUserOrgRole === OrganizationRole.VIEWER) {
                throw new ForbiddenException('Only owners and admins can remove members');
            }
        }

        const membership = await this.userOrganizationsRepository.findOne({
            where: { userId, organizationId: orgId }
        });
        if (!membership) {
            throw new NotFoundException('User is not a member of this organization');
        }

        // Admin can only remove viewers
        if (currentUserOrgRole === OrganizationRole.ADMIN && membership.role !== OrganizationRole.VIEWER) {
            throw new ForbiddenException('Admins can only remove viewer members');
        }

        // Prevent removing yourself if you're the only owner
        if (membership.role === OrganizationRole.OWNER && membership.userId === currentUser.id) {
            const ownerCount = await this.userOrganizationsRepository.count({
                where: { organizationId: orgId, role: OrganizationRole.OWNER }
            });
            if (ownerCount === 1) {
                throw new BadRequestException('Cannot remove the only owner. Transfer ownership first.');
            }
        }

        await this.userOrganizationsRepository.remove(membership);

        return { message: 'Member removed successfully', userId };
    }

    /**
     * Get members of an organization
     * - Super Admin can view any org members
     * - Members can view their own org members
     */
    async getMembers(orgId: string, currentUser: AuthenticatedUser) {
        if (currentUser.role !== Role.SUPER_ADMIN && !this.isOrgMember(currentUser, orgId)) {
            throw new ForbiddenException('You are not a member of this organization');
        }

        const memberships = await this.userOrganizationsRepository.find({
            where: { organizationId: orgId },
            relations: ['user'],
        });

        return memberships.map(m => ({
            id: m.user.id,
            email: m.user.email,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            role: m.role,
            isActive: m.user.isActive,
            joinedAt: m.createdAt,
        }));
    }
}

