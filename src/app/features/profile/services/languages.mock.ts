import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfLanguageDto,
  BaseResponseOfPaginatedEnumerableOfLanguageDto,
  BaseResponseOfString,
  CreateLanguageCommand,
  LanguageDto,
  PaginatedEnumerableOfLanguageDto,
  UpdateLanguageCommand,
} from '../../../shared/models/model';

@Injectable({
  providedIn: 'root',
})
export class LanguagesMock {
  private readonly languages: LanguageDto[] = [
    {
      id: 'lang-1',
      userId: 'user-1',
      name: 'English',
      level: 'Native',
    },
    {
      id: 'lang-2',
      userId: 'user-1',
      name: 'Malay',
      level: 'Fluent',
    },
  ];

  private nextId = 3;

  getLanguagesByUserId(
    userId: string,
  ): Observable<BaseResponseOfPaginatedEnumerableOfLanguageDto> {
    const items = this.languages.filter((l) => l.userId === userId);

    const data: PaginatedEnumerableOfLanguageDto = {
      items,
      pageNumber: 1,
      totalPages: 1,
      totalCount: items.length,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    const response: BaseResponseOfPaginatedEnumerableOfLanguageDto = {
      success: true,
      message: 'Mock languages loaded.',
      data,
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfLanguageDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  createLanguage(command: CreateLanguageCommand): Observable<BaseResponseOfLanguageDto> {
    const newLanguage: LanguageDto = {
      id: `lang-${this.nextId++}`,
      userId: command.userId,
      name: command.name,
      level: command.level,
    };

    this.languages.push(newLanguage);

    const response: BaseResponseOfLanguageDto = {
      success: true,
      message: 'Mock language created.',
      data: newLanguage,
    };

    return new Observable<BaseResponseOfLanguageDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  updateLanguage(
    id: string,
    command: UpdateLanguageCommand,
  ): Observable<BaseResponseOfLanguageDto> {
    const index = this.languages.findIndex((l) => l.id === id);
    let response: BaseResponseOfLanguageDto;

    if (index === -1) {
      response = { success: false, message: 'Language not found.' };
    } else {
      this.languages[index] = { ...this.languages[index], ...command };
      response = {
        success: true,
        message: 'Mock language updated.',
        data: this.languages[index],
      };
    }

    return new Observable<BaseResponseOfLanguageDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }

  deleteLanguage(id: string): Observable<BaseResponseOfString> {
    const index = this.languages.findIndex((l) => l.id === id);
    let response: BaseResponseOfString;

    if (index === -1) {
      response = { success: false, message: 'Language not found.' };
    } else {
      this.languages.splice(index, 1);
      response = { success: true, message: 'Mock language deleted.', data: id };
    }

    return new Observable<BaseResponseOfString>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
