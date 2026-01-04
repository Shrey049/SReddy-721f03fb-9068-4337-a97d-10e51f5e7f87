import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';

export enum OrganizationRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    VIEWER = 'viewer',
}

/**
 * UserOrganization - Junction table for User-Organization many-to-many relationship
 * Each user can belong to multiple organizations with different roles per org
 */
@Entity('user_organizations')
@Unique(['userId', 'organizationId']) // A user can only have one membership per organization
export class UserOrganization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    organizationId: string;

    @Column({
        type: 'enum',
        enum: OrganizationRole,
        default: OrganizationRole.VIEWER
    })
    role: OrganizationRole;

    @ManyToOne(() => User, (user) => user.userOrganizations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Organization, (org) => org.userOrganizations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @CreateDateColumn()
    createdAt: Date;
}

