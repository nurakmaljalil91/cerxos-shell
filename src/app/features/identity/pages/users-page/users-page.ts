import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CxsButtonComponent,
  CxsCardComponent,
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
import { CreateUserCommand, UserDto } from '../../../../shared/models/model';
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
    CxsCardComponent,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly addUserOpen = signal(false);
  readonly addUserLoading = signal(false);
  readonly addUserError = signal<string | null>(null);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly sortKey = signal<string | undefined>('username');
  readonly sortDirection = signal<CxsDataTableSortDirection>('asc');
  readonly filter = signal<string | undefined>(undefined);
  readonly openMenuId = signal<string | null>(null);
  readonly menuPosition = signal<{ top: number; left: number } | null>(null);

  private readonly users = signal<UserDto[]>([]);
  readonly addUserForm = this.formBuilder.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'username', label: 'Username', filterable: true, sortable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'emailConfirm', label: 'Email Confirm' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'phoneNumberConfirm', label: 'Phone Confirm' },
    { key: 'twoFactorEnabled', label: '2-FA' },
    { key: 'roles', label: 'Roles', filterable: true, sortable: true },
    {
      key: 'locked',
      label: 'Locked',
      align: 'right',
      filterable: true,
      sortable: true,
      filterType: 'select',
      filterOptions: [
        {
          label: 'Yes',
          value: 'Yes',
        },
        {
          label: 'No',
          value: 'No',
        },
      ],
    },
    {
      key: 'isDeleted',
      label: 'Deleted',
      align: 'right',
      filterable: true,
      sortable: true,
      filterType: 'select',
      filterOptions: [
        {
          label: 'Yes',
          value: 'Yes',
        },
        {
          label: 'No',
          value: 'No',
        },
      ],
    },
    {
      key: 'accessFailedCount',
      label: 'Access Failed Count',
    },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly rows = computed(() =>
    this.users().map((user) => ({
      id: user.id ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      phoneNumberConfirm: user.phoneNumberConfirm ? 'Yes' : 'No',
      emailConfirm: user.emailConfirm ? 'Yes' : 'No',
      twoFactorEnabled: user.twoFactorEnabled ? 'Yes' : 'No',
      roles: user.roles?.length ? user.roles.join(', ') : undefined,
      locked: user.isLocked ? 'Yes' : 'No',
      isDeleted: user.isDeleted ? 'Yes' : 'No',
      accessFailedCount: user.accessFailedCount ?? 0,
      isLocked: user.isLocked ?? false,
    })),
  );

  ngOnInit(): void {
    this.loadUsers();
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

  onFilterChange(filters: { global: string; columns: Record<string, string> }): void {
    const global = filters.global?.trim();
    const username = filters.columns['username']?.trim();
    const email = filters.columns['email']?.trim();
    const parts: string[] = [];

    if (global) {
      parts.push(
        `username contains '${this.escapeFilterValue(global)}' or email contains '${this.escapeFilterValue(
          global,
        )}'`,
      );
    }

    if (username) {
      parts.push(`username contains '${this.escapeFilterValue(username)}'`);
    }

    if (email) {
      parts.push(`email contains '${this.escapeFilterValue(email)}'`);
    }

    const filter = parts.length ? parts.join(' and ') : undefined;
    this.filter.set(filter);
    this.pageIndex.set(1);
    this.loadUsers();
  }

  onEditUser(userId: string): void {
    void userId;
  }

  onEditRoles(userId: string): void {
    void userId;
  }

  onEditGroups(userId: string): void {
    void userId;
  }

  onDeleteUser(userId: string): void {
    void userId;
  }

  onToggleActionMenu(userId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openMenuId() === userId) {
      this.openMenuId.set(null);
      this.menuPosition.set(null);
      return;
    }

    const button = event.currentTarget as HTMLElement | null;
    if (!button) {
      this.openMenuId.set(userId);
      this.menuPosition.set(null);
      return;
    }

    const rect = button.getBoundingClientRect();
    const menuWidth = 176;
    const top = rect.bottom + 8;
    const left = Math.max(8, rect.right - menuWidth);

    this.openMenuId.set(userId);
    this.menuPosition.set({ top, left });
  }

  onCloseActionMenu(): void {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
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
        filter: this.filter(),
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

  private showToast(title: string, message: string, variant: CxsToastVariant): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    this.toastOpen.set(true);
  }

  private escapeFilterValue(value: string): string {
    return value.replace(/'/g, "''");
  }
}
