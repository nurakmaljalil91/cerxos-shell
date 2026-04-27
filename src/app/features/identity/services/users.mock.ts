import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AssignRoleToUserCommand,
  BaseResponseOfPaginatedEnumerableOfUserDto,
  BaseResponseOfUserDto,
  CreateUserCommand,
  PaginatedEnumerableOfUserDto,
  UpdateUserCommand,
  UserDto,
} from '../../../shared/models/model';
import { QueryRequest } from '../../../shared/models/query-request';

@Injectable({
  providedIn: 'root',
})
export class UsersMock {
  private readonly roleNamesById = new Map([
    ['1', 'Admin'],
    ['2', 'Manager'],
    ['3', 'Auditor'],
  ]);

  private readonly users: UserDto[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@cerxos.dev',
      phoneNumber: '+1 555 0100',
      roles: ['Admin'],
      isLocked: false,
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@cerxos.dev',
      phoneNumber: '+1 555 0101',
      roles: ['Manager'],
      isLocked: false,
    },
    {
      id: '3',
      username: 'auditor',
      email: 'auditor@cerxos.dev',
      phoneNumber: '+1 555 0102',
      roles: ['Auditor'],
      isLocked: true,
    },
    {
      id: '4',
      username: 'support',
      email: 'support@cerxos.dev',
      phoneNumber: '+1 555 0103',
      roles: ['Support'],
      isLocked: false,
    },
    {
      id: '5',
      username: 'analyst',
      email: 'analyst@cerxos.dev',
      phoneNumber: '+1 555 0104',
      roles: ['Analyst'],
      isLocked: false,
    },
  ];

  getUsers(query: QueryRequest): Observable<BaseResponseOfPaginatedEnumerableOfUserDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    const items = [...this.users];
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
      hasNextPage: page < totalPages,
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      message: 'Mock users loaded.',
      data,
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfUserDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  getMyUser(): Observable<BaseResponseOfUserDto> {
    return this.createResponse({
      success: true,
      message: 'Mock current user loaded.',
      data: this.users[0],
    });
  }

  createUser(command: CreateUserCommand): Observable<BaseResponseOfUserDto> {
    const newUser: UserDto = {
      id: crypto.randomUUID(),
      username: command.username ?? '',
      email: command.email ?? '',
      phoneNumber: command.phoneNumber ?? '',
      roles: [],
      isLocked: false,
    };

    this.users.unshift(newUser);

    const response: BaseResponseOfUserDto = {
      success: true,
      message: 'Mock user created.',
      data: newUser,
    };

    return new Observable<BaseResponseOfUserDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  updateUser(userId: string, command: UpdateUserCommand): Observable<BaseResponseOfUserDto> {
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (userIndex < 0) {
      const response: BaseResponseOfUserDto = {
        success: false,
        message: 'Mock user not found.',
      };

      return new Observable<BaseResponseOfUserDto>((observer) => {
        setTimeout(() => {
          observer.next(response);
          observer.complete();
        }, 300);
      });
    }

    const updatedUser: UserDto = {
      ...this.users[userIndex],
      username: command.username ?? '',
      email: command.email ?? '',
      phoneNumber: command.phoneNumber ?? '',
      isLocked: command.isLocked ?? false,
    };

    this.users[userIndex] = updatedUser;

    const response: BaseResponseOfUserDto = {
      success: true,
      message: 'Mock user updated.',
      data: updatedUser,
    };

    return new Observable<BaseResponseOfUserDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  assignRoleToUser(
    userId: string,
    command: AssignRoleToUserCommand,
  ): Observable<BaseResponseOfUserDto> {
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (userIndex < 0) {
      return this.createResponse({
        success: false,
        message: 'Mock user not found.',
      });
    }

    const roleName = this.roleNamesById.get(command.roleId ?? '') ?? command.roleId ?? '';
    const user = this.users[userIndex];

    if (user.roles?.includes(roleName)) {
      return this.createResponse({
        success: false,
        message: 'Role already assigned.',
      });
    }

    const updatedUser: UserDto = {
      ...user,
      roles: [...(user.roles ?? []), roleName],
    };

    this.users[userIndex] = updatedUser;

    return this.createResponse({
      success: true,
      message: 'Mock role assigned to user.',
      data: updatedUser,
    });
  }

  unassignRoleFromUser(userId: string, roleId: string): Observable<BaseResponseOfUserDto> {
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (userIndex < 0) {
      return this.createResponse({
        success: false,
        message: 'Mock user not found.',
      });
    }

    const roleName = this.roleNamesById.get(roleId) ?? roleId;
    const user = this.users[userIndex];

    if (!user.roles?.includes(roleName)) {
      return this.createResponse({
        success: false,
        message: 'Role is not assigned to user.',
      });
    }

    const updatedUser: UserDto = {
      ...user,
      roles: user.roles.filter((role) => role !== roleName),
    };

    this.users[userIndex] = updatedUser;

    return this.createResponse({
      success: true,
      message: 'Mock role unassigned from user.',
      data: updatedUser,
    });
  }

  private createResponse(response: BaseResponseOfUserDto): Observable<BaseResponseOfUserDto> {
    return new Observable<BaseResponseOfUserDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
