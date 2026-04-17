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
import { AssignUserToGroupCommand, GroupDto, UserDto } from '../../../../shared/models/model';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'app-user-groups-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsDialogComponent,
    CxsSelectComponent,
  ],
  templateUrl: './user-groups-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserGroupsDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly groupsService = inject(GroupsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly user = input<UserDto | null>(null);
  readonly closed = output<void>();
  readonly groupAssigned = output<string>();

  readonly loadingGroups = signal(false);
  readonly assigningGroup = signal(false);
  readonly error = signal<string | null>(null);
  private readonly groups = signal<GroupDto[]>([]);

  readonly groupForm = this.formBuilder.group({
    groupId: ['', [Validators.required]],
  });

  readonly currentGroups = computed(() => this.user()?.groups ?? []);
  readonly availableGroups = computed(() => {
    const assigned = new Set(this.currentGroups().map((group) => group.toLowerCase()));
    return this.groups().filter((group) => {
      const name = group.name?.toLowerCase();
      return !!group.id && !!name && !assigned.has(name);
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
    if (this.assigningGroup()) {
      return;
    }

    const user = this.user();
    if (!user?.id) {
      this.error.set('Select a user before assigning a group.');
      return;
    }

    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    const groupId = this.groupForm.controls.groupId.value ?? '';
    const command: AssignUserToGroupCommand = { groupId, userId: user.id };

    this.assigningGroup.set(true);
    this.error.set(null);

    this.groupsService
      .assignUserToGroup(groupId, command)
      .pipe(
        finalize(() => this.assigningGroup.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            this.error.set(response?.message ?? 'Failed to assign group.');
            return;
          }

          this.groupAssigned.emit(response?.message ?? 'Group assigned to user.');
          this.reset();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to assign group.');
        },
      });
  }

  private prepare(): void {
    this.error.set(null);
    this.groupForm.reset({ groupId: '' });
    this.loadGroups();
  }

  private reset(): void {
    this.error.set(null);
    this.assigningGroup.set(false);
    this.groupForm.reset({ groupId: '' });
  }

  private loadGroups(): void {
    this.loadingGroups.set(true);
    this.groupsService
      .getGroups({ page: 1, total: 100, sortBy: 'name', descending: false })
      .pipe(
        finalize(() => this.loadingGroups.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.data?.items) {
            this.groups.set([]);
            this.error.set(response?.message ?? 'Failed to load groups.');
            return;
          }

          this.groups.set(response.data.items);
        },
        error: (err) => {
          this.groups.set([]);
          this.error.set(err?.error?.message ?? 'Failed to load groups.');
        },
      });
  }
}
