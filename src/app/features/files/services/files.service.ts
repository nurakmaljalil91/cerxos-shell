import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfFileRecordDto,
  FileRecordsQueryRequest,
} from '../../../shared/models/model';
import { FilesMock } from './files.mock';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(FilesMock);
  private readonly filesEndpoint = `${environment.fileServiceBaseUrl}/api/files`;

  getFiles(query: FileRecordsQueryRequest): Observable<BaseResponseOfPaginatedEnumerableOfFileRecordDto> {
    if (environment.testMode) {
      return this.mock.getFiles(query);
    }

    let params = new HttpParams()
      .set('page', String(query.page))
      .set('total', String(query.total));

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy).set('descending', String(!!query.descending));
    }

    if (query.filter) {
      params = params.set('filter', query.filter);
    }

    if (query.category) {
      params = params.set('category', query.category);
    }

    return this.http.get<BaseResponseOfPaginatedEnumerableOfFileRecordDto>(this.filesEndpoint, {
      params,
    });
  }
}
