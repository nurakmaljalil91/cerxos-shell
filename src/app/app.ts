import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { CxsThemeDirective } from 'cerxos-ui';
import { UserSessionService } from './core/services/user-session.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, CxsThemeDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly userSessionService = inject(UserSessionService);
  private readonly translocoService = inject(TranslocoService);

  readonly themeMode = computed(() => this.userSessionService.themeMode());

  constructor() {
    this.userSessionService.initialize();
    const lang = this.userSessionService.getPreference('ui.language') ?? 'en';
    this.translocoService.setActiveLang(lang);
  }
}
