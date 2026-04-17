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
  CxsDataTableComponent,
  CxsDataTableSort,
  CxsDataTableSortDirection,
  CxsDialogComponent,
  CxsInputComponent,
  CxsToastComponent,
  CxsToastVariant,
  CxsToggleComponent,
} from 'cerxos-ui';
import { CreateUserCommand, UpdateUserCommand, UserDto } from '../../../../shared/models/model';
import { UsersService } from '../../services/users.service';
import { UserGroupsDialog } from './user-groups-dialog';
import { UserRolesDialog } from './user-roles-dialog';
import { buildUsersFilter, UsersTableFilters } from './users-page.filters';
import { toUserTableRow, USER_COLUMNS } from './users-page.table';

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
    CxsToggleComponent,
    CxsToastComponent,
    CxsCardComponent,
    UserGroupsDialog,
    UserRolesDialog,
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
  readonly editUserOpen = signal(false);
  readonly editUserLoading = signal(false);
  readonly editUserError = signal<string | null>(null);
  readonly editingUserId = signal<string | null>(null);
  readonly groupDialogUser = signal<UserDto | null>(null);
  readonly rolesDialogOpen = signal(false);
  readonly rolesDialogUser = signal<UserDto | null>(null);
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
  readonly editUserForm = this.formBuilder.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    isLocked: [false],
  });

  readonly columns = USER_COLUMNS;
  readonly rows = computed(() => this.users().map(toUserTableRow));
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
  onFilterChange(filters: UsersTableFilters): void {
    this.filter.set(buildUsersFilter(filters));
    this.pageIndex.set(1);
    this.loadUsers();
  }
  onEditUser(userId: string, row?: Partial<UserDto>): void {
    const user = this.users().find((item) => item.id === userId) ?? row;
    if (!user) {
      this.showToast('User not found', 'Refresh the users list and try again.', 'danger');
      return;
    }
    this.editingUserId.set(userId);
    this.editUserError.set(null);
    this.editUserForm.reset({
      username: user.username ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      isLocked: user.isLocked ?? false,
    });
    this.editUserOpen.set(true);
  }
  onEditRoles(userId: string, row?: Partial<UserDto>): void {
    const user = this.users().find((item) => item.id === userId) ?? row;
    if (!user?.id) {
      this.showToast('User not found', 'Refresh the users list and try again.', 'danger');
      return;
    }
    this.rolesDialogUser.set(user as UserDto);
    this.rolesDialogOpen.set(true);
  }
  onAssignmentSaved(title: string, message: string): void {
    this.rolesDialogOpen.set(false);
    this.rolesDialogUser.set(null);
    this.groupDialogUser.set(null);
    this.showToast(title, message, 'info');
    this.loadUsers();
  }
  onEditGroups(userId: string, row?: Partial<UserDto>): void {
    const user = this.users().find((item) => item.id === userId) ?? row;
    if (!user?.id) {
      this.showToast('User not found', 'Refresh the users list and try again.', 'danger');
      return;
    }
    this.groupDialogUser.set(user as UserDto);
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

  onCloseEditUser(): void {
    this.editUserOpen.set(false);
    this.editUserLoading.set(false);
    this.editUserError.set(null);
    this.editingUserId.set(null);
    this.editUserForm.reset({
      username: '',
      email: '',
      phoneNumber: '',
      isLocked: false,
    });
  }

  onEditUserLockedChange(locked: boolean): void {
    this.editUserForm.patchValue({ isLocked: locked });
    this.editUserForm.markAsDirty();
  }

  onSubmitEditUser(): void {
    if (this.editUserLoading()) {
      return;
    }

    const userId = this.editingUserId();
    if (!userId) {
      this.editUserError.set('Select a user to edit.');
      return;
    }

    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    const formValue = this.editUserForm.getRawValue();
    const command: UpdateUserCommand = {
      id: userId,
      username: formValue.username ?? '',
      email: formValue.email ?? '',
      phoneNumber: formValue.phoneNumber ?? '',
      isLocked: formValue.isLocked ?? false,
    };

    this.editUserLoading.set(true);
    this.editUserError.set(null);

    this.usersService
      .updateUser(userId, command)
      .pipe(
        finalize(() => this.editUserLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to update user.';
            this.editUserError.set(message);
            this.showToast('User not updated', message, 'danger');
            return;
          }

          this.editUserOpen.set(false);
          this.editingUserId.set(null);
          this.showToast('User updated', response?.message ?? 'User updated successfully.', 'info');
          this.loadUsers();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to update user.';
          this.editUserError.set(message);
          this.showToast('User not updated', message, 'danger');
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
}
