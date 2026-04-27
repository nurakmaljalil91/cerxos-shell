import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfUserPreferenceDto,
  BaseResponseOfUserPreferenceDto,
  CreateUserPreferenceCommand,
  UpdateUserPreferenceCommand,
} from '../../../shared/models/model';
import { UserPreferencesMock } from './user-preferences.mock';

export type UserPreferencesQuery = {
  page: number;
  total: number;
  sortBy?: string;
  descending?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(UserPreferencesMock);
  private readonly userPreferencesEndpoint = `${environment.apiBaseUrl}/api/userpreferences`;

  getMyUserPreferences(
    query: UserPreferencesQuery,
  ): Observable<BaseResponseOfPaginatedEnumerableOfUserPreferenceDto> {
    if (environment.testMode) {
      return this.mock.getMyUserPreferences(query);
    }

    let params = new HttpParams().set('page', String(query.page)).set('total', String(query.total));

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy).set('descending', String(!!query.descending));
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfUserPreferenceDto>(
      `${this.userPreferencesEndpoint}/me`,
      { params },
    );
  }

  createUserPreference(
    command: CreateUserPreferenceCommand,
  ): Observable<BaseResponseOfUserPreferenceDto> {
    if (environment.testMode) {
      return this.mock.createUserPreference(command);
    }

    return this.http.post<BaseResponseOfUserPreferenceDto>(this.userPreferencesEndpoint, command);
  }

  updateUserPreference(
    preferenceId: string,
    command: UpdateUserPreferenceCommand,
  ): Observable<BaseResponseOfUserPreferenceDto> {
    if (environment.testMode) {
      return this.mock.updateUserPreference(preferenceId, command);
    }

    return this.http.patch<BaseResponseOfUserPreferenceDto>(
      `${this.userPreferencesEndpoint}/${preferenceId}`,
      command,
    );
  }
}
