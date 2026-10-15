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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  CxsAlertComponent,
  CxsButtonComponent,
  CxsCardComponent,
  CxsDataTableCellDirective,
  CxsDataTableColumn,
  CxsDataTableComponent,
  CxsDatepickerComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsMultiSelectComponent,
  CxsMultiSelectOption,
} from 'cerxos-ui';
import { PersonalAccessTokenDto } from '../../../../shared/models/model';
import { PersonalAccessTokensService } from '../../services/personal-access-tokens.service';

const DEFAULT_EXPIRY_DAYS = 90;

/** Formats a date as `YYYY-MM-DD` in local time, matching `cxs-datepicker`. */
export function toDateInputValue(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Builds a readable label such as "Planner – read & write" for a scope value. */
export function scopeLabel(scope: string): string {
  const [service, level] = scope.split(':');
  const name = service.charAt(0).toUpperCase() + service.slice(1);
  return `${name} – ${level === 'write' ? 'read & write' : 'read'}`;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-personal-access-tokens',
  imports: [
    ReactiveFormsModule,
    CxsAlertComponent,
    CxsButtonComponent,
    CxsCardComponent,
    CxsDataTableComponent,
    CxsDataTableCellDirective,
    CxsDatepickerComponent,
    CxsDialogComponent,
    CxsInputComponent,
    CxsMultiSelectComponent,
  ],
  templateUrl: './personal-access-tokens.html',
})
export class PersonalAccessTokens implements OnInit {
  private readonly service = inject(PersonalAccessTokensService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly tokens = signal<PersonalAccessTokenDto[]>([]);
  readonly scopeOptions = signal<CxsMultiSelectOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly createOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  /** The secret of the token just created. Held only until the secret dialog is closed. */
  readonly createdSecret = signal<string | null>(null);
  readonly copied = signal(false);

  readonly revokeTarget = signal<PersonalAccessTokenDto | null>(null);
  readonly revoking = signal(false);

  readonly minExpiry = toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));

  readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    scopes: [[] as string[], [Validators.required]],
    expiresOn: [this.defaultExpiry()],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'prefix', label: 'Token' },
    { key: 'scopes', label: 'Scopes' },
    { key: 'lastUsed', label: 'Last used' },
    { key: 'expires', label: 'Expires' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly rows = computed(() =>
    this.tokens().map((token) => ({
      id: token.id,
      name: token.name ?? '',
      prefix: `${token.displayPrefix ?? ''}…`,
      scopes: (token.scopes ?? []).join(', '),
      lastUsed: this.formatDate(token.lastUsedAt) ?? 'Never',
      expires: this.formatDate(token.expiresAt) ?? 'Never',
      status: token.isActive ? 'Active' : token.revokedAt ? 'Revoked' : 'Expired',
      isActive: !!token.isActive,
    })),
  );

  ngOnInit(): void {
    this.service
      .getScopes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) =>
          this.scopeOptions.set((response.data ?? []).map((value) => ({ value, label: scopeLabel(value) }))),
        error: () => this.error.set('Unable to load token scopes.'),
      });
    this.loadTokens();
  }

  loadTokens(): void {
    this.loading.set(true);
    this.service
      .getMyTokens()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.tokens.set(response.data ?? []);
          this.error.set(null);
        },
        error: () => this.error.set('Unable to load personal access tokens.'),
      });
  }

  onOpenCreate(): void {
    this.createForm.reset({ name: '', scopes: [], expiresOn: this.defaultExpiry() });
    this.createError.set(null);
    this.createOpen.set(true);
  }

  onCloseCreate(): void {
    this.createOpen.set(false);
  }

  onSubmitCreate(): void {
    if (this.createForm.invalid || this.creating()) {
      this.createForm.markAllAsTouched();
      this.createError.set('Enter a name and choose at least one scope.');
      return;
    }

    const { name, scopes, expiresOn } = this.createForm.getRawValue();
    this.creating.set(true);
    this.service
      .createToken({
        name: name.trim(),
        scopes,
        expiresAt: expiresOn ? new Date(`${expiresOn}T23:59:59`).toISOString() : undefined,
      })
      .pipe(
        finalize(() => this.creating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data?.token) {
            this.createError.set(response.message ?? 'Unable to create the token.');
            return;
          }
          this.createOpen.set(false);
          this.copied.set(false);
          this.createdSecret.set(response.data.token);
          this.loadTokens();
        },
        error: (error: { error?: { message?: string } }) =>
          this.createError.set(error?.error?.message ?? 'Unable to create the token.'),
      });
  }

  async onCopySecret(): Promise<void> {
    const secret = this.createdSecret();
    if (!secret) {
      return;
    }
    try {
      await navigator.clipboard.writeText(secret);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }

  onCloseSecret(): void {
    this.createdSecret.set(null);
    this.copied.set(false);
  }

  onRequestRevoke(id: string): void {
    this.revokeTarget.set(this.tokens().find((token) => token.id === id) ?? null);
  }

  onCancelRevoke(): void {
    this.revokeTarget.set(null);
  }

  onConfirmRevoke(): void {
    const target = this.revokeTarget();
    if (!target?.id || this.revoking()) {
      return;
    }
    this.revoking.set(true);
    this.service
      .revokeToken(target.id)
      .pipe(
        finalize(() => this.revoking.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.revokeTarget.set(null);
          this.loadTokens();
        },
        error: () => this.error.set('Unable to revoke the token.'),
      });
  }

  private defaultExpiry(): string {
    return toDateInputValue(new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
  }

  private formatDate(value: string | undefined): string | null {
    return value ? new Date(value).toLocaleDateString() : null;
  }
}
