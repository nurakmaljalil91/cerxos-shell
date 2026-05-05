import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfFileRecordDto,
  FileCategory,
  FileRecordDto,
  FileRecordsQueryRequest,
  PaginatedEnumerableOfFileRecordDto,
} from '../../../shared/models/model';

@Injectable({
  providedIn: 'root',
})
export class FilesMock {
  private readonly files: FileRecordDto[] = [
    {
      id: 1,
      originalFileName: 'profile-photo.jpg',
      key: 'uploads/profile-photo.jpg',
      url: 'http://localhost:7061/api/files/1/download',
      contentType: 'image/jpeg',
      sizeBytes: 204800,
      category: 'Image' as FileCategory,
      uploadedBy: 'admin@cerxos.dev',
      uploadedAt: '2026-04-01T08:30:00.000Z',
    },
    {
      id: 2,
      originalFileName: 'company-intro.mp4',
      key: 'uploads/company-intro.mp4',
      url: 'http://localhost:7061/api/files/2/download',
      contentType: 'video/mp4',
      sizeBytes: 52428800,
      category: 'Video' as FileCategory,
      uploadedBy: 'manager@cerxos.dev',
      uploadedAt: '2026-04-03T10:15:00.000Z',
    },
    {
      id: 3,
      originalFileName: 'meeting-notes.pdf',
      key: 'uploads/meeting-notes.pdf',
      url: 'http://localhost:7061/api/files/3/download',
      contentType: 'application/pdf',
      sizeBytes: 512000,
      category: 'Document' as FileCategory,
      uploadedBy: 'auditor@cerxos.dev',
      uploadedAt: '2026-04-05T14:00:00.000Z',
    },
    {
      id: 4,
      originalFileName: 'podcast-episode-01.mp3',
      key: 'uploads/podcast-episode-01.mp3',
      url: 'http://localhost:7061/api/files/4/download',
      contentType: 'audio/mpeg',
      sizeBytes: 10485760,
      category: 'Audio' as FileCategory,
      uploadedBy: 'admin@cerxos.dev',
      uploadedAt: '2026-04-07T09:00:00.000Z',
    },
    {
      id: 5,
      originalFileName: 'dashboard-screenshot.png',
      key: 'uploads/dashboard-screenshot.png',
      url: 'http://localhost:7061/api/files/5/download',
      contentType: 'image/png',
      sizeBytes: 1048576,
      category: 'Image' as FileCategory,
      uploadedBy: 'support@cerxos.dev',
      uploadedAt: '2026-04-10T11:45:00.000Z',
    },
    {
      id: 6,
      originalFileName: 'quarterly-report-q1-2026.xlsx',
      key: 'uploads/quarterly-report-q1-2026.xlsx',
      url: 'http://localhost:7061/api/files/6/download',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeBytes: 307200,
      category: 'Document' as FileCategory,
      uploadedBy: 'analyst@cerxos.dev',
      uploadedAt: '2026-04-15T16:30:00.000Z',
    },
    {
      id: 7,
      originalFileName: 'product-demo.mp4',
      key: 'uploads/product-demo.mp4',
      url: 'http://localhost:7061/api/files/7/download',
      contentType: 'video/mp4',
      sizeBytes: 78643200,
      category: 'Video' as FileCategory,
      uploadedBy: 'manager@cerxos.dev',
      uploadedAt: '2026-04-18T13:00:00.000Z',
    },
    {
      id: 8,
      originalFileName: 'ambient-track.wav',
      key: 'uploads/ambient-track.wav',
      url: 'http://localhost:7061/api/files/8/download',
      contentType: 'audio/wav',
      sizeBytes: 20971520,
      category: 'Audio' as FileCategory,
      uploadedBy: 'support@cerxos.dev',
      uploadedAt: '2026-04-22T08:00:00.000Z',
    },
  ];

  getFiles(query: FileRecordsQueryRequest): Observable<BaseResponseOfPaginatedEnumerableOfFileRecordDto> {
    const page = Math.max(query.page ?? 1, 1);
    const total = Math.max(query.total ?? 10, 1);

    let items = [...this.files];

    if (query.category) {
      items = items.filter((f) => f.category === query.category);
    }

    if (query.filter) {
      const lower = query.filter.toLowerCase();
      items = items.filter(
        (f) =>
          f.originalFileName?.toLowerCase().includes(lower) ||
          f.uploadedBy?.toLowerCase().includes(lower),
      );
    }

    if (query.sortBy) {
      const key = query.sortBy as keyof FileRecordDto;
      items.sort((a, b) => {
        const aValue = (a[key] ?? '').toString().toLowerCase();
        const bValue = (b[key] ?? '').toString().toLowerCase();
        if (aValue < bValue) {
          return -1;
        }
        if (aValue > bValue) {
          return 1;
        }
        return 0;
      });
      if (query.descending) {
        items.reverse();
      }
    }

    const start = (page - 1) * total;
    const pageItems = items.slice(start, start + total);
    const totalPages = Math.max(Math.ceil(items.length / total), 1);

    const data: PaginatedEnumerableOfFileRecordDto = {
      items: pageItems,
      pageNumber: page,
      totalPages,
      totalCount: items.length,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const response: BaseResponseOfPaginatedEnumerableOfFileRecordDto = {
      success: true,
      message: 'Mock files loaded.',
      data,
    };

    return new Observable<BaseResponseOfPaginatedEnumerableOfFileRecordDto>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 300);
    });
  }
}
