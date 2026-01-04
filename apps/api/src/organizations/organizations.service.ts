
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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

    async create(createOrganizationDto: CreateOrganizationDto, user: AuthenticatedUser) {
        // Only Owner or Super Admin can create organizations
        if (user.role !== Role.OWNER && user.role !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Only Owners and Super Admins can create organizations');
        }

        const org = this.organizationsRepository.create(createOrganizationDto);
        const savedOrg = await this.organizationsRepository.save(org);

        // Simplified: set creator's organizationId and role directly on User
        await this.usersRepository.update(user.id, {
            organizationId: savedOrg.id,
            role: Role.OWNER,
        });

        return savedOrg;
    }

    async findAll(user: AuthenticatedUser) {
        // Super Admin and Owner can see all orgs
        if (user.role === Role.OWNER || user.role === Role.SUPER_ADMIN) {
            return this.organizationsRepository.find();
        }

        // Others see only their own org
        if (user.organizationId) {
            return this.organizationsRepository.find({
                where: { id: user.organizationId }
            });
        }

        return [];
    }

    async findOne(id: string) {
        const org = await this.organizationsRepository.findOne({
            where: { id },
            relations: ['users']
        });
        if (!org) {
            throw new NotFoundException(`Organization #${id} not found`);
        }
        return org;
    }

    async update(id: string, updateOrganizationDto: UpdateOrganizationDto, user: AuthenticatedUser) {
        if (user.role !== Role.OWNER && user.role !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Only Owners can update organizations');
        }

        const org = await this.findOne(id);
        Object.assign(org, updateOrganizationDto);
        return this.organizationsRepository.save(org);
    }

    async remove(id: string, user: AuthenticatedUser) {
        if (user.role !== Role.OWNER && user.role !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Only Owners can delete organizations');
        }

        const org = await this.findOne(id);

        // Clear organizationId from all users in this org before deleting
        await this.usersRepository.update(
            { organizationId: id },
            { organizationId: null as any, role: Role.VIEWER }
        );

        return this.organizationsRepository.remove(org);
    }

    async addMember(orgId: string, userId: string, role: string, currentUser: AuthenticatedUser) {
        // Only Owner or Admin of the org can add members
        if (currentUser.role !== Role.OWNER && currentUser.role !== Role.SUPER_ADMIN) {
            // For Admins, they can only add to their own org
            if (currentUser.role !== Role.ADMIN || currentUser.organizationId !== orgId) {
                throw new ForbiddenException('You do not have permission to add members to this organization');
            }
        }

        // Check if user exists
        const targetUser = await this.usersRepository.findOne({ where: { id: userId } });
        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        // Check if user already belongs to an org
        if (targetUser.organizationId) {
            throw new BadRequestException('User already belongs to an organization');
        }

        // Simplified: set user's organizationId and role directly
        await this.usersRepository.update(userId, {
            organizationId: orgId,
            role: role as any,
        });

        return { message: 'Member added successfully', userId, orgId, role };
    }

    async removeMember(orgId: string, userId: string, currentUser: AuthenticatedUser) {
        if (currentUser.role !== Role.OWNER && currentUser.role !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Only Owners can remove members');
        }

        const targetUser = await this.usersRepository.findOne({ where: { id: userId } });
        if (!targetUser || targetUser.organizationId !== orgId) {
            throw new NotFoundException('User is not a member of this organization');
        }

        // Clear user's organizationId and reset role to viewer
        await this.usersRepository.update(userId, {
            organizationId: null,
            role: Role.VIEWER,
        });

        return { message: 'Member removed successfully', userId };
    }
}

