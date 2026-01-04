
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
   selector: 'app-home',
   standalone: true,
   imports: [CommonModule, RouterModule],
   template: `
    <div class="bg-slate-50 min-h-screen">
      
      <!-- Navbar (Transparent/Glass) -->
      <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
               <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">T</div>
                  <span class="text-xl font-bold tracking-tight text-gray-900">Taskbucket</span>
               </div>
               <div class="hidden md:flex space-x-8">
                  <a href="#features" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Features</a>
                  <a href="#testimonials" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Testimonials</a>
                  <a href="#" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Enterprise</a>
               </div>
               <div class="flex items-center gap-4">
                  <!-- Show login/register if NOT logged in -->
                  <ng-container *ngIf="!isLoggedIn">
                     <a routerLink="/auth/login" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Log in</a>
                     <a routerLink="/auth/register" class="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Start for free</a>
                  </ng-container>
                  <!-- Show dashboard button if logged in -->
                  <ng-container *ngIf="isLoggedIn">
                     <a routerLink="/dashboard" class="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <span>Go to Dashboard</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                     </a>
                  </ng-container>
               </div>
            </div>
         </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-20 pb-24 overflow-hidden">
         <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
         </div>
         
         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200/50 bg-indigo-50/50 mb-8 backdrop-blur">
               <span class="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span> New: Audit Logs 2.0 available now
            </div>
            
            <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8">
                Operate with <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">precision.</span><br>
                Manage with <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">purpose.</span>
            </h1>
            
            <p class="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
               Taskbucket provides the infrastructure for modern operations. Secure, scalable, and designed for high-performance teams.
            </p>
            
            <div class="mt-10 flex items-center justify-center gap-x-6">
               <a [routerLink]="isLoggedIn ? '/dashboard' : '/auth/register'" class="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all">
                  {{ isLoggedIn ? 'Open Dashboard' : 'Start your free trial' }}
               </a>
               <a href="#features" class="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 group">
                 Learn more 
                 <span aria-hidden="true" class="group-hover:translate-x-1 transition-transform">→</span>
               </a>
            </div>

            <!-- Dashboard Preview -->
            <div class="mt-16 sm:mt-24 rounded-xl border border-gray-200/60 bg-white/50 p-2 shadow-2xl backdrop-blur-sm lg:rounded-2xl lg:p-4">
               <img src="app-scren.png" alt="App screenshot" class="rounded-lg shadow-sm ring-1 ring-gray-900/10 w-full">
            </div>
         </div>
      </section>

      <!-- Trusted Companies -->
      <section class="py-12 border-y border-gray-200 bg-white">
         <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <p class="text-center text-sm font-medium text-gray-500 mb-8">TRUSTED BY INNOVATIVE TEAMS AT</p>
            <div class="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
               <div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-gray-300 text-center">Acme Corp</div>
               <div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-gray-300 text-center">Tuple</div>
               <div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-gray-300 text-center">Static</div>
               <div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-gray-300 text-center">Mirage</div>
               <div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-gray-300 text-center">Workcation</div>
            </div>
         </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-24 sm:py-32 bg-slate-50">
         <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="mx-auto max-w-2xl lg:text-center">
               <h2 class="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
               <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">No more spreadsheets.</p>
               <p class="mt-6 text-lg leading-8 text-gray-600">Upgrade your workflow with a system built for granular access control and real-time collaboration.</p>
            </div>
            
            <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
               <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  <!-- Feature 1 -->
                  <div class="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
                     <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                             <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        Role-Based Access
                     </dt>
                     <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p class="flex-auto">Fine-grained permissions ensure that team members only access what they need. Admins maintain full control.</p>
                     </dd>
                  </div>
                  
                  <!-- Feature 2 -->
                  <div class="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
                     <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>
                        Audit Logs
                     </dt>
                     <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p class="flex-auto">Track every action with comprehensive audit trails. Maintain compliance and full visibility.</p>
                     </dd>
                  </div>

                  <!-- Feature 3 -->
                  <div class="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
                     <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                             <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        Real-time Tasks
                     </dt>
                     <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p class="flex-auto">Collaborate in real-time. Drag, drop, and update status instantly across your entire organization.</p>
                     </dd>
                  </div>
               </dl>
            </div>
         </div>
      </section>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200">
         <div class="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
            <div class="flex justify-center space-x-6 md:order-2">
               <a href="#" class="text-gray-400 hover:text-gray-500">
                   <span class="sr-only">GitHub</span>
                   <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
               </a>
            </div>
            <div class="mt-8 md:order-1 md:mt-0">
               <p class="text-center text-xs leading-5 text-gray-500">&copy; 2024 Taskbucket, Inc. All rights reserved.</p>
            </div>
         </div>
      </footer>
    
    </div>
  `
})
export class HomeComponent implements OnInit {
   isLoggedIn = false;

   constructor(private authService: AuthService) { }

   ngOnInit(): void {
      this.authService.currentUser$.subscribe(user => {
         this.isLoggedIn = !!user;
      });
   }
}
