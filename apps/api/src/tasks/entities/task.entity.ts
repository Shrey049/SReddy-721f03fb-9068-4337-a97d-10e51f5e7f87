import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.TODO
    })
    status: TaskStatus;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM
    })
    priority: TaskPriority;

    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date;

    @Column()
    organizationId: string;

    @Column()
    createdById: string;

    @Column({ nullable: true })
    assignedToId: string;

    @ManyToOne(() => Organization, (org) => org.tasks)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @ManyToOne(() => User, (user) => user.createdTasks)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
    @JoinColumn({ name: 'assignedToId' })
    assignedTo: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
