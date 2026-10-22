import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectDto } from '../../../../shared/models/model';
import { ProjectsService } from '../../services/projects.service';
import { ProfileProjectsTab } from './profile-projects-tab';

describe('ProfileProjectsTab', () => {
  let component: ProfileProjectsTab;
  let fixture: ComponentFixture<ProfileProjectsTab>;
  let serviceSpy: jasmine.SpyObj<ProjectsService>;

  const cerxos: ProjectDto = {
    id: 'project-1',
    title: 'Cerxos',
    description: 'Line one\nLine two',
    url: 'https://cerxos.example',
    techStack: 'Angular',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ProjectsService', ['listMine', 'create', 'update', 'delete']);
    serviceSpy.listMine.and.returnValue(of({ success: true, data: [cerxos] }));

    await TestBed.configureTestingModule({
      imports: [ProfileProjectsTab],
      providers: [provideZonelessChangeDetection(), { provide: ProjectsService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileProjectsTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates a project and omits blank optional fields', () => {
    serviceSpy.create.and.returnValue(of({ success: true, data: { id: 'project-2', title: 'Notes' } }));

    component.openAdd();
    component.form.patchValue({ title: ' Notes ', description: 'Line one\nLine two', startDate: '2025-02-01' });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalledWith({
      title: 'Notes',
      description: 'Line one\nLine two',
      url: undefined,
      techStack: undefined,
      startDate: '2025-02-01',
      endDate: undefined,
    });
  });

  it('keeps multi-line descriptions when editing', () => {
    component.openEdit('project-1');

    expect(component.form.controls.description.value).toBe('Line one\nLine two');
  });

  it('sends an empty end date to clear it on edit', () => {
    serviceSpy.update.and.returnValue(of({ success: true, data: { ...cerxos, endDate: undefined } }));

    component.openEdit('project-1');
    component.form.controls.endDate.setValue('');
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith(
      'project-1',
      jasmine.objectContaining({ id: 'project-1', startDate: '2024-01-01', endDate: '' }),
    );
    expect(component.items()[0].endDate).toBeUndefined();
  });

  it('blocks save when the end date is before the start date', () => {
    component.openAdd();
    component.form.patchValue({ title: 'Notes', startDate: '2025-02-10', endDate: '2025-02-01' });
    component.submit();

    expect(component.form.hasError('endBeforeStart')).toBeTrue();
    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('deletes a project after confirmation', () => {
    serviceSpy.delete.and.returnValue(of({ success: true, data: 'project-1' }));

    component.requestDelete('project-1');
    component.confirmDelete();

    expect(serviceSpy.delete).toHaveBeenCalledWith('project-1');
    expect(component.items()).toEqual([]);
  });

  it('limits the end-date picker to the start date', async () => {
    component.openEdit('project-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const pickers = Array.from(
      (fixture.nativeElement as HTMLElement).ownerDocument.querySelectorAll<HTMLInputElement>('cxs-datepicker input'),
    );
    expect(pickers.some((input) => input.min === '2024-01-01')).toBeTrue();
  });
});
