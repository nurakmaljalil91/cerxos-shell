import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { RolesPage } from './roles-page';
import { RolesService } from '../../services/roles.service';
import {
  BaseResponseOfPaginatedEnumerableOfRoleDto,
  BaseResponseOfRoleDto,
} from '../../../../shared/models/model';

describe('RolesPage', () => {
  let component: RolesPage;
  let fixture: ComponentFixture<RolesPage>;
  let rolesServiceSpy: jasmine.SpyObj<Pick<RolesService, 'getRoles' | 'updateRole' | 'deleteRole'>>;

  beforeEach(async () => {
    rolesServiceSpy = jasmine.createSpyObj('RolesService', [
      'getRoles',
      'updateRole',
      'deleteRole',
    ]);

    await TestBed.configureTestingModule({
      imports: [RolesPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RolesService, useValue: rolesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(response));

    fixture.detectChanges();

    expect(rolesServiceSpy.getRoles).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false,
    });
    expect(component).toBeTruthy();
  });

  it('should open edit role dialog with the selected role', () => {
    const response: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full access',
            permissions: [],
          },
        ],
        totalCount: 1,
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(response));

    fixture.detectChanges();
    component.onEditRole('role-1');

    expect(component.editRoleOpen()).toBeTrue();
    expect(component.editingRoleId()).toBe('role-1');
    expect(component.editRoleForm.getRawValue()).toEqual({
      name: 'Admin',
      description: 'Full access',
    });
  });

  it('should submit edited role details', () => {
    const rolesResponse: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full access',
            permissions: [],
          },
        ],
        totalCount: 1,
      },
    };
    const updateResponse: BaseResponseOfRoleDto = {
      success: true,
      message: 'Role updated.',
      data: {
        id: 'role-1',
        name: 'Administrator',
        description: 'Updated access',
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(rolesResponse));
    rolesServiceSpy.updateRole.and.returnValue(of(updateResponse));

    fixture.detectChanges();
    component.onEditRole('role-1');
    component.editRoleForm.setValue({
      name: 'Administrator',
      description: 'Updated access',
    });
    component.onSubmitEditRole();

    expect(rolesServiceSpy.updateRole).toHaveBeenCalledWith('role-1', {
      id: 'role-1',
      name: 'Administrator',
      description: 'Updated access',
    });
    expect(component.editRoleOpen()).toBeFalse();
    expect(component.editingRoleId()).toBeNull();
  });

  it('should open delete role dialog with the selected role', () => {
    const response: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full access',
            permissions: [],
          },
        ],
        totalCount: 1,
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(response));

    fixture.detectChanges();
    component.onDeleteRole('role-1');

    expect(component.deleteRoleOpen()).toBeTrue();
    expect(component.deletingRole()?.id).toBe('role-1');
    expect(component.deletingRole()?.name).toBe('Admin');
  });

  it('should delete the selected role when confirmed', () => {
    const rolesResponse: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full access',
            permissions: [],
          },
        ],
        totalCount: 1,
      },
    };
    const deleteResponse: BaseResponseOfRoleDto = {
      success: true,
      message: 'Role deleted.',
      data: {
        id: 'role-1',
        name: 'Admin',
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(rolesResponse));
    rolesServiceSpy.deleteRole.and.returnValue(of(deleteResponse));

    fixture.detectChanges();
    component.onDeleteRole('role-1');
    component.onConfirmDeleteRole();

    expect(rolesServiceSpy.deleteRole).toHaveBeenCalledWith('role-1');
    expect(component.deleteRoleOpen()).toBeFalse();
    expect(component.deletingRole()).toBeNull();
  });

  it('should close delete role dialog without deleting', () => {
    const response: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full access',
            permissions: [],
          },
        ],
        totalCount: 1,
      },
    };

    rolesServiceSpy.getRoles.and.returnValue(of(response));

    fixture.detectChanges();
    component.onDeleteRole('role-1');
    component.onCloseDeleteRole();

    expect(rolesServiceSpy.deleteRole).not.toHaveBeenCalled();
    expect(component.deleteRoleOpen()).toBeFalse();
    expect(component.deletingRole()).toBeNull();
  });
});
