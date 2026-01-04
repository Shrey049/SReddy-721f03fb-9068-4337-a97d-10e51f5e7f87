# Taskbucket Frontend Development Guide

A comprehensive guide for frontend development covering role-based access control, features per user role, and UI implementation guidelines.

---

## Table of Contents

1. [User Roles & Permissions](#user-roles--permissions)
2. [Features by Role](#features-by-role)
3. [UI Components & Routes](#ui-components--routes)
4. [Known Issues to Fix](#known-issues-to-fix)
5. [Implementation Guidelines](#implementation-guidelines)

---

## User Roles & Permissions

The application uses a hierarchical role-based access control system defined in `libs/data/src/lib/enums/role.enum.ts`:

| Role | Level | Description |
|------|-------|-------------|
| **SUPER_ADMIN** | Highest | Platform-level administrator with full system access |
| **OWNER** | High | Organization owner with full org-level control |
| **ADMIN** | Medium | Organization administrator with operational control |
| **VIEWER** | Lowest | Read-only access to assigned resources |

---

## Features by Role

### 🔐 SUPER_ADMIN (super_admin)

**Dashboard Features:**
- ✅ View all organizations across the platform
- ✅ View all users across the platform
- ✅ Promote any user to Owner role
- ✅ Access system-wide audit logs (all logs)
- ✅ View all tasks across all organizations

**Admin Panel Features:**
- ✅ User Management (`/admin/users`) - Full access
- ✅ Audit Log (`/admin/audit`) - All system logs
- ✅ Organization Management - View/manage all orgs

**API Permissions:**
| Endpoint | Method | Access |
|----------|--------|--------|
| `GET /users` | GET | ✅ Full access |
| `PUT /users/:id/role` | PUT | ✅ Can change any user's role |
| `GET /audit-log` | GET | ✅ All logs across platform |
| `GET /organizations` | GET | ✅ All organizations |
| `GET /tasks` | GET | ✅ All tasks |

**UI Elements to Show:**
- [x] User Management link in sidebar
- [x] Audit Log link in sidebar
- [x] Organizations list with all orgs
- [x] "Promote to Owner" button in user table
- [ ] System Settings (TBD)

---

### 👑 OWNER (owner)

**Dashboard Features:**
- ✅ Complete control over their organization
- ✅ Create/Edit/Delete Tasks
- ✅ Create Organizations
- ✅ Add/Remove organization members
- ✅ View audit logs (for their organization)
- ✅ Manage user roles within their organization

**Organization Management Features:**
- ✅ Create new organizations only one if not already owner of one 
- ✅ Update organization details
- ✅ Delete organizations
- ✅ Add members to organization
- ✅ Remove members from organization

**Task Management Features:**
- ✅ Create tasks
- ✅ Update any task in organization
- ✅ Delete any task in organization
- ✅ Change task status (drag & drop)
- ✅ Assign tasks to members

**API Permissions:**
| Endpoint | Method | Access |
|----------|--------|--------|
| `POST /organizations` | POST | ✅ Create new orgs |
| `PATCH /organizations/:id` | PATCH | ✅ Update own org |
| `DELETE /organizations/:id` | DELETE | ✅ Delete own org |
| `POST /organizations/:id/members` | POST | ✅ Add members |
| `DELETE /organizations/:id/members/:userId` | DELETE | ✅ Remove members |
| `POST /tasks` | POST | ✅ Create tasks |
| `PUT /tasks/:id` | PUT | ✅ Update tasks |
| `DELETE /tasks/:id` | DELETE | ✅ Delete tasks |
| `GET /users` | GET | ✅ View users |
| `PUT /users/:id/role` | PUT | ✅ Change roles (within org) |
| `GET /audit-log` | GET | ✅ All logs |

**UI Elements to Show:**
- [x] "Create" button on Task Board
- [x] Delete button on tasks
- [x] "New Organization" button
- [x] Member management options
- [x] Audit Log link in sidebar
- [x] User Management link in sidebar

---

### 🛠️ ADMIN (admin)

**Dashboard Features:**
- ✅ Manage tasks within organization
- ✅ Create/Edit/Delete Tasks
- ✅ Add members to organization
- ✅ View audit logs (organization-scoped)
- ❌ Cannot create organizations
- ❌ Cannot delete organizations
- ❌ Cannot remove members

**Task Management Features:**
- ✅ Create tasks
- ✅ Update tasks
- ✅ Delete tasks
- ✅ Change task status (drag & drop)

**API Permissions:**
| Endpoint | Method | Access |
|----------|--------|--------|
| `POST /tasks` | POST | ✅ Create tasks |
| `PUT /tasks/:id` | PUT | ✅ Update tasks |
| `DELETE /tasks/:id` | DELETE | ✅ Delete tasks |
| `PATCH /tasks/:id/status` | PATCH | ✅ Update status |
| `POST /organizations/:id/members` | POST | ✅ Add members |
| `GET /audit-log` | GET | ✅ Org-scoped logs |
| `GET /organizations` | GET | ✅ View orgs |
| `POST /organizations` | POST | ❌ Forbidden |
| `DELETE /organizations/:id/members/:userId` | DELETE | ❌ Forbidden |

**UI Elements to Show:** ✅ IMPLEMENTED
- [x] "Create" button on Task Board
- [x] Delete button on tasks
- [x] "Add Member" option (but NOT remove)
- [x] Audit Log link in sidebar
- [x] Hide "New Organization" button (HIDDEN for ADMIN)
- [ ] Hide "Remove Member" option - TBD

---

### 👁️ VIEWER (viewer)

**Dashboard Features:**
- ✅ View tasks assigned to them
- ✅ Update task status (move between columns)
- ✅ View organization details
- ❌ Cannot create tasks
- ❌ Cannot delete tasks
- ❌ Cannot access audit logs
- ❌ Cannot manage users
- ❌ Cannot manage organizations

**API Permissions:**
| Endpoint | Method | Access |
|----------|--------|--------|
| `GET /tasks` | GET | ✅ View tasks |
| `GET /tasks/:id` | GET | ✅ View single task |
| `PUT /tasks/:id` | PUT | ✅ Update own tasks |
| `PATCH /tasks/:id/status` | PATCH | ✅ Update status |
| `GET /organizations` | GET | ✅ View orgs |
| `POST /tasks` | POST | ❌ Forbidden |
| `DELETE /tasks/:id` | DELETE | ❌ Forbidden |
| `GET /audit-log` | GET | ❌ Forbidden (403) |
| `GET /users` | GET | ❌ Forbidden |

**UI Elements to HIDE:** ✅ IMPLEMENTED
- [x] "Create" button on Task Board (HIDDEN)
- [x] Delete button on tasks (HIDDEN)
- [x] "New Organization" button (HIDDEN)
- [ ] Member management options (HIDE) - TBD
- [x] Audit Log link in sidebar (HIDDEN)
- [x] User Management link in sidebar (HIDDEN)

---

## UI Components & Routes

### Current Routes Structure

```
/                           → Landing Page (public)
/auth/login                 → Login Page (public)
/auth/register              → Register Page (public)

--- AUTHENTICATED ROUTES (requires authGuard) ---

/dashboard                  → Main Dashboard (Task Board)
/dashboard/organizations    → Organization List
/dashboard/organizations/:id → Organization Detail
/admin/audit                → Audit Log (SUPER_ADMIN, OWNER, ADMIN)
/admin/users                → User Management (SUPER_ADMIN, OWNER)
```

### Role-Based Route Protection

Routes should be protected based on user role:

```typescript
// Recommended route guard implementation
const roleRoutes = {
  '/admin/users': [Role.SUPER_ADMIN, Role.OWNER],
  '/admin/audit': [Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN],
  '/dashboard/organizations': [Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN, Role.VIEWER],
};
```

---

## Known Issues - RESOLVED ✅

### 🐛 Critical Issues - FIXED

1. **Multiple Create Buttons** ✅ FIXED
   - Added role-based visibility with `PermissionService.canCreateTask()`
   - Create button only shows for OWNER and ADMIN roles

2. **API Called on Double Click** ✅ FIXED
   - Added `isCreating`, `deletingTaskId`, `promotingUserId` flags
   - All action buttons now disabled during API calls
   - Prevent function execution if already in progress

3. **Broken Functionality** ✅ FIXED
   - Added loading states to all components
   - Improved error handling in API calls

### 🔧 UI Improvements - COMPLETED

| Issue | Component | Status |
|-------|-----------|--------|
| Role-based button visibility | TaskBoardComponent | ✅ Done |
| Role-based sidebar links | SidebarComponent | ✅ Done |
| Role-based create button | OrganizationListComponent | ✅ Done |
| Loading states | All components | ✅ Done |
| Error handling UI | All components | ✅ Done |
| Empty state designs | All list components | ✅ Done |

---

## Implementation Guidelines

### 1. Role-Based UI Control

Create a utility service to check permissions:

```typescript
// core/services/permission.service.ts
@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private authService: AuthService) {}

  canCreateTask(): boolean {
    const user = this.authService.currentUser$.value;
    return [Role.OWNER, Role.ADMIN].includes(user?.role);
  }

  canDeleteTask(): boolean {
    const user = this.authService.currentUser$.value;
    return [Role.OWNER, Role.ADMIN].includes(user?.role);
  }

  canCreateOrganization(): boolean {
    const user = this.authService.currentUser$.value;
    return user?.role === Role.OWNER;
  }

  canManageUsers(): boolean {
    const user = this.authService.currentUser$.value;
    return [Role.SUPER_ADMIN, Role.OWNER].includes(user?.role);
  }

  canViewAuditLog(): boolean {
    const user = this.authService.currentUser$.value;
    return [Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN].includes(user?.role);
  }
}
```

### 2. Conditional UI Rendering

```html
<!-- Example: Hide Create button for viewers -->
<button *ngIf="permissionService.canCreateTask()" (click)="openCreateDialog()">
  Create
</button>

<!-- Example: Hide Delete button for viewers -->
<button *ngIf="permissionService.canDeleteTask()" (click)="deleteTask(task.id)">
  Delete
</button>
```

### 3. Sidebar Role-Based Links

```typescript
// sidebar.component.ts
navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '...', roles: ['all'] },
  { path: '/dashboard/organizations', label: 'Organizations', icon: '...', roles: ['all'] },
  { path: '/admin/users', label: 'Users', icon: '...', roles: [Role.SUPER_ADMIN, Role.OWNER] },
  { path: '/admin/audit', label: 'Audit Log', icon: '...', roles: [Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN] },
];

isVisible(item: NavItem): boolean {
  if (item.roles.includes('all')) return true;
  return item.roles.includes(this.currentUser?.role);
}
```

### 4. Prevent Double-Click API Calls

```typescript
// Add debounce to button handlers
import { debounceTime, Subject } from 'rxjs';

private createClick$ = new Subject<void>();

ngOnInit() {
  this.createClick$.pipe(
    debounceTime(300)
  ).subscribe(() => {
    this.performCreate();
  });
}

onCreateClick() {
  this.createClick$.next();
}
```

Or use a loading flag:

```typescript
isCreating = false;

async createTask() {
  if (this.isCreating) return;
  this.isCreating = true;
  
  try {
    await this.tasksService.create(this.taskData).toPromise();
  } finally {
    this.isCreating = false;
  }
}
```

---

## Quick Reference: Role Permissions Matrix

| Feature | SUPER_ADMIN | OWNER | ADMIN | VIEWER |
|---------|-------------|-------|-------|--------|
| View Tasks | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ✅ |
| View Organizations | ✅ | ✅ | ✅ | ✅ |
| Create Organizations | ✅ | ✅ | ❌ | ❌ |
| Delete Organizations | ✅ | ✅ | ❌ | ❌ |
| Add Members | ✅ | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ | ❌ | ❌ |
| View Audit Log | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ✅ | ❌ | ❌ |
| Promote Users | ✅ | ❌ | ❌ | ❌ |

---

## File Structure Overview

```
apps/dashboard/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts        # Authentication guard
│   ├── interceptors/            # HTTP interceptors
│   └── services/
│       ├── auth.service.ts      # Authentication service
│       ├── tasks.service.ts     # Task API service
│       ├── organization.service.ts
│       ├── users.service.ts
│       └── audit.service.ts
├── features/
│   ├── admin/
│   │   ├── audit-log/           # Audit log component
│   │   └── user-management/     # User management component
│   ├── auth/
│   │   ├── login.component.ts
│   │   └── register.component.ts
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   ├── task-board/          # Kanban board
│   │   ├── task-modal/          # Task create/edit dialog
│   │   ├── organization-list/
│   │   └── organization-detail/
│   └── landing/
│       └── home.component.ts    # Public landing page
├── layout/
│   ├── layout.component.ts      # Main app layout
│   ├── navbar.component.ts
│   └── sidebar.component.ts
└── shared/                      # Shared modules/components
```

---

## Implementation Status ✅

1. [x] Create `PermissionService` for centralized role checking
2. [x] Update all components to use role-based visibility
3. [x] Fix double-click API issue with loading flags
4. [ ] Add route guards for admin routes (future enhancement)
5. [x] Update sidebar with role-based navigation
6. [x] Add loading states and error handling
7. [ ] Test all role scenarios end-to-end

---

*Last Updated: January 4, 2026*
