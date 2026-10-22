import { computed, DestroyRef, Directive, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CxsToastVariant } from 'cerxos-ui';
import { finalize, Observable } from 'rxjs';

/** A toast the profile page should show on behalf of a career tab. */
export type CareerTabNotice = { variant: CxsToastVariant; title: string; message: string };

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
};

type ApiError = { error?: ApiResponse<unknown> | null };

/** Picks the most specific message from an API response: the first field error, then the message. */
export function apiErrorMessage(source: ApiResponse<unknown> | null | undefined, fallback: string): string {
  const fieldError = source?.errors ? Object.values(source.errors).flat()[0] : undefined;
  return fieldError ?? source?.message ?? fallback;
}

/** Form validator: the `end` control's date must not be before the `start` control's date. */
export function endNotBeforeStart(start: string, end: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startValue = group.get(start)?.value as string | null;
    const endValue = group.get(end)?.value as string | null;
    return startValue && endValue && endValue < startValue ? { endBeforeStart: true } : null;
  };
}

/** Converts a form value to a create payload value: blank becomes undefined (omitted). */
export function optional(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Shared load / add / edit / delete flow for the profile career tabs.
 * Subclasses supply the form, the API calls and the mapping between form values and commands.
 */
@Directive()
export abstract class CareerTabBase<TDto extends { id?: string }, TCreate, TUpdate> implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);

  readonly notify = output<CareerTabNotice>();

  readonly items = signal<TDto[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly modalOpen = signal(false);
  readonly editing = signal<TDto | null>(null);
  readonly saving = signal(false);
  readonly modalError = signal<string | null>(null);
  readonly deleteTarget = signal<TDto | null>(null);
  readonly deleting = signal(false);

  readonly tableData = computed(() => this.items() as unknown as Record<string, unknown>[]);

  /** Singular display label, e.g. "Skill". */
  protected abstract readonly label: string;
  abstract readonly form: FormGroup;

  protected abstract list(): Observable<ApiResponse<TDto[]>>;
  protected abstract create(command: TCreate): Observable<ApiResponse<TDto>>;
  protected abstract update(id: string, command: TUpdate): Observable<ApiResponse<TDto>>;
  protected abstract remove(id: string): Observable<ApiResponse<string>>;
  protected abstract resetForm(): void;
  protected abstract patchForm(item: TDto): void;
  protected abstract toCreateCommand(): TCreate;
  protected abstract toUpdateCommand(id: string): TUpdate;
  abstract displayName(item: TDto): string;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.list()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.loadError.set(apiErrorMessage(response, `Failed to load ${this.pluralLabel()}.`));
            return;
          }
          this.items.set(response.data ?? []);
        },
        error: (err: ApiError) => {
          this.loadError.set(apiErrorMessage(err?.error, `Failed to load ${this.pluralLabel()}.`));
        },
      });
  }

  openAdd(): void {
    this.editing.set(null);
    this.resetForm();
    this.prepareModal();
  }

  openEdit(id: string): void {
    const item = this.items().find((i) => i.id === id);
    if (!item) {
      return;
    }

    this.editing.set(item);
    this.patchForm(item);
    this.prepareModal();
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalError.set(null);
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const existing = this.editing();
    const request$ = existing?.id
      ? this.update(existing.id, this.toUpdateCommand(existing.id))
      : this.create(this.toCreateCommand());
    const failure = `Failed to save ${this.label.toLowerCase()}.`;

    this.saving.set(true);
    this.modalError.set(null);

    request$
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          const saved = response?.data;
          if (!response?.success || !saved) {
            this.modalError.set(apiErrorMessage(response, failure));
            return;
          }

          this.items.update((list) =>
            existing ? list.map((i) => (i.id === saved.id ? saved : i)) : [...list, saved],
          );
          this.modalOpen.set(false);
          this.notify.emit({
            variant: 'info',
            title: existing ? `${this.label} updated` : `${this.label} added`,
            message: `${this.displayName(saved)} has been saved.`,
          });
        },
        error: (err: ApiError) => {
          this.modalError.set(apiErrorMessage(err?.error, failure));
        },
      });
  }

  requestDelete(id: string): void {
    this.deleteTarget.set(this.items().find((i) => i.id === id) ?? null);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target?.id || this.deleting()) {
      return;
    }

    const failure = `Failed to delete ${this.label.toLowerCase()}.`;
    this.deleting.set(true);

    this.remove(target.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.notifyDeleteFailed(apiErrorMessage(response, failure));
            return;
          }

          this.items.update((list) => list.filter((i) => i.id !== target.id));
          this.deleteTarget.set(null);
          this.notify.emit({
            variant: 'info',
            title: `${this.label} deleted`,
            message: `${this.displayName(target)} has been removed.`,
          });
        },
        error: (err: ApiError) => {
          this.notifyDeleteFailed(apiErrorMessage(err?.error, failure));
        },
      });
  }

  /** True when the control has been touched and fails validation, for `[invalid]` bindings. */
  showInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  private notifyDeleteFailed(message: string): void {
    this.notify.emit({ variant: 'danger', title: 'Delete failed', message });
  }

  private prepareModal(): void {
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  private pluralLabel(): string {
    return `${this.label.toLowerCase()}s`;
  }
}
