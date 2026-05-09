import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, Type, signal } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { loadRemoteStyles } from '../../../../shared/utils/remote-style-loader';

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
    loadRemoteStyles('planning-mfe')
      .then(() => loadRemoteModule('planning-mfe', './UpcomingEventsWidget'))
      .then((m) => this.upcomingWidget.set(m['UpcomingEventsWidgetComponent']))
      .catch(() => {});
  }
}
