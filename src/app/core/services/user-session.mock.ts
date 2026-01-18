import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponseOfUserSessionDto } from '../../shared/models/model';

@Injectable({
  providedIn: 'root',
})
export class UserSessionMock {
  getSession(): Observable<BaseResponseOfUserSessionDto> {
    const response: BaseResponseOfUserSessionDto = {
      success: true,
      message: 'Session loaded.',
      data: {
        user: {
          id: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['Admin'],
          permissions: ['users.read', 'users.write'],
        },
        profile: {
          id: 'profile-1',
          userId: 'user-1',
          displayName: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          imageUrl: 'https://example.com/avatar.png',
        },
        preferences: [{ key: 'theme', value: 'light' }],
        roles: ['Admin'],
        permissions: ['users.read', 'users.write'],
        groups: ['Admins'],
        groupRoles: { Admins: ['Admin'] },
      },
    };

    return new Observable<BaseResponseOfUserSessionDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
