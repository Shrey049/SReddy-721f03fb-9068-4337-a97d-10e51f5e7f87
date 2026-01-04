import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
}

export enum ResourceType {
    TASK = 'task',
    USER = 'user',
    ORGANIZATION = 'organization',
}

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Column({
        type: 'enum',
        enum: ResourceType,
    })
    resourceType: ResourceType;

    @Column()
    resourceId: string;

    @Column({ type: 'jsonb', nullable: true })
    details: any;

    @Column({ nullable: true })
    ipAddress: string;

    @ManyToOne(() => User, (user) => user.auditLogs)
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
