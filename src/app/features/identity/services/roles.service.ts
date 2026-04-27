import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfRoleDto,
  BaseResponseOfRoleDto,
  CreateRoleCommand,
  UpdateRoleCommand,
} from '../../../shared/models/model';
import { RolesMock } from './roles.mock';

export type RolesQuery = {
  page: number;
  total: number;
  sortBy?: string;
  descending?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(RolesMock);
  private readonly rolesEndpoint = `${environment.apiBaseUrl}/api/roles`;

  getRoles(query: RolesQuery): Observable<BaseResponseOfPaginatedEnumerableOfRoleDto> {
    if (environment.testMode) {
      return this.mock.getRoles(query);
    }

    let params = new HttpParams().set('page', String(query.page)).set('total', String(query.total));

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy).set('descending', String(!!query.descending));
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfRoleDto>(this.rolesEndpoint, {
      params,
    });
  }

  createRole(command: CreateRoleCommand): Observable<BaseResponseOfRoleDto> {
    if (environment.testMode) {
      return this.mock.createRole(command);
    }

    return this.http.post<BaseResponseOfRoleDto>(this.rolesEndpoint, command);
  }

  updateRole(roleId: string, command: UpdateRoleCommand): Observable<BaseResponseOfRoleDto> {
    if (environment.testMode) {
      return this.mock.updateRole(roleId, command);
    }

    return this.http.patch<BaseResponseOfRoleDto>(`${this.rolesEndpoint}/${roleId}`, command);
  }

  deleteRole(roleId: string): Observable<BaseResponseOfRoleDto> {
    if (environment.testMode) {
      return this.mock.deleteRole(roleId);
    }

    return this.http.delete<BaseResponseOfRoleDto>(`${this.rolesEndpoint}/${roleId}`);
  }
}
