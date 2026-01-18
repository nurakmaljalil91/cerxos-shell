import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfUserProfileDto,
  BaseResponseOfUserProfileDto,
  PaginatedEnumerableOfUserProfileDto,
  UserProfileDto,
} from '../../../shared/models/model';
import type { UserProfilesQuery } from './user-profiles.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfilesMock {
  private readonly profiles: UserProfileDto[] = [
    {
      id: '1',
      userId: 'user-1',
      displayName: 'Ava Martinez',
      firstName: 'Ava',
      lastName: 'Martinez',
      identityCardNumber: 'ID-123456',
      passportNumber: 'P-987654',
      dateOfBirth: '1990-04-12',
      birthPlace: 'Madrid',
      shoeSize: '38',
      clothingSize: 'M',
      waistSize: '30',
      bio: 'Operations lead focused on streamlining workflows.',
      imageUrl: '',
      tag: 'Core',
      bloodType: 'O+',
    },
    {
      id: '2',
      userId: 'user-2',
      displayName: 'Jordan Lee',
      firstName: 'Jordan',
      lastName: 'Lee',
      identityCardNumber: 'ID-654321',
      passportNumber: 'P-123789',
      dateOfBirth: '1987-11-02',
      birthPlace: 'Seoul',
      shoeSize: '41',
      clothingSize: 'L',
      waistSize: '33',
      bio: 'Customer success specialist with a passion for people.',
      imageUrl: '',
      tag: 'Support',
      bloodType: 'A-',
    },
  ];

  getUserProfiles(
    query: UserProfilesQuery,
  ): Observable<BaseResponseOfPaginatedEnumerableOfUserProfileDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    const items = [...this.profiles];
    if (query.sortBy) {
      const key = query.sortBy as keyof UserProfileDto;
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

    const data: PaginatedEnumerableOfUserProfileDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserProfileDto = {
      success: true,
      message: 'Mock user profiles loaded.',
      data,
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfUserProfileDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  getUserProfileById(id: string): Observable<BaseResponseOfUserProfileDto> {
    const profile = this.profiles.find((item) => item.id === id);
    const response: BaseResponseOfUserProfileDto = profile
      ? {
          success: true,
          message: 'Mock user profile loaded.',
          data: profile,
        }
      : {
          success: false,
          message: 'User profile not found.',
        };

    return new Observable<BaseResponseOfUserProfileDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  getMyUserProfiles(): Observable<BaseResponseOfUserProfileDto> {
    const profile = this.profiles[0];
    const response: BaseResponseOfUserProfileDto = {
      success: true,
      message: 'Mock my user profile loaded.',
      data: profile,
    };

    return new Observable<BaseResponseOfUserProfileDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
