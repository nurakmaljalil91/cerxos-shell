import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CxsButtonComponent, CxsDialogComponent, CxsSelectComponent } from 'cerxos-ui';
import { AssignRoleToUserCommand, RoleDto, UserDto } from '../../../../shared/models/model';
import { RolesService } from '../../services/roles.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-roles-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CxsButtonComponent, CxsDialogComponent, CxsSelectComponent],
  templateUrl: './user-roles-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRolesDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly user = input<UserDto | null>(null);

  readonly closed = output<void>();
  readonly roleAssigned = output<string>();
  readonly roleUnassigned = output<string>();

  readonly loadingRoles = signal(false);
  readonly assigningRole = signal(false);
  readonly unassigningRoleId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  private readonly roles = signal<RoleDto[]>([]);

  readonly roleForm = this.formBuilder.group({
    roleId: ['', [Validators.required]],
  });
  readonly selectedRoleId = signal('');

  readonly currentRoles = computed(() => this.user()?.roles ?? []);
  readonly assignedRoles = computed(() => {
    const assigned = new Set(this.currentRoles().map((role) => role.toLowerCase()));
    return this.roles().filter((role) => {
      const name = role.name?.toLowerCase();
      return !!role.id && !!name && assigned.has(name);
    });
  });
  readonly availableRoles = computed(() => {
    const assigned = new Set(this.currentRoles().map((role) => role.toLowerCase()));
    return this.roles().filter((role) => {
      const name = role.name?.toLowerCase();
      return !!role.id && !!name && !assigned.has(name);
    });
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => this.prepare());
      }
    });
  }

  onClose(): void {
    this.closed.emit();
    this.reset();
  }

  onSubmit(): void {
    if (this.assigningRole()) {
      return;
    }

    const user = this.user();
    if (!user?.id) {
      this.error.set('Select a user before assigning a role.');
      return;
    }

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      this.error.set('Select a role to assign.');
      return;
    }

    const roleId = this.roleForm.controls.roleId.value ?? '';
    const command: AssignRoleToUserCommand = {
      userId: user.id,
      roleId,
    };

    this.assigningRole.set(true);
    this.error.set(null);

    this.usersService
      .assignRoleToUser(user.id, command)
      .pipe(
        finalize(() => this.assigningRole.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.error.set(response?.message ?? 'Failed to assign role.');
            return;
          }

          this.roleAssigned.emit(response?.message ?? 'Role assigned to user.');
          this.reset();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to assign role.');
        },
      });
  }

  onRoleSelected(roleId: string): void {
    this.roleForm.controls.roleId.setValue(roleId);
    this.roleForm.controls.roleId.markAsTouched();
    this.selectedRoleId.set(roleId);
    this.error.set(null);
  }

  onUnassignRole(role: RoleDto): void {
    if (this.unassigningRoleId()) {
      return;
    }

    const user = this.user();
    if (!user?.id || !role.id) {
      this.error.set('Select a user and role before unassigning.');
      return;
    }

    this.unassigningRoleId.set(role.id);
    this.error.set(null);

    this.usersService
      .unassignRoleFromUser(user.id, role.id)
      .pipe(
        finalize(() => this.unassigningRoleId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.error.set(response?.message ?? 'Failed to unassign role.');
            return;
          }

          this.roleUnassigned.emit(response?.message ?? 'Role unassigned from user.');
          this.reset();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to unassign role.');
        },
      });
  }

  private prepare(): void {
    this.error.set(null);
    this.roleForm.reset({ roleId: '' });
    this.loadRoles();
  }

  private reset(): void {
    this.error.set(null);
    this.assigningRole.set(false);
    this.unassigningRoleId.set(null);
    this.selectedRoleId.set('');
    this.roleForm.reset({ roleId: '' });
  }

  private loadRoles(): void {
    this.loadingRoles.set(true);
    this.rolesService
      .getRoles({
        page: 1,
        total: 100,
        sortBy: 'name',
        descending: false,
      })
      .pipe(
        finalize(() => this.loadingRoles.set(false)),
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
}
