
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { IUser, IOrganization, Role } from '@turbovets-workspace/data';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Users</h1>
          <p class="text-sm text-gray-500 mt-1">{{ filteredUsers.length }} of {{ users.length }} users</p>
        </div>
        
        <!-- Filters and Actions -->
        <div class="flex items-center gap-3">
          <!-- Role Filter -->
          <select [(ngModel)]="selectedRole" 
                  (change)="applyFilters()" 
                  class="block w-40 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 border">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          
          <!-- Org Filter -->
          <select [(ngModel)]="selectedOrgId" 
                  (change)="applyFilters()" 
                  class="block w-48 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 border">
            <option value="">All Organizations</option>
            <option *ngFor="let org of organizations" [value]="org.id">{{ org.name }}</option>
          </select>
          
          <!-- Refresh Button -->
          <button (click)="loadUsers()" 
                  [disabled]="isLoading"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
            <svg [class.animate-spin]="isLoading" class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-500">Loading users...</p>
        </div>
      </div>

      <!-- Users Table -->
      <div *ngIf="!isLoading" class="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizations</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold"
                         [ngClass]="{
                           'bg-purple-100 text-purple-600': user.role === 'super_admin',
                           'bg-blue-100 text-blue-600': user.role === 'owner',
                           'bg-green-100 text-green-600': user.role === 'admin',
                           'bg-gray-100 text-gray-600': user.role === 'viewer'
                         }">
                      {{ user.firstName.charAt(0) || '?' }}{{ user.lastName.charAt(0) || '' }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="h-6 w-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                      {{ user.organizationCount || 0 }}
                    </div>
                    <span class="text-sm text-gray-600">{{ (user.organizationCount || 0) === 1 ? 'org' : 'orgs' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                        [ngClass]="{
                          'bg-purple-100 text-purple-700': user.role === 'super_admin',
                          'bg-blue-100 text-blue-700': user.role === 'owner',
                          'bg-green-100 text-green-700': user.role === 'admin',
                          'bg-gray-100 text-gray-700': user.role === 'viewer'
                        }">
                    {{ formatRole(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                        [ngClass]="user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button *ngIf="canPromote(user)" 
                          (click)="promoteToOwner(user)"
                          [disabled]="promotingUserId === user.id"
                          class="text-blue-600 hover:text-blue-900 disabled:opacity-50 inline-flex items-center gap-1">
                    <svg *ngIf="promotingUserId === user.id" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ promotingUserId === user.id ? 'Promoting...' : 'Promote to Owner' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredUsers.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="text-sm font-medium text-gray-900">No users found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ selectedRole || selectedOrgId ? 'Try adjusting your filters.' : 'Users will appear here once they register.' }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  organizations: IOrganization[] = [];
  orgMap: Map<string, string> = new Map();
  currentUser: any;
  isLoading = true;
  promotingUserId: string | null = null;
  selectedRole = '';
  selectedOrgId = '';

  constructor(
    private usersService: UsersService,
    private orgService: OrganizationService,
    private authService: AuthService,
    public permissionService: PermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadOrganizations();
    this.loadUsers();
  }

  loadOrganizations() {
    this.orgService.findAll().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.orgMap = new Map(orgs.map(o => [o.id, o.name]));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load orgs:', err)
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.usersService.findAll().subscribe({
      next: (users: IUser[]) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      if (this.selectedRole && user.role !== this.selectedRole) return false;
      if (this.selectedOrgId && !user.organizations?.some(o => o.organizationId === this.selectedOrgId)) return false;
      return true;
    });
    this.cdr.detectChanges();
  }

  getOrgName(orgId: string | undefined): string | undefined {
    if (!orgId) return undefined;
    return this.orgMap.get(orgId);
  }

  getUserPrimaryOrgName(user: IUser): string | undefined {
    if (!user.organizations || user.organizations.length === 0) return undefined;
    // Return the first organization's name (or the one where user is owner/admin)
    const primaryOrg = user.organizations.find(o => o.role === 'owner')
      || user.organizations.find(o => o.role === 'admin')
      || user.organizations[0];
    return primaryOrg?.organizationName || this.orgMap.get(primaryOrg?.organizationId);
  }

  formatRole(role?: string | Role): string {
    return role ? role.toString().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }

  canPromote(user: IUser): boolean {
    // Only Super Admin can promote
    if (!this.permissionService.canPromoteUsers()) return false;
    // Cannot promote self or existing owners/super admins
    if (user.role === Role.OWNER || user.role === Role.SUPER_ADMIN) return false;
    return true;
  }

  promoteToOwner(user: IUser) {
    if (this.promotingUserId) return; // Prevent double-click

    if (confirm(`Are you sure you want to promote ${user.firstName} to Owner?`)) {
      this.promotingUserId = user.id;
      this.cdr.detectChanges();

      this.usersService.updateRole(user.id, Role.OWNER).subscribe({
        next: () => {
          // Update user role immediately in UI
          const idx = this.users.findIndex(u => u.id === user.id);
          if (idx !== -1) {
            this.users[idx] = { ...this.users[idx], role: Role.OWNER };
          }
          this.applyFilters();
          this.promotingUserId = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to promote user:', err);
          this.promotingUserId = null;
          this.cdr.detectChanges();
        }
      });
    }
  }
}


