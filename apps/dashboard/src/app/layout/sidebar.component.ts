import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { OrganizationService } from '../core/services/organization.service';
import { PermissionService } from '../core/services/permission.service';
import { IUser, IOrganization } from '@turbovets-workspace/data';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay for mobile -->
    <div *ngIf="isMobileOpen" (click)="closeSidebar()" class="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 sm:hidden"></div>

    <aside class="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] transition-transform bg-white border-r border-gray-200"
           [class.translate-x-0]="isMobileOpen"
           [class.-translate-x-full]="!isMobileOpen"
           [class.sm:translate-x-0]="true"
           aria-label="Sidebar">
      <div class="h-full px-3 py-4 overflow-y-auto bg-white">
        <ul class="space-y-2 font-medium">
          <!-- Dashboard Home -->
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-blue-50 text-blue-600" [routerLinkActiveOptions]="{exact: true}" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
              </svg>
              <span class="ms-3">Tasks</span>
            </a>
          </li>
          
          <!-- Administration Section - Only for users with permissions -->
          <ng-container *ngIf="permissionService.canViewUserManagement() || permissionService.canViewAuditLog()">
             <li class="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200">
                <div class="px-2 text-xs font-semibold text-gray-500 uppercase">Administration</div>
                
                <!-- User Management - SUPER_ADMIN and OWNER only -->
                <a *ngIf="permissionService.canViewUserManagement()" 
                   routerLink="/admin/users" 
                   routerLinkActive="bg-blue-50 text-blue-600" 
                   class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span class="ms-3">Users</span>
                </a>
                
                <!-- Audit Logs - SUPER_ADMIN, OWNER, and ADMIN -->
                <a *ngIf="permissionService.canViewAuditLog()" 
                   routerLink="/admin/audit" 
                   routerLinkActive="bg-blue-50 text-blue-600" 
                   class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="ms-3">Audit Logs</span>
                </a>
             </li>
          </ng-container>

          <!-- Organizations Section -->
          <li class="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200">
             <div class="px-2 text-xs font-semibold text-gray-500 uppercase">Organizations</div>
             
             <!-- Loading State -->
             <div *ngIf="isLoadingOrgs" class="flex items-center p-2 text-gray-400">
                <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
             </div>
             
             <!-- Organization List -->
             <ng-container *ngIf="!isLoadingOrgs">
               <a *ngFor="let org of organizations" 
                  [routerLink]="['/dashboard/organizations', org.id]" 
                  routerLinkActive="bg-blue-50 text-blue-600" 
                  class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                  <span class="flex-shrink-0 w-8 h-8 text-white transition duration-75 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">{{ org.name.substring(0,2).toUpperCase() }}</span>
                  <span class="ms-3 truncate">{{ org.name }}</span>
               </a>
               
               <!-- View All Link -->
               <a routerLink="/dashboard/organizations" 
                  routerLinkActive="bg-blue-50 text-blue-600"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 group">
                   <svg class="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                   <span class="ms-3">View All</span>
               </a>
             </ng-container>
          </li>
        </ul>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  @Input() isMobileOpen = false;
  @Output() close = new EventEmitter<void>();

  currentUser: IUser | null = null;
  organizations: IOrganization[] = [];
  isLoadingOrgs = true;

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    public permissionService: PermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Load orgs for sidebar
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.isLoadingOrgs = true;
    this.cdr.detectChanges();
    this.orgService.findAll().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.isLoadingOrgs = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingOrgs = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeSidebar() {
    this.close.emit();
  }
}

