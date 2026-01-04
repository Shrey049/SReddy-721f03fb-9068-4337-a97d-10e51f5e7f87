import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Role } from '@turbovets-workspace/data';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white/90 backdrop-blur-md border-b border-gray-100 fixed w-full z-50 top-0 start-0 h-16">
      <div class="px-3 py-3 lg:px-5 lg:pl-3">
        <div class="flex items-center justify-between">
          
          <!-- Left: Hamburger & Brand -->
          <div class="flex items-center justify-start rtl:justify-end">
            <button (click)="toggleSidebar.emit()" type="button" class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
               <span class="sr-only">Open sidebar</span>
               <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
               </svg>
            </button>
            <a routerLink="/" class="flex ms-2 md:ms-4 items-center gap-2">
               <!-- Logo Icon -->
               <div class="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">T</div>
               <span class="self-center text-xl font-bold tracking-tight text-gray-900 hover:text-gray-700 transition-colors">Taskbucket</span>
            </a>
          </div>

          <!-- Right: Actions & Profile -->
          <div class="flex items-center gap-3">
            
            <!-- Notification Bell (placeholder) -->
            <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
               <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>

            <!-- User Menu -->
            <div class="relative ml-1" *ngIf="currentUser">
                <button (click)="toggleUserMenu()" class="flex items-center gap-2 focus:outline-none group">
                  <div class="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs group-hover:bg-gray-200 transition-colors overflow-hidden">
                      <!-- Placeholder for avatar image -->
                       <span *ngIf="!currentUser.avatarUrl">{{ currentUser.firstName?.charAt(0) }}{{ currentUser.lastName?.charAt(0) }}</span>
                       <img *ngIf="currentUser.avatarUrl" [src]="currentUser.avatarUrl" class="w-full h-full object-cover">
                  </div>
                </button>
                <!-- Dropdown -->
                <div *ngIf="showUserMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-50 animate-fade-in border border-gray-100">
                   <div class="px-4 py-3 border-b border-gray-50">
                      <p class="text-sm font-semibold text-gray-900">{{ currentUser.firstName }} {{ currentUser.lastName }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ currentUser.email }}</p>
                   </div>
                   <div class="py-1">
                       <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Profile settings</a>
                       <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Help center</a>
                   </div>
                   <div class="border-t border-gray-50 py-1">
                       <a href="#" (click)="logout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign out</a>
                   </div>
                </div>
            </div>

            <!-- Login/Register if not logged in (Shouldn't show in dashboard typically, but safe to keep) -->
            <div class="flex items-center space-x-2" *ngIf="!currentUser">
                <a routerLink="/auth/login" class="text-gray-700 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none">Log in</a>
                <a routerLink="/auth/register" class="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2">Get started</a>
            </div>

          </div>
        </div>
      </div>
    </nav>
    
    <!-- Backdrop for menus -->
    <div *ngIf="showCreateMenu || showUserMenu" (click)="closeMenus()" class="fixed inset-0 z-40 bg-transparent"></div>
  `
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any = null;
  showCreateMenu = false;
  showUserMenu = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleCreateMenu() { this.showCreateMenu = !this.showCreateMenu; this.showUserMenu = false; }
  toggleUserMenu() { this.showUserMenu = !this.showUserMenu; this.showCreateMenu = false; }
  closeMenus() { this.showCreateMenu = false; this.showUserMenu = false; }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get isOwnerOrAdmin(): boolean {
    return this.currentUser?.role === Role.OWNER || this.currentUser?.role === Role.ADMIN || this.currentUser?.role === Role.SUPER_ADMIN;
  }

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === Role.SUPER_ADMIN;
  }

  get isOwner(): boolean {
    return this.currentUser?.role === Role.OWNER;
  }
}
