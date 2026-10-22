// TODO: Split this page into smaller components and simplify onSubmitAddress.
/* eslint-disable max-lines, complexity */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { OnboardingOutcome, OnboardingService } from '../../../../core/services/onboarding.service';
import { UserSessionService } from '../../../../core/services/user-session.service';
import {
  CxsAvatarComponent,
  CxsBadgeComponent,
  CxsButtonComponent,
  CxsCardComponent,
  CxsDataTableCellDirective,
  CxsDataTableComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsTabPanelComponent,
  CxsTabsComponent,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import type { CxsDataTableColumn } from 'cerxos-ui';
import {
  AddressDto,
  BaseResponseOfLanguageDto,
  BaseResponseOfPaginatedEnumerableOfLanguageDto,
  CreateLanguageCommand,
  LanguageDto,
  UpdateLanguageCommand,
  UserProfileDto,
} from '../../../../shared/models/model';
import { UserProfilesService } from '../../services/user-profiles.service';
import { AddressesService } from '../../services/addresses.service';
import { FileService } from '../../services/file.service';
import { LanguagesService } from '../../services/languages.service';
import { CareerTabNotice } from '../../components/career-tab.base';
import { ProfileEducationTab } from '../../components/profile-education-tab/profile-education-tab';
import { ProfileProjectsTab } from '../../components/profile-projects-tab/profile-projects-tab';
import { ProfileSkillsTab } from '../../components/profile-skills-tab/profile-skills-tab';
import { ProfileWorkExperienceTab } from '../../components/profile-work-experience-tab/profile-work-experience-tab';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CxsAvatarComponent,
    CxsBadgeComponent,
    CxsButtonComponent,
    CxsCardComponent,
    CxsDataTableCellDirective,
    CxsDataTableComponent,
    CxsDialogComponent,
    CxsInputComponent,
    CxsTabPanelComponent,
    CxsTabsComponent,
    CxsToastComponent,
    ProfileEducationTab,
    ProfileProjectsTab,
    ProfileSkillsTab,
    ProfileWorkExperienceTab,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly userProfilesService = inject(UserProfilesService);
  private readonly addressesService = inject(AddressesService);
  private readonly fileService = inject(FileService);
  private readonly languagesService = inject(LanguagesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);
  private readonly userSessionService = inject(UserSessionService);

  // ---- Profile ----
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<UserProfileDto | null>(null);

  readonly editOpen = signal(false);
  readonly editLoading = signal(false);
  readonly editError = signal<string | null>(null);
  readonly setupMode = signal(false);
  readonly outcomeLoading = signal(false);
  readonly pendingOutcome = signal<OnboardingOutcome | null>(null);
  readonly uploadLoading = signal(false);
  readonly uploadError = signal<string | null>(null);

  readonly avatarModalOpen = signal(false);
  readonly avatarPreviewUrl = signal<string | null>(null);
  readonly avatarSaveLoading = signal(false);
  readonly avatarSaveError = signal<string | null>(null);

  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  readonly editForm = this.formBuilder.group({
    displayName: [''],
    firstName: [''],
    lastName: [''],
    dateOfBirth: [''],
    birthPlace: [''],
    identityCardNumber: [''],
    passportNumber: [''],
    taxNumber: [''],
    bio: [''],
    imageUrl: [''],
    tag: [''],
    bloodType: [''],
    shoeSize: [''],
    clothingSize: [''],
    waistSize: [''],
  });

  readonly displayName = computed(() => {
    const profile = this.profile();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
    return fullName || profile?.displayName || 'Profile';
  });

  readonly email = computed(() => this.userSessionService.session()?.user?.email ?? 'N/A');

  readonly personalDetails = computed(() => {
    const profile = this.profile();
    if (!profile) {
      return [];
    }
    return [
      { label: 'Display name', value: this.formatValue(profile.displayName) },
      { label: 'First name', value: this.formatValue(profile.firstName) },
      { label: 'Last name', value: this.formatValue(profile.lastName) },
      { label: 'Date of birth', value: this.formatValue(profile.dateOfBirth) },
      { label: 'Birth place', value: this.formatValue(profile.birthPlace) },
    ];
  });

  readonly identityDetails = computed(() => {
    const profile = this.profile();
    if (!profile) {
      return [];
    }
    return [
      { label: 'Identity card', value: this.formatValue(profile.identityCardNumber) },
      { label: 'Passport', value: this.formatValue(profile.passportNumber) },
      { label: 'Tax number', value: this.formatValue(profile.taxNumber) },
    ];
  });

  readonly sizeDetails = computed(() => {
    const profile = this.profile();
    if (!profile) {
      return [];
    }
    return [
      { label: 'Shoe size', value: this.formatValue(profile.shoeSize) },
      { label: 'Clothing size', value: this.formatValue(profile.clothingSize) },
      { label: 'Waist size', value: this.formatValue(profile.waistSize) },
    ];
  });

  readonly bio = computed(() => this.formatValue(this.profile()?.bio));
  readonly empty = computed(() => !this.loading() && !this.error() && !this.profile());

  // ---- Addresses ----
  readonly addresses = signal<AddressDto[]>([]);
  readonly addressesLoading = signal(false);
  readonly addressModalItem = signal<AddressDto | null>(null);
  readonly addressModalOpen = signal(false);
  readonly addressModalLoading = signal(false);
  readonly addressModalError = signal<string | null>(null);

  readonly addressForm = this.formBuilder.group({
    label: [''],
    type: [''],
    line1: [''],
    line2: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    country: [''],
    isDefault: [false],
  });

  readonly addressColumns: CxsDataTableColumn[] = [
    { key: 'label', label: 'Label' },
    { key: 'type', label: 'Type' },
    { key: 'line1', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'isDefault', label: 'Default', formatter: (v) => (v ? 'Yes' : '') },
    { key: 'actions', label: '', width: '72px' },
  ];

  readonly addressData = computed(() => this.addresses() as unknown as Record<string, unknown>[]);

  // ---- Languages ----
  readonly languages = signal<LanguageDto[]>([]);
  readonly languagesLoading = signal(false);
  readonly languageModalItem = signal<LanguageDto | null>(null);
  readonly languageModalOpen = signal(false);
  readonly languageModalLoading = signal(false);
  readonly languageModalError = signal<string | null>(null);

  readonly languageForm = this.formBuilder.group({
    name: [''],
    level: [''],
  });

  readonly languageColumns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Language' },
    { key: 'level', label: 'Level' },
    { key: 'actions', label: '', width: '72px' },
  ];

  readonly languageData = computed(() => this.languages() as unknown as Record<string, unknown>[]);

  ngOnInit(): void {
    this.setupMode.set(this.onboardingService.consumeProfileSetup());
    this.loadProfile();
  }

  // ---- Profile handlers ----

  onRefresh(): void {
    this.loadProfile();
  }

  onOpenEdit(): void {
    const profile = this.profile();
    if (!profile) {
      return;
    }

    this.editForm.setValue({
      displayName: profile.displayName ?? '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
      birthPlace: profile.birthPlace ?? '',
      identityCardNumber: profile.identityCardNumber ?? '',
      passportNumber: profile.passportNumber ?? '',
      taxNumber: profile.taxNumber ?? '',
      bio: profile.bio ?? '',
      imageUrl: profile.imageUrl ?? '',
      tag: profile.tag ?? '',
      bloodType: profile.bloodType ?? '',
      shoeSize: profile.shoeSize ?? '',
      clothingSize: profile.clothingSize ?? '',
      waistSize: profile.waistSize ?? '',
    });

    this.editError.set(null);
    this.editOpen.set(true);
  }

  onCloseEdit(): void {
    if (this.setupMode()) {
      return;
    }
    this.editOpen.set(false);
    this.editError.set(null);
  }

  onOpenAvatarModal(): void {
    if (!this.profile()) {
      return;
    }
    this.avatarPreviewUrl.set(null);
    this.uploadError.set(null);
    this.avatarSaveError.set(null);
    this.avatarModalOpen.set(true);
  }

  onCloseAvatarModal(): void {
    this.avatarModalOpen.set(false);
    this.avatarPreviewUrl.set(null);
    this.uploadError.set(null);
    this.avatarSaveError.set(null);
  }

  onAvatarModalFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.uploadError.set('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > maxSizeBytes) {
      this.uploadError.set('File exceeds the 5 MB size limit.');
      return;
    }

    this.uploadLoading.set(true);
    this.uploadError.set(null);

    this.fileService
      .uploadProfilePicture(file)
      .pipe(
        finalize(() => this.uploadLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.url) {
            this.avatarPreviewUrl.set(response.data.url);
          } else {
            this.uploadError.set(response?.message ?? 'Upload failed: no URL returned.');
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.uploadError.set(err?.error?.message ?? 'Upload failed.');
        },
      });
  }

  onSaveAvatar(): void {
    const profile = this.profile();
    const newUrl = this.avatarPreviewUrl();
    if (!profile?.id || !newUrl) {
      return;
    }

    this.avatarSaveLoading.set(true);
    this.avatarSaveError.set(null);

    this.userProfilesService
      .updateUserProfile(profile.id, { id: profile.id, imageUrl: newUrl })
      .pipe(
        finalize(() => this.avatarSaveLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.avatarSaveError.set(response?.message ?? 'Failed to update profile photo.');
            return;
          }
          this.profile.set(response.data ?? null);
          this.avatarModalOpen.set(false);
          this.showToast('info', 'Photo updated', 'Your profile photo has been saved.');
        },
        error: (err: { error?: { message?: string } }) => {
          this.avatarSaveError.set(err?.error?.message ?? 'Failed to update profile photo.');
        },
      });
  }

  onSubmitEdit(): void {
    if (this.pendingOutcome()) {
      this.recordOutcome(this.pendingOutcome()!);
      return;
    }
    const profile = this.profile();
    if (!profile?.id) {
      return;
    }

    this.editLoading.set(true);
    this.editError.set(null);

    const raw = this.editForm.getRawValue();
    const command = {
      id: profile.id,
      displayName: raw.displayName || undefined,
      firstName: raw.firstName || undefined,
      lastName: raw.lastName || undefined,
      dateOfBirth: raw.dateOfBirth || undefined,
      birthPlace: raw.birthPlace || undefined,
      identityCardNumber: raw.identityCardNumber || undefined,
      passportNumber: raw.passportNumber || undefined,
      taxNumber: raw.taxNumber || undefined,
      bio: raw.bio || undefined,
      imageUrl: raw.imageUrl || undefined,
      tag: raw.tag || undefined,
      bloodType: raw.bloodType || undefined,
      shoeSize: raw.shoeSize || undefined,
      clothingSize: raw.clothingSize || undefined,
      waistSize: raw.waistSize || undefined,
    };

    this.userProfilesService
      .updateUserProfile(profile.id, command)
      .pipe(
        finalize(() => this.editLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.editError.set(response?.message ?? 'Failed to update profile.');
            return;
          }
          this.profile.set(response.data ?? null);
          if (this.setupMode()) {
            this.recordOutcome('Completed');
          } else {
            this.editOpen.set(false);
            this.showToast('info', 'Profile updated', 'Your profile has been saved.');
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.editError.set(err?.error?.message ?? 'Failed to update profile.');
        },
      });
  }

  onSkipSetup(): void {
    this.recordOutcome('Skipped');
  }

  retryOutcome(): void {
    const outcome = this.pendingOutcome();
    if (outcome) {
      this.recordOutcome(outcome);
    }
  }

  private recordOutcome(outcome: OnboardingOutcome): void {
    if (this.outcomeLoading()) {
      return;
    }
    this.pendingOutcome.set(outcome);
    this.outcomeLoading.set(true);
    this.editError.set(null);
    this.onboardingService
      .setOutcome(outcome)
      .pipe(
        finalize(() => this.outcomeLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.editError.set(
              response?.message ?? 'Could not finish profile setup. Please retry.',
            );
            return;
          }
          this.pendingOutcome.set(null);
          this.setupMode.set(false);
          this.editOpen.set(false);
          if (outcome === 'Completed') {
            this.userSessionService
              .refresh()
              .pipe(
                catchError(() => EMPTY),
                takeUntilDestroyed(this.destroyRef),
              )
              .subscribe();
          }
          void this.router.navigate(['/']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.editError.set(
            err?.error?.message ?? 'Could not finish profile setup. Please retry.',
          );
        },
      });
  }

  // ---- Address handlers ----

  onOpenAddAddress(): void {
    this.addressModalItem.set(null);
    this.addressForm.reset({
      label: '',
      type: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
    });
    this.addressModalError.set(null);
    this.addressModalOpen.set(true);
  }

  onOpenEditAddress(id: string): void {
    const address = this.addresses().find((a) => a.id === id) ?? null;
    if (!address) {
      return;
    }

    this.addressModalItem.set(address);
    this.addressForm.setValue({
      label: address.label ?? '',
      type: address.type ?? '',
      line1: address.line1 ?? '',
      line2: address.line2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postalCode: address.postalCode ?? '',
      country: address.country ?? '',
      isDefault: address.isDefault ?? false,
    });
    this.addressModalError.set(null);
    this.addressModalOpen.set(true);
  }

  onCloseAddressModal(): void {
    this.addressModalOpen.set(false);
    this.addressModalError.set(null);
  }

  onSubmitAddress(): void {
    const profile = this.profile();
    const raw = this.addressForm.getRawValue();
    const existing = this.addressModalItem();

    this.addressModalLoading.set(true);
    this.addressModalError.set(null);

    if (existing?.id) {
      const command = {
        id: existing.id,
        label: raw.label || undefined,
        type: raw.type || undefined,
        line1: raw.line1 || undefined,
        line2: raw.line2 || undefined,
        city: raw.city || undefined,
        state: raw.state || undefined,
        postalCode: raw.postalCode || undefined,
        country: raw.country || undefined,
        isDefault: raw.isDefault ?? undefined,
      };

      this.addressesService
        .updateAddress(existing.id, command)
        .pipe(
          finalize(() => this.addressModalLoading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (response) => {
            if (!response?.success) {
              this.addressModalError.set(response?.message ?? 'Failed to update address.');
              return;
            }
            const updated = response.data;
            if (updated) {
              this.addresses.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
            }
            this.addressModalOpen.set(false);
            this.showToast('info', 'Address updated', 'The address has been saved.');
          },
          error: (err: { error?: { message?: string } }) => {
            this.addressModalError.set(err?.error?.message ?? 'Failed to update address.');
          },
        });
    } else {
      const command = {
        userId: profile?.userId ?? undefined,
        label: raw.label || undefined,
        type: raw.type || undefined,
        line1: raw.line1 || undefined,
        line2: raw.line2 || undefined,
        city: raw.city || undefined,
        state: raw.state || undefined,
        postalCode: raw.postalCode || undefined,
        country: raw.country || undefined,
        isDefault: raw.isDefault ?? false,
      };

      this.addressesService
        .createAddress(command)
        .pipe(
          finalize(() => this.addressModalLoading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (response) => {
            if (!response?.success) {
              this.addressModalError.set(response?.message ?? 'Failed to create address.');
              return;
            }
            if (response.data) {
              this.addresses.update((list) => [...list, response.data!]);
            }
            this.addressModalOpen.set(false);
            this.showToast('info', 'Address added', 'The address has been created.');
          },
          error: (err: { error?: { message?: string } }) => {
            this.addressModalError.set(err?.error?.message ?? 'Failed to create address.');
          },
        });
    }
  }

  // ---- Language handlers ----

  onOpenAddLanguage(): void {
    this.languageModalItem.set(null);
    this.languageForm.reset({ name: '', level: '' });
    this.languageModalError.set(null);
    this.languageModalOpen.set(true);
  }

  onOpenEditLanguage(id: string): void {
    const lang = this.languages().find((l) => l.id === id) ?? null;
    if (!lang) {
      return;
    }

    this.languageModalItem.set(lang);
    this.languageForm.setValue({ name: lang.name ?? '', level: lang.level ?? '' });
    this.languageModalError.set(null);
    this.languageModalOpen.set(true);
  }

  onCloseLanguageModal(): void {
    this.languageModalOpen.set(false);
    this.languageModalError.set(null);
  }

  onSubmitLanguage(): void {
    const profile = this.profile();
    const raw = this.languageForm.getRawValue();
    const existing = this.languageModalItem();

    this.languageModalLoading.set(true);
    this.languageModalError.set(null);

    if (existing?.id) {
      const command: UpdateLanguageCommand = {
        id: existing.id,
        name: raw.name || undefined,
        level: raw.level || undefined,
      };

      this.languagesService
        .updateLanguage(existing.id, command)
        .pipe(
          finalize(() => this.languageModalLoading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (response: BaseResponseOfLanguageDto) => {
            if (!response?.success) {
              this.languageModalError.set(response?.message ?? 'Failed to update language.');
              return;
            }
            const updated = response.data;
            if (updated) {
              this.languages.update((list) => list.map((l) => (l.id === updated.id ? updated : l)));
            }
            this.languageModalOpen.set(false);
            this.showToast('info', 'Language updated', 'The language has been saved.');
          },
          error: (err: { error?: { message?: string } }) => {
            this.languageModalError.set(err?.error?.message ?? 'Failed to update language.');
          },
        });
    } else {
      const command: CreateLanguageCommand = {
        userId: profile?.userId ?? undefined,
        name: raw.name || undefined,
        level: raw.level || undefined,
      };

      this.languagesService
        .createLanguage(command)
        .pipe(
          finalize(() => this.languageModalLoading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (response: BaseResponseOfLanguageDto) => {
            if (!response?.success) {
              this.languageModalError.set(response?.message ?? 'Failed to create language.');
              return;
            }
            if (response.data) {
              this.languages.update((list) => [...list, response.data!]);
            }
            this.languageModalOpen.set(false);
            this.showToast('info', 'Language added', 'The language has been created.');
          },
          error: (err: { error?: { message?: string } }) => {
            this.languageModalError.set(err?.error?.message ?? 'Failed to create language.');
          },
        });
    }
  }

  // ---- Private helpers ----

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userProfilesService
      .getMyUserProfiles()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.profile.set(null);
            this.error.set(response?.message ?? 'Failed to load profile.');
            return;
          }
          this.profile.set(response.data ?? null);
          if (this.setupMode()) {
            this.onOpenEdit();
          }
          if (response.data?.userId) {
            this.loadAddresses(response.data.userId);
            this.loadLanguages(response.data.userId);
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.profile.set(null);
          this.error.set(err?.error?.message ?? 'Failed to load profile.');
        },
      });
  }

  private loadAddresses(userId: string): void {
    this.addressesLoading.set(true);

    this.addressesService
      .getAddressesByUserId(userId)
      .pipe(
        finalize(() => this.addressesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.addresses.set(response.data?.items ?? []);
          }
        },
        error: () => {
          this.addresses.set([]);
        },
      });
  }

  private loadLanguages(userId: string): void {
    this.languagesLoading.set(true);

    this.languagesService
      .getLanguagesByUserId(userId)
      .pipe(
        finalize(() => this.languagesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response: BaseResponseOfPaginatedEnumerableOfLanguageDto) => {
          if (response?.success) {
            this.languages.set(response.data?.items ?? []);
          }
        },
        error: () => {
          this.languages.set([]);
        },
      });
  }

  onCareerNotice(notice: CareerTabNotice): void {
    this.showToast(notice.variant, notice.title, notice.message);
  }

  private showToast(variant: CxsToastVariant, title: string, message: string): void {
    this.toastVariant.set(variant);
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }

  private formatValue(value?: string): string {
    if (!value) {
      return 'N/A';
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : 'N/A';
  }
}
