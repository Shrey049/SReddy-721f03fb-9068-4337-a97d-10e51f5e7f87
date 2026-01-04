
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrganization, IOrganizationMember, CreateOrganizationDto, UpdateOrganizationDto } from '@turbovets-workspace/data';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    private apiUrl = '/api/organizations';

    constructor(private http: HttpClient) { }

    findAll(): Observable<IOrganization[]> {
        return this.http.get<IOrganization[]>(this.apiUrl);
    }

    findOne(id: string): Observable<IOrganization> {
        return this.http.get<IOrganization>(`${this.apiUrl}/${id}`);
    }

    create(org: CreateOrganizationDto): Observable<IOrganization> {
        return this.http.post<IOrganization>(this.apiUrl, org);
    }

    update(id: string, org: UpdateOrganizationDto): Observable<IOrganization> {
        return this.http.patch<IOrganization>(`${this.apiUrl}/${id}`, org);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getMembers(orgId: string): Observable<IOrganizationMember[]> {
        return this.http.get<IOrganizationMember[]>(`${this.apiUrl}/${orgId}/members`);
    }

    addMember(orgId: string, userId: string, role: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${orgId}/members`, { userId, role });
    }

    updateMemberRole(orgId: string, userId: string, role: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${orgId}/members/${userId}`, { role });
    }

    removeMember(orgId: string, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${orgId}/members/${userId}`);
    }
}
