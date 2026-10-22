import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CxsButtonComponent,
  CxsDataTableCellDirective,
  CxsDataTableComponent,
  CxsDialogComponent,
  CxsInputComponent,
} from 'cerxos-ui';
import type { CxsDataTableColumn } from 'cerxos-ui';
import { Observable } from 'rxjs';
import {
  BaseResponseOfSkillDto,
  BaseResponseOfSkillDtoList,
  BaseResponseOfString,
  CreateSkillCommand,
  SkillDto,
  UpdateSkillCommand,
} from '../../../../shared/models/model';
import { SkillsService } from '../../services/skills.service';
import { CareerTabBase, optional } from '../career-tab.base';

const WHOLE_NUMBER = /^\d+$/;

@Component({
  selector: 'app-profile-skills-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CxsButtonComponent,
    CxsDataTableCellDirective,
    CxsDataTableComponent,
    CxsDialogComponent,
    CxsInputComponent,
  ],
  templateUrl: './profile-skills-tab.html',
})
export class ProfileSkillsTab extends CareerTabBase<SkillDto, CreateSkillCommand, UpdateSkillCommand> {
  private readonly service = inject(SkillsService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly label = 'Skill';

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    proficiency: [''],
    yearsOfExperience: ['', Validators.pattern(WHOLE_NUMBER)],
  });

  readonly columns: CxsDataTableColumn[] = [
    { key: 'name', label: 'Skill' },
    { key: 'proficiency', label: 'Proficiency' },
    { key: 'yearsOfExperience', label: 'Years' },
    { key: 'actions', label: '', width: '140px' },
  ];

  displayName(item: SkillDto): string {
    return item.name ?? 'Skill';
  }

  protected list(): Observable<BaseResponseOfSkillDtoList> {
    return this.service.listMine();
  }

  protected create(command: CreateSkillCommand): Observable<BaseResponseOfSkillDto> {
    return this.service.create(command);
  }

  protected update(id: string, command: UpdateSkillCommand): Observable<BaseResponseOfSkillDto> {
    return this.service.update(id, command);
  }

  protected remove(id: string): Observable<BaseResponseOfString> {
    return this.service.delete(id);
  }

  protected resetForm(): void {
    this.form.reset();
  }

  protected patchForm(item: SkillDto): void {
    this.form.setValue({
      name: item.name ?? '',
      proficiency: item.proficiency ?? '',
      yearsOfExperience: item.yearsOfExperience?.toString() ?? '',
    });
  }

  protected toCreateCommand(): CreateSkillCommand {
    const raw = this.form.getRawValue();
    return {
      name: raw.name.trim(),
      proficiency: optional(raw.proficiency),
      yearsOfExperience: this.toYears(raw.yearsOfExperience),
    };
  }

  protected toUpdateCommand(id: string): UpdateSkillCommand {
    const raw = this.form.getRawValue();
    return {
      id,
      name: raw.name.trim(),
      proficiency: raw.proficiency.trim(),
      yearsOfExperience: this.toYears(raw.yearsOfExperience),
    };
  }

  private toYears(value: string): number | undefined {
    const trimmed = value.trim();
    return trimmed ? Number(trimmed) : undefined;
  }
}
