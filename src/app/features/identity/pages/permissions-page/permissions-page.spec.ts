import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { PermissionsPage } from './permissions-page';
import { PermissionsService } from '../../services/permissions.service';
import {
  BaseResponseOfPaginatedEnumerableOfPermissionDto,
  BaseResponseOfPermissionDto,
} from '../../../../shared/models/model';

describe('PermissionsPage', () => {
  let component: PermissionsPage;
  let fixture: ComponentFixture<PermissionsPage>;
  let permissionsServiceSpy: jasmine.SpyObj<
    Pick<PermissionsService, 'getPermissions' | 'updatePermission' | 'deletePermission'>
  >;

  beforeEach(async () => {
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', [
      'getPermissions',
      'updatePermission',
      'deletePermission',
    ]);

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

  it('should open edit permission dialog with the selected permission', () => {
    const response: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [
          {
            id: 'permission-1',
            name: 'users.read',
            description: 'View users',
          },
        ],
        totalCount: 1,
      },
    };

    permissionsServiceSpy.getPermissions.and.returnValue(of(response));

    fixture.detectChanges();
    component.onEditPermission('permission-1');

    expect(component.editPermissionOpen()).toBeTrue();
    expect(component.editingPermissionId()).toBe('permission-1');
    expect(component.editPermissionForm.getRawValue()).toEqual({
      name: 'users.read',
      description: 'View users',
    });
  });

  it('should submit edited permission details', () => {
    const permissionsResponse: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [
          {
            id: 'permission-1',
            name: 'users.read',
            description: 'View users',
          },
        ],
        totalCount: 1,
      },
    };
    const updateResponse: BaseResponseOfPermissionDto = {
      success: true,
      message: 'Permission updated.',
      data: {
        id: 'permission-1',
        name: 'users.view',
        description: 'Updated users view',
      },
    };

    permissionsServiceSpy.getPermissions.and.returnValue(of(permissionsResponse));
    permissionsServiceSpy.updatePermission.and.returnValue(of(updateResponse));

    fixture.detectChanges();
    component.onEditPermission('permission-1');
    component.editPermissionForm.setValue({
      name: 'users.view',
      description: 'Updated users view',
    });
    component.onSubmitEditPermission();

    expect(permissionsServiceSpy.updatePermission).toHaveBeenCalledWith('permission-1', {
      id: 'permission-1',
      name: 'users.view',
      description: 'Updated users view',
    });
    expect(component.editPermissionOpen()).toBeFalse();
    expect(component.editingPermissionId()).toBeNull();
  });

  it('should open delete permission dialog with the selected permission', () => {
    const response: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [
          {
            id: 'permission-1',
            name: 'users.read',
            description: 'View users',
          },
        ],
        totalCount: 1,
      },
    };

    permissionsServiceSpy.getPermissions.and.returnValue(of(response));

    fixture.detectChanges();
    component.onDeletePermission('permission-1');

    expect(component.deletePermissionOpen()).toBeTrue();
    expect(component.deletingPermission()?.id).toBe('permission-1');
    expect(component.deletingPermission()?.name).toBe('users.read');
  });

  it('should delete the selected permission when confirmed', () => {
    const permissionsResponse: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [
          {
            id: 'permission-1',
            name: 'users.read',
            description: 'View users',
          },
        ],
        totalCount: 1,
      },
    };
    const deleteResponse: BaseResponseOfPermissionDto = {
      success: true,
      message: 'Permission deleted.',
      data: {
        id: 'permission-1',
        name: 'users.read',
      },
    };

    permissionsServiceSpy.getPermissions.and.returnValue(of(permissionsResponse));
    permissionsServiceSpy.deletePermission.and.returnValue(of(deleteResponse));

    fixture.detectChanges();
    component.onDeletePermission('permission-1');
    component.onConfirmDeletePermission();

    expect(permissionsServiceSpy.deletePermission).toHaveBeenCalledWith('permission-1');
    expect(component.deletePermissionOpen()).toBeFalse();
    expect(component.deletingPermission()).toBeNull();
  });

  it('should close delete permission dialog without deleting', () => {
    const response: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [
          {
            id: 'permission-1',
            name: 'users.read',
            description: 'View users',
          },
        ],
        totalCount: 1,
      },
    };

    permissionsServiceSpy.getPermissions.and.returnValue(of(response));

    fixture.detectChanges();
    component.onDeletePermission('permission-1');
    component.onCloseDeletePermission();

    expect(permissionsServiceSpy.deletePermission).not.toHaveBeenCalled();
    expect(component.deletePermissionOpen()).toBeFalse();
    expect(component.deletingPermission()).toBeNull();
  });
});
