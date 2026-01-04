
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IAuditLog } from '@turbovets-workspace/data';

export interface AuditLogResponse {
    data: IAuditLog[];
    total: number;
    page: number;
    pageSize: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    private apiUrl = '/api/audit-log';

    constructor(private http: HttpClient) { }

    getAuditLogs(filters?: {
        action?: string;
        resourceType?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        pageSize?: number
    }): Observable<AuditLogResponse> {
        let params = new HttpParams();
        if (filters?.action) params = params.set('action', filters.action);
        if (filters?.resourceType) params = params.set('resourceType', filters.resourceType);
        if (filters?.userId) params = params.set('userId', filters.userId);
        if (filters?.startDate) params = params.set('startDate', filters.startDate);
        if (filters?.endDate) params = params.set('endDate', filters.endDate);
        if (filters?.page) params = params.set('page', filters.page.toString());
        if (filters?.pageSize) params = params.set('pageSize', filters.pageSize.toString());

        return this.http.get<AuditLogResponse>(this.apiUrl, { params });
    }
}

