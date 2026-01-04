
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditLogResponse } from '../../../core/services/audit.service';
import { IAuditLog } from '@turbovets-workspace/data';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-full bg-gradient-to-br from-gray-50 to-slate-100/50">
      <div class="p-6 max-w-7xl mx-auto">
        <!-- Premium Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Audit Log</h1>
              <p class="text-sm text-gray-500">Track all system activities and security events</p>
            </div>
          </div>
        </div>

        <!-- Filters Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 mb-6">
          <div class="flex flex-wrap items-end gap-4">
            <!-- Action Filter -->
            <div class="flex-1 min-w-[150px]">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Action</label>
              <select [(ngModel)]="selectedAction" 
                      (change)="applyFilters()" 
                      class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5 px-3 border transition-all hover:border-gray-300">
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
              </select>
            </div>
            
            <!-- Resource Type Filter -->
            <div class="flex-1 min-w-[150px]">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Resource</label>
              <select [(ngModel)]="selectedResourceType" 
                      (change)="applyFilters()" 
                      class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5 px-3 border transition-all hover:border-gray-300">
                <option value="">All Resources</option>
                <option value="task">Task</option>
                <option value="user">User</option>
                <option value="organization">Organization</option>
              </select>
            </div>
            
            <!-- Date Range -->
            <div class="flex-1 min-w-[150px]">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" 
                     [(ngModel)]="startDate" 
                     (change)="applyFilters()"
                     class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5 px-3 border transition-all hover:border-gray-300">
            </div>
            
            <div class="flex-1 min-w-[150px]">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" 
                     [(ngModel)]="endDate" 
                     (change)="applyFilters()"
                     class="block w-full rounded-xl border-gray-200 bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5 px-3 border transition-all hover:border-gray-300">
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2">
              <button (click)="clearFilters()" 
                      class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                Clear
              </button>
              <button (click)="loadLogs()" 
                      [disabled]="isLoading"
                      class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50">
                <svg *ngIf="isLoading" class="animate-spin -ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg *ngIf="!isLoading" class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div *ngIf="!isLoading && total > 0" class="flex items-center justify-between mb-4 px-1">
          <div class="text-sm text-gray-600">
            Showing <span class="font-semibold text-gray-900">{{ (currentPage - 1) * pageSize + 1 }}</span> - 
            <span class="font-semibold text-gray-900">{{ Math.min(currentPage * pageSize, total) }}</span> of 
            <span class="font-semibold text-gray-900">{{ total }}</span> entries
          </div>
          <div class="text-sm text-gray-500">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-20">
          <div class="text-center">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-indigo-200 rounded-full animate-pulse"></div>
              <div class="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p class="text-gray-500 mt-4 font-medium">Loading audit logs...</p>
          </div>
        </div>

        <!-- Audit Log Table -->
        <div *ngIf="!isLoading" class="bg-white shadow-sm overflow-hidden rounded-2xl border border-gray-200/80">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Resource</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr *ngFor="let log of logs; let i = index" 
                    class="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-200"
                    [class.bg-gray-50/30]="i % 2 === 1">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20': log.action === 'create',
                            'bg-sky-100 text-sky-700 ring-1 ring-sky-600/20': log.action === 'read',
                            'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20': log.action === 'update',
                            'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20': log.action === 'delete',
                            'bg-violet-100 text-violet-700 ring-1 ring-violet-600/20': log.action === 'login'
                          }">
                      <span class="w-1.5 h-1.5 rounded-full"
                            [ngClass]="{
                              'bg-emerald-500': log.action === 'create',
                              'bg-sky-500': log.action === 'read',
                              'bg-amber-500': log.action === 'update',
                              'bg-rose-500': log.action === 'delete',
                              'bg-violet-500': log.action === 'login'
                            }"></span>
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg *ngIf="log.resourceType === 'task'" class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <svg *ngIf="log.resourceType === 'user'" class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <svg *ngIf="log.resourceType === 'organization'" class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-gray-900 capitalize">{{ log.resourceType }}</div>
                        <div class="text-xs text-gray-400 font-mono truncate max-w-[180px]">{{ log.resourceId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div *ngIf="log.user" class="flex items-center gap-3">
                      <div class="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {{ log.user.firstName.charAt(0) || '?' }}{{ log.user.lastName.charAt(0) || '' }}
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ log.user.firstName }} {{ log.user.lastName }}</div>
                        <div class="text-xs text-gray-500">{{ log.user.email }}</div>
                      </div>
                    </div>
                    <div *ngIf="!log.user" class="text-sm text-gray-400 font-mono">{{ log.userId }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ log.createdAt | date:'medium' }}</div>
                    <div class="text-xs text-gray-400">{{ getRelativeTime(log.createdAt) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="logs.length === 0" class="text-center py-16 px-6">
            <div class="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">No audit logs found</h3>
            <p class="mt-1 text-sm text-gray-500">System activity will appear here.</p>
            <button *ngIf="hasActiveFilters" (click)="clearFilters()" class="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Clear filters to see all logs
            </button>
          </div>

          <!-- Pagination -->
          <div *ngIf="logs.length > 0 && totalPages > 1" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">Rows per page:</label>
                <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" 
                        class="rounded-lg border-gray-200 text-sm py-1.5 pr-8 focus:ring-indigo-500 focus:border-indigo-500">
                  <option [value]="10">10</option>
                  <option [value]="25">25</option>
                  <option [value]="50">50</option>
                  <option [value]="100">100</option>
                </select>
              </div>
              
              <nav class="flex items-center gap-1">
                <button (click)="goToPage(1)" 
                        [disabled]="currentPage === 1"
                        class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
                </button>
                <button (click)="goToPage(currentPage - 1)" 
                        [disabled]="currentPage === 1"
                        class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                
                <ng-container *ngFor="let page of visiblePages">
                  <button *ngIf="page !== '...'" 
                          (click)="goToPage(+page)"
                          [class.bg-indigo-600]="currentPage === page"
                          [class.text-white]="currentPage === page"
                          [class.text-gray-700]="currentPage !== page"
                          [class.hover:bg-gray-200]="currentPage !== page"
                          class="min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors">
                    {{ page }}
                  </button>
                  <span *ngIf="page === '...'" class="px-2 text-gray-400">...</span>
                </ng-container>
                
                <button (click)="goToPage(currentPage + 1)" 
                        [disabled]="currentPage === totalPages"
                        class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button (click)="goToPage(totalPages)" 
                        [disabled]="currentPage === totalPages"
                        class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  logs: IAuditLog[] = [];
  isLoading = true;
  total = 0;

  // Filters
  selectedAction = '';
  selectedResourceType = '';
  startDate = '';
  endDate = '';

  // Pagination
  currentPage = 1;
  pageSize = 25;

  Math = Math; // Expose Math to template

  constructor(
    private auditService: AuditService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadLogs();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedAction || this.selectedResourceType || this.startDate || this.endDate);
  }

  get visiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  }

  loadLogs() {
    this.isLoading = true;
    this.cdr.detectChanges();

    const filters: any = {
      page: this.currentPage,
      pageSize: this.pageSize
    };
    if (this.selectedAction) filters.action = this.selectedAction;
    if (this.selectedResourceType) filters.resourceType = this.selectedResourceType;
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;

    this.auditService.getAuditLogs(filters).subscribe({
      next: (response: AuditLogResponse) => {
        this.logs = response.data || [];
        this.total = response.total || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load audit logs:', err);
        this.logs = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters() {
    this.selectedAction = '';
    this.selectedResourceType = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadLogs();
  }

  getRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return '';
  }
}


