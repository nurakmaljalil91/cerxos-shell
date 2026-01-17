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
  CxsDataTableCellDirective,
  CxsDataTableColumn,
  CxsDataTableComponent,
  CxsDataTableSort,
  CxsDataTableSortDirection,
} from 'cerxos-ui';
import { PermissionDto, RoleDto, UserDto } from '../../../../shared/models/model';
import { PermissionsService } from '../../services/permissions.service';
import { RolesService } from '../../services/roles.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CxsDataTableComponent, CxsDataTableCellDirective],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage implements OnInit {
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

  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly sortKey = signal<string | undefined>('username');
  readonly sortDirection = signal<CxsDataTableSortDirection>('asc');

  private readonly users = signal<UserDto[]>([]);
  private readonly roles = signal<RoleDto[]>([]);
  private readonly permissions = signal<PermissionDto[]>([]);

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
  ];

  readonly permissionColumns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Permission', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
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
}
