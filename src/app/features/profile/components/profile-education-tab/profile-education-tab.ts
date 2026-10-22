import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CxsButtonComponent,
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
  BaseResponseOfEducationDto,
  BaseResponseOfEducationDtoList,
  BaseResponseOfString,
  CreateEducationCommand,
  EducationDto,
  UpdateEducationCommand,
} from '../../../../shared/models/model';
import { EducationsService } from '../../services/educations.service';
import { CareerTabBase, endNotBeforeStart, optional } from '../career-tab.base';

@Component({
  selector: 'app-profile-education-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsDataTableCellDirective,
    CxsDataTableComponent,
    CxsDatepickerComponent,
    CxsDialogComponent,
    CxsInputComponent,
    CxsTextareaComponent,
  ],
  templateUrl: './profile-education-tab.html',
})
export class ProfileEducationTab extends CareerTabBase<EducationDto, CreateEducationCommand, UpdateEducationCommand> {
  private readonly service = inject(EducationsService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly label = 'Education';

  readonly form = this.formBuilder.nonNullable.group(
    {
      institution: ['', Validators.required],
      degree: [''],
      fieldOfStudy: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      grade: [''],
      description: [''],
    },
    { validators: endNotBeforeStart('startDate', 'endDate') },
  );

  readonly columns: CxsDataTableColumn[] = [
    { key: 'institution', label: 'Institution' },
    { key: 'degree', label: 'Degree' },
    { key: 'fieldOfStudy', label: 'Field' },
    { key: 'startDate', label: 'From' },
    { key: 'endDate', label: 'To' },
    { key: 'grade', label: 'Grade' },
    { key: 'actions', label: '', width: '140px' },
  ];

  displayName(item: EducationDto): string {
    return item.institution ?? 'Education';
  }

  protected list(): Observable<BaseResponseOfEducationDtoList> {
    return this.service.listMine();
  }

  protected create(command: CreateEducationCommand): Observable<BaseResponseOfEducationDto> {
    return this.service.create(command);
  }

  protected update(id: string, command: UpdateEducationCommand): Observable<BaseResponseOfEducationDto> {
    return this.service.update(id, command);
  }

  protected remove(id: string): Observable<BaseResponseOfString> {
    return this.service.delete(id);
  }

  protected resetForm(): void {
    this.form.reset();
  }

  protected patchForm(item: EducationDto): void {
    this.form.setValue({
      institution: item.institution ?? '',
      degree: item.degree ?? '',
      fieldOfStudy: item.fieldOfStudy ?? '',
      startDate: item.startDate ?? '',
      endDate: item.endDate ?? '',
      grade: item.grade ?? '',
      description: item.description ?? '',
    });
  }

  protected toCreateCommand(): CreateEducationCommand {
    const raw = this.form.getRawValue();
    return {
      institution: raw.institution.trim(),
      degree: optional(raw.degree),
      fieldOfStudy: optional(raw.fieldOfStudy),
      startDate: raw.startDate,
      endDate: optional(raw.endDate),
      grade: optional(raw.grade),
      description: optional(raw.description),
    };
  }

  protected toUpdateCommand(id: string): UpdateEducationCommand {
    const raw = this.form.getRawValue();
    return {
      id,
      institution: raw.institution.trim(),
      degree: raw.degree.trim(),
      fieldOfStudy: raw.fieldOfStudy.trim(),
      startDate: raw.startDate,
      endDate: raw.endDate,
      grade: raw.grade.trim(),
      description: raw.description.trim(),
    };
  }
}
