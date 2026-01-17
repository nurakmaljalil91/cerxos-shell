import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { UsersPage } from './users-page';
import { PermissionsService } from '../../services/permissions.service';
import { RolesService } from '../../services/roles.service';
import { UsersService } from '../../services/users.service';
import {
  BaseResponseOfPaginatedEnumerableOfPermissionDto,
  BaseResponseOfPaginatedEnumerableOfRoleDto,
  BaseResponseOfPaginatedEnumerableOfUserDto
} from '../../../../shared/models/model';

describe('UsersPage', () => {
  let component: UsersPage;
  let fixture: ComponentFixture<UsersPage>;
  let usersServiceSpy: jasmine.SpyObj<Pick<UsersService, 'getUsers'>>;
  let rolesServiceSpy: jasmine.SpyObj<Pick<RolesService, 'getRoles'>>;
  let permissionsServiceSpy: jasmine.SpyObj<Pick<PermissionsService, 'getPermissions'>>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getRoles']);
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['getPermissions']);

    await TestBed.configureTestingModule({
      imports: [UsersPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: PermissionsService, useValue: permissionsServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }
    };

    const rolesResponse: BaseResponseOfPaginatedEnumerableOfRoleDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0
      }
    };

    const permissionsResponse: BaseResponseOfPaginatedEnumerableOfPermissionDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0
      }
    };

    usersServiceSpy.getUsers.and.returnValue(of(response));
    rolesServiceSpy.getRoles.and.returnValue(of(rolesResponse));
    permissionsServiceSpy.getPermissions.and.returnValue(of(permissionsResponse));

    fixture.detectChanges();

    expect(usersServiceSpy.getUsers).toHaveBeenCalledWith({
      page: 1,
      total: 10,
      sortBy: 'username',
      descending: false
    });
    expect(rolesServiceSpy.getRoles).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false
    });
    expect(permissionsServiceSpy.getPermissions).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false
    });
    expect(component).toBeTruthy();
  });
});
