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
import { finalize } from 'rxjs';
import {
  CxsAvatarComponent,
  CxsBadgeComponent,
  CxsButtonComponent,
  CxsCardComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import { UserProfileDto } from '../../../../shared/models/model';
import { UserProfilesService } from '../../services/user-profiles.service';

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
    CxsDialogComponent,
    CxsInputComponent,
    CxsToastComponent,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly userProfilesService = inject(UserProfilesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<UserProfileDto | null>(null);

  readonly editOpen = signal(false);
  readonly editLoading = signal(false);
  readonly editError = signal<string | null>(null);

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

  readonly personalDetails = computed(() => {
    const profile = this.profile();
    if (!profile) return [];
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
    if (!profile) return [];
    return [
      { label: 'Profile ID', value: this.formatValue(profile.id) },
      { label: 'User ID', value: this.formatValue(profile.userId) },
      { label: 'Identity card', value: this.formatValue(profile.identityCardNumber) },
      { label: 'Passport', value: this.formatValue(profile.passportNumber) },
    ];
  });

  readonly sizeDetails = computed(() => {
    const profile = this.profile();
    if (!profile) return [];
    return [
      { label: 'Shoe size', value: this.formatValue(profile.shoeSize) },
      { label: 'Clothing size', value: this.formatValue(profile.clothingSize) },
      { label: 'Waist size', value: this.formatValue(profile.waistSize) },
    ];
  });

  readonly bio = computed(() => this.formatValue(this.profile()?.bio));
  readonly empty = computed(() => !this.loading() && !this.error() && !this.profile());

  ngOnInit(): void {
    this.loadProfile();
  }

  onRefresh(): void {
    this.loadProfile();
  }

  onOpenEdit(): void {
    const profile = this.profile();
    if (!profile) return;

    this.editForm.setValue({
      displayName: profile.displayName ?? '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
      birthPlace: profile.birthPlace ?? '',
      identityCardNumber: profile.identityCardNumber ?? '',
      passportNumber: profile.passportNumber ?? '',
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
    this.editOpen.set(false);
    this.editError.set(null);
  }

  onSubmitEdit(): void {
    const profile = this.profile();
    if (!profile?.id) return;

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
          this.editOpen.set(false);
          this.showToast('info', 'Profile updated', 'Your profile has been saved.');
        },
        error: (err) => {
          this.editError.set(err?.error?.message ?? 'Failed to update profile.');
        },
      });
  }

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
        },
        error: (err) => {
          this.profile.set(null);
          this.error.set(err?.error?.message ?? 'Failed to load profile.');
        },
      });
  }

  private showToast(variant: CxsToastVariant, title: string, message: string): void {
    this.toastVariant.set(variant);
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }

  private formatValue(value?: string): string {
    if (!value) return 'N/A';
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : 'N/A';
  }
}
