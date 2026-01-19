import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { PermissionsPage } from './permissions-page';
import { PermissionsService } from '../../services/permissions.service';
import { BaseResponseOfPaginatedEnumerableOfPermissionDto } from '../../../../shared/models/model';

describe('PermissionsPage', () => {
  let component: PermissionsPage;
  let fixture: ComponentFixture<PermissionsPage>;
  let permissionsServiceSpy: jasmine.SpyObj<Pick<PermissionsService, 'getPermissions'>>;

  beforeEach(async () => {
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['getPermissions']);

    await TestBed.configureTestingModule({
      imports: [PermissionsPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PermissionsService, useValue: permissionsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    permissionsServiceSpy.getPermissions.and.returnValue(of(response));

    fixture.detectChanges();

    expect(permissionsServiceSpy.getPermissions).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false,
    });
    expect(component).toBeTruthy();
  });
});
