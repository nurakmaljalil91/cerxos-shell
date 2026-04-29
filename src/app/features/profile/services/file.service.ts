import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseResponseOfUploadedFileDto } from '../../../shared/models/model';
import { FileMock } from './file.mock';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(FileMock);
  private readonly uploadEndpoint = `${environment.fileServiceBaseUrl}/api/files/upload`;

  uploadProfilePicture(file: File): Observable<BaseResponseOfUploadedFileDto> {
    if (environment.testMode) {
      return this.mock.uploadProfilePicture(file);
    }

    const form = new FormData();
    form.append('file', file);

    return this.http.post<BaseResponseOfUploadedFileDto>(this.uploadEndpoint, form);
  }
}
