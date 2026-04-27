import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  CxsButtonComponent,
  CxsCardComponent,
  CxsCheckboxComponent,
  CxsInputComponent,
  CxsSelectComponent,
  CxsToggleComponent,
} from 'cerxos-ui';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UserDto, UserPreferenceDto } from '../../../../shared/models/model';
import { UsersService } from '../../../identity/services/users.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import {
  DEFAULT_PREFERENCES,
  PREFERENCE_KEY_ALIASES,
  PREFERENCE_KEYS,
  PreferenceControlName,
  PreferenceFormValue,
} from './settings-page.preferences';

type AccountFormValue = {
  username: string;
  email: string;
  phoneNumber: string;
};

const DEFAULT_ACCOUNT: AccountFormValue = {
  username: '',
  email: '',
  phoneNumber: '',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-page',
  imports: [
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsCardComponent,
    CxsToggleComponent,
    CxsCheckboxComponent,
    CxsInputComponent,
    CxsSelectComponent,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly userPreferencesService = inject(UserPreferencesService);
  private readonly userSessionService = inject(UserSessionService);
  private readonly usersService = inject(UsersService);

  readonly loadingAccount = signal(false);
  readonly accountError = signal<string | null>(null);
  readonly accountValues = signal<AccountFormValue>(DEFAULT_ACCOUNT);
  readonly loadingPreferences = signal(false);
  readonly savingPreferenceKeys = signal<Set<string>>(new Set());
  readonly preferenceError = signal<string | null>(null);
  readonly preferenceSavedMessage = signal<string | null>(null);
  readonly preferenceValues = signal<PreferenceFormValue>(DEFAULT_PREFERENCES);

  readonly accountForm = this.formBuilder.group({
    username: [{ value: DEFAULT_ACCOUNT.username, disabled: true }],
    email: [DEFAULT_ACCOUNT.email],
    phoneNumber: [DEFAULT_ACCOUNT.phoneNumber],
  });

  readonly preferencesForm = this.formBuilder.group({
    language: [DEFAULT_PREFERENCES.language],
    defaultLanding: [DEFAULT_PREFERENCES.defaultLanding],
    dateFormat: [DEFAULT_PREFERENCES.dateFormat],
    currencyFormat: [DEFAULT_PREFERENCES.currencyFormat],
    theme: [DEFAULT_PREFERENCES.theme],
    density: [DEFAULT_PREFERENCES.density],
    compactNavigation: [DEFAULT_PREFERENCES.compactNavigation],
    analyticsHints: [DEFAULT_PREFERENCES.analyticsHints],
  });

  private readonly preferencesByKey = signal<Record<string, UserPreferenceDto>>({});
  private hydratingPreferences = false;

  ngOnInit(): void {
    this.registerPreferenceAutosave();
    this.loadCurrentUser();
    this.loadPreferences();
  }

  onPreferenceToggle(controlName: 'compactNavigation' | 'analyticsHints', checked: boolean): void {
    this.preferenceValues.update((values) => ({
      ...values,
      [controlName]: checked,
    }));
    this.preferencesForm.controls[controlName].setValue(checked);
    this.preferencesForm.controls[controlName].markAsDirty();
  }

  onReloadPreferences(): void {
    this.loadPreferences();
  }

  onSavePreferences(): void {
    (Object.keys(PREFERENCE_KEYS) as PreferenceControlName[]).forEach((controlName) => {
      this.savePreference(controlName, this.preferencesForm.controls[controlName].value);
    });
  }

  isPreferenceSaving(controlName: PreferenceControlName): boolean {
    return this.savingPreferenceKeys().has(PREFERENCE_KEYS[controlName]);
  }

  private loadCurrentUser(): void {
    this.loadingAccount.set(true);
    this.accountError.set(null);

    this.usersService
      .getMyUser()
      .pipe(
        finalize(() => this.loadingAccount.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data) {
            this.accountError.set(response?.message ?? 'Failed to load account details.');
            return;
          }

          this.patchAccountForm(response.data);
        },
        error: (err) => {
          this.accountError.set(err?.error?.message ?? 'Failed to load account details.');
        },
      });
  }

  private patchAccountForm(user: UserDto): void {
    const account: AccountFormValue = {
      username: user.username ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
    };

    this.accountValues.set(account);
    this.accountForm.patchValue(account, { emitEvent: false });
  }

  private registerPreferenceAutosave(): void {
    (Object.keys(PREFERENCE_KEYS) as PreferenceControlName[]).forEach((controlName) => {
      const control = this.preferencesForm.controls[controlName] as AbstractControl<
        string | boolean | null
      >;

      control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value: string | boolean | null) => {
          if (this.hydratingPreferences) {
            return;
          }

          this.setPreferenceValue(controlName, value);
          this.savePreference(controlName, value);
        });
    });
  }

  private loadPreferences(): void {
    this.loadingPreferences.set(true);
    this.preferenceError.set(null);
    this.preferenceSavedMessage.set(null);

    this.userPreferencesService
      .getMyUserPreferences({
        page: 1,
        total: 100,
        sortBy: 'key',
        descending: false,
      })
      .pipe(
        finalize(() => this.loadingPreferences.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.preferenceError.set(response?.message ?? 'Failed to load preferences.');
            return;
          }

          const preferences = response.data.items.reduce<Record<string, UserPreferenceDto>>(
            (accumulator, preference) => {
              if (preference.key) {
                accumulator[preference.key] = preference;
              }

              return accumulator;
            },
            {},
          );

          this.preferencesByKey.set(preferences);
          this.patchPreferenceForm(preferences);
        },
        error: (err) => {
          this.preferenceError.set(err?.error?.message ?? 'Failed to load preferences.');
        },
      });
  }

  private patchPreferenceForm(preferences: Record<string, UserPreferenceDto>): void {
    const values: PreferenceFormValue = {
      language: this.getStringPreferenceValue('language', preferences),
      defaultLanding: this.getStringPreferenceValue('defaultLanding', preferences),
      dateFormat: this.getStringPreferenceValue('dateFormat', preferences),
      currencyFormat: this.getStringPreferenceValue('currencyFormat', preferences),
      theme: this.getStringPreferenceValue('theme', preferences),
      density: this.getStringPreferenceValue('density', preferences),
      compactNavigation: this.parseBooleanPreference(
        this.getPreferenceValue('compactNavigation', preferences),
        DEFAULT_PREFERENCES.compactNavigation,
      ),
      analyticsHints: this.parseBooleanPreference(
        this.getPreferenceValue('analyticsHints', preferences),
        DEFAULT_PREFERENCES.analyticsHints,
      ),
    };

    this.hydratingPreferences = true;
    this.preferencesForm.patchValue(values, { emitEvent: false });
    this.preferenceValues.set(values);
    this.hydratingPreferences = false;
  }

  private savePreference(
    controlName: PreferenceControlName,
    rawValue: string | boolean | null,
  ): void {
    const key = PREFERENCE_KEYS[controlName];
    const value = this.serializePreferenceValue(rawValue);
    const existing = this.findExistingPreference(controlName);
    const userId = this.userSessionService.session()?.user?.id;

    if (!existing?.id && !userId) {
      this.preferenceError.set('Current user is required before saving preferences.');
      return;
    }

    this.markPreferenceSaving(key, true);
    this.preferenceError.set(null);
    this.preferenceSavedMessage.set(null);

    const request$ = existing?.id
      ? this.userPreferencesService.updateUserPreference(existing.id, {
          id: existing.id,
          key,
          value,
        })
      : this.userPreferencesService.createUserPreference({
          userId,
          key,
          value,
        });

    request$
      .pipe(
        finalize(() => this.markPreferenceSaving(key, false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data) {
            this.preferenceError.set(response?.message ?? 'Failed to save preference.');
            return;
          }

          this.preferencesByKey.update((preferences) => ({
            ...preferences,
            [key]: response.data as UserPreferenceDto,
          }));
          this.syncSessionPreference(controlName, response.data);
          this.preferenceSavedMessage.set('Preferences saved.');
        },
        error: (err) => {
          this.preferenceError.set(err?.error?.message ?? 'Failed to save preference.');
        },
      });
  }

  private markPreferenceSaving(key: string, saving: boolean): void {
    this.savingPreferenceKeys.update((keys) => {
      const next = new Set(keys);

      if (saving) {
        next.add(key);
      } else {
        next.delete(key);
      }

      return next;
    });
  }

  private serializePreferenceValue(value: string | boolean | null): string {
    if (typeof value === 'boolean') {
      return String(value);
    }

    return value ?? '';
  }

  private parseBooleanPreference(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined) {
      return fallback;
    }

    return value.trim().toLowerCase() === 'true';
  }

  private getStringPreferenceValue(
    controlName: Exclude<PreferenceControlName, 'compactNavigation' | 'analyticsHints'>,
    preferences: Record<string, UserPreferenceDto>,
  ): string {
    return this.getPreferenceValue(controlName, preferences) ?? DEFAULT_PREFERENCES[controlName];
  }

  private getPreferenceValue(
    controlName: PreferenceControlName,
    preferences: Record<string, UserPreferenceDto>,
  ): string | undefined {
    const preference = this.findPreferenceByControlName(controlName, preferences);
    return preference?.value ?? undefined;
  }

  private findExistingPreference(
    controlName: PreferenceControlName,
  ): UserPreferenceDto | undefined {
    return this.findPreferenceByControlName(controlName, this.preferencesByKey());
  }

  private findPreferenceByControlName(
    controlName: PreferenceControlName,
    preferences: Record<string, UserPreferenceDto>,
  ): UserPreferenceDto | undefined {
    const keys = [PREFERENCE_KEYS[controlName], ...PREFERENCE_KEY_ALIASES[controlName]];
    return keys.map((key) => preferences[key]).find(Boolean);
  }

  private setPreferenceValue(
    controlName: PreferenceControlName,
    value: string | boolean | null,
  ): void {
    const serializedValue = this.serializePreferenceValue(value);

    this.preferenceValues.update((values) => ({
      ...values,
      [controlName]:
        typeof DEFAULT_PREFERENCES[controlName] === 'boolean'
          ? this.parseBooleanPreference(serializedValue, false)
          : serializedValue,
    }));

    if (controlName === 'theme') {
      this.userSessionService.setPreference(PREFERENCE_KEYS.theme, serializedValue);
    }
  }

  private syncSessionPreference(
    controlName: PreferenceControlName,
    preference: UserPreferenceDto,
  ): void {
    if (!preference.key || preference.value === undefined) {
      return;
    }

    if (controlName === 'theme') {
      this.userSessionService.setPreference(PREFERENCE_KEYS.theme, preference.value);
    }
  }
}
