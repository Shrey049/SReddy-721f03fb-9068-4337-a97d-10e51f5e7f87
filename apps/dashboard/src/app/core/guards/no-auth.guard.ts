import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to prevent authenticated users from accessing login/register pages.
 * Redirects to /dashboard if user is already logged in.
 */
export const noAuthGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();

    if (token) {
        // User is already logged in, redirect to dashboard
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
};
