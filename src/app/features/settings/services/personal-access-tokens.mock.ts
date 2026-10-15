import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  BaseResponseOfCreatedPersonalAccessTokenDto,
  BaseResponseOfPersonalAccessTokenDto,
  BaseResponseOfPersonalAccessTokenDtoList,
  BaseResponseOfStringList,
  CreatePersonalAccessTokenCommand,
  PersonalAccessTokenDto,
} from '../../../shared/models/model';

const SERVICES = ['users', 'planner', 'financial', 'files', 'notifications', 'habits'];

@Injectable({
  providedIn: 'root',
})
export class PersonalAccessTokensMock {
  private tokens: PersonalAccessTokenDto[] = [
    {
      id: 'pat-1',
      name: 'Claude Code',
      displayPrefix: 'cxs_pat_Ab3d',
      scopes: ['planner:read', 'planner:write'],
      createdAt: '2026-10-01T08:00:00Z',
      expiresAt: '2026-12-30T08:00:00Z',
      lastUsedAt: '2026-10-14T09:30:00Z',
      isActive: true,
    },
  ];

  getScopes(): Observable<BaseResponseOfStringList> {
    return of({
      success: true,
      data: SERVICES.flatMap((service) => [`${service}:read`, `${service}:write`]),
    });
  }

  getMyTokens(): Observable<BaseResponseOfPersonalAccessTokenDtoList> {
    return of({ success: true, data: [...this.tokens] });
  }

  createToken(
    command: CreatePersonalAccessTokenCommand,
  ): Observable<BaseResponseOfCreatedPersonalAccessTokenDto> {
    const token = `cxs_pat_mock${Math.random().toString(36).slice(2, 12)}`;
    const created: PersonalAccessTokenDto = {
      id: `pat-${this.tokens.length + 1}`,
      name: command.name,
      displayPrefix: token.slice(0, 12),
      scopes: command.scopes,
      createdAt: new Date().toISOString(),
      expiresAt: command.expiresAt,
      isActive: true,
    };
    this.tokens = [created, ...this.tokens];
    return of({ success: true, data: { ...created, token } });
  }

  revokeToken(id: string): Observable<BaseResponseOfPersonalAccessTokenDto> {
    this.tokens = this.tokens.map((token) =>
      token.id === id ? { ...token, isActive: false, revokedAt: new Date().toISOString() } : token,
    );
    return of({ success: true, data: this.tokens.find((token) => token.id === id) });
  }
}
