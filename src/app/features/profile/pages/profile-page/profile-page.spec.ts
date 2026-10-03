import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UserProfilesService } from '../../services/user-profiles.service';
import { AddressesService } from '../../services/addresses.service';
import { LanguagesService } from '../../services/languages.service';
import { FileService } from '../../services/file.service';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let profiles: jasmine.SpyObj<UserProfilesService>;
  let onboarding: jasmine.SpyObj<OnboardingService>;
  let navigate: jasmine.Spy;

  const profile = {
    id: 'profile-1',
    userId: 'user-1',
    displayName: 'Test Profile',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    profiles = jasmine.createSpyObj('UserProfilesService', ['getMyUserProfiles', 'updateUserProfile']);
    profiles.getMyUserProfiles.and.returnValue(of({ success: true, data: profile }));
    profiles.updateUserProfile.and.returnValue(of({ success: true, data: profile }));
    onboarding = jasmine.createSpyObj('OnboardingService', ['consumeProfileSetup', 'setOutcome']);
    onboarding.consumeProfileSetup.and.returnValue(false);
    onboarding.setOutcome.and.returnValue(of({ success: true, data: 'Completed' }));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: UserProfilesService, useValue: profiles },
        { provide: OnboardingService, useValue: onboarding },
        {
          provide: UserSessionService,
          useValue: { refresh: (): ReturnType<UserSessionService['refresh']> => of({ success: true }) },
        },
        {
          provide: AddressesService,
          useValue: { getAddressesByUserId: (): ReturnType<AddressesService['getAddressesByUserId']> =>
            of({ success: true, data: { items: [] } }) },
        },
        {
          provide: LanguagesService,
          useValue: { getLanguagesByUserId: (): ReturnType<LanguagesService['getLanguagesByUserId']> =>
            of({ success: true, data: { items: [] } }) },
        },
        { provide: FileService, useValue: {} },
      ],
    }).compileComponents();

    navigate = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
  });

  function createPage(setup = false): void {
    onboarding.consumeProfileSetup.and.returnValue(setup);
    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads a profile without setup on a direct visit', () => {
    createPage();
    expect(profiles.getMyUserProfiles).toHaveBeenCalled();
    expect(component.setupMode()).toBeFalse();
    expect(component.editOpen()).toBeFalse();
  });

  it('opens the edit form during the first-login flow', () => {
    createPage(true);
    expect(component.setupMode()).toBeTrue();
    expect(component.editOpen()).toBeTrue();
  });

  it('records a skip and returns to the dashboard', () => {
    createPage(true);
    component.onSkipSetup();
    expect(onboarding.setOutcome).toHaveBeenCalledWith('Skipped');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('allows a skip even when the profile could not be loaded', () => {
    profiles.getMyUserProfiles.and.returnValue(throwError(() => ({ error: { message: 'Unavailable' } })));
    createPage(true);
    expect(component.editOpen()).toBeFalse();

    component.onSkipSetup();
    expect(onboarding.setOutcome).toHaveBeenCalledWith('Skipped');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('records completion only after profile save succeeds', () => {
    createPage(true);
    component.onSubmitEdit();
    expect(profiles.updateUserProfile).toHaveBeenCalled();
    expect(onboarding.setOutcome).toHaveBeenCalledWith('Completed');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('keeps setup open and allows retry after an outcome request fails', () => {
    onboarding.setOutcome.and.returnValues(
      throwError(() => ({ error: { message: 'Try again.' } })),
      of({ success: true, data: 'Skipped' }),
    );
    createPage(true);
    component.onSkipSetup();
    expect(component.setupMode()).toBeTrue();
    expect(component.editError()).toBe('Try again.');
    expect(navigate).not.toHaveBeenCalled();

    component.retryOutcome();
    expect(onboarding.setOutcome).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith(['/']);
  });
});
