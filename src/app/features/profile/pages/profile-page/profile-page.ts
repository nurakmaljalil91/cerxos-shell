import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CxsAvatarComponent,
  CxsBadgeComponent,
  CxsButtonComponent,
  CxsCardComponent,
} from 'cerxos-ui';
import { UserProfileDto } from '../../../../shared/models/model';
import { UserProfilesService } from '../../services/user-profiles.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CxsAvatarComponent,
    CxsBadgeComponent,
    CxsButtonComponent,
    CxsCardComponent,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly userProfilesService = inject(UserProfilesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<UserProfileDto | null>(null);

  readonly displayName = computed(() => {
    const profile = this.profile();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
    if (fullName) {
      return fullName;
    }
    if (profile?.displayName) {
      return profile.displayName;
    }
    return 'Profile';
  });

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
      { label: 'Profile ID', value: this.formatValue(profile.id) },
      { label: 'User ID', value: this.formatValue(profile.userId) },
      { label: 'Identity card', value: this.formatValue(profile.identityCardNumber) },
      { label: 'Passport', value: this.formatValue(profile.passportNumber) },
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

  ngOnInit(): void {
    this.loadProfile();
  }

  onRefresh(): void {
    this.loadProfile();
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

          const profile = response.data ?? null;
          this.profile.set(profile);
        },
        error: (err) => {
          this.profile.set(null);
          this.error.set(err?.error?.message ?? 'Failed to load profile.');
        },
      });
  }

  private formatValue(value?: string): string {
    if (!value) {
      return 'N/A';
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : 'N/A';
  }
}
