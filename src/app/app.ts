import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CxsThemeDirective } from 'cerxos-ui';
import { UserSessionService } from './core/services/user-session.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,selector: 'app-root',
  imports: [RouterOutlet, CxsThemeDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private userSessionService = inject(UserSessionService);

  readonly themeMode = computed(() => this.userSessionService.themeMode());

  constructor() {
    this.userSessionService.initialize();
  }
}
