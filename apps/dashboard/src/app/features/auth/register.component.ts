
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex bg-white">
      <!-- Left Side - Form -->
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-1/2">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          
          <div class="flex items-center gap-2 mb-8">
             <div class="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">T</div>
             <span class="text-xl font-bold tracking-tight text-gray-900">Taskbucket</span>
          </div>

          <div>
            <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p class="mt-2 text-sm text-gray-600">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <div class="mt-8">
            <div class="bg-white">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
                
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4 border border-red-100 mb-4">
                  <div class="flex">
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input id="firstName" type="text" formControlName="firstName" required placeholder="John"
                             class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors">
                    </div>
                    <div>
                      <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input id="lastName" type="text" formControlName="lastName" required placeholder="Doe"
                             class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors">
                    </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input id="email" type="email" formControlName="email" autocomplete="email" required placeholder="name@company.com"
                         class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors">
                </div>

                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input id="password" type="password" formControlName="password" required placeholder="Create a password (min 8 chars)"
                         class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm transition-colors">
                  <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
                </div>
                
                <div class="flex items-center">
                    <input id="terms" name="terms" type="checkbox" class="h-4 w-4 text-black focus:ring-black border-gray-300 rounded">
                    <label for="terms" class="ml-2 block text-sm text-gray-900">
                        I agree to the <a href="#" class="font-medium text-black underline">Terms</a> and <a href="#" class="font-medium text-black underline">Privacy Policy</a>.
                    </label>
                </div>

                <div>
                  <button type="submit" [disabled]="registerForm.invalid || isLoading"
                          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all">
                    <span *ngIf="isLoading" class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating account...
                    </span>
                    <span *ngIf="!isLoading">Get started</span>
                  </button>
                </div>
              </form>
            </div>
            
            <div class="mt-8 text-center">
               <p class="text-sm text-gray-600">
                  Already have an account? 
                  <a routerLink="/auth/login" class="font-medium text-gray-900 hover:underline">Sign in</a>
               </p>
            </div>

          </div>
        </div>
      </div>

       <!-- Right Side - Image/Branding (Stick to same or complimentary image) -->
      <div class="hidden lg:block relative w-0 flex-1">
        <img class="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80" alt="Office environment">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
             <h3 class="text-white text-3xl font-bold mb-2">Join thousands of teams.</h3>
             <p class="text-white/80 text-lg">Streamline your operations and boost productivity with the world's leading veterinary management platform.</p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Using dummy delay for effect if real API is too fast/mocked
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed.';
        }
      });
    }
  }
}
