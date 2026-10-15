import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { PersonalAccessTokens, scopeLabel, toDateInputValue } from './personal-access-tokens';
import { PersonalAccessTokensService } from '../../services/personal-access-tokens.service';
import { PersonalAccessTokenDto } from '../../../../shared/models/model';

describe('PersonalAccessTokens', () => {
  let component: PersonalAccessTokens;
  let fixture: ComponentFixture<PersonalAccessTokens>;
  let serviceSpy: jasmine.SpyObj<PersonalAccessTokensService>;

  const activeToken: PersonalAccessTokenDto = {
    id: 'pat-1',
    name: 'Claude Code',
    displayPrefix: 'cxs_pat_Ab3d',
    scopes: ['planner:read', 'planner:write'],
    isActive: true,
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('PersonalAccessTokensService', [
      'getScopes',
      'getMyTokens',
      'createToken',
      'revokeToken',
    ]);
    serviceSpy.getScopes.and.returnValue(of({ success: true, data: ['planner:read', 'planner:write'] }));
    serviceSpy.getMyTokens.and.returnValue(of({ success: true, data: [activeToken] }));

    await TestBed.configureTestingModule({
      imports: [PersonalAccessTokens],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PersonalAccessTokensService, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalAccessTokens);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load scopes and tokens on init', () => {
    expect(component.scopeOptions().map((option) => option.value)).toEqual(['planner:read', 'planner:write']);
    expect(component.rows().length).toBe(1);
    expect(component.rows()[0].prefix).toBe('cxs_pat_Ab3d…');
    expect(component.rows()[0].status).toBe('Active');
  });

  it('should not submit an invalid form', () => {
    component.onOpenCreate();
    component.onSubmitCreate();

    expect(serviceSpy.createToken).not.toHaveBeenCalled();
    expect(component.createError()).toContain('choose at least one scope');
  });

  it('should show the secret once after creating a token, then forget it', async () => {
    serviceSpy.createToken.and.returnValue(
      of({ success: true, data: { ...activeToken, id: 'pat-2', token: 'cxs_pat_secret' } }),
    );
    component.onOpenCreate();
    component.createForm.setValue({ name: ' Claude ', scopes: ['planner:write'], expiresOn: '2027-01-15' });

    component.onSubmitCreate();
    fixture.detectChanges();
    await fixture.whenStable();

    const command = serviceSpy.createToken.calls.mostRecent().args[0];
    expect(command.name).toBe('Claude');
    expect(command.scopes).toEqual(['planner:write']);
    expect(command.expiresAt).toBe(new Date('2027-01-15T23:59:59').toISOString());
    expect(component.createOpen()).toBeFalse();
    expect(component.createdSecret()).toBe('cxs_pat_secret');
    expect(document.body.textContent).toContain('cxs_pat_secret');
    expect(serviceSpy.getMyTokens).toHaveBeenCalledTimes(2);

    component.onCloseSecret();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.createdSecret()).toBeNull();
    expect(document.body.textContent).not.toContain('cxs_pat_secret');
  });

  it('should copy the secret to the clipboard', async () => {
    const writeText = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.createdSecret.set('cxs_pat_secret');

    await component.onCopySecret();

    expect(writeText).toHaveBeenCalledWith('cxs_pat_secret');
    expect(component.copied()).toBeTrue();
  });

  it('should revoke a token only after confirmation', () => {
    serviceSpy.revokeToken.and.returnValue(of({ success: true }));

    component.onRequestRevoke('pat-1');
    expect(serviceSpy.revokeToken).not.toHaveBeenCalled();
    expect(component.revokeTarget()?.name).toBe('Claude Code');

    component.onConfirmRevoke();

    expect(serviceSpy.revokeToken).toHaveBeenCalledWith('pat-1');
    expect(component.revokeTarget()).toBeNull();
    expect(serviceSpy.getMyTokens).toHaveBeenCalledTimes(2);
  });

  it('should label revoked and expired tokens', () => {
    serviceSpy.getMyTokens.and.returnValue(
      of({
        success: true,
        data: [
          { ...activeToken, isActive: false, revokedAt: '2026-10-01T00:00:00Z' },
          { ...activeToken, id: 'pat-2', isActive: false },
        ],
      }),
    );

    component.loadTokens();

    expect(component.rows().map((row) => row.status)).toEqual(['Revoked', 'Expired']);
  });

  it('should format helpers', () => {
    expect(scopeLabel('planner:write')).toBe('Planner – read & write');
    expect(scopeLabel('habits:read')).toBe('Habits – read');
    expect(toDateInputValue(new Date(2027, 0, 5))).toBe('2027-01-05');
  });
});
