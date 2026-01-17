import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { UsersPage } from './users-page';
import { UsersService } from '../../services/users.service';
import { BaseResponseOfPaginatedEnumerableOfUserDto } from '../../../../shared/models/model';

describe('UsersPage', () => {
  let component: UsersPage;
  let fixture: ComponentFixture<UsersPage>;
  let usersServiceSpy: jasmine.SpyObj<Pick<UsersService, 'getUsers'>>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);

    await TestBed.configureTestingModule({
      imports: [UsersPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UsersService, useValue: usersServiceSpy }
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

    usersServiceSpy.getUsers.and.returnValue(of(response));

    fixture.detectChanges();

    expect(usersServiceSpy.getUsers).toHaveBeenCalledWith({
      page: 1,
      total: 10,
      sortBy: 'username',
      descending: false
    });
    expect(component).toBeTruthy();
  });
});
