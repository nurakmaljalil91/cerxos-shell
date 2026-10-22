import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfProjectDto,
  BaseResponseOfProjectDtoList,
  BaseResponseOfString,
  CreateProjectCommand,
  UpdateProjectCommand,
} from '../../../shared/models/model';
import { ProjectsMock } from './projects.mock';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(ProjectsMock);
  private readonly endpoint = `${environment.apiBaseUrl}/api/projects`;

  listMine(): Observable<BaseResponseOfProjectDtoList> {
    if (environment.testMode) {
      return this.mock.listMine();
    }

    return this.http.get<BaseResponseOfProjectDtoList>(`${this.endpoint}/me`);
  }

  create(command: CreateProjectCommand): Observable<BaseResponseOfProjectDto> {
    if (environment.testMode) {
      return this.mock.create(command);
    }

    return this.http.post<BaseResponseOfProjectDto>(this.endpoint, command);
  }

  update(id: string, command: UpdateProjectCommand): Observable<BaseResponseOfProjectDto> {
    if (environment.testMode) {
      return this.mock.update(id, command);
    }

    return this.http.put<BaseResponseOfProjectDto>(`${this.endpoint}/${id}`, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.delete(id);
    }

    return this.http.delete<BaseResponseOfString>(`${this.endpoint}/${id}`);
  }
}
