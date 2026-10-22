import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfEducationDto,
  BaseResponseOfEducationDtoList,
  BaseResponseOfString,
  CreateEducationCommand,
  UpdateEducationCommand,
} from '../../../shared/models/model';
import { EducationsMock } from './educations.mock';

@Injectable({
  providedIn: 'root',
})
export class EducationsService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(EducationsMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/educations`;

  listMine(): Observable<BaseResponseOfEducationDtoList> {
    if (environment.testMode) {
      return this.mock.listMine();
    }

    return this.http.get<BaseResponseOfEducationDtoList>(`${this.endpoint}/me`);
  }

  create(command: CreateEducationCommand): Observable<BaseResponseOfEducationDto> {
    if (environment.testMode) {
      return this.mock.create(command);
    }

    return this.http.post<BaseResponseOfEducationDto>(this.endpoint, command);
  }

  update(id: string, command: UpdateEducationCommand): Observable<BaseResponseOfEducationDto> {
    if (environment.testMode) {
      return this.mock.update(id, command);
    }

    return this.http.put<BaseResponseOfEducationDto>(`${this.endpoint}/${id}`, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.delete(id);
    }

    return this.http.delete<BaseResponseOfString>(`${this.endpoint}/${id}`);
  }
}
