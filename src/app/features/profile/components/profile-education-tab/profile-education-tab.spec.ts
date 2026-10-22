import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EducationDto } from '../../../../shared/models/model';
import { EducationsService } from '../../services/educations.service';
import { ProfileEducationTab } from './profile-education-tab';

describe('ProfileEducationTab', () => {
  let component: ProfileEducationTab;
  let fixture: ComponentFixture<ProfileEducationTab>;
  let serviceSpy: jasmine.SpyObj<EducationsService>;

  const degree: EducationDto = {
    id: 'edu-1',
    institution: 'UTM',
    degree: 'BSc',
    startDate: '2014-09-01',
    endDate: '2018-06-30',
    grade: 'Second upper',
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('EducationsService', ['listMine', 'create', 'update', 'delete']);
    serviceSpy.listMine.and.returnValue(of({ success: true, data: [degree] }));

    await TestBed.configureTestingModule({
      imports: [ProfileEducationTab],
      providers: [provideZonelessChangeDetection(), { provide: EducationsService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEducationTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires institution and start date', () => {
    component.openAdd();
    component.submit();

    expect(component.form.controls.institution.hasError('required')).toBeTrue();
    expect(component.form.controls.startDate.hasError('required')).toBeTrue();
    expect(component.showInvalid('institution')).toBeTrue();
    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('saves the picked calendar days as full dates', () => {
    serviceSpy.create.and.returnValue(of({ success: true, data: { id: 'edu-2', institution: 'MMU' } }));

    component.openAdd();
    component.form.patchValue({ institution: 'MMU', startDate: '2019-09-02', endDate: '2021-07-15' });
    component.submit();

    expect(serviceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ institution: 'MMU', startDate: '2019-09-02', endDate: '2021-07-15' }),
    );
  });

  it('rejects an end date before the start date', () => {
    component.openAdd();
    component.form.patchValue({ institution: 'MMU', startDate: '2019-09-02', endDate: '2019-09-01' });
    component.submit();

    expect(component.form.hasError('endBeforeStart')).toBeTrue();
    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('updates an education grade', () => {
    serviceSpy.update.and.returnValue(of({ success: true, data: { ...degree, grade: 'First class' } }));

    component.openEdit('edu-1');
    component.form.controls.grade.setValue('First class');
    component.submit();

    expect(serviceSpy.update).toHaveBeenCalledWith('edu-1', jasmine.objectContaining({ grade: 'First class' }));
    expect(component.items()[0].grade).toBe('First class');
  });
});
