import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserOrganization } from '../organizations/entities/user-organization.entity';
import { CreateUserDto, Role } from '@turbovets-workspace/data';
import { AuthenticatedUser } from '@turbovets-workspace/auth';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(UserOrganization)
        private userOrganizationsRepository: Repository<UserOrganization>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = this.usersRepository.create({
            ...createUserDto,
            passwordHash,
        });

        return this.usersRepository.save(user);
    }

    async findOne(id: string): Promise<User> {
        return this.usersRepository.findOne({ where: { id } });
    }

    /**
     * Find all users based on user's role:
     * - Super Admin / Global Owner: See all users
     * - Org Owner / Admin: See users in their organizations
     * - Viewer: See users in their organizations (read-only)
     */
    async findAll(currentUser: AuthenticatedUser): Promise<(User & { organizationCount: number })[]> {
        // Super admin or global owner sees all users
        if (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.OWNER) {
            const users = await this.usersRepository.find({
                select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
            });
            return this.addOrganizationCounts(users);
        }

        // Get user's organization IDs from database (not JWT) for fresh data
        const userMemberships = await this.userOrganizationsRepository.find({
            where: { userId: currentUser.id },
            select: ['organizationId']
        });
        const orgIds = userMemberships.map(m => m.organizationId);

        if (orgIds.length === 0) {
            // User has no orgs, return empty
            return [];
        }

        // Get all user IDs that are members of the same organizations
        const memberships = await this.userOrganizationsRepository.find({
            where: { organizationId: In(orgIds) },
            select: ['userId']
        });

        const userIds = [...new Set(memberships.map(m => m.userId))];

        if (userIds.length === 0) {
            return [];
        }

        const users = await this.usersRepository.find({
            where: { id: In(userIds) },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
        });
        return this.addOrganizationCounts(users);
    }

    /**
     * Add organization count to each user from user_organizations table
     */
    private async addOrganizationCounts(users: User[]): Promise<(User & { organizationCount: number })[]> {
        if (users.length === 0) return [];

        const userIds = users.map(u => u.id);

        // Get counts from user_organizations table
        const counts = await this.userOrganizationsRepository
            .createQueryBuilder('uo')
            .select('uo.userId', 'userId')
            .addSelect('COUNT(uo.organizationId)', 'count')
            .where('uo.userId IN (:...userIds)', { userIds })
            .groupBy('uo.userId')
            .getRawMany();

        // Create a map of userId -> count
        const countMap = new Map<string, number>();
        counts.forEach(c => countMap.set(c.userId, parseInt(c.count, 10)));

        // Add organizationCount to each user
        return users.map(user => ({
            ...user,
            organizationCount: countMap.get(user.id) || 0
        }));
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'isActive', 'role']
        });
    }

    async updateRole(id: string, role: string): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        // Cast string to Role enum (validation should be done in DTO/Controller)
        user.role = role as any;
        return this.usersRepository.save(user);
    }

    /**
     * Get all organization memberships for a user
     */
    async getUserOrganizations(userId: string): Promise<Array<{
        organizationId: string;
        organizationName: string;
        role: string;
    }>> {
        const memberships = await this.userOrganizationsRepository.find({
            where: { userId },
            relations: ['organization'],
        });

        return memberships.map(m => ({
            organizationId: m.organizationId,
            organizationName: m.organization?.name || '',
            role: m.role,
        }));
    }
}
