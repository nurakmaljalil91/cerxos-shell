import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfString,
  BaseResponseOfWorkExperienceDto,
  BaseResponseOfWorkExperienceDtoList,
  CreateWorkExperienceCommand,
  UpdateWorkExperienceCommand,
} from '../../../shared/models/model';
import { WorkExperiencesMock } from './work-experiences.mock';

@Injectable({
  providedIn: 'root',
})
export class WorkExperiencesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(WorkExperiencesMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/workexperiences`;

  listMine(): Observable<BaseResponseOfWorkExperienceDtoList> {
    if (environment.testMode) {
      return this.mock.listMine();
    }

    return this.http.get<BaseResponseOfWorkExperienceDtoList>(`${this.endpoint}/me`);
  }

  create(command: CreateWorkExperienceCommand): Observable<BaseResponseOfWorkExperienceDto> {
    if (environment.testMode) {
      return this.mock.create(command);
    }

    return this.http.post<BaseResponseOfWorkExperienceDto>(this.endpoint, command);
  }

  update(id: string, command: UpdateWorkExperienceCommand): Observable<BaseResponseOfWorkExperienceDto> {
    if (environment.testMode) {
      return this.mock.update(id, command);
    }

    return this.http.put<BaseResponseOfWorkExperienceDto>(`${this.endpoint}/${id}`, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.delete(id);
    }

    return this.http.delete<BaseResponseOfString>(`${this.endpoint}/${id}`);
  }
}
