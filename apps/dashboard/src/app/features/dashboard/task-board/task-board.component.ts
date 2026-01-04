
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../../core/services/tasks.service';
import { PermissionService } from '../../../core/services/permission.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { ITask, CreateTaskDto, TaskStatus, IOrganization, Role } from '@turbovets-workspace/data';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from '../task-modal/task-dialog.component';

@Component({
   selector: 'app-task-board',
   standalone: true,
   imports: [CommonModule, FormsModule, DragDropModule, TaskDialogComponent],
   template: `
    <div class="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      <!-- Premium Header -->
      <div class="flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200/50">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Task Board</h3>
                <p class="text-sm text-gray-500">{{ totalTasks }} tasks across {{ todoTasks.length + inProgressTasks.length + doneTasks.length > 0 ? '3 columns' : 'your workspace' }}</p>
              </div>
            </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Org Filter (Super Admin only) -->
          <div *ngIf="isSuperAdmin" class="relative">
            <select [(ngModel)]="selectedOrgId" 
                    (change)="onOrgChange()"
                    class="pl-3 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-100">
              <option value="">All Organizations</option>
              <option *ngFor="let org of organizations" [value]="org.id">{{ org.name }}</option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (ngModelChange)="onSearch()"
                   placeholder="Search tasks..."
                   class="pl-10 pr-4 py-2.5 w-64 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400">
            <button *ngIf="searchQuery" 
                    (click)="clearSearch()" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Refresh Button -->
          <button (click)="loadTasks()" 
                  [disabled]="isLoading"
                  class="inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all hover:shadow-md">
            <svg [class.animate-spin]="isLoading" class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <!-- Create Button -->
          <button *ngIf="permissionService.canCreateTask()" 
                  (click)="openCreateDialog()" 
                  [disabled]="isCreating"
                  class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50">
              <svg *ngIf="!isCreating" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <svg *ngIf="isCreating" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isCreating ? 'Creating...' : 'New Task' }}
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="relative mx-auto mb-4">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p class="text-gray-500 font-medium">Loading tasks...</p>
        </div>
      </div>
      
      <!-- Kanban Columns -->
      <div *ngIf="!isLoading" class="flex-1 overflow-x-auto overflow-y-hidden">
        <div class="h-full flex gap-5 px-6 py-6 min-w-max">
            
            <!-- Todo Column -->
            <div class="w-80 flex flex-col bg-white/70 backdrop-blur-sm rounded-2xl h-full border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div class="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-2xl">
                    <h4 class="font-bold text-gray-700 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 shadow-sm"></span>
                        To Do 
                        <span class="text-xs bg-gray-200/80 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{{ getFilteredTasks(todoTasks).length }}</span>
                    </h4>
                </div>
                <div class="p-3 flex-1 overflow-y-auto space-y-3"
                     cdkDropList
                     id="todo"
                     [cdkDropListData]="todoTasks"
                     [cdkDropListConnectedTo]="['in_progress', 'done']"
                     (cdkDropListDropped)="drop($event)">
                     
                   <div *ngFor="let task of getFilteredTasks(todoTasks)" cdkDrag 
                        (click)="openEditDialog(task)"
                        class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-200 group relative hover:-translate-y-0.5">
                      <!-- Priority Badge & Delete -->
                      <div class="flex justify-between items-start mb-3">
                          <span class="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg" 
                                [ngClass]="{
                                  'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 ring-1 ring-red-200': task.priority === 'urgent',
                                  'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 ring-1 ring-amber-200': task.priority === 'high',
                                  'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-200': task.priority === 'medium',
                                  'bg-gradient-to-r from-gray-50 to-slate-100 text-gray-500 ring-1 ring-gray-200': task.priority === 'low'
                                }">{{ task.priority }}</span>
                          
                          <button *ngIf="permissionService.canDeleteTask()" 
                                  (click)="deleteTask(task.id); $event.stopPropagation()" 
                                  [disabled]="deletingTaskId === task.id"
                                  class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded-lg disabled:opacity-50">
                            <svg *ngIf="deletingTaskId !== task.id" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <svg *ngIf="deletingTaskId === task.id" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          </button>
                      </div>
                      
                      <!-- Task Content -->
                      <h5 class="font-semibold text-gray-800 mb-1.5 leading-snug">{{ task.title }}</h5>
                      <p class="text-xs text-gray-500 line-clamp-2 mb-3" *ngIf="task.description">{{ task.description }}</p>
                      
                      <!-- Footer: Due Date & Assignee -->
                      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div *ngIf="task.dueDate" class="flex items-center gap-1.5 text-xs" 
                             [ngClass]="isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {{ formatDate(task.dueDate) }}
                        </div>
                        <div *ngIf="!task.dueDate" class="text-xs text-gray-300">No due date</div>
                        
                        <div *ngIf="task.assignedTo" class="flex items-center gap-1.5">
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                            {{ task.assignedTo.firstName.charAt(0) }}{{ task.assignedTo.lastName.charAt(0) }}
                          </div>
                          <span class="text-xs text-gray-500 hidden sm:inline">{{ task.assignedTo.firstName }}</span>
                        </div>
                        <div *ngIf="!task.assignedTo" class="w-6 h-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                   </div>
                   
                   <!-- Empty State -->
                   <div *ngIf="getFilteredTasks(todoTasks).length === 0" class="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50/50">
                       <svg class="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                       {{ searchQuery ? 'No matching tasks' : 'No tasks yet' }}
                   </div>
                </div>
            </div>

            <!-- In Progress Column -->
            <div class="w-80 flex flex-col bg-white/70 backdrop-blur-sm rounded-2xl h-full border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div class="p-4 flex items-center justify-between border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <h4 class="font-bold text-blue-700 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm animate-pulse"></span>
                        In Progress 
                        <span class="text-xs bg-blue-200/80 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{{ getFilteredTasks(inProgressTasks).length }}</span>
                    </h4>
                </div>
                <div class="p-3 flex-1 overflow-y-auto space-y-3"
                     cdkDropList
                     id="in_progress"
                     [cdkDropListData]="inProgressTasks"
                     [cdkDropListConnectedTo]="['todo', 'done']"
                     (cdkDropListDropped)="drop($event)">
                     
                   <div *ngFor="let task of getFilteredTasks(inProgressTasks)" cdkDrag 
                        (click)="openEditDialog(task)"
                        class="bg-white p-4 rounded-xl shadow-sm border border-blue-100 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-200 group relative hover:-translate-y-0.5 ring-1 ring-blue-100/50">
                      <div class="flex justify-between items-start mb-3">
                        <span class="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg"
                              [ngClass]="{
                                'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 ring-1 ring-red-200': task.priority === 'urgent',
                                'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 ring-1 ring-amber-200': task.priority === 'high',
                                'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-200': task.priority === 'medium',
                                'bg-gradient-to-r from-gray-50 to-slate-100 text-gray-500 ring-1 ring-gray-200': task.priority === 'low'
                              }">{{ task.priority }}</span>
                        
                        <button *ngIf="permissionService.canDeleteTask()" 
                                (click)="deleteTask(task.id); $event.stopPropagation()" 
                                [disabled]="deletingTaskId === task.id"
                                class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded-lg disabled:opacity-50">
                          <svg *ngIf="deletingTaskId !== task.id" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          <svg *ngIf="deletingTaskId === task.id" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        </button>
                      </div>
                      <h5 class="font-semibold text-gray-800 mb-1.5 leading-snug">{{ task.title }}</h5>
                      <p class="text-xs text-gray-500 line-clamp-2 mb-3" *ngIf="task.description">{{ task.description }}</p>
                      
                      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div *ngIf="task.dueDate" class="flex items-center gap-1.5 text-xs"
                             [ngClass]="isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {{ formatDate(task.dueDate) }}
                        </div>
                        <div *ngIf="!task.dueDate" class="text-xs text-gray-300">No due date</div>
                        
                        <div *ngIf="task.assignedTo" class="flex items-center gap-1.5">
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                            {{ task.assignedTo.firstName.charAt(0) }}{{ task.assignedTo.lastName.charAt(0) }}
                          </div>
                        </div>
                        <div *ngIf="!task.assignedTo" class="w-6 h-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                   </div>
                   
                   <div *ngIf="getFilteredTasks(inProgressTasks).length === 0" class="h-32 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center text-blue-300 text-sm bg-blue-50/30">
                       <svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       {{ searchQuery ? 'No matching tasks' : 'Drag tasks here' }}
                   </div>
                </div>
            </div>

            <!-- Done Column -->
            <div class="w-80 flex flex-col bg-white/70 backdrop-blur-sm rounded-2xl h-full border border-green-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div class="p-4 flex items-center justify-between border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                    <h4 class="font-bold text-green-700 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm"></span>
                        Done 
                        <span class="text-xs bg-green-200/80 text-green-700 px-2.5 py-1 rounded-full font-semibold">{{ getFilteredTasks(doneTasks).length }}</span>
                    </h4>
                </div>
                <div class="p-3 flex-1 overflow-y-auto space-y-3"
                     cdkDropList
                     id="done"
                     [cdkDropListData]="doneTasks"
                     [cdkDropListConnectedTo]="['todo', 'in_progress']"
                     (cdkDropListDropped)="drop($event)">
                     
                   <div *ngFor="let task of getFilteredTasks(doneTasks)" cdkDrag 
                        (click)="openEditDialog(task)"
                        class="bg-white/80 p-4 rounded-xl shadow-sm border border-green-100 cursor-pointer hover:shadow-lg transition-all duration-200 group relative opacity-80 hover:opacity-100">
                      <div class="flex justify-between items-start mb-3">
                           <span class="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 ring-1 ring-green-200">
                             ✓ Completed
                           </span>
                          <button *ngIf="permissionService.canDeleteTask()" 
                                  (click)="deleteTask(task.id); $event.stopPropagation()" 
                                  [disabled]="deletingTaskId === task.id"
                                  class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded-lg disabled:opacity-50">
                            <svg *ngIf="deletingTaskId !== task.id" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <svg *ngIf="deletingTaskId === task.id" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          </button>
                      </div>
                      <h5 class="font-medium text-gray-500 mb-1.5 line-through decoration-green-400">{{ task.title }}</h5>
                      
                      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div class="text-xs text-gray-400">Completed</div>
                        <div *ngIf="task.assignedTo" class="flex items-center gap-1.5">
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                            {{ task.assignedTo.firstName.charAt(0) }}{{ task.assignedTo.lastName.charAt(0) }}
                          </div>
                        </div>
                      </div>
                   </div>
                   
                   <div *ngIf="getFilteredTasks(doneTasks).length === 0" class="h-32 border-2 border-dashed border-green-200 rounded-xl flex flex-col items-center justify-center text-green-300 text-sm bg-green-50/30">
                       <svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       {{ searchQuery ? 'No matching tasks' : 'Completed tasks' }}
                   </div>
                </div>
            </div>

        </div>
      </div>

      <app-task-dialog [isOpen]="isDialogOpen" 
                       [mode]="dialogMode"
                       [task]="editingTask"
                       (closeDialog)="closeDialog()" 
                       (saveTask)="onSaveTask($event)"
                       (updateTask)="onUpdateTask($event)">
      </app-task-dialog>
    </div>
  `
})
export class TaskBoardComponent implements OnInit {
   todoTasks: ITask[] = [];
   inProgressTasks: ITask[] = [];
   doneTasks: ITask[] = [];

   // Dialog State
   isDialogOpen = false;
   dialogMode: 'create' | 'edit' = 'create';
   editingTask: ITask | null = null;

   isLoading = true;
   isCreating = false;
   deletingTaskId: string | null = null;
   searchQuery = '';

   // Org Filter
   organizations: IOrganization[] = [];
   selectedOrgId = '';
   isSuperAdmin = false;

   get totalTasks(): number {
      return this.todoTasks.length + this.inProgressTasks.length + this.doneTasks.length;
   }

   constructor(
      private tasksService: TasksService,
      public permissionService: PermissionService,
      private orgService: OrganizationService,
      private authService: AuthService,
      private cdr: ChangeDetectorRef
   ) { }

   ngOnInit() {
      // Check for Super Admin
      this.authService.currentUser$.subscribe(user => {
         if (user?.role === Role.SUPER_ADMIN) {
            this.isSuperAdmin = true;
            this.loadOrganizations();
         } else {
            this.isSuperAdmin = false;
         }
      });

      this.loadTasks();
   }

   loadOrganizations() {
      this.orgService.findAll().subscribe(orgs => {
         this.organizations = orgs;
      });
   }

   onOrgChange() {
      this.loadTasks();
   }

   loadTasks() {
      this.isLoading = true;
      this.cdr.detectChanges();

      const filters: any = {};
      if (this.selectedOrgId) {
         filters.organizationId = this.selectedOrgId;
      }

      this.tasksService.findAll(filters).subscribe({
         next: (response) => {
            const tasks = response.data || [];
            this.todoTasks = tasks.filter((t: ITask) => t.status === 'todo');
            this.inProgressTasks = tasks.filter((t: ITask) => t.status === 'in_progress');
            this.doneTasks = tasks.filter((t: ITask) => t.status === 'done');
            this.isLoading = false;
            this.cdr.detectChanges();
         },
         error: (err) => {
            console.error('Failed to load tasks:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
         }
      });
   }

   getFilteredTasks(tasks: ITask[]): ITask[] {
      if (!this.searchQuery.trim()) return tasks;
      const query = this.searchQuery.toLowerCase();
      return tasks.filter(task =>
         task.title.toLowerCase().includes(query) ||
         (task.description && task.description.toLowerCase().includes(query))
      );
   }

   onSearch() {
      this.cdr.detectChanges();
   }

   clearSearch() {
      this.searchQuery = '';
      this.cdr.detectChanges();
   }

   formatDate(date: string | Date): string {
      if (!date) return '';
      const d = new Date(date);
      const now = new Date();
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
   }

   isOverdue(date: string | Date): boolean {
      if (!date) return false;
      return new Date(date) < new Date();
   }

   drop(event: CdkDragDrop<ITask[]>) {
      if (event.previousContainer === event.container) {
         moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
         const task = event.previousContainer.data[event.previousIndex];
         const newStatus = event.container.id;

         transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
         );

         // Update backend
         this.tasksService.updateStatus(task.id, newStatus).subscribe({
            next: () => this.cdr.detectChanges(),
            error: (err) => console.error('Failed to update status:', err)
         });
      }
   }

   openCreateDialog() {
      if (this.isCreating) return;
      this.dialogMode = 'create';
      this.editingTask = null;
      this.isDialogOpen = true;
      this.cdr.detectChanges();
   }

   openEditDialog(task: ITask) {
      // Check if user has permission to edit
      // Owner: Yes (their org) - handled by findAll scope
      // Admin: Yes (their org)
      // Super Admin: Yes (all)
      // Viewer: No (status only, handled by drag-drop)
      // Since viewers see tasks, we need to prevent them from opening edit dialog for full edit
      // But they might want to view details. 
      // For now, let's allow opening but maybe read-only? 
      // Requirement says: Update Task -> Owner, Admin. 
      // So Viewers should probably not see edit dialog, or seeing it in read-only.
      // Let's check permission before opening.
      if (!this.permissionService.canCreateTask()) { // Reusing canCreateTask as proxy for write access broadly
         return;
      }

      this.dialogMode = 'edit';
      this.editingTask = task;
      this.isDialogOpen = true;
      this.cdr.detectChanges();
   }

   closeDialog() {
      if (!this.isCreating) {
         this.isDialogOpen = false;
         this.editingTask = null;
         this.cdr.detectChanges();
      }
   }

   onSaveTask(taskData: CreateTaskDto) {
      if (this.isCreating) return;

      this.isCreating = true;
      this.cdr.detectChanges();

      this.tasksService.create(taskData).subscribe({
         next: (newTask) => {
            if (newTask.status === 'todo' || !newTask.status) {
               this.todoTasks = [newTask, ...this.todoTasks];
            } else if (newTask.status === 'in_progress') {
               this.inProgressTasks = [newTask, ...this.inProgressTasks];
            } else {
               this.doneTasks = [newTask, ...this.doneTasks];
            }
            this.isDialogOpen = false;
            this.isCreating = false;
            this.cdr.detectChanges();
         },
         error: (err) => {
            console.error('Failed to create task:', err);
            this.isCreating = false;
            this.cdr.detectChanges();
         }
      });
   }

   onUpdateTask(event: { id: string; data: any }) {
      if (this.isCreating) return; // Re-use isCreating flag for loading state
      this.isCreating = true;
      this.cdr.detectChanges();

      this.tasksService.update(event.id, event.data).subscribe({
         next: (updatedTask) => {
            // Refresh list to update UI
            // Or update locally
            this.loadTasks(); // Simpler to reload to handle status changes/moves
            this.isDialogOpen = false;
            this.isCreating = false;
            this.cdr.detectChanges();
         },
         error: (err) => {
            console.error('Failed to update task:', err);
            this.isCreating = false;
            this.cdr.detectChanges();
         }
      });
   }

   deleteTask(id: string) {
      if (this.deletingTaskId) return;

      if (confirm('Are you sure you want to delete this task?')) {
         this.deletingTaskId = id;
         this.cdr.detectChanges();

         this.tasksService.delete(id).subscribe({
            next: () => {
               this.todoTasks = this.todoTasks.filter(t => t.id !== id);
               this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== id);
               this.doneTasks = this.doneTasks.filter(t => t.id !== id);
               this.deletingTaskId = null;
               this.cdr.detectChanges();
            },
            error: (err) => {
               console.error('Failed to delete task:', err);
               this.deletingTaskId = null;
               this.cdr.detectChanges();
            }
         });
      }
   }
}
