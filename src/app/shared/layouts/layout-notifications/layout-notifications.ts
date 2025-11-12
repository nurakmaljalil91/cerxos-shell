import { Component, signal } from '@angular/core';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';

@Component({
  selector: 'app-layout-notifications',
  standalone: true,
  imports: [HeroIconHelperPipe],
  templateUrl: './layout-notifications.html',
  styleUrl: './layout-notifications.css'
})
export class LayoutNotifications {
  notificationOpen = signal<boolean>(false);

  notifications: { id: string; title: string; body: string; when: string; read: boolean }[] = [
    {
      id: 'n1',
      title: 'Deployment complete',
      body: 'Cerxos API v1.2.3 rolled out',
      when: '2m ago',
      read: false
    },
    {
      id: 'n2',
      title: 'New comment',
      body: 'Johan mentioned you in PO-1042',
      when: '1h ago',
      read: false
    },
    {
      id: 'n3',
      title: 'Invoice paid',
      body: 'RM 4,200 from Kyeob Consulting',
      when: 'Yesterday',
      read: true
    }
  ];

  unreadCount = (): number =>
    this.notifications.filter((notification) => !notification.read).length;

  toggleNotification() {
    this.notificationOpen.update((value) => !value);
  }

  closeMenus() {
    this.notificationOpen.set(false);
  }

  markAllRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  openNotification(n: { id: string }) {
    // mark read and navigate / open a details drawer, etc.
    this.notifications = this.notifications.map(x => (x.id === n.id ? { ...x, read: true } : x));
    // Example: this.router.navigate(['/notifications', n.id]);
    this.closeMenus();
  }
}
