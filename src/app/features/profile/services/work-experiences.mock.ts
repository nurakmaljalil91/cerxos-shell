import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfString,
  BaseResponseOfWorkExperienceDto,
  BaseResponseOfWorkExperienceDtoList,
  CreateWorkExperienceCommand,
  UpdateWorkExperienceCommand,
  WorkExperienceDto,
} from '../../../shared/models/model';
import { CareerRecordMock } from './career-record.mock';

@Injectable({
  providedIn: 'root',
})
export class WorkExperiencesMock {
  private readonly store = new CareerRecordMock<
    WorkExperienceDto,
    CreateWorkExperienceCommand,
    UpdateWorkExperienceCommand
  >(
    'work',
    'work experience',
    [
    {
      id: 'work-1',
      userId: 'user-1',
      company: 'Cerxos',
      position: 'Software Engineer',
      department: 'Platform',
      location: 'Kuala Lumpur',
      startDate: '2023-02-01',
      description: 'Builds the Cerxos web platform.',
    },
    ],
  );

  listMine(): Observable<BaseResponseOfWorkExperienceDtoList> {
    return this.store.listMine();
  }

  create(command: CreateWorkExperienceCommand): Observable<BaseResponseOfWorkExperienceDto> {
    return this.store.create(command);
  }

  update(id: string, command: UpdateWorkExperienceCommand): Observable<BaseResponseOfWorkExperienceDto> {
    return this.store.update(id, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    return this.store.delete(id);
  }
}
