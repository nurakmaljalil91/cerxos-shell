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
  BaseResponseOfProjectDto,
  BaseResponseOfProjectDtoList,
  BaseResponseOfString,
  CreateProjectCommand,
  ProjectDto,
  UpdateProjectCommand,
} from '../../../../shared/models/model';
import { ProjectsService } from '../../services/projects.service';
import { CareerTabBase, endNotBeforeStart, optional } from '../career-tab.base';

@Component({
  selector: 'app-profile-projects-tab',
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
  templateUrl: './profile-projects-tab.html',
})
export class ProfileProjectsTab extends CareerTabBase<ProjectDto, CreateProjectCommand, UpdateProjectCommand> {
  private readonly service = inject(ProjectsService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly label = 'Project';

  readonly form = this.formBuilder.nonNullable.group(
    {
      title: ['', Validators.required],
      description: [''],
      url: [''],
      techStack: [''],
      startDate: [''],
      endDate: [''],
    },
    { validators: endNotBeforeStart('startDate', 'endDate') },
  );

  readonly columns: CxsDataTableColumn[] = [
    { key: 'title', label: 'Project' },
    { key: 'techStack', label: 'Tech stack' },
    { key: 'url', label: 'URL' },
    { key: 'startDate', label: 'From' },
    { key: 'endDate', label: 'To' },
    { key: 'actions', label: '', width: '140px' },
  ];

  displayName(item: ProjectDto): string {
    return item.title ?? 'Project';
  }

  protected list(): Observable<BaseResponseOfProjectDtoList> {
    return this.service.listMine();
  }

  protected create(command: CreateProjectCommand): Observable<BaseResponseOfProjectDto> {
    return this.service.create(command);
  }

  protected update(id: string, command: UpdateProjectCommand): Observable<BaseResponseOfProjectDto> {
    return this.service.update(id, command);
  }

  protected remove(id: string): Observable<BaseResponseOfString> {
    return this.service.delete(id);
  }

  protected resetForm(): void {
    this.form.reset();
  }

  protected patchForm(item: ProjectDto): void {
    this.form.setValue({
      title: item.title ?? '',
      description: item.description ?? '',
      url: item.url ?? '',
      techStack: item.techStack ?? '',
      startDate: item.startDate ?? '',
      endDate: item.endDate ?? '',
    });
  }

  protected toCreateCommand(): CreateProjectCommand {
    const raw = this.form.getRawValue();
    return {
      title: raw.title.trim(),
      description: optional(raw.description),
      url: optional(raw.url),
      techStack: optional(raw.techStack),
      startDate: optional(raw.startDate),
      endDate: optional(raw.endDate),
    };
  }

  protected toUpdateCommand(id: string): UpdateProjectCommand {
    const raw = this.form.getRawValue();
    return {
      id,
      title: raw.title.trim(),
      description: raw.description.trim(),
      url: raw.url.trim(),
      techStack: raw.techStack.trim(),
      startDate: raw.startDate,
      endDate: raw.endDate,
    };
  }
}
