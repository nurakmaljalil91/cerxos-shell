import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfUserPreferenceDto,
  BaseResponseOfUserPreferenceDto,
  CreateUserPreferenceCommand,
  PaginatedEnumerableOfUserPreferenceDto,
  UpdateUserPreferenceCommand,
  UserPreferenceDto,
} from '../../../shared/models/model';
import type { UserPreferencesQuery } from './user-preferences.service';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesMock {
  private readonly preferences: UserPreferenceDto[] = [
    { id: 'pref-1', userId: 'user-1', key: 'ui.language', value: 'en' },
    { id: 'pref-2', userId: 'user-1', key: 'ui.defaultLanding', value: 'dashboard' },
    { id: 'pref-3', userId: 'user-1', key: 'ui.dateFormat', value: 'mdy' },
    { id: 'pref-4', userId: 'user-1', key: 'ui.currencyFormat', value: 'usd' },
    { id: 'pref-5', userId: 'user-1', key: 'theme', value: 'light' },
    { id: 'pref-6', userId: 'user-1', key: 'ui.density', value: 'comfortable' },
    { id: 'pref-7', userId: 'user-1', key: 'ui.compactNavigation', value: 'true' },
    { id: 'pref-8', userId: 'user-1', key: 'ui.analyticsHints', value: 'false' },
  ];

  getMyUserPreferences(
    query: UserPreferencesQuery,
  ): Observable<BaseResponseOfPaginatedEnumerableOfUserPreferenceDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);
    const items = [...this.preferences];
    const start = (page - 1) * total;
    const pageItems = items.slice(start, start + total);
    const totalPages = Math.max(Math.ceil(items.length / total), 1);

    const data: PaginatedEnumerableOfUserPreferenceDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    return this.createListResponse({
      success: true,
      message: 'Mock user preferences loaded.',
      data,
    });
  }

  createUserPreference(
    command: CreateUserPreferenceCommand,
  ): Observable<BaseResponseOfUserPreferenceDto> {
    const preference: UserPreferenceDto = {
      id: crypto.randomUUID(),
      userId: command.userId,
      key: command.key ?? '',
      value: command.value ?? '',
    };

    this.preferences.push(preference);

    return this.createItemResponse({
      success: true,
      message: 'Mock user preference created.',
      data: preference,
    });
  }

  updateUserPreference(
    preferenceId: string,
    command: UpdateUserPreferenceCommand,
  ): Observable<BaseResponseOfUserPreferenceDto> {
    const preference = this.preferences.find((item) => item.id === preferenceId);

    if (!preference) {
      return this.createItemResponse({
        success: false,
        message: 'Mock user preference not found.',
      });
    }

    preference.key = command.key ?? preference.key;
    preference.value = command.value ?? '';

    return this.createItemResponse({
      success: true,
      message: 'Mock user preference updated.',
      data: preference,
    });
  }

  private createListResponse(
    response: BaseResponseOfPaginatedEnumerableOfUserPreferenceDto,
  ): Observable<BaseResponseOfPaginatedEnumerableOfUserPreferenceDto> {
    return new Observable<BaseResponseOfPaginatedEnumerableOfUserPreferenceDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 250);
    });
  }

  private createItemResponse(
    response: BaseResponseOfUserPreferenceDto,
  ): Observable<BaseResponseOfUserPreferenceDto> {
    return new Observable<BaseResponseOfUserPreferenceDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 250);
    });
  }
}
