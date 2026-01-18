import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BaseResponseOfPaginatedEnumerableOfUserProfileDto,
  BaseResponseOfUserProfileDto,
} from '../../../shared/models/model';
import { UserProfilesMock } from './user-profiles.mock';
import { UserProfilesQuery, UserProfilesService } from './user-profiles.service';

describe('UserProfilesService', () => {
  let service: UserProfilesService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let userProfilesMockSpy: jasmine.SpyObj<Pick<UserProfilesMock, 'getUserProfiles' | 'getUserProfileById'>>;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    userProfilesMockSpy = jasmine.createSpyObj('UserProfilesMock', [
      'getUserProfiles',
      'getUserProfileById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UserProfilesMock, useValue: userProfilesMockSpy },
      ],
    });

    service = TestBed.inject(UserProfilesService);
  });

  afterEach(() => {
    environment.testMode = originalTestMode;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use UserProfilesMock when testMode is enabled for list', (done) => {
    environment.testMode = true;

    const query: UserProfilesQuery = {
      page: 1,
      total: 10,
      sortBy: 'displayName',
      descending: false,
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserProfileDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    userProfilesMockSpy.getUserProfiles.and.returnValue(of(response));

    service.getUserProfiles(query).subscribe((result) => {
      expect(userProfilesMockSpy.getUserProfiles).toHaveBeenCalledWith(query);
      expect(httpClientSpy.get).not.toHaveBeenCalled();
      expect(result).toEqual(response);
      done();
    });
  });

  it('should call HttpClient with expected params when testMode is disabled for list', (done) => {
    environment.testMode = false;

    const query: UserProfilesQuery = {
      page: 2,
      total: 5,
      sortBy: 'displayName',
      descending: true,
    };

    const response: BaseResponseOfPaginatedEnumerableOfUserProfileDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    httpClientSpy.get.and.returnValue(of(response));

    service.getUserProfiles(query).subscribe((result) => {
      expect(result).toEqual(response);
      expect(httpClientSpy.get).toHaveBeenCalled();

      const [url, options] = httpClientSpy.get.calls.mostRecent().args as [
        string,
        { params: HttpParams },
      ];

      const expectedParams = new HttpParams()
        .set('page', '2')
        .set('total', '5')
        .set('sortBy', 'displayName')
        .set('descending', 'true');

      expect(url).toBe(`${environment.apiBaseUrl}/api/userprofiles`);
      expect(options.params.toString()).toBe(expectedParams.toString());
      done();
    });
  });

  it('should use UserProfilesMock when testMode is enabled for detail', (done) => {
    environment.testMode = true;

    const response: BaseResponseOfUserProfileDto = {
      success: true,
      data: {
        id: '1',
        userId: 'user-1',
        displayName: 'Test',
      },
    };

    userProfilesMockSpy.getUserProfileById.and.returnValue(of(response));

    service.getUserProfileById('1').subscribe((result) => {
      expect(userProfilesMockSpy.getUserProfileById).toHaveBeenCalledWith('1');
      expect(httpClientSpy.get).not.toHaveBeenCalled();
      expect(result).toEqual(response);
      done();
    });
  });

  it('should call HttpClient when testMode is disabled for detail', (done) => {
    environment.testMode = false;

    const response: BaseResponseOfUserProfileDto = {
      success: true,
      data: {
        id: '1',
        userId: 'user-1',
        displayName: 'Test',
      },
    };

    httpClientSpy.get.and.returnValue(of(response));

    service.getUserProfileById('1').subscribe((result) => {
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiBaseUrl}/api/userprofiles/1`,
      );
      expect(result).toEqual(response);
      done();
    });
  });
});
