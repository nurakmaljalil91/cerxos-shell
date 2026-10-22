import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfEducationDto,
  BaseResponseOfEducationDtoList,
  BaseResponseOfString,
  CreateEducationCommand,
  EducationDto,
  UpdateEducationCommand,
} from '../../../shared/models/model';
import { CareerRecordMock } from './career-record.mock';

@Injectable({
  providedIn: 'root',
})
export class EducationsMock {
  private readonly store = new CareerRecordMock<EducationDto, CreateEducationCommand, UpdateEducationCommand>(
    'edu',
    'education',
    [
    {
      id: 'edu-1',
      userId: 'user-1',
      institution: 'Universiti Teknologi Malaysia',
      degree: 'Bachelor of Computer Science',
      fieldOfStudy: 'Software Engineering',
      startDate: '2014-09-01',
      endDate: '2018-06-30',
      grade: 'First class',
    },
    ],
  );

  listMine(): Observable<BaseResponseOfEducationDtoList> {
    return this.store.listMine();
  }

  create(command: CreateEducationCommand): Observable<BaseResponseOfEducationDto> {
    return this.store.create(command);
  }

  update(id: string, command: UpdateEducationCommand): Observable<BaseResponseOfEducationDto> {
    return this.store.update(id, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    return this.store.delete(id);
  }
}
