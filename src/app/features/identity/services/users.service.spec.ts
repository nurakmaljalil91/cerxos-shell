import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QueryRequest } from '../../../shared/models/query-request';
import {
  AssignRoleToUserCommand,
  BaseResponseOfPaginatedEnumerableOfUserDto,
  BaseResponseOfUserDto,
  CreateUserCommand,
  UpdateUserCommand,
} from '../../../shared/models/model';
import { UsersMock } from './users.mock';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let usersMockSpy: jasmine.SpyObj<
    Pick<UsersMock, 'getUsers' | 'createUser' | 'updateUser' | 'assignRoleToUser'>
  >;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    usersMockSpy = jasmine.createSpyObj('UsersMock', [
      'getUsers',
      'createUser',
      'updateUser',
      'assignRoleToUser',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UsersMock, useValue: usersMockSpy },
      ],
    });

    service = TestBed.inject(UsersService);
  });

  afterEach(() => {
    environment.testMode = originalTestMode;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use UsersMock when testMode is enabled', (done) => {
    environment.testMode = true;

    const query: QueryRequest = {
      page: 1,
      total: 10,
      sortBy: 'username',
      descending: false,
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    usersMockSpy.getUsers.and.returnValue(of(response));

    service.getUsers(query).subscribe((result) => {
      expect(usersMockSpy.getUsers).toHaveBeenCalledWith(query);
      expect(httpClientSpy.get).not.toHaveBeenCalled();
      expect(result).toEqual(response);
      done();
    });
  });

  it('should call HttpClient with expected params when testMode is disabled', (done) => {
    environment.testMode = false;

    const query: QueryRequest = {
      page: 2,
      total: 5,
      sortBy: 'email',
      descending: true,
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    httpClientSpy.get.and.returnValue(of(response));

    service.getUsers(query).subscribe((result) => {
      expect(result).toEqual(response);
      expect(httpClientSpy.get).toHaveBeenCalled();

      const [url, options] = httpClientSpy.get.calls.mostRecent().args as [
        string,
        { params: HttpParams },
      ];

      const expectedParams = new HttpParams()
        .set('page', '2')
        .set('total', '5')
        .set('sortBy', 'email')
        .set('descending', 'true');

      expect(url).toBe(`${environment.apiBaseUrl}/api/users`);
      expect(options.params.toString()).toBe(expectedParams.toString());
      done();
    });
  });

  it('should use UsersMock to create a user when testMode is enabled', (done) => {
    environment.testMode = true;

    const command: CreateUserCommand = {
      username: 'new-user',
      email: 'new-user@example.com',
      password: 'Password123!',
    };

    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        username: 'new-user',
        email: 'new-user@example.com',
      },
    };

    usersMockSpy.createUser.and.returnValue(of(response));

    service.createUser(command).subscribe((result) => {
      expect(usersMockSpy.createUser).toHaveBeenCalledWith(command);
      expect(httpClientSpy.post).not.toHaveBeenCalled();
      expect(result).toEqual(response);
      done();
    });
  });

  it('should call HttpClient to create a user when testMode is disabled', (done) => {
    environment.testMode = false;

    const command: CreateUserCommand = {
      username: 'new-user',
      email: 'new-user@example.com',
      password: 'Password123!',
    };

    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        username: 'new-user',
        email: 'new-user@example.com',
      },
    };

    httpClientSpy.post.and.returnValue(of(response));

    service.createUser(command).subscribe((result) => {
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}/api/users`,
        command,
      );
      expect(result).toEqual(response);
      done();
    });
  });

  it('should use UsersMock to update a user when testMode is enabled', (done) => {
    environment.testMode = true;

    const command: UpdateUserCommand = {
      id: '1',
      username: 'updated-user',
      email: 'updated-user@example.com',
      phoneNumber: '+1 555 0199',
      isLocked: true,
    };

    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        username: 'updated-user',
        email: 'updated-user@example.com',
        phoneNumber: '+1 555 0199',
        isLocked: true,
      },
    };

    usersMockSpy.updateUser.and.returnValue(of(response));

    service.updateUser('1', command).subscribe((result) => {
      expect(usersMockSpy.updateUser).toHaveBeenCalledWith('1', command);
      expect(httpClientSpy.patch).not.toHaveBeenCalled();
      expect(result).toEqual(response);
      done();
    });
  });

  it('should call HttpClient to update a user when testMode is disabled', (done) => {
    environment.testMode = false;

    const command: UpdateUserCommand = {
      id: '1',
      username: 'updated-user',
      email: 'updated-user@example.com',
      phoneNumber: '+1 555 0199',
      isLocked: false,
    };

    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        username: 'updated-user',
        email: 'updated-user@example.com',
        phoneNumber: '+1 555 0199',
        isLocked: false,
      },
    };

    httpClientSpy.patch.and.returnValue(of(response));

    service.updateUser('1', command).subscribe((result) => {
      expect(httpClientSpy.patch).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}/api/users/1`,
        command,
      );
      expect(result).toEqual(response);
      done();
    });
  });

  it('should use UsersMock to assign a role when testMode is enabled', (done) => {
    environment.testMode = true;

    const command: AssignRoleToUserCommand = {
      userId: '1',
      roleId: '2',
    };
    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        roles: ['Manager'],
      },
    };

    usersMockSpy.assignRoleToUser.and.returnValue(of(response));

    service.assignRoleToUser('1', command).subscribe((result) => {
      expect(usersMockSpy.assignRoleToUser).toHaveBeenCalledWith('1', command);
      expect(httpClientSpy.post).not.toHaveBeenCalled();
      expect(result).toEqual(response);
      done();
    });
  });

  it('should call HttpClient to assign a role when testMode is disabled', (done) => {
    environment.testMode = false;

    const command: AssignRoleToUserCommand = {
      userId: '1',
      roleId: '2',
    };
    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        roles: ['Manager'],
      },
    };

    httpClientSpy.post.and.returnValue(of(response));

    service.assignRoleToUser('1', command).subscribe((result) => {
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}/api/users/1/assign-role`,
        command,
      );
      expect(result).toEqual(response);
      done();
    });
  });
});
