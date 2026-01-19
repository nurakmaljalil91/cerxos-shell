import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfPermissionDto,
  BaseResponseOfPermissionDto,
  CreatePermissionCommand
} from '../../../shared/models/model';
import { PermissionsMock } from './permissions.mock';

export type PermissionsQuery = {
  page: number;
  total: number;
  sortBy?: string;
  descending?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(PermissionsMock);
  private readonly permissionsEndpoint = `${environment.apiBaseUrl}/api/permissions`;

  getPermissions(query: PermissionsQuery): Observable<BaseResponseOfPaginatedEnumerableOfPermissionDto> {
    if (environment.testMode) {
      return this.mock.getPermissions(query);
    }

    let params = new HttpParams()
      .set('page', String(query.page))
      .set('total', String(query.total));

    if (query.sortBy) {
      params = params
        .set('sortBy', query.sortBy)
        .set('descending', String(!!query.descending));
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfPermissionDto>(
      this.permissionsEndpoint,
      { params }
    );
  }

  createPermission(command: CreatePermissionCommand): Observable<BaseResponseOfPermissionDto> {
    if (environment.testMode) {
      return this.mock.createPermission(command);
    }

    return this.http.post<BaseResponseOfPermissionDto>(this.permissionsEndpoint, command);
  }
}
