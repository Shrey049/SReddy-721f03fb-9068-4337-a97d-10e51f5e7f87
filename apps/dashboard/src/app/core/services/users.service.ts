
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '@turbovets-workspace/data';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private apiUrl = '/api/users';

    constructor(private http: HttpClient) { }

    findAll(): Observable<IUser[]> {
        return this.http.get<IUser[]>(this.apiUrl);
    }

    updateRole(id: string, role: string): Observable<IUser> {
        return this.http.put<IUser>(`${this.apiUrl}/${id}/role`, { role });
    }
}
