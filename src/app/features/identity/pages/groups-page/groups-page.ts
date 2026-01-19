import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
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
import { CreateGroupCommand, GroupDto } from '../../../../shared/models/model';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'app-groups-page',
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
    CxsCardComponent
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
  readonly toastOpen = signal(false);
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');
  readonly toastVariant = signal<CxsToastVariant>('info');

  private readonly groups = signal<GroupDto[]>([]);

  readonly addGroupForm = this.formBuilder.group({
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
    void groupId;
  }

  onDeleteGroup(groupId: string): void {
    void groupId;
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
