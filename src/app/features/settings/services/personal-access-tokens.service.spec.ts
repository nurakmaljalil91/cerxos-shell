import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { PersonalAccessTokensService } from './personal-access-tokens.service';
import { PersonalAccessTokensMock } from './personal-access-tokens.mock';
import { environment } from '../../../../environments/environment';

describe('PersonalAccessTokensService', () => {
  let service: PersonalAccessTokensService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let mockSpy: jasmine.SpyObj<PersonalAccessTokensMock>;
  let originalTestMode: boolean;
  const endpoint = `${environment.apiBaseUrl}/api/personalaccesstokens`;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    environment.testMode = false;
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);
    mockSpy = jasmine.createSpyObj('PersonalAccessTokensMock', [
      'getScopes',
      'getMyTokens',
      'createToken',
      'revokeToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: PersonalAccessTokensMock, useValue: mockSpy },
      ],
    });
    service = TestBed.inject(PersonalAccessTokensService);
  });

  afterEach(() => {
    environment.testMode = originalTestMode;
  });

  it('should get supported scopes', () => {
    httpClientSpy.get.and.returnValue(of({ success: true, data: ['planner:read'] }));

    service.getScopes().subscribe((response) => expect(response.data).toEqual(['planner:read']));

    expect(httpClientSpy.get).toHaveBeenCalledWith(`${endpoint}/scopes`);
  });

  it('should list the current user tokens', () => {
    httpClientSpy.get.and.returnValue(of({ success: true, data: [] }));

    service.getMyTokens().subscribe();

    expect(httpClientSpy.get).toHaveBeenCalledWith(endpoint);
  });

  it('should create a token', () => {
    const command = { name: 'Claude', scopes: ['planner:write'], expiresAt: '2027-01-01T00:00:00.000Z' };
    httpClientSpy.post.and.returnValue(of({ success: true, data: { token: 'cxs_pat_x' } }));

    service.createToken(command).subscribe((response) => expect(response.data?.token).toBe('cxs_pat_x'));

    expect(httpClientSpy.post).toHaveBeenCalledWith(endpoint, command);
  });

  it('should revoke a token', () => {
    httpClientSpy.delete.and.returnValue(of({ success: true }));

    service.revokeToken('abc').subscribe();

    expect(httpClientSpy.delete).toHaveBeenCalledWith(`${endpoint}/abc`);
  });

  it('should use the mock in test mode', () => {
    environment.testMode = true;
    mockSpy.getMyTokens.and.returnValue(of({ success: true, data: [] }));

    service.getMyTokens().subscribe();

    expect(mockSpy.getMyTokens).toHaveBeenCalled();
    expect(httpClientSpy.get).not.toHaveBeenCalled();
  });
});
