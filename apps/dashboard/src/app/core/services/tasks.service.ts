
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITask, ICreateTask, IUpdateTask, ITaskQuery } from '@turbovets-workspace/data';

export interface TaskResponse {
    data: ITask[];
    total: number;
    page: number;
    limit: number;
}

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private apiUrl = '/api/tasks';

    constructor(private http: HttpClient) { }

    findAll(query: ITaskQuery = {}): Observable<TaskResponse> {
        let params = new HttpParams();
        if (query.status) params = params.set('status', query.status);
        if (query.priority) params = params.set('priority', query.priority);
        if (query.assignedToId) params = params.set('assignedToId', query.assignedToId);
        if (query.organizationId) params = params.set('organizationId', query.organizationId);
        if (query.search) params = params.set('search', query.search);
        if (query.page) params = params.set('page', query.page);
        if (query.pageSize) params = params.set('pageSize', query.pageSize);

        return this.http.get<TaskResponse>(this.apiUrl, { params });
    }

    findOne(id: string): Observable<ITask> {
        return this.http.get<ITask>(`${this.apiUrl}/${id}`);
    }

    create(task: ICreateTask): Observable<ITask> {
        return this.http.post<ITask>(this.apiUrl, task);
    }

    update(id: string, task: IUpdateTask): Observable<ITask> {
        return this.http.put<ITask>(`${this.apiUrl}/${id}`, task);
    }

    updateStatus(id: string, status: string): Observable<ITask> {
        return this.http.patch<ITask>(`${this.apiUrl}/${id}/status`, { status });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
