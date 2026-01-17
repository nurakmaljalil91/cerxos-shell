import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfRoleDto,
  BaseResponseOfRoleDto,
  CreateRoleCommand,
  PaginatedEnumerableOfRoleDto,
  RoleDto
} from '../../../shared/models/model';
import type { RolesQuery } from './roles.service';

@Injectable({
  providedIn: 'root'
})
export class RolesMock {
  private readonly roles: RoleDto[] = [
    {
      id: '1',
      name: 'Admin',
      description: 'Full access to the platform.',
      permissions: ['users.read', 'users.write', 'roles.manage', 'permissions.manage']
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Manage teams and assignments.',
      permissions: ['users.read', 'projects.write']
    },
    {
      id: '3',
      name: 'Auditor',
      description: 'Read-only access to reports.',
      permissions: ['reports.read']
    }
  ];

  getRoles(query: RolesQuery): Observable<BaseResponseOfPaginatedEnumerableOfRoleDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    const items = [...this.roles];
    const start = (page - 1) * total;
    const pageItems = items.slice(start, start + total);
    const totalPages = Math.max(Math.ceil(items.length / total), 1);

    const data: PaginatedEnumerableOfRoleDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    };

    const response: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      message: 'Mock roles loaded.',
      data
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfRoleDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  createRole(command: CreateRoleCommand): Observable<BaseResponseOfRoleDto> {
    const newRole: RoleDto = {
      id: crypto.randomUUID(),
      name: command.name ?? '',
      description: command.description ?? '',
      permissions: []
    };

    this.roles.unshift(newRole);

    const response: BaseResponseOfRoleDto = {
      success: true,
      message: 'Mock role created.',
      data: newRole
    };

    return new Observable<BaseResponseOfRoleDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
