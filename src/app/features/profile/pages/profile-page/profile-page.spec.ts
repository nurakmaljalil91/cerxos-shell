import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { BaseResponseOfPaginatedEnumerableOfUserProfileDto } from '../../../../shared/models/model';
import { UserProfilesService } from '../../services/user-profiles.service';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let userProfilesServiceSpy: jasmine.SpyObj<Pick<UserProfilesService, 'getUserProfiles'>>;

  beforeEach(async () => {
    userProfilesServiceSpy = jasmine.createSpyObj('UserProfilesService', ['getUserProfiles']);

    const response: BaseResponseOfPaginatedEnumerableOfUserProfileDto = {
      success: true,
      data: {
        items: [
          {
            id: '1',
            userId: 'user-1',
            displayName: 'Test Profile',
            firstName: 'Test',
            lastName: 'User',
          },
        ],
        totalCount: 1,
      },
    };

    userProfilesServiceSpy.getUserProfiles.and.returnValue(of(response));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserProfilesService, useValue: userProfilesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a profile on init', () => {
    expect(userProfilesServiceSpy.getUserProfiles).toHaveBeenCalledWith({
      page: 1,
      total: 1,
      sortBy: 'displayName',
      descending: false,
    });
  });
});
