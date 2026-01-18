import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfUserProfileDto,
  BaseResponseOfUserProfileDto,
} from '../../../shared/models/model';
import { UserProfilesMock } from './user-profiles.mock';

export type UserProfilesQuery = {
  page: number;
  total: number;
  sortBy?: string;
  descending?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UserProfilesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(UserProfilesMock);
  private readonly userProfilesEndpoint = `${environment.apiBaseUrl}/api/userprofiles`;

  getUserProfiles(
    query: UserProfilesQuery,
  ): Observable<BaseResponseOfPaginatedEnumerableOfUserProfileDto> {
    if (environment.testMode) {
      return this.mock.getUserProfiles(query);
    }

    let params = new HttpParams()
      .set('page', String(query.page))
      .set('total', String(query.total));

    if (query.sortBy) {
      params = params
        .set('sortBy', query.sortBy)
        .set('descending', String(!!query.descending));
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfUserProfileDto>(
      this.userProfilesEndpoint,
      { params },
    );
  }

  getUserProfileById(id: string): Observable<BaseResponseOfUserProfileDto> {
    if (environment.testMode) {
      return this.mock.getUserProfileById(id);
    }

    return this.http.get<BaseResponseOfUserProfileDto>(
      `${this.userProfilesEndpoint}/${id}`,
    );
  }

  getMyUserProfiles(): Observable<BaseResponseOfUserProfileDto> {
    if (environment.testMode) {
      return this.mock.getMyUserProfiles();
    }

    return this.http.get<BaseResponseOfUserProfileDto>(`${this.userProfilesEndpoint}/me`);
  }
}
