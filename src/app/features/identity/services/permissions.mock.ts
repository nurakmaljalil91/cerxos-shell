import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfPermissionDto,
  BaseResponseOfPermissionDto,
  CreatePermissionCommand,
  PaginatedEnumerableOfPermissionDto,
  PermissionDto
} from '../../../shared/models/model';
import type { PermissionsQuery } from './permissions.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsMock {
  private readonly permissions: PermissionDto[] = [
    { id: '1', name: 'users.read', description: 'View users' },
    { id: '2', name: 'users.write', description: 'Create and update users' },
    { id: '3', name: 'roles.manage', description: 'Manage roles' },
    { id: '4', name: 'permissions.manage', description: 'Manage permissions' },
    { id: '5', name: 'reports.read', description: 'View reports' }
  ];

  getPermissions(query: PermissionsQuery): Observable<BaseResponseOfPaginatedEnumerableOfPermissionDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    const items = [...this.permissions];
    const start = (page - 1) * total;
    const pageItems = items.slice(start, start + total);
    const totalPages = Math.max(Math.ceil(items.length / total), 1);

    const data: PaginatedEnumerableOfPermissionDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    };

    const response: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      message: 'Mock permissions loaded.',
      data
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfPermissionDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  createPermission(command: CreatePermissionCommand): Observable<BaseResponseOfPermissionDto> {
    const newPermission: PermissionDto = {
      id: crypto.randomUUID(),
      name: command.name ?? '',
      description: command.description ?? ''
    };

    this.permissions.unshift(newPermission);

    const response: BaseResponseOfPermissionDto = {
      success: true,
      message: 'Mock permission created.',
      data: newPermission
    };

    return new Observable<BaseResponseOfPermissionDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
