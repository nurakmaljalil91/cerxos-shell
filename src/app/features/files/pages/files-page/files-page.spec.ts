import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { FilesPage } from './files-page';
import { FilesService } from '../../services/files.service';
import { BaseResponseOfPaginatedEnumerableOfFileRecordDto } from '../../../../shared/models/model';

describe('FilesPage', () => {
  let component: FilesPage;
  let fixture: ComponentFixture<FilesPage>;
  let filesServiceSpy: jasmine.SpyObj<Pick<FilesService, 'getFiles'>>;

  beforeEach(async () => {
    filesServiceSpy = jasmine.createSpyObj('FilesService', ['getFiles']);

    await TestBed.configureTestingModule({
      imports: [FilesPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: FilesService, useValue: filesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfFileRecordDto = {
      success: true,
      data: {
        items: [],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };

    filesServiceSpy.getFiles.and.returnValue(of(response));

    fixture.detectChanges();

    expect(filesServiceSpy.getFiles).toHaveBeenCalledWith({
      page: 1,
      total: 10,
      sortBy: 'uploadedAt',
      descending: true,
      filter: undefined,
      category: undefined,
    });
    expect(component).toBeTruthy();
  });

  it('should display files in rows', () => {
    const response: BaseResponseOfPaginatedEnumerableOfFileRecordDto = {
      success: true,
      data: {
        items: [
          {
            id: 1,
            originalFileName: 'report.pdf',
            category: 'Document',
            contentType: 'application/pdf',
            sizeBytes: 512000,
            uploadedBy: 'admin@cerxos.dev',
            uploadedAt: '2026-04-01T08:30:00.000Z',
            url: 'http://localhost:7061/api/files/1/download',
          },
        ],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };

    filesServiceSpy.getFiles.and.returnValue(of(response));

    fixture.detectChanges();

    expect(component.rows().length).toBe(1);
    expect(component.rows()[0]['fileName']).toBe('report.pdf');
    expect(component.rows()[0]['category']).toBe('Document');
    expect(component.totalCount()).toBe(1);
  });

  it('should set error when response is unsuccessful', () => {
    const response: BaseResponseOfPaginatedEnumerableOfFileRecordDto = {
      success: false,
      message: 'Unauthorized.',
    };

    filesServiceSpy.getFiles.and.returnValue(of(response));

    fixture.detectChanges();

    expect(component.error()).toBe('Unauthorized.');
    expect(component.rows().length).toBe(0);
  });
});
