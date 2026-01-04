import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserOrganization } from '../../organizations/entities/user-organization.entity';
import { Task } from '../../tasks/entities/task.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { Role } from '@turbovets-workspace/data';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false }) // Don't return password by default
    passwordHash: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.VIEWER
    })
    role: Role;  // Global role: super_admin or viewer (default for new users)

    // User-Organization memberships (many-to-many through UserOrganization)
    @OneToMany(() => UserOrganization, (userOrg) => userOrg.user)
    userOrganizations: UserOrganization[];

    @OneToMany(() => Task, (task) => task.createdBy)
    createdTasks: Task[];

    @OneToMany(() => Task, (task) => task.assignedTo)
    assignedTasks: Task[];

    @OneToMany(() => AuditLog, (log) => log.user)
    auditLogs: AuditLog[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

