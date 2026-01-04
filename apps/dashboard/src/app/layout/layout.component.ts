
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>
      
      <app-sidebar [isMobileOpen]="isSidebarOpen" (close)="isSidebarOpen = false"></app-sidebar>

      <!-- Main Content -->
      <main class="pt-16 min-h-[calc(100vh)] transition-all ease-in-out duration-300">
        <div class="p-4 sm:ml-64">
            <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
