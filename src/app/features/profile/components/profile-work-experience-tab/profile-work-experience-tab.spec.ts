import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WorkExperienceDto } from '../../../../shared/models/model';
import { WorkExperiencesService } from '../../services/work-experiences.service';
import { ProfileWorkExperienceTab } from './profile-work-experience-tab';

describe('ProfileWorkExperienceTab', () => {
  let component: ProfileWorkExperienceTab;
  let fixture: ComponentFixture<ProfileWorkExperienceTab>;
  let serviceSpy: jasmine.SpyObj<WorkExperiencesService>;

  const pastJob: WorkExperienceDto = {
    id: 'work-1',
    company: 'Acme',
    position: 'Developer',
    startDate: '2019-01-01',
    endDate: '2022-12-31',
  };
  const currentJob: WorkExperienceDto = {
    id: 'work-2',
    company: 'Cerxos',
    position: 'Engineer',
    department: 'Platform',
    startDate: '2023-01-01',
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('WorkExperiencesService', ['listMine', 'create', 'update', 'delete']);
    serviceSpy.listMine.and.returnValue(of({ success: true, data: [pastJob, currentJob] }));

    await TestBed.configureTestingModule({
      imports: [ProfileWorkExperienceTab],
      providers: [provideZonelessChangeDetection(), { provide: WorkExperiencesService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileWorkExperienceTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('checking "currently working here" clears and disables the end date', () => {
    component.openAdd();
    component.form.patchValue({ endDate: '2024-01-31' });

    component.form.controls.isCurrent.setValue(true);

    expect(component.form.controls.endDate.value).toBe('');
    expect(component.form.controls.endDate.disabled).toBeTrue();
  });

  it('creates a current job without an end date and with its department', () => {
    serviceSpy.create.and.returnValue(of({ success: true, data: { ...currentJob, id: 'work-3' } }));

    component.openAdd();
    component.form.patchValue({
      company: 'Cerxos',
      position: 'Engineer',
      department: 'Platform',
      startDate: '2023-01-01',
      endDate: '2023-06-30',
    });
    component.form.controls.isCurrent.setValue(true);
    component.submit();

    const command = serviceSpy.create.calls.mostRecent().args[0];
    expect(command.endDate).toBeUndefined();
    expect(command.department).toBe('Platform');
    expect(command.startDate).toBe('2023-01-01');
  });

  it('opens a job without an end date with the box checked and end date disabled', () => {
    component.openEdit('work-2');

    expect(component.form.controls.isCurrent.value).toBeTrue();
    expect(component.form.controls.endDate.disabled).toBeTrue();
  });

  it('opens a finished job with the box unchecked and end date enabled', () => {
    component.openEdit('work-2');
    component.openEdit('work-1');

    expect(component.form.controls.isCurrent.value).toBeFalse();
    expect(component.form.controls.endDate.enabled).toBeTrue();
    expect(component.form.controls.endDate.value).toBe('2022-12-31');
  });

  it('sends an empty end date when an existing job becomes current', () => {
    serviceSpy.update.and.returnValue(of({ success: true, data: { ...pastJob, endDate: undefined } }));

    component.openEdit('work-1');
    component.form.controls.isCurrent.setValue(true);
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith('work-1', jasmine.objectContaining({ id: 'work-1', endDate: '' }));
  });

  it('re-enables the end date when unchecked and saves the picked date', () => {
    serviceSpy.update.and.returnValue(of({ success: true, data: { ...currentJob, endDate: '2025-03-31' } }));

    component.openEdit('work-2');
    component.form.controls.isCurrent.setValue(false);
    expect(component.form.controls.endDate.enabled).toBeTrue();

    component.form.controls.endDate.setValue('2025-03-31');
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith('work-2', jasmine.objectContaining({ endDate: '2025-03-31' }));
    expect(component.items()[1].endDate).toBe('2025-03-31');
  });

  it('shows Present for a job without an end date', () => {
    const endColumn = component.columns.find((column) => column.key === 'endDate')!;

    expect(endColumn.formatter!(undefined, {})).toBe('Present');
    expect(endColumn.formatter!('2022-12-31', {})).toBe('2022-12-31');
  });

  it('renders the checkbox and disables the end-date input in the dialog', async () => {
    component.openEdit('work-2');
    fixture.detectChanges();
    await fixture.whenStable();

    const document = (fixture.nativeElement as HTMLElement).ownerDocument;
    const checkbox = document.querySelector<HTMLInputElement>('cxs-checkbox input[type="checkbox"]');
    const dateInputs = Array.from(document.querySelectorAll<HTMLInputElement>('cxs-datepicker input'));

    expect(checkbox?.checked).toBeTrue();
    expect(dateInputs.some((input) => input.disabled)).toBeTrue();
  });
});
