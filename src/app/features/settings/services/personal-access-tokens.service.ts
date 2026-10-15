import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfCreatedPersonalAccessTokenDto,
  BaseResponseOfPersonalAccessTokenDto,
  BaseResponseOfPersonalAccessTokenDtoList,
  BaseResponseOfStringList,
  CreatePersonalAccessTokenCommand,
} from '../../../shared/models/model';
import { PersonalAccessTokensMock } from './personal-access-tokens.mock';

@Injectable({
  providedIn: 'root',
})
export class PersonalAccessTokensService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(PersonalAccessTokensMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/personalaccesstokens`;

  getScopes(): Observable<BaseResponseOfStringList> {
    if (environment.testMode) {
      return this.mock.getScopes();
    }

    return this.http.get<BaseResponseOfStringList>(`${this.endpoint}/scopes`);
  }

  getMyTokens(): Observable<BaseResponseOfPersonalAccessTokenDtoList> {
    if (environment.testMode) {
      return this.mock.getMyTokens();
    }

    return this.http.get<BaseResponseOfPersonalAccessTokenDtoList>(this.endpoint);
  }

  createToken(
    command: CreatePersonalAccessTokenCommand,
  ): Observable<BaseResponseOfCreatedPersonalAccessTokenDto> {
    if (environment.testMode) {
      return this.mock.createToken(command);
    }

    return this.http.post<BaseResponseOfCreatedPersonalAccessTokenDto>(this.endpoint, command);
  }

  revokeToken(id: string): Observable<BaseResponseOfPersonalAccessTokenDto> {
    if (environment.testMode) {
      return this.mock.revokeToken(id);
    }

    return this.http.delete<BaseResponseOfPersonalAccessTokenDto>(`${this.endpoint}/${id}`);
  }
}
