import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfSkillDto,
  BaseResponseOfSkillDtoList,
  BaseResponseOfString,
  CreateSkillCommand,
  SkillDto,
  UpdateSkillCommand,
} from '../../../shared/models/model';
import { CareerRecordMock } from './career-record.mock';

@Injectable({
  providedIn: 'root',
})
export class SkillsMock {
  private readonly store = new CareerRecordMock<SkillDto, CreateSkillCommand, UpdateSkillCommand>(
    'skill',
    'skill',
    [
    { id: 'skill-1', userId: 'user-1', name: 'Angular', proficiency: 'Advanced', yearsOfExperience: 5 },
    { id: 'skill-2', userId: 'user-1', name: '.NET', proficiency: 'Advanced', yearsOfExperience: 6 },
    ],
  );

  listMine(): Observable<BaseResponseOfSkillDtoList> {
    return this.store.listMine();
  }

  create(command: CreateSkillCommand): Observable<BaseResponseOfSkillDto> {
    return this.store.create(command);
  }

  update(id: string, command: UpdateSkillCommand): Observable<BaseResponseOfSkillDto> {
    return this.store.update(id, command);
  }

  delete(id: string): Observable<BaseResponseOfString> {
    return this.store.delete(id);
  }
}
