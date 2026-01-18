import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfGroupDto,
  BaseResponseOfPaginatedEnumerableOfGroupDto,
  CreateGroupCommand,
  GroupDto,
  PaginatedEnumerableOfGroupDto,
} from '../../../shared/models/model';
import type { GroupsQuery } from './groups.service';

@Injectable({
  providedIn: 'root',
})
export class GroupsMock {
  private readonly groups: GroupDto[] = [
    {
      id: '1',
      name: 'Administrators',
      description: 'Full access to system administration.',
      roles: ['Admin'],
    },
    {
      id: '2',
      name: 'Support',
      description: 'Support and help desk staff.',
      roles: ['Support', 'Auditor'],
    },
    {
      id: '3',
      name: 'Finance',
      description: 'Billing and payments.',
      roles: ['Manager'],
    },
  ];

  getGroups(query: GroupsQuery): Observable<BaseResponseOfPaginatedEnumerableOfGroupDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    const items = [...this.groups];
    const start = (page - 1) * total;
    const pageItems = items.slice(start, start + total);
    const totalPages = Math.max(Math.ceil(items.length / total), 1);

    const data: PaginatedEnumerableOfGroupDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const response: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      message: 'Mock groups loaded.',
      data,
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfGroupDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  createGroup(command: CreateGroupCommand): Observable<BaseResponseOfGroupDto> {
    const newGroup: GroupDto = {
      id: crypto.randomUUID(),
      name: command.name ?? '',
      description: command.description ?? '',
      roles: [],
    };

    this.groups.unshift(newGroup);

    const response: BaseResponseOfGroupDto = {
      success: true,
      message: 'Mock group created.',
      data: newGroup,
    };

    return new Observable<BaseResponseOfGroupDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
