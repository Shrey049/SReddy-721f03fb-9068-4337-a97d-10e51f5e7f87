# 🚀 TurboVets - Secure Task Management System

A full-stack task management system with role-based access control (RBAC) built using an NX monorepo architecture. The system enables users to manage tasks securely, with authorization based on their roles and organizational hierarchy.

---

## 📺 Demo Video



https://github.com/user-attachments/assets/0d924922-28e0-4bdc-974b-dd9292568666



---

## 📑 Table of Contents

- [🚀 TurboVets - Secure Task Management System](#-turbovets---secure-task-management-system)
  - [📺 Demo Video](#-demo-video)
  - [📑 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠️ Setup Instructions](#️-setup-instructions)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
    - [Running the Applications](#running-the-applications)
  - [🏗️ Architecture Overview](#️-architecture-overview)
    - [NX Monorepo Structure](#nx-monorepo-structure)
    - [Shared Libraries](#shared-libraries)
  - [📊 Data Model](#-data-model)
    - [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
    - [Schema Description](#schema-description)
  - [🔐 Access Control Implementation](#-access-control-implementation)
    - [Roles \& Permissions](#roles--permissions)
    - [Role Hierarchy](#role-hierarchy)
    - [JWT Authentication Integration](#jwt-authentication-integration)
    - [Organization-Level Role Inheritance](#organization-level-role-inheritance)
  - [📡 API Documentation](#-api-documentation)
    - [Authentication Endpoints](#authentication-endpoints)
    - [Task Endpoints](#task-endpoints)
    - [Organization Endpoints](#organization-endpoints)
    - [User Endpoints](#user-endpoints)
    - [Audit Log Endpoints](#audit-log-endpoints)
  - [🧪 Testing Strategy](#-testing-strategy)
  - [🎁 Bonus Features](#-bonus-features)
  - [🔮 Future Considerations](#-future-considerations)
  - [📜 License](#-license)

---

## ✨ Features

### Backend (NestJS + TypeORM + PostgreSQL)

- ✅ JWT-based authentication (register, login, token verification)
- ✅ Role-based access control (RBAC) with 4 roles: Super Admin, Owner, Admin, Viewer
- ✅ Organization hierarchy with role inheritance
- ✅ Task management with organization scoping
- ✅ Audit logging for all CRUD operations
- ✅ Custom decorators and guards for access control

### Frontend (Angular + TailwindCSS)

- ✅ Responsive task management dashboard
- ✅ Drag-and-drop for task reordering and status changes
- ✅ Role-based UI elements (conditional rendering)
- ✅ Organization management interface
- ✅ User management for admins
- ✅ Audit log viewer
- ✅ Dark/Light mode toggle
- ✅ Mobile-first responsive design

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x or **yarn** >= 1.22.x
- **PostgreSQL** >= 14.x
- **NX CLI** (optional, can use `npx nx`)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd turbovets-workspace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root of `turbovets-workspace`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=turbovets

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d

# Application
NODE_ENV=development
PORT=3000
```

### Database Setup

1. **Create the PostgreSQL database:**

   ```bash
   createdb turbovets
   ```

2. **Run the seed script (optional - creates demo data):**

   ```bash
   npx ts-node tools/database/seed.ts
   ```

   This creates the following test accounts:
   | Email | Password | Role |
   |-------|----------|------|
   | `super-admin@dev.co` | `Password123!` | Super Admin |
   | `owner@turbovets.com` | `SecurePass123!` | Owner |
   | `admin.a@turbovets.com` | `SecurePass123!` | Admin |
   | `viewer.a@turbovets.com` | `SecurePass123!` | Viewer |

### Running the Applications

**Start the backend API:**

```bash
npx nx serve api
```

Backend runs at: `http://localhost:3000/api`

**Start the frontend dashboard:**

```bash
npx nx serve dashboard
```

Frontend runs at: `http://localhost:4200`

**Run both in parallel:**

```bash
npx nx run-many -t serve -p api dashboard
```

---

## 🏗️ Architecture Overview

### NX Monorepo Structure

```
turbovets-workspace/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   └── src/
│   │       ├── auth/           # JWT authentication module
│   │       ├── users/          # User management module
│   │       ├── organizations/  # Organization management module
│   │       ├── tasks/          # Task management module
│   │       └── audit/          # Audit logging module
│   │
│   ├── api-e2e/                # Backend E2E tests
│   │
│   ├── dashboard/              # Angular Frontend Application
│   │   └── src/app/
│   │       ├── core/           # Core services (auth, API)
│   │       ├── features/       # Feature modules (dashboard, auth, admin)
│   │       ├── layout/         # Layout components (sidebar, header)
│   │       └── shared/         # Shared components & utilities
│   │
│   └── dashboard-e2e/          # Frontend E2E tests (Playwright)
│
├── libs/
│   ├── data/                   # Shared TypeScript interfaces & DTOs
│   │   └── src/lib/
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── enums/          # Shared enumerations (Role, TaskStatus, etc.)
│   │       └── interfaces/     # TypeScript interfaces
│   │
│   └── auth/                   # Reusable RBAC logic
│       └── src/lib/
│           ├── decorators/     # Custom decorators (@Roles, @CurrentUser)
│           ├── guards/         # Authorization guards (RolesGuard)
│           └── interfaces/     # Auth interfaces
│
├── tools/
│   └── database/
│       └── seed.ts             # Database seeding script
│
└── docs/
    └── FRONTEND_GUIDE.md       # Frontend development documentation
```

### Shared Libraries

| Library                     | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `@turbovets-workspace/data` | Shared DTOs, interfaces, and enums used across frontend and backend |
| `@turbovets-workspace/auth` | Reusable authentication decorators, guards, and RBAC utilities      |

**Why this structure?**

- **Separation of Concerns:** Each module handles a specific domain
- **Code Reuse:** Shared libraries prevent duplication between frontend and backend
- **Scalability:** Easy to add new apps or libraries without affecting existing code
- **Type Safety:** Shared TypeScript interfaces ensure type consistency

---

## 📊 Data Model

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
│      Users      │       │    UserOrganizations   │       │  Organizations  │
├─────────────────┤       ├────────────────────────┤       ├─────────────────┤
│ id (PK, UUID)   │───┐   │ id (PK, UUID)          │   ┌───│ id (PK, UUID)   │
│ email (unique)  │   │   │ userId (FK)            │───┘   │ name            │
│ passwordHash    │   └──>│ organizationId (FK)    │<──────│ createdAt       │
│ firstName       │       │ role (enum)            │       │ updatedAt       │
│ lastName        │       │ createdAt              │       └─────────────────┘
│ isActive        │       └────────────────────────┘               │
│ role (enum)     │                                                │
│ createdAt       │                                                │
│ updatedAt       │                                                │
└─────────────────┘                                                │
        │                                                          │
        │                    ┌─────────────────┐                   │
        │                    │      Tasks      │                   │
        │                    ├─────────────────┤                   │
        │                    │ id (PK, UUID)   │                   │
        └───────────────────>│ title           │                   │
        │ (createdById,      │ description     │<──────────────────┘
        │  assignedToId)     │ status (enum)   │     (organizationId)
        │                    │ priority (enum) │
        │                    │ dueDate         │
        │                    │ organizationId  │
        │                    │ createdById     │
        │                    │ assignedToId    │
        │                    │ createdAt       │
        │                    │ updatedAt       │
        │                    └─────────────────┘
        │
        │                    ┌─────────────────┐
        │                    │   AuditLogs     │
        │                    ├─────────────────┤
        └───────────────────>│ id (PK, UUID)   │
             (userId)        │ userId (FK)     │
                             │ action (enum)   │
                             │ resourceType    │
                             │ resourceId      │
                             │ details (JSON)  │
                             │ ipAddress       │
                             │ createdAt       │
                             └─────────────────┘
```

### Schema Description

| Entity                | Description                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Users**             | System users with global role (super_admin or viewer as default). Password is hashed with bcrypt.                         |
| **Organizations**     | Represent teams or departments. Tasks are scoped to organizations.                                                        |
| **UserOrganizations** | Junction table for many-to-many relationship. Each user can have different roles per organization (owner, admin, viewer). |
| **Tasks**             | Work items with status, priority, and due dates. Scoped to organizations and can be assigned to users.                    |
| **AuditLogs**         | Tracks all CRUD operations with user, action type, affected resource, and timestamp.                                      |

**Enums:**

| Enum               | Values                                        |
| ------------------ | --------------------------------------------- |
| `Role` (Global)    | `super_admin`, `owner`, `admin`, `viewer`     |
| `OrganizationRole` | `owner`, `admin`, `viewer`                    |
| `TaskStatus`       | `todo`, `in_progress`, `done`                 |
| `TaskPriority`     | `low`, `medium`, `high`, `urgent`             |
| `AuditAction`      | `create`, `read`, `update`, `delete`, `login` |

---

## 🔐 Access Control Implementation

### Roles & Permissions

| Role            | Scope        | Permissions                                                                                            |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| **Super Admin** | System-wide  | Full access to all resources, can promote users to Owner, system maintenance                           |
| **Owner**       | Organization | Full control over their organization - manage members, create/edit/delete tasks, view audit logs       |
| **Admin**       | Organization | Create/edit/delete tasks, add members, view org-scoped audit logs, cannot remove members or delete org |
| **Viewer**      | Personal     | Read-only access to assigned tasks, can update task status only                                        |

### Role Hierarchy

```
Super Admin (System Level)
    │
    └── Can manage ALL organizations and users

Owner (Organization Level)
    │
    ├── Full control over organization
    ├── Can add/remove members
    └── Can delegate Admin role

Admin (Organization Level)
    │
    ├── Task management
    ├── Can add members (not remove)
    └── View audit logs (org-scoped)

Viewer (Task Level)
    │
    └── View and update status of assigned tasks only
```

### JWT Authentication Integration

1. **Registration:** User registers → password hashed with bcrypt → JWT token issued
2. **Login:** User logs in → credentials verified → JWT token with user info (id, email, role, organizations)
3. **Protected Routes:** All API endpoints (except `/auth/*`) require valid JWT in `Authorization: Bearer <token>` header
4. **Guards:**
   - `JwtAuthGuard`: Validates JWT token and attaches user to request
   - `RolesGuard`: Checks if user has required role for the endpoint

### Organization-Level Role Inheritance

Users can belong to multiple organizations with different roles per org:

```typescript
// User's JWT payload includes organization memberships
{
  id: "uuid",
  email: "user@example.com",
  role: "viewer",           // Global role
  organizations: [
    { organizationId: "org-1", role: "owner" },
    { organizationId: "org-2", role: "admin" },
    { organizationId: "org-3", role: "viewer" }
  ]
}
```

**Access Control Logic:**

- When accessing a resource, the system checks both global role AND organization-level role
- Super Admin bypasses all organization checks
- Organization-scoped operations check the user's role within that specific organization

---

## 📡 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication Endpoints

#### Register a new user

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "organizations": [{ "organizationId": "org-uuid", "role": "admin" }]
  }
}
```

#### Get Current User Profile

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "viewer",
  "organizations": []
}
```

---

### Task Endpoints

#### Create Task

```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete documentation",
  "description": "Write comprehensive README",
  "organizationId": "org-uuid",
  "priority": "high",
  "dueDate": "2026-01-15T00:00:00Z",
  "assignedToId": "user-uuid"
}
```

**Response (201 Created):**

```json
{
  "id": "task-uuid",
  "title": "Complete documentation",
  "description": "Write comprehensive README",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-01-15T00:00:00.000Z",
  "organizationId": "org-uuid",
  "createdById": "creator-uuid",
  "assignedToId": "user-uuid",
  "createdAt": "2026-01-04T12:00:00.000Z",
  "updatedAt": "2026-01-04T12:00:00.000Z"
}
```

#### List Tasks (with filters)

```http
GET /tasks?status=todo&priority=high&organizationId=org-uuid
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
[
  {
    "id": "task-uuid",
    "title": "Task 1",
    "status": "todo",
    "priority": "high",
    "assignedTo": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdBy": {
      "id": "creator-uuid",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
]
```

#### Get Single Task

```http
GET /tasks/:id
Authorization: Bearer <token>
```

#### Update Task

```http
PUT /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "urgent"
}
```

#### Update Task Status

```http
PATCH /tasks/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### Delete Task

```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{ "message": "Task deleted successfully" }
```

---

### Organization Endpoints

#### Create Organization (Owner/Super Admin only)

```http
POST /organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering Team"
}
```

#### List Organizations

```http
GET /organizations
Authorization: Bearer <token>
```

#### Get Organization Details

```http
GET /organizations/:id
Authorization: Bearer <token>
```

#### Update Organization

```http
PATCH /organizations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Name"
}
```

#### Delete Organization

```http
DELETE /organizations/:id
Authorization: Bearer <token>
```

#### Get Organization Members

```http
GET /organizations/:id/members
Authorization: Bearer <token>
```

#### Add Member to Organization

```http
POST /organizations/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "role": "admin"
}
```

#### Update Member Role

```http
PUT /organizations/:id/members/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "viewer"
}
```

#### Remove Member from Organization

```http
DELETE /organizations/:id/members/:userId
Authorization: Bearer <token>
```

---

### User Endpoints

#### List Users (Admin/Owner/Super Admin)

```http
GET /users
Authorization: Bearer <token>
```

#### Update User Role (Super Admin/Owner only)

```http
PUT /users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "owner"
}
```

---

### Audit Log Endpoints

#### Get Audit Logs (Admin/Owner/Super Admin)

```http
GET /audit-log?page=1&pageSize=20&action=create&resourceType=task
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20, max: 100) |
| `action` | string | Filter by action: create, read, update, delete, login |
| `resourceType` | string | Filter by resource: task, user, organization |
| `userId` | string | Filter by user who performed action |
| `startDate` | string | ISO date string for range start |
| `endDate` | string | ISO date string for range end |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "log-uuid",
      "userId": "user-uuid",
      "action": "create",
      "resourceType": "task",
      "resourceId": "task-uuid",
      "details": { "title": "New Task" },
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-01-04T12:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

---

## 🧪 Testing Strategy

### Backend Tests (Jest)

```bash
# Run all backend tests
npx nx test api

# Run E2E tests
npx nx e2e api-e2e
```

**Test Coverage:**

- **Authentication:** Registration, login, JWT validation
- **RBAC Logic:** Role-based access for all endpoints
- **Task Operations:** CRUD with permission checks
- **Organization Management:** Member management, role assignment
- **Audit Logging:** Log creation and retrieval

### Frontend Tests (Jest/Karma)

```bash
# Run frontend unit tests
npx nx test dashboard

# Run E2E tests (Playwright)
npx nx e2e dashboard-e2e
```

**Test Coverage:**

- **Components:** Task board, organization management, user management
- **Services:** API service, auth service, state management
- **Guards:** Auth guards, role-based route protection

---

## 🎁 Bonus Features

- ✅ **Dark/Light Mode Toggle:** System-wide theme switching with persistent preference
- ✅ **Drag-and-Drop:** Intuitive task reordering and status changes
- ✅ **Responsive Design:** Mobile-first approach, works on all screen sizes
- ✅ **Audit Logging:** Complete audit trail for compliance
- 🔄 **Task Completion Visualization:** (In Progress)
- 🔄 **Keyboard Shortcuts:** (Planned)

---

## 🔮 Future Considerations

### Security Enhancements

- **JWT Refresh Tokens:** Implement token rotation for better security
- **CSRF Protection:** Add CSRF tokens for state-changing requests
- **Rate Limiting:** Prevent brute force attacks
- **Password Policies:** Enforce strong password requirements

### Scalability Improvements

- **RBAC Caching:** Cache permission checks with Redis
- **Database Indexing:** Optimize queries for large datasets
- **Microservices:** Split into separate services for audit, auth, etc.

### Feature Additions

- **Advanced Role Delegation:** Allow Owners to create custom roles
- **Task Templates:** Reusable task templates for common workflows
- **Notifications:** Email and in-app notifications
- **File Attachments:** Allow attaching files to tasks
- **Comments:** Task comments and mentions
- **Time Tracking:** Track time spent on tasks

---

## 📜 License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Built with ❤️ using NX, NestJS, Angular, and TailwindCSS**
