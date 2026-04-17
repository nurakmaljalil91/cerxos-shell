import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { UsersPage } from './users-page';
import { UsersService } from '../../services/users.service';
import {
  BaseResponseOfPaginatedEnumerableOfUserDto,
  BaseResponseOfUserDto,
} from '../../../../shared/models/model';

describe('UsersPage', () => {
  let component: UsersPage;
  let fixture: ComponentFixture<UsersPage>;
  let usersServiceSpy: jasmine.SpyObj<Pick<UsersService, 'getUsers' | 'updateUser'>>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers', 'updateUser']);

    await TestBed.configureTestingModule({
      imports: [UsersPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UsersService, useValue: usersServiceSpy },
      ],
    }).compileComponents();

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
        hasNextPage: false,
      },
    };

    usersServiceSpy.getUsers.and.returnValue(of(response));

    fixture.detectChanges();

    expect(usersServiceSpy.getUsers).toHaveBeenCalledWith({
      page: 1,
      total: 10,
      sortBy: 'username',
      descending: false,
    });
    expect(component).toBeTruthy();
  });

  it('should open edit user dialog with the selected user', () => {
    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [
          {
            id: '1',
            username: 'admin',
            email: 'admin@cerxos.dev',
            phoneNumber: '+1 555 0100',
            isLocked: true,
          },
        ],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };

    usersServiceSpy.getUsers.and.returnValue(of(response));

    fixture.detectChanges();
    component.onEditUser('1');

    expect(component.editUserOpen()).toBeTrue();
    expect(component.editingUserId()).toBe('1');
    expect(component.editUserForm.getRawValue()).toEqual({
      username: 'admin',
      email: 'admin@cerxos.dev',
      phoneNumber: '+1 555 0100',
      isLocked: true,
    });
  });

  it('should submit user updates', () => {
    const usersResponse: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [
          {
            id: '1',
            username: 'admin',
            email: 'admin@cerxos.dev',
            phoneNumber: '+1 555 0100',
            isLocked: false,
          },
        ],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
    const updateResponse: BaseResponseOfUserDto = {
      success: true,
      message: 'Updated.',
      data: {
        id: '1',
        username: 'admin-updated',
        email: 'admin.updated@cerxos.dev',
        phoneNumber: '+1 555 0199',
        isLocked: true,
      },
    };

    usersServiceSpy.getUsers.and.returnValue(of(usersResponse));
    usersServiceSpy.updateUser.and.returnValue(of(updateResponse));

    fixture.detectChanges();
    component.onEditUser('1');
    component.editUserForm.setValue({
      username: 'admin-updated',
      email: 'admin.updated@cerxos.dev',
      phoneNumber: '+1 555 0199',
      isLocked: true,
    });
    component.onSubmitEditUser();

    expect(usersServiceSpy.updateUser).toHaveBeenCalledWith('1', {
      id: '1',
      username: 'admin-updated',
      email: 'admin.updated@cerxos.dev',
      phoneNumber: '+1 555 0199',
      isLocked: true,
    });
    expect(component.editUserOpen()).toBeFalse();
    expect(usersServiceSpy.getUsers).toHaveBeenCalledTimes(2);
  });
});
