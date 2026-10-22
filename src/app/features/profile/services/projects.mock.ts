import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfProjectDto,
  BaseResponseOfProjectDtoList,
  BaseResponseOfString,
  CreateProjectCommand,
  ProjectDto,
  UpdateProjectCommand,
} from '../../../shared/models/model';
import { CareerRecordMock } from './career-record.mock';

@Injectable({
  providedIn: 'root',
})
export class ProjectsMock {
  private readonly store = new CareerRecordMock<ProjectDto, CreateProjectCommand, UpdateProjectCommand>(
    'project',
    'project',
    [
    {
      id: 'project-1',
      userId: 'user-1',
      title: 'Cerxos',
      description: 'Personal productivity platform.',
      url: 'https://cerxos.example',
      techStack: 'Angular, .NET, PostgreSQL',
      startDate: '2024-01-01',
    },
    ],
  );

  listMine(): Observable<BaseResponseOfProjectDtoList> {
    return this.store.listMine();
  }

  create(command: CreateProjectCommand): Observable<BaseResponseOfProjectDto> {
    return this.store.create(command);
  }

  update(id: string, command: UpdateProjectCommand): Observable<BaseResponseOfProjectDto> {
    return this.store.update(id, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    return this.store.delete(id);
  }
}
