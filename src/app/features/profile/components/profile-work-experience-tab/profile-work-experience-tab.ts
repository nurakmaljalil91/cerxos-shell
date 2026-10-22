import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CxsButtonComponent,
  CxsCheckboxComponent,
  CxsDataTableCellDirective,
  CxsDataTableComponent,
  CxsDatepickerComponent,
  CxsDialogComponent,
  CxsInputComponent,
  CxsTextareaComponent,
} from 'cerxos-ui';
import type { CxsDataTableColumn } from 'cerxos-ui';
import { Observable } from 'rxjs';
import {
  BaseResponseOfString,
  BaseResponseOfWorkExperienceDto,
  BaseResponseOfWorkExperienceDtoList,
  CreateWorkExperienceCommand,
  UpdateWorkExperienceCommand,
  WorkExperienceDto,
} from '../../../../shared/models/model';
import { WorkExperiencesService } from '../../services/work-experiences.service';
import { CareerTabBase, endNotBeforeStart, optional } from '../career-tab.base';

@Component({
  selector: 'app-profile-work-experience-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsCheckboxComponent,
    CxsDataTableCellDirective,
    CxsDataTableComponent,
    CxsDatepickerComponent,
    CxsDialogComponent,
    CxsInputComponent,
    CxsTextareaComponent,
  ],
  templateUrl: './profile-work-experience-tab.html',
})
export class ProfileWorkExperienceTab extends CareerTabBase<
  WorkExperienceDto,
  CreateWorkExperienceCommand,
  UpdateWorkExperienceCommand
> {
  private readonly service = inject(WorkExperiencesService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly label = 'Work experience';

  readonly form = this.formBuilder.nonNullable.group(
    {
      company: ['', Validators.required],
      position: ['', Validators.required],
      department: [''],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      description: [''],
    },
    { validators: endNotBeforeStart('startDate', 'endDate') },
  );

  readonly columns: CxsDataTableColumn[] = [
    { key: 'company', label: 'Company' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'startDate', label: 'From' },
    { key: 'endDate', label: 'To', formatter: (value) => (value ? String(value) : 'Present') },
    { key: 'actions', label: '', width: '140px' },
  ];

  constructor() {
    super();
    // A current position has no end date: clear and lock the end-date field while the box is checked.
    this.form.controls.isCurrent.valueChanges.pipe(takeUntilDestroyed()).subscribe((isCurrent) => {
      const endDate = this.form.controls.endDate;
      if (isCurrent) {
        endDate.setValue('');
        endDate.disable();
      } else {
        endDate.enable();
      }
    });
  }

  displayName(item: WorkExperienceDto): string {
    return item.position && item.company ? `${item.position} at ${item.company}` : (item.company ?? 'Work experience');
  }

  protected list(): Observable<BaseResponseOfWorkExperienceDtoList> {
    return this.service.listMine();
  }

  protected create(command: CreateWorkExperienceCommand): Observable<BaseResponseOfWorkExperienceDto> {
    return this.service.create(command);
  }

  protected update(id: string, command: UpdateWorkExperienceCommand): Observable<BaseResponseOfWorkExperienceDto> {
    return this.service.update(id, command);
  }

  protected remove(id: string): Observable<BaseResponseOfString> {
    return this.service.delete(id);
  }

  protected resetForm(): void {
    this.form.reset();
  }

  protected patchForm(item: WorkExperienceDto): void {
    this.form.setValue({
      company: item.company ?? '',
      position: item.position ?? '',
      department: item.department ?? '',
      location: item.location ?? '',
      startDate: item.startDate ?? '',
      endDate: item.endDate ?? '',
      isCurrent: !item.endDate,
      description: item.description ?? '',
    });
  }

  protected toCreateCommand(): CreateWorkExperienceCommand {
    const raw = this.form.getRawValue();
    return {
      company: raw.company.trim(),
      position: raw.position.trim(),
      department: optional(raw.department),
      location: optional(raw.location),
      startDate: raw.startDate,
      endDate: raw.isCurrent ? undefined : optional(raw.endDate),
      description: optional(raw.description),
    };
  }

  protected toUpdateCommand(id: string): UpdateWorkExperienceCommand {
    const raw = this.form.getRawValue();
    return {
      id,
      company: raw.company.trim(),
      position: raw.position.trim(),
      department: raw.department.trim(),
      location: raw.location.trim(),
      startDate: raw.startDate,
      endDate: raw.isCurrent ? '' : raw.endDate,
      description: raw.description.trim(),
    };
  }
}
