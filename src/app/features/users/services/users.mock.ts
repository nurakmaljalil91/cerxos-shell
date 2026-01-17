import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfUserDto,
  PaginatedEnumerableOfUserDto,
  UserDto
} from '../../../shared/models/model';
import type { UsersQuery } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class UsersMock {
  private readonly users: UserDto[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@cerxos.dev',
      phoneNumber: '+1 555 0100',
      roles: ['Admin'],
      isLocked: false
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@cerxos.dev',
      phoneNumber: '+1 555 0101',
      roles: ['Manager'],
      isLocked: false
    },
    {
      id: '3',
      username: 'auditor',
      email: 'auditor@cerxos.dev',
      phoneNumber: '+1 555 0102',
      roles: ['Auditor'],
      isLocked: true
    },
    {
      id: '4',
      username: 'support',
      email: 'support@cerxos.dev',
      phoneNumber: '+1 555 0103',
      roles: ['Support'],
      isLocked: false
    },
    {
      id: '5',
      username: 'analyst',
      email: 'analyst@cerxos.dev',
      phoneNumber: '+1 555 0104',
      roles: ['Analyst'],
      isLocked: false
    }
  ];

  getUsers(query: UsersQuery): Observable<BaseResponseOfPaginatedEnumerableOfUserDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    let items = [...this.users];
    if (query.sortBy) {
      const key = query.sortBy as keyof UserDto;
      items.sort((a, b) => {
        const aValue = (a[key] ?? '').toString().toLowerCase();
        const bValue = (b[key] ?? '').toString().toLowerCase();
        if (aValue < bValue) {
          return -1;
        }
        if (aValue > bValue) {
          return 1;
        }
        return 0;
      });
      if (query.descending) {
        items.reverse();
      }
    }

    const start = (page - 1) * total;
    const pageItems = items.slice(start, start + total);
    const totalPages = Math.max(Math.ceil(items.length / total), 1);

    const data: PaginatedEnumerableOfUserDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      message: 'Mock users loaded.',
      data
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfUserDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
