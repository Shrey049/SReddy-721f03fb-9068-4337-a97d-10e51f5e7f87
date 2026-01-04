import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';

export enum OrganizationRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    VIEWER = 'viewer',
}

// NOTE: This entity is kept for potential future use but is no longer actively used
// in the simplified 1:1 user-org model
@Entity('user_organizations')
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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @CreateDateColumn()
    createdAt: Date;
}

