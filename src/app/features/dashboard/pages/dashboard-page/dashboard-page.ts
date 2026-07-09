import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, Type, signal } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

@Component({
  selector: 'app-dashboard-page',
  imports: [NgComponentOutlet],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  readonly upcomingWidget = signal<Type<unknown> | null>(null);

  ngOnInit(): void {
    // UpcomingEventsWidgetComponent uses ViewEncapsulation.ShadowDom and ships its own
    // styles, so no separate loadRemoteStyles() call is needed (and would otherwise leak
    // planning-mfe's global stylesheet into the shell's document, breaking the shell's
    // own Tailwind cascade layers).
    loadRemoteModule('planning-mfe', './UpcomingEventsWidget')
      .then((m) => this.upcomingWidget.set(m['UpcomingEventsWidgetComponent']))
      .catch(() => {});
  }
}
