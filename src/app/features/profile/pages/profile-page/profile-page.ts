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
  CxsDataTableCellDirective,
  CxsDataTableComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import type { CxsDataTableColumn } from 'cerxos-ui';
import { AddressDto } from '../../../../shared/models/model';
import { UserProfileDto } from '../../../../shared/models/model';
import { UserProfilesService } from '../../services/user-profiles.service';
import { AddressesService } from '../../services/addresses.service';

interface SkillEntry {
  id: string;
  name: string;
  level: string;
  years: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

interface WorkplaceEntry {
  id: string;
  company: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

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
    CxsToastComponent,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly userProfilesService = inject(UserProfilesService);
  private readonly addressesService = inject(AddressesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // ---- Profile ----
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

  readonly addressData = computed(
    () => this.addresses() as unknown as Array<Record<string, unknown>>,
  );

  // ---- Skills (local) ----
  readonly skills = signal<SkillEntry[]>([]);
  readonly skillModalItem = signal<SkillEntry | null>(null);
  readonly skillModalOpen = signal(false);

  readonly skillForm = this.formBuilder.group({
    name: [''],
    level: [''],
    years: [''],
  });

  readonly skillColumns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Skill' },
    { key: 'level', label: 'Level' },
    { key: 'years', label: 'Years' },
    { key: 'actions', label: '', width: '72px' },
  ];

  readonly skillData = computed(
    () => this.skills() as unknown as Array<Record<string, unknown>>,
  );

  // ---- Education (local) ----
  readonly educations = signal<EducationEntry[]>([]);
  readonly educationModalItem = signal<EducationEntry | null>(null);
  readonly educationModalOpen = signal(false);

  readonly educationForm = this.formBuilder.group({
    institution: [''],
    degree: [''],
    field: [''],
    startYear: [''],
    endYear: [''],
  });

  readonly educationColumns: CxsDataTableColumn[] = [
    { key: 'institution', label: 'Institution' },
    { key: 'degree', label: 'Degree' },
    { key: 'field', label: 'Field' },
    { key: 'startYear', label: 'From' },
    { key: 'endYear', label: 'To' },
    { key: 'actions', label: '', width: '72px' },
  ];

  readonly educationData = computed(
    () => this.educations() as unknown as Array<Record<string, unknown>>,
  );

  // ---- Workplace (local) ----
  readonly workplaces = signal<WorkplaceEntry[]>([]);
  readonly workplaceModalItem = signal<WorkplaceEntry | null>(null);
  readonly workplaceModalOpen = signal(false);

  readonly workplaceForm = this.formBuilder.group({
    company: [''],
    position: [''],
    department: [''],
    startDate: [''],
    endDate: [''],
    isCurrent: [false],
  });

  readonly workplaceColumns: CxsDataTableColumn[] = [
    { key: 'company', label: 'Company' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'startDate', label: 'From' },
    { key: 'endDate', label: 'To' },
    { key: 'isCurrent', label: 'Current', formatter: (v) => (v ? 'Yes' : '') },
    { key: 'actions', label: '', width: '72px' },
  ];

  readonly workplaceData = computed(
    () => this.workplaces() as unknown as Array<Record<string, unknown>>,
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  // ---- Profile handlers ----

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
        error: (err: { error?: { message?: string } }) => {
          this.editError.set(err?.error?.message ?? 'Failed to update profile.');
        },
      });
  }

  // ---- Address handlers ----

  onOpenAddAddress(): void {
    this.addressModalItem.set(null);
    this.addressForm.reset({ label: '', type: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
    this.addressModalError.set(null);
    this.addressModalOpen.set(true);
  }

  onOpenEditAddress(id: string): void {
    const address = this.addresses().find((a) => a.id === id) ?? null;
    if (!address) return;

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
              this.addresses.update((list) =>
                list.map((a) => (a.id === updated.id ? updated : a)),
              );
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

  // ---- Skill handlers ----

  onOpenAddSkill(): void {
    this.skillModalItem.set(null);
    this.skillForm.reset({ name: '', level: '', years: '' });
    this.skillModalOpen.set(true);
  }

  onOpenEditSkill(id: string): void {
    const skill = this.skills().find((s) => s.id === id) ?? null;
    if (!skill) return;

    this.skillModalItem.set(skill);
    this.skillForm.setValue({ name: skill.name, level: skill.level, years: skill.years });
    this.skillModalOpen.set(true);
  }

  onCloseSkillModal(): void {
    this.skillModalOpen.set(false);
  }

  onSubmitSkill(): void {
    const raw = this.skillForm.getRawValue();
    const existing = this.skillModalItem();

    if (existing) {
      this.skills.update((list) =>
        list.map((s) =>
          s.id === existing.id
            ? { ...s, name: raw.name ?? '', level: raw.level ?? '', years: raw.years ?? '' }
            : s,
        ),
      );
    } else {
      const newSkill: SkillEntry = {
        id: `skill-${Date.now()}`,
        name: raw.name ?? '',
        level: raw.level ?? '',
        years: raw.years ?? '',
      };
      this.skills.update((list) => [...list, newSkill]);
    }

    this.skillModalOpen.set(false);
  }

  // ---- Education handlers ----

  onOpenAddEducation(): void {
    this.educationModalItem.set(null);
    this.educationForm.reset({ institution: '', degree: '', field: '', startYear: '', endYear: '' });
    this.educationModalOpen.set(true);
  }

  onOpenEditEducation(id: string): void {
    const entry = this.educations().find((e) => e.id === id) ?? null;
    if (!entry) return;

    this.educationModalItem.set(entry);
    this.educationForm.setValue({
      institution: entry.institution,
      degree: entry.degree,
      field: entry.field,
      startYear: entry.startYear,
      endYear: entry.endYear,
    });
    this.educationModalOpen.set(true);
  }

  onCloseEducationModal(): void {
    this.educationModalOpen.set(false);
  }

  onSubmitEducation(): void {
    const raw = this.educationForm.getRawValue();
    const existing = this.educationModalItem();

    if (existing) {
      this.educations.update((list) =>
        list.map((e) =>
          e.id === existing.id
            ? {
                ...e,
                institution: raw.institution ?? '',
                degree: raw.degree ?? '',
                field: raw.field ?? '',
                startYear: raw.startYear ?? '',
                endYear: raw.endYear ?? '',
              }
            : e,
        ),
      );
    } else {
      const newEntry: EducationEntry = {
        id: `edu-${Date.now()}`,
        institution: raw.institution ?? '',
        degree: raw.degree ?? '',
        field: raw.field ?? '',
        startYear: raw.startYear ?? '',
        endYear: raw.endYear ?? '',
      };
      this.educations.update((list) => [...list, newEntry]);
    }

    this.educationModalOpen.set(false);
  }

  // ---- Workplace handlers ----

  onOpenAddWorkplace(): void {
    this.workplaceModalItem.set(null);
    this.workplaceForm.reset({ company: '', position: '', department: '', startDate: '', endDate: '', isCurrent: false });
    this.workplaceModalOpen.set(true);
  }

  onOpenEditWorkplace(id: string): void {
    const entry = this.workplaces().find((w) => w.id === id) ?? null;
    if (!entry) return;

    this.workplaceModalItem.set(entry);
    this.workplaceForm.setValue({
      company: entry.company,
      position: entry.position,
      department: entry.department,
      startDate: entry.startDate,
      endDate: entry.endDate,
      isCurrent: entry.isCurrent,
    });
    this.workplaceModalOpen.set(true);
  }

  onCloseWorkplaceModal(): void {
    this.workplaceModalOpen.set(false);
  }

  onSubmitWorkplace(): void {
    const raw = this.workplaceForm.getRawValue();
    const existing = this.workplaceModalItem();

    if (existing) {
      this.workplaces.update((list) =>
        list.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                company: raw.company ?? '',
                position: raw.position ?? '',
                department: raw.department ?? '',
                startDate: raw.startDate ?? '',
                endDate: raw.endDate ?? '',
                isCurrent: raw.isCurrent ?? false,
              }
            : w,
        ),
      );
    } else {
      const newEntry: WorkplaceEntry = {
        id: `work-${Date.now()}`,
        company: raw.company ?? '',
        position: raw.position ?? '',
        department: raw.department ?? '',
        startDate: raw.startDate ?? '',
        endDate: raw.endDate ?? '',
        isCurrent: raw.isCurrent ?? false,
      };
      this.workplaces.update((list) => [...list, newEntry]);
    }

    this.workplaceModalOpen.set(false);
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
          if (response.data?.userId) {
            this.loadAddresses(response.data.userId);
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
