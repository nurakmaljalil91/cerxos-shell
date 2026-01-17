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
  CxsDataTableSort,
  CxsDataTableSortDirection,
  CxsDialogComponent,
  CxsInputComponent,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import {
  CreatePermissionCommand,
  CreateRoleCommand,
  CreateUserCommand,
  PermissionDto,
  RoleDto,
  UserDto,
} from '../../../../shared/models/model';
import { PermissionsService } from '../../services/permissions.service';
import { RolesService } from '../../services/roles.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-page',
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
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly permissionsService = inject(PermissionsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rolesLoading = signal(false);
  readonly rolesError = signal<string | null>(null);
  readonly permissionsLoading = signal(false);
  readonly permissionsError = signal<string | null>(null);
  readonly addUserOpen = signal(false);
  readonly addUserLoading = signal(false);
  readonly addUserError = signal<string | null>(null);
  readonly addRoleOpen = signal(false);
  readonly addRoleLoading = signal(false);
  readonly addRoleError = signal<string | null>(null);
  readonly addPermissionOpen = signal(false);
  readonly addPermissionLoading = signal(false);
  readonly addPermissionError = signal<string | null>(null);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly sortKey = signal<string | undefined>('username');
  readonly sortDirection = signal<CxsDataTableSortDirection>('asc');

  private readonly users = signal<UserDto[]>([]);
  private readonly roles = signal<RoleDto[]>([]);
  private readonly permissions = signal<PermissionDto[]>([]);

  readonly addUserForm = this.formBuilder.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly addRoleForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  readonly addPermissionForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'username', label: 'Username', filterable: true, sortable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'roles', label: 'Roles', filterable: true, sortable: true },
    { key: 'locked', label: 'Locked', align: 'right' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly roleColumns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Role', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly permissionColumns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Permission', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly rows = computed(() =>
    this.users().map((user) => ({
      id: user.id ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      roles: user.roles?.length ? user.roles.join(', ') : undefined,
      locked: user.isLocked ? 'Yes' : 'No',
      isLocked: user.isLocked ?? false,
    })),
  );

  readonly roleRows = computed(() =>
    this.roles().map((role) => ({
      id: role.id ?? '',
      name: role.name ?? '',
      description: role.description ?? '',
      permissions: role.permissions?.length ? role.permissions.join(', ') : undefined,
    })),
  );

  readonly permissionRows = computed(() =>
    this.permissions().map((permission) => ({
      id: permission.id ?? '',
      name: permission.name ?? '',
      description: permission.description ?? '',
    })),
  );

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadUsers();
  }

  onSortChange(sort: CxsDataTableSort): void {
    this.sortKey.set(sort.key);
    this.sortDirection.set(sort.direction);
    this.pageIndex.set(1);
    this.loadUsers();
  }

  onEditUser(userId: string): void {
    void userId;
  }

  onDeleteUser(userId: string): void {
    void userId;
  }

  onToggleLockUser(userId: string, isLocked: boolean): void {
    void userId;
    void isLocked;
  }

  onChangePassword(userId: string): void {
    void userId;
  }

  onEditRole(roleId: string): void {
    void roleId;
  }

  onDeleteRole(roleId: string): void {
    void roleId;
  }

  onEditPermission(permissionId: string): void {
    void permissionId;
  }

  onDeletePermission(permissionId: string): void {
    void permissionId;
  }

  onOpenAddUser(): void {
    this.addUserError.set(null);
    this.addUserOpen.set(true);
  }

  onCloseAddUser(): void {
    this.addUserOpen.set(false);
    this.addUserLoading.set(false);
    this.addUserError.set(null);
    this.addUserForm.reset({
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
    });
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

  onSubmitAddUser(): void {
    if (this.addUserLoading()) {
      return;
    }

    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    const formValue = this.addUserForm.getRawValue();
    const command: CreateUserCommand = {
      username: formValue.username ?? '',
      email: formValue.email ?? '',
      phoneNumber: formValue.phoneNumber ?? '',
      password: formValue.password ?? '',
    };

    this.addUserLoading.set(true);
    this.addUserError.set(null);

    this.usersService
      .createUser(command)
      .pipe(
        finalize(() => this.addUserLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to create user.';
            this.addUserError.set(message);
            this.showToast('User not created', message, 'danger');
            return;
          }

          this.addUserForm.reset({
            username: '',
            email: '',
            phoneNumber: '',
            password: '',
          });
          this.addUserOpen.set(false);
          this.showToast('User created', response?.message ?? 'User added successfully.', 'info');
          this.loadUsers();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to create user.';
          this.addUserError.set(message);
          this.showToast('User not created', message, 'danger');
        },
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

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const sortKey = this.sortKey();
    this.usersService
      .getUsers({
        page: this.pageIndex(),
        total: this.pageSize(),
        sortBy: sortKey,
        descending: this.sortDirection() === 'desc',
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.users.set([]);
            this.totalCount.set(0);
            this.error.set(response?.message ?? 'Failed to load users.');
            return;
          }

          this.users.set(response.data.items);
          this.totalCount.set(response.data.totalCount ?? 0);
        },
        error: (err) => {
          this.users.set([]);
          this.totalCount.set(0);
          this.error.set(err?.error?.message ?? 'Failed to load users.');
        },
      });
  }

  private loadRoles(): void {
    this.rolesLoading.set(true);
    this.rolesError.set(null);

    this.rolesService
      .getRoles({
        page: 1,
        total: 1000,
        sortBy: 'name',
        descending: false,
      })
      .pipe(
        finalize(() => this.rolesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.roles.set([]);
            this.rolesError.set(response?.message ?? 'Failed to load roles.');
            return;
          }

          this.roles.set(response.data.items);
        },
        error: (err) => {
          this.roles.set([]);
          this.rolesError.set(err?.error?.message ?? 'Failed to load roles.');
        },
      });
  }

  private loadPermissions(): void {
    this.permissionsLoading.set(true);
    this.permissionsError.set(null);

    this.permissionsService
      .getPermissions({
        page: 1,
        total: 1000,
        sortBy: 'name',
        descending: false,
      })
      .pipe(
        finalize(() => this.permissionsLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.permissions.set([]);
            this.permissionsError.set(response?.message ?? 'Failed to load permissions.');
            return;
          }

          this.permissions.set(response.data.items);
        },
        error: (err) => {
          this.permissions.set([]);
          this.permissionsError.set(err?.error?.message ?? 'Failed to load permissions.');
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
