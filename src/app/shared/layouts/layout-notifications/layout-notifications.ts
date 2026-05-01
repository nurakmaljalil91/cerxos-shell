import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';
import {
  LayoutNotificationItem,
  NotificationService,
} from '../../../core/services/notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout-notifications',
  standalone: true,
  imports: [HeroIconHelperPipe],
  templateUrl: './layout-notifications.html',
  styleUrl: './layout-notifications.css'
})
export class LayoutNotifications {
  private readonly notificationService = inject(NotificationService);

  readonly notificationOpen = signal<boolean>(false);
  readonly notifications = this.notificationService.notifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly loading = this.notificationService.loading;
  readonly error = this.notificationService.error;
  readonly panelStatus = computed((): string | null => {
    if (this.loading()) {
      return 'Loading notifications';
    }
    return this.error();
  });

  toggleNotification(): void {
    this.notificationOpen.update((value) => !value);
  }

  closeMenus(): void {
    this.notificationOpen.set(false);
  }

  markAllRead(): void {
    this.notificationService.markAllRead();
  }

  openNotification(n: LayoutNotificationItem): void {
    this.notificationService.openNotification(n);
    this.closeMenus();
  }
}
