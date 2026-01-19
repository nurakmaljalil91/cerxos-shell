import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfUserDto,
  BaseResponseOfUserDto,
  CreateUserCommand,
} from '../../../shared/models/model';
import { UsersMock } from './users.mock';
import { QueryRequest } from '../../../shared/models/query-request';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(UsersMock);
  private readonly usersEndpoint = `${environment.apiBaseUrl}/api/users`;

  getUsers(query: QueryRequest): Observable<BaseResponseOfPaginatedEnumerableOfUserDto> {
    if (environment.testMode) {
      return this.mock.getUsers(query);
    }

    let params = new HttpParams().set('page', String(query.page)).set('total', String(query.total));

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy).set('descending', String(!!query.descending));
    }

    if (query.filter) {
      params = params.set('filter', query.filter);
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfUserDto>(this.usersEndpoint, {
      params,
    });
  }

  createUser(command: CreateUserCommand): Observable<BaseResponseOfUserDto> {
    if (environment.testMode) {
      return this.mock.createUser(command);
    }

    return this.http.post<BaseResponseOfUserDto>(this.usersEndpoint, command);
  }
}
