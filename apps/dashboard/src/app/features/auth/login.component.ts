
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex bg-white">
      <!-- Left Side - Form -->
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          
          <!-- Logo -->
          <div class="flex items-center gap-2 mb-10">
             <div class="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">T</div>
             <span class="text-xl font-bold tracking-tight text-gray-900">Taskbucket</span>
          </div>

          <div>
            <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p class="mt-2 text-sm text-gray-600">
              Please enter your details to sign in.
            </p>
          </div>

          <div class="mt-8">
             <!-- Social Login Placeholders -->
             <div class="grid grid-cols-2 gap-3 mb-6">
                <button class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                   <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.0003 20.41c-5.46 0-9.9103-4.45-9.9103-9.91 0-5.46 4.4503-9.91 9.9103-9.91 5.46 0 9.91 4.45 9.91 9.91 0 5.46-4.45 9.91-9.91 9.91zm0-1.74c4.5 0 8.17-3.67 8.17-8.17s-3.67-8.17-8.17-8.17-8.1703 3.67-8.1703 8.17 3.6703 8.17 8.1703 8.17zm3.88-5.32l-1.35-1.35c.01-.2.02-.4.02-.61 0-2.34-1.91-4.25-4.25-4.25-.2 0-.41.01-.61.02l-1.35-1.35C8.98 5.71 9.8 5.46 10.7 5.46c3.48 0 6.3 2.82 6.3 6.3 0 .89-.25 1.72-.6 2.47-.26.49-.61.94-1.02 1.32zm-6.68 1.96l1.35-1.35c.2.01.41.02.61.02 2.34 0 4.25-1.91 4.25-4.25 0-.2-.01-.41-.02-.61l1.35-1.35C15.02 15.29 14.2 15.54 13.3 15.54c-3.48 0-6.3-2.82-6.3-6.3 0-.89.25-1.72.6-2.47.26-.49.61-.94 1.02-1.32z"/></svg>
                   Google
                </button>
                <button class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                   <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                   GitHub
                </button>
             </div>

             <div class="relative mb-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
             </div>

            <div class="bg-white">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
                
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4 border border-red-100">
                  <div class="flex">
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
                    </div>
                  </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input id="email" type="email" formControlName="email" required placeholder="name@company.com"
                         class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors">
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                      <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                      <a href="#" class="text-sm font-medium text-gray-600 hover:text-black">Forgot password?</a>
                  </div>
                  <input id="password" type="password" formControlName="password" required placeholder="••••••••"
                         class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors">
                </div>

                <div>
                  <button type="submit" [disabled]="loginForm.invalid || isLoading"
                          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all">
                    <span *ngIf="isLoading" class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Signing in...
                    </span>
                    <span *ngIf="!isLoading">Sign in</span>
                  </button>
                </div>
              </form>
            </div>
            
            <div class="mt-8 text-center">
               <p class="text-sm text-gray-600">
                  Don't have an account? 
                  <a routerLink="/auth/register" class="font-medium text-gray-900 hover:underline">Sign up for free</a>
               </p>
            </div>

          </div>
        </div>
      </div>

      <!-- Right Side - Image/Branding -->
      <div class="hidden lg:block relative w-0 flex-1">
        <img class="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80" alt="">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
            <blockquote class="text-white">
                <p class="text-xl font-medium mb-4">"Taskbucket has completely transformed how our team manages complex workflows. It's simply brilliant."</p>
                <footer class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold">JD</div>
                    <div>
                        <div class="font-semibold">Jane Doe</div>
                        <div class="text-sm text-gray-300">Director of Operations, VetCare Inc.</div>
                    </div>
                </footer>
            </blockquote>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    }
  }
}
