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
  CxsCardComponent,
  CxsDataTableCellDirective,
  CxsDataTableColumn,
  CxsDataTableComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsToastComponent,
  CxsToastVariant,
} from 'cerxos-ui';
import { CreateGroupCommand, GroupDto, UpdateGroupCommand } from '../../../../shared/models/model';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'app-groups-page',
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
    CxsCardComponent,
  ],
  templateUrl: './groups-page.html',
  styleUrl: './groups-page.css',
})
export class GroupsPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly groupsService = inject(GroupsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly addGroupOpen = signal(false);
  readonly addGroupLoading = signal(false);
  readonly addGroupError = signal<string | null>(null);
  readonly editGroupOpen = signal(false);
  readonly editGroupLoading = signal(false);
  readonly editGroupError = signal<string | null>(null);
  readonly editingGroupId = signal<string | null>(null);
  readonly deleteGroupOpen = signal(false);
  readonly deleteGroupLoading = signal(false);
  readonly deleteGroupError = signal<string | null>(null);
  readonly deletingGroup = signal<GroupDto | null>(null);
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  private readonly groups = signal<GroupDto[]>([]);

  readonly addGroupForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });
  readonly editGroupForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Group', sortable: true, filterable: true },
    { key: 'description', label: 'Description' },
    { key: 'roles', label: 'Roles' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  readonly rows = computed(() =>
    this.groups().map((group) => ({
      id: group.id ?? '',
      name: group.name ?? '',
      description: group.description ?? '',
      roles: group.roles?.length ? group.roles.join(', ') : undefined,
    })),
  );

  ngOnInit(): void {
    this.loadGroups();
  }

  onEditGroup(groupId: string): void {
    const group = this.groups().find((item) => item.id === groupId);

    if (!group) {
      this.showToast('Group not found', 'Refresh the groups list and try again.', 'danger');
      return;
    }

    this.editingGroupId.set(groupId);
    this.editGroupError.set(null);
    this.editGroupForm.reset({
      name: group.name ?? '',
      description: group.description ?? '',
    });
    this.editGroupOpen.set(true);
  }

  onDeleteGroup(groupId: string): void {
    const group = this.groups().find((item) => item.id === groupId);

    if (!group) {
      this.showToast('Group not found', 'Refresh the groups list and try again.', 'danger');
      return;
    }

    this.deleteGroupError.set(null);
    this.deletingGroup.set(group);
    this.deleteGroupOpen.set(true);
  }

  onOpenAddGroup(): void {
    this.addGroupError.set(null);
    this.addGroupOpen.set(true);
  }

  onCloseAddGroup(): void {
    this.addGroupOpen.set(false);
    this.addGroupLoading.set(false);
    this.addGroupError.set(null);
    this.addGroupForm.reset({
      name: '',
      description: '',
    });
  }

  onSubmitAddGroup(): void {
    if (this.addGroupLoading()) {
      return;
    }

    if (this.addGroupForm.invalid) {
      this.addGroupForm.markAllAsTouched();
      return;
    }

    const formValue = this.addGroupForm.getRawValue();
    const command: CreateGroupCommand = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
    };

    this.addGroupLoading.set(true);
    this.addGroupError.set(null);

    this.groupsService
      .createGroup(command)
      .pipe(
        finalize(() => this.addGroupLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to create group.';
            this.addGroupError.set(message);
            this.showToast('Group not created', message, 'danger');
            return;
          }

          this.addGroupForm.reset({
            name: '',
            description: '',
          });
          this.addGroupOpen.set(false);
          this.showToast('Group created', response?.message ?? 'Group added successfully.', 'info');
          this.loadGroups();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to create group.';
          this.addGroupError.set(message);
          this.showToast('Group not created', message, 'danger');
        },
      });
  }

  onCloseEditGroup(): void {
    this.editGroupOpen.set(false);
    this.editGroupLoading.set(false);
    this.editGroupError.set(null);
    this.editingGroupId.set(null);
    this.editGroupForm.reset({
      name: '',
      description: '',
    });
  }

  onSubmitEditGroup(): void {
    if (this.editGroupLoading()) {
      return;
    }

    const groupId = this.editingGroupId();
    if (!groupId) {
      this.editGroupError.set('Select a group to edit.');
      return;
    }

    if (this.editGroupForm.invalid) {
      this.editGroupForm.markAllAsTouched();
      return;
    }

    const formValue = this.editGroupForm.getRawValue();
    const command: UpdateGroupCommand = {
      id: groupId,
      name: formValue.name ?? '',
      description: formValue.description ?? '',
    };

    this.editGroupLoading.set(true);
    this.editGroupError.set(null);

    this.groupsService
      .updateGroup(groupId, command)
      .pipe(
        finalize(() => this.editGroupLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to update group.';
            this.editGroupError.set(message);
            this.showToast('Group not updated', message, 'danger');
            return;
          }

          this.editGroupOpen.set(false);
          this.editingGroupId.set(null);
          this.showToast(
            'Group updated',
            response?.message ?? 'Group updated successfully.',
            'info',
          );
          this.loadGroups();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to update group.';
          this.editGroupError.set(message);
          this.showToast('Group not updated', message, 'danger');
        },
      });
  }

  onCloseDeleteGroup(): void {
    this.deleteGroupOpen.set(false);
    this.deleteGroupLoading.set(false);
    this.deleteGroupError.set(null);
    this.deletingGroup.set(null);
  }

  onConfirmDeleteGroup(): void {
    if (this.deleteGroupLoading()) {
      return;
    }

    const group = this.deletingGroup();
    if (!group?.id) {
      this.deleteGroupError.set('Select a group to delete.');
      return;
    }

    this.deleteGroupLoading.set(true);
    this.deleteGroupError.set(null);

    this.groupsService
      .deleteGroup(group.id)
      .pipe(
        finalize(() => this.deleteGroupLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success) {
            const message = response?.message ?? 'Failed to delete group.';
            this.deleteGroupError.set(message);
            this.showToast('Group not deleted', message, 'danger');
            return;
          }

          this.deleteGroupOpen.set(false);
          this.deletingGroup.set(null);
          this.showToast(
            'Group deleted',
            response?.message ?? 'Group deleted successfully.',
            'info',
          );
          this.loadGroups();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to delete group.';
          this.deleteGroupError.set(message);
          this.showToast('Group not deleted', message, 'danger');
        },
      });
  }

  onToastOpenChange(open: boolean): void {
    this.toastOpen.set(open);
  }

  private loadGroups(): void {
    this.loading.set(true);
    this.error.set(null);

    this.groupsService
      .getGroups({
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

  private showToast(title: string, message: string, variant: CxsToastVariant): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    this.toastOpen.set(true);
  }
}
