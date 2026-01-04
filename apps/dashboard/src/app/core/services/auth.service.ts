
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginDto, RegisterDto } from '@turbovets-workspace/data';

interface AuthResponse {
    accessToken: string;
    user: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/auth'; // Proxy should be set up or usage of full URL
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUser();
    }

    private loadUser() {
        const token = localStorage.getItem('token');
        if (token) {
            // ideally verify token or decode it. For now assuming persistence.
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            this.currentUserSubject.next(user);
        }
    }

    login(credentials: LoginDto): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('user', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
            })
        );
    }

    register(data: RegisterDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
