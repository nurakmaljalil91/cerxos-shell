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
import { CreateRoleCommand, RoleDto } from '../../../../shared/models/model';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-roles-page',
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
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.css',
})
export class RolesPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly addRoleOpen = signal(false);
  readonly addRoleLoading = signal(false);
  readonly addRoleError = signal<string | null>(null);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  private readonly roles = signal<RoleDto[]>([]);

  readonly addRoleForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Role', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly rows = computed(() =>
    this.roles().map((role) => ({
      id: role.id ?? '',
      name: role.name ?? '',
      description: role.description ?? '',
      permissions: role.permissions?.length ? role.permissions.join(', ') : undefined,
    })),
  );

  ngOnInit(): void {
    this.loadRoles();
  }

  onEditRole(roleId: string): void {
    void roleId;
  }

  onDeleteRole(roleId: string): void {
    void roleId;
  }

  onOpenAddRole(): void {
    this.addRoleError.set(null);
    this.addRoleOpen.set(true);
  }

  onCloseAddRole(): void {
    this.addRoleOpen.set(false);
    this.addRoleLoading.set(false);
    this.addRoleError.set(null);
    this.addRoleForm.reset({
      name: '',
      description: '',
    });
  }

  onSubmitAddRole(): void {
    if (this.addRoleLoading()) {
      return;
    }

    if (this.addRoleForm.invalid) {
      this.addRoleForm.markAllAsTouched();
      return;
    }

    const formValue = this.addRoleForm.getRawValue();
    const command: CreateRoleCommand = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
    };

    this.addRoleLoading.set(true);
    this.addRoleError.set(null);

    this.rolesService
      .createRole(command)
      .pipe(
        finalize(() => this.addRoleLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to create role.';
            this.addRoleError.set(message);
            this.showToast('Role not created', message, 'danger');
            return;
          }

          this.addRoleForm.reset({
            name: '',
            description: '',
          });
          this.addRoleOpen.set(false);
          this.showToast('Role created', response?.message ?? 'Role added successfully.', 'info');
          this.loadRoles();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to create role.';
          this.addRoleError.set(message);
          this.showToast('Role not created', message, 'danger');
        },
      });
  }

  onToastOpenChange(open: boolean): void {
    this.toastOpen.set(open);
  }

  private loadRoles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.rolesService
      .getRoles({
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
            this.roles.set([]);
            this.error.set(response?.message ?? 'Failed to load roles.');
            return;
          }

          this.roles.set(response.data.items);
        },
        error: (err) => {
          this.roles.set([]);
          this.error.set(err?.error?.message ?? 'Failed to load roles.');
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
