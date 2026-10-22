import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SkillDto } from '../../../../shared/models/model';
import { SkillsService } from '../../services/skills.service';
import { CareerTabNotice } from '../career-tab.base';
import { ProfileSkillsTab } from './profile-skills-tab';

describe('ProfileSkillsTab', () => {
  let component: ProfileSkillsTab;
  let fixture: ComponentFixture<ProfileSkillsTab>;
  let serviceSpy: jasmine.SpyObj<SkillsService>;
  let notices: CareerTabNotice[];

  const angular: SkillDto = { id: 'skill-1', name: 'Angular', proficiency: 'Advanced', yearsOfExperience: 4 };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('SkillsService', ['listMine', 'create', 'update', 'delete']);
    serviceSpy.listMine.and.returnValue(of({ success: true, data: [angular] }));

    await TestBed.configureTestingModule({
      imports: [ProfileSkillsTab],
      providers: [provideZonelessChangeDetection(), { provide: SkillsService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSkillsTab);
    component = fixture.componentInstance;
    notices = [];
    component.notify.subscribe((notice) => notices.push(notice));
    fixture.detectChanges();
  });

  it('loads the current user skills on init', () => {
    expect(serviceSpy.listMine).toHaveBeenCalledTimes(1);
    expect(component.items()).toEqual([angular]);
  });

  it('shows the load error instead of an empty list', () => {
    serviceSpy.listMine.and.returnValue(throwError(() => ({ error: { message: 'Service unavailable' } })));

    component.load();

    expect(component.loadError()).toBe('Service unavailable');
  });

  it('creates a skill, closes the dialog and notifies', () => {
    const created: SkillDto = { id: 'skill-2', name: 'Rust', yearsOfExperience: 2 };
    serviceSpy.create.and.returnValue(of({ success: true, data: created }));

    component.openAdd();
    component.form.setValue({ name: ' Rust ', proficiency: '', yearsOfExperience: '2' });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalledWith({ name: 'Rust', proficiency: undefined, yearsOfExperience: 2 });
    expect(component.items()).toEqual([angular, created]);
    expect(component.modalOpen()).toBeFalse();
    expect(notices[0].title).toBe('Skill added');
  });

  it('edits a skill and sends empty strings for cleared text fields', () => {
    const updated: SkillDto = { ...angular, proficiency: undefined, yearsOfExperience: 5 };
    serviceSpy.update.and.returnValue(of({ success: true, data: updated }));

    component.openEdit('skill-1');
    expect(component.form.getRawValue()).toEqual({ name: 'Angular', proficiency: 'Advanced', yearsOfExperience: '4' });

    component.form.patchValue({ proficiency: '', yearsOfExperience: '5' });
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith('skill-1', {
      id: 'skill-1',
      name: 'Angular',
      proficiency: '',
      yearsOfExperience: 5,
    });
    expect(component.items()).toEqual([updated]);
  });

  it('keeps the dialog open with the server error when save fails', () => {
    serviceSpy.create.and.returnValue(
      throwError(() => ({
        error: { message: 'One or more validation failures have occurred.', errors: { Name: ['Name is required.'] } },
      })),
    );

    component.openAdd();
    component.form.setValue({ name: 'Go', proficiency: '', yearsOfExperience: '' });
    component.submit();

    expect(component.modalOpen()).toBeTrue();
    expect(component.modalError()).toBe('Name is required.');
    expect(component.form.getRawValue().name).toBe('Go');
  });

  it('blocks save for a missing name or invalid years', () => {
    component.openAdd();
    component.form.setValue({ name: '', proficiency: '', yearsOfExperience: '' });
    component.submit();
    expect(component.form.controls.name.touched).toBeTrue();

    component.form.setValue({ name: 'Go', proficiency: '', yearsOfExperience: '-1' });
    component.submit();
    component.form.setValue({ name: 'Go', proficiency: '', yearsOfExperience: '1.5' });
    component.submit();

    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('deletes a skill after confirmation', () => {
    serviceSpy.delete.and.returnValue(of({ success: true, data: 'skill-1' }));

    component.requestDelete('skill-1');
    expect(component.deleteTarget()).toEqual(angular);
    component.confirmDelete();

    expect(serviceSpy.delete).toHaveBeenCalledWith('skill-1');
    expect(component.items()).toEqual([]);
    expect(component.deleteTarget()).toBeNull();
    expect(notices[0].title).toBe('Skill deleted');
  });

  it('keeps the skill when delete is cancelled', () => {
    component.requestDelete('skill-1');
    component.cancelDelete();

    expect(serviceSpy.delete).not.toHaveBeenCalled();
    expect(component.items()).toEqual([angular]);
  });
});
