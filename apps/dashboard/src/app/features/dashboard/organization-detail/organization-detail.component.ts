
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization.service';
import { UsersService } from '../../../core/services/users.service';
import { TasksService } from '../../../core/services/tasks.service';
import { IOrganization, IUser, Role, ITask } from '@turbovets-workspace/data';
import { PermissionService } from '../../../core/services/permission.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-organization-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="min-h-full bg-gray-50/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="organization">
            
            <!-- Header Section -->
            <div class="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div class="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <div class="flex items-center gap-4">
                            <div class="h-16 w-16 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                                {{ organization.name.substring(0,2).toUpperCase() }}
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">{{ organization.name }}</h1>
                                <p class="mt-1 text-sm text-gray-500">Managed Organization</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 sm:mt-0 flex gap-3">
                         <span class="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Active
                        </span>
                        <span class="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {{ organization.users?.length || 0 }} Members
                        </span>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="mt-8 border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <button (click)="activeTab = 'members'"
                            [class.border-blue-500]="activeTab === 'members'"
                            [class.text-blue-600]="activeTab === 'members'"
                            [class.border-transparent]="activeTab !== 'members'"
                            [class.text-gray-500]="activeTab !== 'members'"
                            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300 transition-colors">
                            Team Members
                        </button>
                        <button (click)="activeTab = 'tasks'"
                            [class.border-blue-500]="activeTab === 'tasks'"
                            [class.text-blue-600]="activeTab === 'tasks'"
                            [class.border-transparent]="activeTab !== 'tasks'"
                            [class.text-gray-500]="activeTab !== 'tasks'"
                            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300 transition-colors">
                            Project Tasks
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Content Area -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                
                <!-- Members Tab -->
                <div *ngIf="activeTab === 'members'" class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-lg font-medium text-gray-900">Organization Members</h2>
                        <button (click)="showAddMemberModal = true" type="button" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Add Member
                        </button>
                    </div>

                    <div class="overflow-hidden bg-white rounded-xl border border-gray-200">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6">Member</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr *ngFor="let user of organization.users" class="hover:bg-gray-50 transition-colors">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                        <div class="flex items-center">
                                            <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                {{ user.firstName[0] }}{{ user.lastName[0] }}
                                            </div>
                                            <div class="ml-4">
                                                <div class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                                                <div class="text-gray-500">{{ user.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 capitalize">
                                            {{ user.role }}
                                        </span>
                                    </td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button (click)="removeMember(user.id)" class="text-gray-400 hover:text-red-600 transition-colors">
                                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                                <tr *ngIf="!organization.users?.length">
                                    <td colspan="3" class="py-12 text-center">
                                        <div class="flex flex-col items-center justify-center text-gray-500">
                                            <svg class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            <p class="text-sm font-medium">No members found</p>
                                            <p class="text-xs text-gray-400 mt-1">Add members to collaborate</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tasks Tab -->
                <div *ngIf="activeTab === 'tasks'" class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-lg font-medium text-gray-900">Assigned Tasks</h2>
                        <span class="text-sm text-gray-500">{{ tasks.length }} total tasks</span>
                    </div>

                    <div *ngIf="loadingTasks" class="py-12 flex justify-center">
                        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>

                    <div *ngIf="!loadingTasks" class="overflow-hidden bg-white rounded-xl border border-gray-200">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6">Task</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr *ngFor="let task of tasks" class="hover:bg-gray-50 transition-colors">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {{ task.title }}
                                        <div class="text-xs text-gray-500 font-normal truncate max-w-[200px]">{{ task.description }}</div>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                                        <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize border"
                                              [ngClass]="{
                                                'bg-yellow-50 text-yellow-700 border-yellow-200': task.status === 'todo',
                                                'bg-blue-50 text-blue-700 border-blue-200': task.status === 'in_progress',
                                                'bg-green-50 text-green-700 border-green-200': task.status === 'done'
                                              }">
                                            {{ task.status.replace('_', ' ') }}
                                        </span>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div *ngIf="task.assignedTo" class="flex items-center gap-2">
                                            <div class="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {{ task.assignedTo.firstName[0] }}
                                            </div>
                                            {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                                        </div>
                                        <span *ngIf="!task.assignedTo" class="text-gray-400 italic">Unassigned</span>
                                    </td>
                                </tr>
                                <tr *ngIf="tasks.length === 0">
                                    <td colspan="3" class="py-12 text-center">
                                        <div class="flex flex-col items-center justify-center text-gray-500">
                                            <svg class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p class="text-sm font-medium">No tasks found</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>

        <!-- Add Member Modal -->
        <div *ngIf="showAddMemberModal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity backdrop-blur-sm" aria-hidden="true" (click)="showAddMemberModal = false"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Add Team Member</h3>
                                <div class="mt-4">
                                    <form [formGroup]="memberForm" (ngSubmit)="addMember()">
                                        <div class="space-y-4">
                                            <div>
                                                <label for="userId" class="block text-sm font-medium text-gray-700">Select User</label>
                                                <select id="userId" formControlName="userId" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white">
                                                    <option value="" disabled>Choose a user...</option>
                                                    <option *ngFor="let user of availableUsers" [value]="user.id">
                                                        {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                                                    </option>
                                                </select>
                                            </div>
                                            <div>
                                                <label for="role" class="block text-sm font-medium text-gray-700">Assign Role</label>
                                                <select id="role" formControlName="role" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white">
                                                    <option *ngFor="let role of assignableRoles" [value]="role">{{ formatRole(role) }}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="mt-6 sm:flex sm:flex-row-reverse gap-3">
                                            <button type="submit" [disabled]="memberForm.invalid" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                                Add Member
                                            </button>
                                            <button type="button" (click)="showAddMemberModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `,
    styles: []
})
export class OrganizationDetailComponent implements OnInit {
    organization: any;
    tasks: ITask[] = [];
    availableUsers: IUser[] = [];
    showAddMemberModal = false;
    memberForm: FormGroup;
    orgId: string | null = null;
    isLoading = false;
    loadingTasks = false;
    activeTab: 'members' | 'tasks' = 'members';
    assignableRoles: string[] = [];

    constructor(
        private route: ActivatedRoute,
        private orgService: OrganizationService,
        private usersService: UsersService,
        private tasksService: TasksService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        public permissionService: PermissionService
    ) {
        this.assignableRoles = this.permissionService.getAssignableRoles();
        this.memberForm = this.fb.group({
            userId: ['', Validators.required],
            role: ['viewer', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadUsers(); // Load available users once

        // Subscribe to paramMap to handle navigation changes while component is active
        this.route.paramMap.subscribe(params => {
            const newId = params.get('id');
            if (newId && (newId !== this.orgId || !this.organization)) {
                this.orgId = newId;
                this.loadOrg();
                this.loadTasks();
            }
        });
    }

    loadOrg() {
        if (this.orgId) {
            this.isLoading = true;
            this.cdr.detectChanges();
            this.orgService.findOne(this.orgId).subscribe({
                next: (org: any) => {
                    this.organization = org;
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    loadTasks() {
        if (!this.orgId) return;

        this.loadingTasks = true;
        this.tasks = []; // Clear previous tasks
        this.cdr.detectChanges();

        this.tasksService.findAll({ organizationId: this.orgId }).subscribe({
            next: (response) => {
                this.tasks = response.data || [];
                this.loadingTasks = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load tasks:', err);
                this.loadingTasks = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadUsers() {
        this.usersService.findAll().subscribe({
            next: (users: IUser[]) => {
                this.availableUsers = users;
                this.cdr.detectChanges();
            },
            error: (err) => console.error(err)
        });
    }

    addMember() {
        if (this.memberForm.valid && this.orgId) {
            this.orgService.addMember(this.orgId, this.memberForm.value.userId, this.memberForm.value.role).subscribe({
                next: () => {
                    this.showAddMemberModal = false;
                    this.memberForm.reset({ role: 'viewer' });
                    this.loadOrg();
                },
                error: (err) => console.error(err)
            });
        }
    }

    removeMember(userId: string) {
        if (confirm('Are you sure you want to remove this member?') && this.orgId) {
            this.orgService.removeMember(this.orgId, userId).subscribe({
                next: () => {
                    this.loadOrg();
                },
                error: (err) => console.error(err)
            });
        }
    }

    formatRole(role: string): string {
        const roleLabels: Record<string, string> = {
            'owner': 'Owner',
            'admin': 'Administrator',
            'viewer': 'Viewer'
        };
        return roleLabels[role] || role;
    }
}
