import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CxsButtonComponent,
  CxsDataTableCellDirective,
  CxsDataTableColumn,
  CxsDataTableComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import { CreatePermissionCommand, PermissionDto } from '../../../../shared/models/model';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsDataTableComponent,
    CxsDataTableCellDirective,
    CxsDialogComponent,
    CxsInputComponent,
    CxsToastComponent,
  ],
  templateUrl: './permissions-page.html',
  styleUrl: './permissions-page.css',
})
export class PermissionsPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly permissionsService = inject(PermissionsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly addPermissionOpen = signal(false);
  readonly addPermissionLoading = signal(false);
  readonly addPermissionError = signal<string | null>(null);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  private readonly permissions = signal<PermissionDto[]>([]);

  readonly addPermissionForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Permission', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly rows = computed(() =>
    this.permissions().map((permission) => ({
      id: permission.id ?? '',
      name: permission.name ?? '',
      description: permission.description ?? '',
    })),
  );

  ngOnInit(): void {
    this.loadPermissions();
  }

  onEditPermission(permissionId: string): void {
    void permissionId;
  }

  onDeletePermission(permissionId: string): void {
    void permissionId;
  }

  onOpenAddPermission(): void {
    this.addPermissionError.set(null);
    this.addPermissionOpen.set(true);
  }

  onCloseAddPermission(): void {
    this.addPermissionOpen.set(false);
    this.addPermissionLoading.set(false);
    this.addPermissionError.set(null);
    this.addPermissionForm.reset({
      name: '',
      description: '',
    });
  }

  onSubmitAddPermission(): void {
    if (this.addPermissionLoading()) {
      return;
    }

    if (this.addPermissionForm.invalid) {
      this.addPermissionForm.markAllAsTouched();
      return;
    }

    const formValue = this.addPermissionForm.getRawValue();
    const command: CreatePermissionCommand = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
    };

    this.addPermissionLoading.set(true);
    this.addPermissionError.set(null);

    this.permissionsService
      .createPermission(command)
      .pipe(
        finalize(() => this.addPermissionLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to create permission.';
            this.addPermissionError.set(message);
            this.showToast('Permission not created', message, 'danger');
            return;
          }

          this.addPermissionForm.reset({
            name: '',
            description: '',
          });
          this.addPermissionOpen.set(false);
          this.showToast(
            'Permission created',
            response?.message ?? 'Permission added successfully.',
            'info',
          );
          this.loadPermissions();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to create permission.';
          this.addPermissionError.set(message);
          this.showToast('Permission not created', message, 'danger');
        },
      });
  }

  onToastOpenChange(open: boolean): void {
    this.toastOpen.set(open);
  }

  private loadPermissions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.permissionsService
      .getPermissions({
        page: 1,
        total: 1000,
        sortBy: 'name',
        descending: false,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.permissions.set([]);
            this.error.set(response?.message ?? 'Failed to load permissions.');
            return;
          }

          this.permissions.set(response.data.items);
        },
        error: (err) => {
          this.permissions.set([]);
          this.error.set(err?.error?.message ?? 'Failed to load permissions.');
        },
      });
  }

  private showToast(title: string, message: string, variant: CxsToastVariant): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    this.toastOpen.set(true);
  }
}
