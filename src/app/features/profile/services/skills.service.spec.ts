import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SkillsMock } from './skills.mock';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  const endpoint = `${environment.apiBaseUrl}/api/skills`;
  let service: SkillsService;
  let http: HttpTestingController;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    environment.testMode = false;

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SkillsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    environment.testMode = originalTestMode;
  });

  it('lists the current user records from the me route', () => {
    service.listMine().subscribe((response) => expect(response.data?.length).toBe(0));

    const request = http.expectOne(`${endpoint}/me`);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: [] });
  });

  it('creates with POST and sends the command body', () => {
    const command = { name: 'Angular', yearsOfExperience: 4 };
    service.create(command).subscribe();

    const request = http.expectOne(endpoint);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(command);
    request.flush({ success: true });
  });

  it('updates with PUT on the record id', () => {
    const command = { id: 'abc', endDate: '' };
    service.update('abc', command).subscribe();

    const request = http.expectOne(`${endpoint}/abc`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(command);
    request.flush({ success: true });
  });

  it('deletes with DELETE on the record id', () => {
    service.delete('abc').subscribe();

    const request = http.expectOne(`${endpoint}/abc`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: true, data: 'abc' });
  });

  it('uses the mock in test mode', () => {
    environment.testMode = true;
    const mock = TestBed.inject(SkillsMock);
    const spy = spyOn(mock, 'listMine').and.returnValue(of({ success: true, data: [] }));

    service.listMine().subscribe();

    expect(spy).toHaveBeenCalled();
    http.expectNone(`${endpoint}/me`);
  });
});
