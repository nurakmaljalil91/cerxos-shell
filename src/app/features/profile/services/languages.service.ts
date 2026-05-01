import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfLanguageDto,
  BaseResponseOfPaginatedEnumerableOfLanguageDto,
  BaseResponseOfString,
  CreateLanguageCommand,
  UpdateLanguageCommand,
} from '../../../shared/models/model';
import { LanguagesMock } from './languages.mock';

@Injectable({
  providedIn: 'root',
})
export class LanguagesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(LanguagesMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/languages`;

  getLanguagesByUserId(
    userId: string,
  ): Observable<BaseResponseOfPaginatedEnumerableOfLanguageDto> {
    if (environment.testMode) {
      return this.mock.getLanguagesByUserId(userId);
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfLanguageDto>(
      `${this.endpoint}?userId=${encodeURIComponent(userId)}`,
    );
  }

  createLanguage(command: CreateLanguageCommand): Observable<BaseResponseOfLanguageDto> {
    if (environment.testMode) {
      return this.mock.createLanguage(command);
    }

    return this.http.post<BaseResponseOfLanguageDto>(this.endpoint, command);
  }

  updateLanguage(
    id: string,
    command: UpdateLanguageCommand,
  ): Observable<BaseResponseOfLanguageDto> {
    if (environment.testMode) {
      return this.mock.updateLanguage(id, command);
    }

    return this.http.patch<BaseResponseOfLanguageDto>(`${this.endpoint}/${id}`, command);
  }

  deleteLanguage(id: string): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.deleteLanguage(id);
    }

    return this.http.delete<BaseResponseOfString>(`${this.endpoint}/${id}`);
  }
}
