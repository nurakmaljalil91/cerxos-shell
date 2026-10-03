import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseResponseOfString } from '../../shared/models/model';

export type OnboardingOutcome = 'Completed' | 'Skipped';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly http = inject(HttpClient);
  private readonly welcome = signal(false);
  private profileSetupPending = false;

  readonly welcomeOpen = this.welcome.asReadonly();

  showWelcome(): void {
    this.welcome.set(true);
  }

  clear(): void {
    this.welcome.set(false);
    this.profileSetupPending = false;
  }

  continueToProfile(): void {
    this.welcome.set(false);
    this.profileSetupPending = true;
  }

  consumeProfileSetup(): boolean {
    const pending = this.profileSetupPending;
    this.profileSetupPending = false;
    return pending;
  }

  setOutcome(outcome: OnboardingOutcome): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return of({ success: true, data: outcome });
    }

    return this.http.put<BaseResponseOfString>(
      `${environment.apiBaseUrl}/api/onboarding/me`,
      { outcome },
    );
  }
}
