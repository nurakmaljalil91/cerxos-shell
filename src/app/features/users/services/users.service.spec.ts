import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseResponseOfPaginatedEnumerableOfUserDto, BaseResponseOfUserDto, CreateUserCommand } from '../../../shared/models/model';
import { UsersMock } from './users.mock';
import { UsersQuery, UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let usersMockSpy: jasmine.SpyObj<Pick<UsersMock, 'getUsers' | 'createUser'>>;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    usersMockSpy = jasmine.createSpyObj('UsersMock', ['getUsers', 'createUser']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UsersMock, useValue: usersMockSpy }
      ]
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

    const query: UsersQuery = {
      page: 1,
      total: 10,
      sortBy: 'username',
      descending: false
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0
      }
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

    const query: UsersQuery = {
      page: 2,
      total: 5,
      sortBy: 'email',
      descending: true
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0
      }
    };

    httpClientSpy.get.and.returnValue(of(response));

    service.getUsers(query).subscribe((result) => {
      expect(result).toEqual(response);
      expect(httpClientSpy.get).toHaveBeenCalled();

      const [url, options] = httpClientSpy.get.calls.mostRecent().args as [
        string,
        { params: HttpParams }
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
      password: 'Password123!'
    };

    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        username: 'new-user',
        email: 'new-user@example.com'
      }
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
      password: 'Password123!'
    };

    const response: BaseResponseOfUserDto = {
      success: true,
      data: {
        id: '1',
        username: 'new-user',
        email: 'new-user@example.com'
      }
    };

    httpClientSpy.post.and.returnValue(of(response));

    service.createUser(command).subscribe((result) => {
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}/api/users`,
        command
      );
      expect(result).toEqual(response);
      done();
    });
  });
});
