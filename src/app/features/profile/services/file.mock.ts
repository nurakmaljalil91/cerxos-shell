import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponseOfUploadedFileDto } from '../../../shared/models/model';

@Injectable({
  providedIn: 'root',
})
export class FileMock {
  uploadProfilePicture(file: File): Observable<BaseResponseOfUploadedFileDto> {
    const response: BaseResponseOfUploadedFileDto = {
      success: true,
      data: {
        url: 'https://placehold.co/128x128',
        key: 'profiles/mock.jpg',
        contentType: file.type,
        sizeBytes: file.size,
      },
    };

    return new Observable<BaseResponseOfUploadedFileDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 800);
    });
  }
}
