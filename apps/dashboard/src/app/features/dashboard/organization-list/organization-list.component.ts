

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { IOrganization } from '@turbovets-workspace/data';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-organization-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="p-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Organizations</h1>
          <p class="text-sm text-gray-500 mt-1">Manage your organizations and teams</p>
        </div>
        
        <!-- Create Button - Super Admin can create multiple orgs -->
        <button *ngIf="permissionService.canCreateOrganization()" 
                (click)="showCreateModal = true" 
                [disabled]="isCreating"
                class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
            <svg *ngIf="!isCreating" class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
            <svg *ngIf="isCreating" class="animate-spin -ml-0.5 mr-1.5 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            New Organization
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-500">Loading organizations...</p>
        </div>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!isLoading && organizations.length === 0" class="text-center py-20 bg-white rounded-xl border border-gray-200">
          <svg class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900">No organizations yet</h3>
          <p class="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            {{ permissionService.canCreateOrganization() ? 'Get started by creating your first organization.' : 'You are not part of any organization yet.' }}
          </p>
          <div *ngIf="permissionService.canCreateOrganization()" class="mt-6">
              <button (click)="showCreateModal = true" 
                      [disabled]="isCreating"
                      class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                  <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                  Create Organization
              </button>
          </div>
      </div>

      <!-- Grid Layout -->
      <div *ngIf="!isLoading && organizations.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        <div *ngFor="let org of organizations; let i = index" class="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow h-64">
            <!-- Card Header (Banner) -->
            <div [ngClass]="getBannerColor(i)" class="h-20 px-6 py-4 relative">
                <div class="flex justify-between items-start">
                    <h2 class="text-lg font-semibold text-white hover:underline cursor-pointer truncate w-full" [routerLink]="['/dashboard/organizations', org.id]">
                        {{ org.name }}
                    </h2>
                </div>
                <p class="text-white/80 text-xs mt-1">{{ org.parentId ? 'Department' : 'Organization' }}</p>
                
                <!-- Avatar -->
                <div class="absolute -bottom-8 right-6">
                    <div class="h-14 w-14 rounded-full border-4 border-white bg-white text-gray-700 flex items-center justify-center text-xl font-bold shadow-sm">
                        {{ org.name.charAt(0).toUpperCase() }}
                    </div>
                </div>
            </div>

            <!-- Card Body -->
            <div class="flex-1 p-6 pt-10 flex flex-col justify-between">
                <div class="space-y-2">
                   <div class="flex items-center gap-2 text-sm text-gray-500">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                     <span>View tasks →</span>
                   </div>
                </div>
            </div>

            <!-- Card Footer -->
            <div class="border-t border-gray-100 bg-gray-50 px-4 py-3 flex justify-end">
                <a [routerLink]="['/dashboard/organizations', org.id]" 
                   class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    Open
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </a>
            </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" (click)="closeModal()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form [formGroup]="orgForm" (ngSubmit)="createOrg()">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900" id="modal-title">Create Organization</h3>
                        </div>
                        <div class="mt-4">
                            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                            <input type="text" id="name" formControlName="name" 
                                   class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border" 
                                   placeholder="e.g. Acme Corp">
                            <p class="mt-1 text-xs text-gray-500">Choose a name that represents your team or company</p>
                        </div>
                    </div>
                    <div class="mt-6 flex flex-row-reverse gap-3">
                        <button type="submit" 
                                [disabled]="orgForm.invalid || isCreating" 
                                class="inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg *ngIf="isCreating" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            {{ isCreating ? 'Creating...' : 'Create' }}
                        </button>
                        <button type="button" 
                                (click)="closeModal()" 
                                [disabled]="isCreating"
                                class="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  `
})
export class OrganizationListComponent implements OnInit {
    organizations: IOrganization[] = [];
    showCreateModal = false;
    orgForm: FormGroup;
    isLoading = true;
    isCreating = false;

    // Palette for card colors
    bannerColors = [
        'bg-blue-600',
        'bg-indigo-600',
        'bg-purple-600',
        'bg-teal-600',
        'bg-green-600',
        'bg-cyan-600',
        'bg-pink-600',
        'bg-orange-600'
    ];

    constructor(
        private orgService: OrganizationService,
        private fb: FormBuilder,
        public permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) {
        this.orgForm = this.fb.group({
            name: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadOrgs();
    }

    loadOrgs() {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.orgService.findAll().subscribe({
            next: (orgs: IOrganization[]) => {
                this.organizations = orgs;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load organizations:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    createOrg() {
        if (this.orgForm.invalid || this.isCreating) return;

        this.isCreating = true;
        this.cdr.detectChanges();

        this.orgService.create(this.orgForm.value).subscribe({
            next: (newOrg) => {
                // Add org immediately to UI
                this.organizations = [...this.organizations, newOrg];
                this.showCreateModal = false;
                this.orgForm.reset();
                this.isCreating = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to create organization:', err);
                this.isCreating = false;
                this.cdr.detectChanges();
            }
        });
    }

    closeModal() {
        if (this.isCreating) return;
        this.showCreateModal = false;
        this.orgForm.reset();
        this.cdr.detectChanges();
    }

    getBannerColor(index: number): string {
        return this.bannerColors[index % this.bannerColors.length];
    }
}


