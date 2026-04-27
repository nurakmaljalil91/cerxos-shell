import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings-page';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';
import {
  BaseResponseOfPaginatedEnumerableOfUserPreferenceDto,
  BaseResponseOfUserPreferenceDto,
} from '../../../../shared/models/model';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UserPreferencesService } from '../../services/user-preferences.service';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  const sessionSignal = signal({ user: { id: 'user-1' }, preferences: [] });
  const userSessionServiceStub = {
    session: sessionSignal,
    setPreference: jasmine.createSpy('setPreference'),
  };
  let userPreferencesServiceSpy: jasmine.SpyObj<
    Pick<
      UserPreferencesService,
      'getMyUserPreferences' | 'createUserPreference' | 'updateUserPreference'
    >
  >;

  beforeEach(async () => {
    const preferencesResponse: BaseResponseOfPaginatedEnumerableOfUserPreferenceDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    userPreferencesServiceSpy = jasmine.createSpyObj('UserPreferencesService', [
      'getMyUserPreferences',
      'createUserPreference',
      'updateUserPreference',
    ]);
    userPreferencesServiceSpy.getMyUserPreferences.and.returnValue(of(preferencesResponse));
    userPreferencesServiceSpy.createUserPreference.and.returnValue(
      of({
        success: true,
        data: {
          id: 'pref-created',
          userId: 'user-1',
          key: 'ui.language',
          value: 'en',
        },
      }),
    );
    userPreferencesServiceSpy.updateUserPreference.and.returnValue(
      of({
        success: true,
        data: {
          id: 'pref-updated',
          userId: 'user-1',
          key: 'ui.language',
          value: 'en',
        },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserPreferencesService, useValue: userPreferencesServiceSpy },
        { provide: UserSessionService, useValue: userSessionServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    userSessionServiceStub.setPreference.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user preferences into the form', () => {
    expect(userPreferencesServiceSpy.getMyUserPreferences).toHaveBeenCalledWith({
      page: 1,
      total: 100,
      sortBy: 'key',
      descending: false,
    });
  });

  it('should reflect currency format and theme preferences from the API', () => {
    const preferencesResponse: BaseResponseOfPaginatedEnumerableOfUserPreferenceDto = {
      success: true,
      data: {
        items: [
          { id: 'pref-currency', userId: 'user-1', key: 'ui.currencyFormat', value: 'myr' },
          { id: 'pref-theme', userId: 'user-1', key: 'theme', value: 'dark' },
        ],
        totalCount: 2,
      },
    };

    userPreferencesServiceSpy.getMyUserPreferences.and.returnValue(of(preferencesResponse));

    component.onReloadPreferences();

    expect(component.preferencesForm.controls.currencyFormat.value).toBe('myr');
    expect(component.preferencesForm.controls.theme.value).toBe('dark');
    expect(component.preferenceValues().currencyFormat).toBe('myr');
    expect(component.preferenceValues().theme).toBe('dark');
  });

  it('should update an existing preference when changed', () => {
    const preferencesResponse: BaseResponseOfPaginatedEnumerableOfUserPreferenceDto = {
      success: true,
      data: {
        items: [{ id: 'pref-1', userId: 'user-1', key: 'ui.language', value: 'en' }],
        totalCount: 1,
      },
    };
    const updateResponse: BaseResponseOfUserPreferenceDto = {
      success: true,
      data: { id: 'pref-1', userId: 'user-1', key: 'ui.language', value: 'fr' },
    };

    userPreferencesServiceSpy.getMyUserPreferences.and.returnValue(of(preferencesResponse));
    userPreferencesServiceSpy.updateUserPreference.and.returnValue(of(updateResponse));

    component.onReloadPreferences();
    component.preferencesForm.controls.language.setValue('fr');

    expect(userPreferencesServiceSpy.updateUserPreference).toHaveBeenCalledWith('pref-1', {
      id: 'pref-1',
      key: 'ui.language',
      value: 'fr',
    });
  });

  it('should create a missing preference when changed', () => {
    const createResponse: BaseResponseOfUserPreferenceDto = {
      success: true,
      data: { id: 'pref-new', userId: 'user-1', key: 'ui.defaultLanding', value: 'planning' },
    };

    userPreferencesServiceSpy.createUserPreference.and.returnValue(of(createResponse));

    component.preferencesForm.controls.defaultLanding.setValue('planning');

    expect(userPreferencesServiceSpy.createUserPreference).toHaveBeenCalledWith({
      userId: 'user-1',
      key: 'ui.defaultLanding',
      value: 'planning',
    });
  });

  it('should update theme using the shell theme preference key', () => {
    const preferencesResponse: BaseResponseOfPaginatedEnumerableOfUserPreferenceDto = {
      success: true,
      data: {
        items: [{ id: 'pref-theme', userId: 'user-1', key: 'theme', value: 'light' }],
        totalCount: 1,
      },
    };
    const updateResponse: BaseResponseOfUserPreferenceDto = {
      success: true,
      data: { id: 'pref-theme', userId: 'user-1', key: 'theme', value: 'system' },
    };

    userPreferencesServiceSpy.getMyUserPreferences.and.returnValue(of(preferencesResponse));
    userPreferencesServiceSpy.updateUserPreference.and.returnValue(of(updateResponse));

    component.onReloadPreferences();
    component.preferencesForm.controls.theme.setValue('system');

    expect(userSessionServiceStub.setPreference).toHaveBeenCalledWith('theme', 'system');
    expect(userPreferencesServiceSpy.updateUserPreference).toHaveBeenCalledWith('pref-theme', {
      id: 'pref-theme',
      key: 'theme',
      value: 'system',
    });
  });
});
