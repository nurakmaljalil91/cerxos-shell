import { CommonModule } from '@angular/common';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsDialogComponent,
    CxsSelectComponent,
  ],
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

  readonly loadingRoles = signal(false);
  readonly assigningRole = signal(false);
  readonly error = signal<string | null>(null);
  private readonly roles = signal<RoleDto[]>([]);

  readonly roleForm = this.formBuilder.group({
    roleId: ['', [Validators.required]],
  });

  readonly currentRoles = computed(() => this.user()?.roles ?? []);
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

  private prepare(): void {
    this.error.set(null);
    this.roleForm.reset({ roleId: '' });
    this.loadRoles();
  }

  private reset(): void {
    this.error.set(null);
    this.assigningRole.set(false);
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
