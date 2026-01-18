import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfGroupDto,
  BaseResponseOfPaginatedEnumerableOfGroupDto,
  CreateGroupCommand,
} from '../../../shared/models/model';
import { GroupsMock } from './groups.mock';

export type GroupsQuery = {
  page: number;
  total: number;
  sortBy?: string;
  descending?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(GroupsMock);
  private readonly groupsEndpoint = `${environment.apiBaseUrl}/api/groups`;

  getGroups(query: GroupsQuery): Observable<BaseResponseOfPaginatedEnumerableOfGroupDto> {
    if (environment.testMode) {
      return this.mock.getGroups(query);
    }

    let params = new HttpParams().set('page', String(query.page)).set('total', String(query.total));

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy).set('descending', String(!!query.descending));
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfGroupDto>(this.groupsEndpoint, {
      params,
    });
  }

  createGroup(command: CreateGroupCommand): Observable<BaseResponseOfGroupDto> {
    if (environment.testMode) {
      return this.mock.createGroup(command);
    }

    return this.http.post<BaseResponseOfGroupDto>(this.groupsEndpoint, command);
  }
}
