import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfSkillDto,
  BaseResponseOfSkillDtoList,
  BaseResponseOfString,
  CreateSkillCommand,
  UpdateSkillCommand,
} from '../../../shared/models/model';
import { SkillsMock } from './skills.mock';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(SkillsMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/skills`;

  listMine(): Observable<BaseResponseOfSkillDtoList> {
    if (environment.testMode) {
      return this.mock.listMine();
    }

    return this.http.get<BaseResponseOfSkillDtoList>(`${this.endpoint}/me`);
  }

  create(command: CreateSkillCommand): Observable<BaseResponseOfSkillDto> {
    if (environment.testMode) {
      return this.mock.create(command);
    }

    return this.http.post<BaseResponseOfSkillDto>(this.endpoint, command);
  }

  update(id: string, command: UpdateSkillCommand): Observable<BaseResponseOfSkillDto> {
    if (environment.testMode) {
      return this.mock.update(id, command);
    }

    return this.http.put<BaseResponseOfSkillDto>(`${this.endpoint}/${id}`, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.delete(id);
    }

    return this.http.delete<BaseResponseOfString>(`${this.endpoint}/${id}`);
  }
}
