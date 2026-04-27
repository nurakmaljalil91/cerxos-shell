import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
import {
  CreatePermissionCommand,
  PermissionDto,
  UpdatePermissionCommand,
} from '../../../../shared/models/model';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  readonly editPermissionOpen = signal(false);
  readonly editPermissionLoading = signal(false);
  readonly editPermissionError = signal<string | null>(null);
  readonly editingPermissionId = signal<string | null>(null);
  readonly deletePermissionOpen = signal(false);
  readonly deletePermissionLoading = signal(false);
  readonly deletePermissionError = signal<string | null>(null);
  readonly deletingPermission = signal<PermissionDto | null>(null);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  private readonly permissions = signal<PermissionDto[]>([]);

  readonly addPermissionForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });
  readonly editPermissionForm = this.formBuilder.group({
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
    const permission = this.permissions().find((item) => item.id === permissionId);

    if (!permission) {
      this.showToast(
        'Permission not found',
        'Refresh the permissions list and try again.',
        'danger',
      );
      return;
    }

    this.editingPermissionId.set(permissionId);
    this.editPermissionError.set(null);
    this.editPermissionForm.reset({
      name: permission.name ?? '',
      description: permission.description ?? '',
    });
    this.editPermissionOpen.set(true);
  }

  onDeletePermission(permissionId: string): void {
    const permission = this.permissions().find((item) => item.id === permissionId);

    if (!permission) {
      this.showToast(
        'Permission not found',
        'Refresh the permissions list and try again.',
        'danger',
      );
      return;
    }

    this.deletePermissionError.set(null);
    this.deletingPermission.set(permission);
    this.deletePermissionOpen.set(true);
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

  onCloseEditPermission(): void {
    this.editPermissionOpen.set(false);
    this.editPermissionLoading.set(false);
    this.editPermissionError.set(null);
    this.editingPermissionId.set(null);
    this.editPermissionForm.reset({
      name: '',
      description: '',
    });
  }

  onSubmitEditPermission(): void {
    if (this.editPermissionLoading()) {
      return;
    }

    const permissionId = this.editingPermissionId();
    if (!permissionId) {
      this.editPermissionError.set('Select a permission to edit.');
      return;
    }

    if (this.editPermissionForm.invalid) {
      this.editPermissionForm.markAllAsTouched();
      return;
    }

    const formValue = this.editPermissionForm.getRawValue();
    const command: UpdatePermissionCommand = {
      id: permissionId,
      name: formValue.name ?? '',
      description: formValue.description ?? '',
    };

    this.editPermissionLoading.set(true);
    this.editPermissionError.set(null);

    this.permissionsService
      .updatePermission(permissionId, command)
      .pipe(
        finalize(() => this.editPermissionLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to update permission.';
            this.editPermissionError.set(message);
            this.showToast('Permission not updated', message, 'danger');
            return;
          }

          this.editPermissionOpen.set(false);
          this.editingPermissionId.set(null);
          this.showToast(
            'Permission updated',
            response?.message ?? 'Permission updated successfully.',
            'info',
          );
          this.loadPermissions();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to update permission.';
          this.editPermissionError.set(message);
          this.showToast('Permission not updated', message, 'danger');
        },
      });
  }

  onCloseDeletePermission(): void {
    this.deletePermissionOpen.set(false);
    this.deletePermissionLoading.set(false);
    this.deletePermissionError.set(null);
    this.deletingPermission.set(null);
  }

  onConfirmDeletePermission(): void {
    if (this.deletePermissionLoading()) {
      return;
    }

    const permission = this.deletingPermission();
    if (!permission?.id) {
      this.deletePermissionError.set('Select a permission to delete.');
      return;
    }

    this.deletePermissionLoading.set(true);
    this.deletePermissionError.set(null);

    this.permissionsService
      .deletePermission(permission.id)
      .pipe(
        finalize(() => this.deletePermissionLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to delete permission.';
            this.deletePermissionError.set(message);
            this.showToast('Permission not deleted', message, 'danger');
            return;
          }

          this.deletePermissionOpen.set(false);
          this.deletingPermission.set(null);
          this.showToast(
            'Permission deleted',
            response?.message ?? 'Permission deleted successfully.',
            'info',
          );
          this.loadPermissions();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to delete permission.';
          this.deletePermissionError.set(message);
          this.showToast('Permission not deleted', message, 'danger');
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
