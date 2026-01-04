
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { IUser, ITask, IOrganization, IOrganizationMember, Role } from '@turbovets-workspace/data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" *ngIf="isOpen">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" (click)="close()"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal Panel -->
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white" id="modal-title">{{ mode === 'edit' ? 'Edit Task' : 'Create Task' }}</h3>
                  <p class="text-sm text-white/70">{{ mode === 'edit' ? 'Update task details' : 'Add a new task to your board' }}</p>
                </div>
              </div>
              <button (click)="close()" class="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Form Content -->
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
            
            <!-- Organization Selector (Super Admin only) -->
            <div *ngIf="showOrgSelector && mode === 'create'" class="space-y-1.5">
              <label for="organizationId" class="block text-sm font-semibold text-gray-700">Organization</label>
              <select id="organizationId" formControlName="organizationId" 
                      class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all">
                <option value="">Select organization...</option>
                <option *ngFor="let org of organizations" [value]="org.id">{{ org.name }}</option>
              </select>
              <p class="text-xs text-gray-500">Choose which organization this task belongs to</p>
            </div>

            <!-- Title -->
            <div class="space-y-1.5">
              <label for="title" class="block text-sm font-semibold text-gray-700">Title <span class="text-red-500">*</span></label>
              <input type="text" id="title" formControlName="title" 
                     placeholder="Enter task title..."
                     class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all placeholder:text-gray-400">
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label for="description" class="block text-sm font-semibold text-gray-700">Description</label>
              <textarea id="description" formControlName="description" rows="3" 
                        placeholder="Describe the task..."
                        class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all resize-none placeholder:text-gray-400"></textarea>
            </div>

            <!-- Priority and Status Row -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="priority" class="block text-sm font-semibold text-gray-700">Priority</label>
                <select id="priority" formControlName="priority" 
                        class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all">
                  <option value="low">🟢 Low</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label for="status" class="block text-sm font-semibold text-gray-700">Status</label>
                <select id="status" formControlName="status" 
                        class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all">
                  <option value="todo">📋 To Do</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>
            </div>

            <!-- Due Date and Assignee Row -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="dueDate" class="block text-sm font-semibold text-gray-700">Due Date</label>
                <input type="date" id="dueDate" formControlName="dueDate" 
                       class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all">
              </div>
              <div class="space-y-1.5">
                <label for="assignedToId" class="block text-sm font-semibold text-gray-700">Assign To</label>
                <select id="assignedToId" formControlName="assignedToId" 
                        class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border transition-all">
                  <option value="">Unassigned</option>
                  <option *ngFor="let user of users" [value]="user.id">
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" (click)="close()" 
                      class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button type="submit" [disabled]="taskForm.invalid || isSubmitting" 
                      class="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                <svg *ngIf="isSubmitting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Task' : 'Create Task') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TaskDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() task: ITask | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveTask = new EventEmitter<any>();
  @Output() updateTask = new EventEmitter<{ id: string; data: any }>();

  taskForm: FormGroup;
  users: IOrganizationMember[] = [];
  organizations: IOrganization[] = [];
  showOrgSelector = false;
  isSubmitting = false;
  currentUser: any = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private orgService: OrganizationService,
    private authService: AuthService,
    public permissionService: PermissionService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['medium', Validators.required],
      status: ['todo'],
      dueDate: [''],
      assignedToId: [''],
      organizationId: ['']
    });
  }

  ngOnInit(): void {
    // Watch org selection changes to reload users
    const orgSub = this.taskForm.get('organizationId')?.valueChanges.subscribe(orgId => {
      if (orgId) {
        this.loadUsersForOrg(orgId);
      } else {
        this.users = [];
      }
    });
    if (orgSub) this.subscriptions.push(orgSub);

    // Check if Super Admin - show org selector
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.role === Role.SUPER_ADMIN) {
        this.showOrgSelector = true;
        this.loadOrganizations();
        // Make org required for Super Admin when creating
        this.taskForm.get('organizationId')?.setValidators(Validators.required);
        this.taskForm.get('organizationId')?.updateValueAndValidity();
      } else if (user?.organizations?.length > 0) {
        // Non-super-admin: auto-select their first organization and load users
        const firstOrgId = user.organizations[0].organizationId;
        this.taskForm.patchValue({ organizationId: firstOrgId });
        this.loadUsersForOrg(firstOrgId);

        // If user has multiple orgs, show selector
        if (user.organizations.length > 1) {
          this.showOrgSelector = true;
          this.organizations = user.organizations.map((o: any) => ({
            id: o.organizationId,
            name: o.organizationName
          }));
        }
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task && this.mode === 'edit') {
      // Pre-populate form with task data
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        priority: this.task.priority,
        status: this.task.status,
        dueDate: this.task.dueDate ? this.formatDateForInput(this.task.dueDate) : '',
        assignedToId: this.task.assignedToId || ''
      });
    }

    if (changes['isOpen'] && this.isOpen && this.mode === 'create') {
      // Reset form when opening in create mode
      this.taskForm.reset({
        priority: 'medium',
        status: 'todo',
        assignedToId: '',
        organizationId: this.currentUser?.organizationId || ''
      });
    }
  }

  private formatDateForInput(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  loadUsersForOrg(orgId: string) {
    this.orgService.getMembers(orgId).subscribe({
      next: (members: IOrganizationMember[]) => {
        this.users = members;
      },
      error: (err) => {
        console.error('Failed to load org members:', err);
        this.users = [];
      }
    });
  }

  loadOrganizations() {
    this.orgService.findAll().subscribe((orgs: IOrganization[]) => {
      this.organizations = orgs;
    });
  }

  close() {
    if (!this.isSubmitting) {
      this.closeDialog.emit();
    }
  }

  onSubmit() {
    if (this.taskForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formData = { ...this.taskForm.value };

      // Clean up empty strings (but keep organizationId - it's required!)
      if (!formData.assignedToId) delete formData.assignedToId;
      if (!formData.dueDate) delete formData.dueDate;
      // organizationId must always be sent for task creation
      if (!formData.organizationId && this.mode === 'create') {
        console.error('organizationId is required to create a task');
        this.isSubmitting = false;
        return;
      }

      if (this.mode === 'edit' && this.task) {
        // Don't send organizationId on edit - it shouldn't change
        delete formData.organizationId;
        this.updateTask.emit({ id: this.task.id, data: formData });
      } else {
        this.saveTask.emit(formData);
      }

      // Note: Parent component should set isSubmitting = false after API call completes
    }
  }

  // Called by parent after successful save
  resetForm() {
    this.isSubmitting = false;
    this.taskForm.reset({
      priority: 'medium',
      status: 'todo',
      assignedToId: '',
      organizationId: ''
    });
  }
}

