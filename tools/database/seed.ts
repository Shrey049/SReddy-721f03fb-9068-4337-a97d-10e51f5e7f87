import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../apps/api/src/users/entities/user.entity';
import { Organization } from '../../apps/api/src/organizations/entities/organization.entity';
import { UserOrganization, OrganizationRole } from '../../apps/api/src/organizations/entities/user-organization.entity';
import { Task, TaskStatus, TaskPriority } from '../../apps/api/src/tasks/entities/task.entity';
import { AuditLog } from '../../apps/api/src/audit/entities/audit-log.entity';
import { Role } from '../../libs/data/src/lib/enums/role.enum';

// Load env vars if not loaded automatically (dotenv might be needed if running standalone)
// Assuming running with some env loader or defaults.

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'turbovets',
    entities: [User, Organization, UserOrganization, Task, AuditLog],
    synchronize: true, // Auto-create tables for seed
});

async function seed() {
    await dataSource.initialize();
    console.log('Database connected.');

    const userRepo = dataSource.getRepository(User);
    const orgRepo = dataSource.getRepository(Organization);
    const userOrgRepo = dataSource.getRepository(UserOrganization);
    const taskRepo = dataSource.getRepository(Task);

    // Clear existing data (optional, or check if exists)
    // await taskRepo.delete({}); // Careful with foreign keys
    // ...

    // 1. Create Organizations
    console.log('Seeding Organizations...');
    const rootOrg = orgRepo.create({ name: 'TurboVets HQ' });
    await orgRepo.save(rootOrg);

    const deptA = orgRepo.create({ name: 'Benefits Team', parent: rootOrg });
    const deptB = orgRepo.create({ name: 'Claims Team', parent: rootOrg });
    await orgRepo.save([deptA, deptB]);

    // 2. Create Users
    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash('SecurePass123!', salt);
    const superAdminPasswordHash = await bcrypt.hash('Password123!', salt);

    // Create Super Admin user (for testing and admin purposes)
    const superAdmin = userRepo.create({
        email: 'super-admin@dev.co',
        passwordHash: superAdminPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: Role.SUPER_ADMIN,
    });
    await userRepo.save(superAdmin);

    const owner = userRepo.create({
        email: 'owner@turbovets.com',
        passwordHash,
        firstName: 'Owner',
        lastName: 'User',
        role: Role.OWNER,
    });

    const adminA = userRepo.create({
        email: 'admin.a@turbovets.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'Alpha',
        role: Role.ADMIN,
    });

    const viewerA = userRepo.create({
        email: 'viewer.a@turbovets.com',
        passwordHash,
        firstName: 'Viewer',
        lastName: 'Alice',
        role: Role.VIEWER,
    });

    await userRepo.save([owner, adminA, viewerA]);

    // 3. Assign Roles
    console.log('Assigning Roles...');
    await userOrgRepo.save([
        { user: owner, organization: rootOrg, role: OrganizationRole.OWNER },
        { user: adminA, organization: deptA, role: OrganizationRole.ADMIN },
        { user: viewerA, organization: deptA, role: OrganizationRole.VIEWER },
    ]);

    // 4. Create Tasks
    console.log('Seeding Tasks...');
    await taskRepo.save([
        {
            title: 'Review Quarterly Budget',
            description: 'Review the Q1 financial reports.',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            organization: rootOrg,
            createdBy: owner,
            assignedTo: owner, // Self assigned
        },
        {
            title: 'Approve Benefits Package',
            description: 'Finalize the 2026 benefits.',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.URGENT,
            organization: deptA,
            createdBy: adminA,
            assignedTo: viewerA,
        },
        {
            title: 'Update Claim Policy',
            description: 'Draft new policy for pet insurance.',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            organization: deptB, // AdminA shouldn't see this one if logic works (he is in DeptA)
            createdBy: owner,
        }
    ]);

    console.log('Seeding complete.');
    await dataSource.destroy();
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
