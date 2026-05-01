import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { catchError, EMPTY, finalize, forkJoin, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { UserSessionService } from './user-session.service';

export type LayoutNotificationItem = {
  id: string;
  notificationId: number;
  title: string;
  body: string;
  when: string;
  read: boolean;
  deepLinkUrl?: string;
};

type NotificationItemDto = {
  notificationId?: number;
  recipientId?: string;
  title?: string | null;
  body?: string | null;
  deepLinkUrl?: string | null;
  isRead?: boolean;
  createdAtUtc?: string;
};

type NotificationReadEvent = {
  notificationId?: number;
  readAtUtc?: string;
};

type BaseResponse<T> = {
  success?: boolean;
  data?: T;
};

type PaginatedEnumerable<T> = {
  items?: T[];
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly userSessionService = inject(UserSessionService);
  private readonly notificationEndpoint = `${environment.notificationServiceBaseUrl}/api/notifications`;
  private readonly notificationHub = `${environment.notificationServiceBaseUrl}/hubs/notifications`;

  private readonly _notifications = signal<LayoutNotificationItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _connected = signal(false);
  private readonly _error = signal<string | null>(null);

  private hubConnection: signalR.HubConnection | null = null;
  private subscribedRecipientId: string | null = null;

  readonly notifications = this._notifications.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly connected = this._connected.asReadonly();
  readonly error = this._error.asReadonly();
  readonly unreadCount = computed(
    () => this._notifications().filter((notification) => !notification.read).length,
  );

  constructor() {
    effect(() => {
      const token = this.tokenService.token();
      const recipientId = this.userSessionService.session()?.user?.id;

      if (!token || !recipientId) {
        void this.disconnect();
        this._notifications.set([]);
        return;
      }

      void this.connect(recipientId);
    });
  }

  load(): void {
    const recipientId = this.userSessionService.session()?.user?.id;
    if (!recipientId) {
      this._notifications.set([]);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    const params = new HttpParams()
      .set('recipientId', recipientId)
      .set('page', 1)
      .set('total', 10);

    this.http
      .get<BaseResponse<PaginatedEnumerable<NotificationItemDto>>>(this.notificationEndpoint, {
        params,
      })
      .pipe(
        tap((response) => {
          const items = response.data?.items ?? [];
          this._notifications.set(items.map((item) => this.mapNotification(item)));
        }),
        catchError(() => {
          this._error.set('Notifications are unavailable.');
          return EMPTY;
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  markAllRead(): void {
    const unread = this._notifications().filter((notification) => !notification.read);
    if (!unread.length) {
      return;
    }

    this._notifications.update((items) => items.map((item) => ({ ...item, read: true })));

    forkJoin(unread.map((notification) => this.markReadRequest(notification))).subscribe({
      error: () => this._error.set('Some notifications could not be marked as read.'),
    });
  }

  openNotification(notification: LayoutNotificationItem): void {
    if (!notification.read) {
      this._notifications.update((items) =>
        items.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
      );
      this.markReadRequest(notification).subscribe({
        error: () => this._error.set('Notification could not be marked as read.'),
      });
    }

    if (notification.deepLinkUrl) {
      window.location.assign(notification.deepLinkUrl);
    }
  }

  private async connect(recipientId: string): Promise<void> {
    if (this.subscribedRecipientId === recipientId && this.hubConnection) {
      return;
    }

    await this.disconnect();
    this.load();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.notificationHub, {
        accessTokenFactory: () => this.tokenService.get() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('notificationReceived', (notification: NotificationItemDto) => {
      this.upsertNotification(this.mapNotification(notification));
    });

    this.hubConnection.on('notificationRead', (event: NotificationReadEvent) => {
      if (event.notificationId === undefined) {
        return;
      }
      this.markLocalRead(event.notificationId);
    });

    this.hubConnection.onreconnected(() => {
      void this.hubConnection?.invoke('Subscribe', recipientId);
    });

    this.hubConnection.onclose(() => {
      this._connected.set(false);
    });

    try {
      await this.hubConnection.start();
      await this.hubConnection.invoke('Subscribe', recipientId);
      this.subscribedRecipientId = recipientId;
      this._connected.set(true);
      this._error.set(null);
    } catch {
      this._connected.set(false);
      this._error.set('Live notifications are unavailable.');
    }
  }

  private async disconnect(): Promise<void> {
    const connection = this.hubConnection;
    if (!connection) {
      this.subscribedRecipientId = null;
      this._connected.set(false);
      return;
    }

    const recipientId = this.subscribedRecipientId;
    this.hubConnection = null;
    this.subscribedRecipientId = null;

    try {
      if (recipientId && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('Unsubscribe', recipientId);
      }
      await connection.stop();
    } finally {
      this._connected.set(false);
    }
  }

  private markReadRequest(notification: LayoutNotificationItem): Observable<BaseResponse<NotificationItemDto>> {
    const recipientId = this.userSessionService.session()?.user?.id;
    if (!recipientId) {
      return EMPTY;
    }

    const params = new HttpParams().set('recipientId', recipientId);
    return this.http.post<BaseResponse<NotificationItemDto>>(
      `${this.notificationEndpoint}/${notification.notificationId}/read`,
      null,
      { params },
    );
  }

  private upsertNotification(notification: LayoutNotificationItem): void {
    this._notifications.update((items) => {
      const existingIndex = items.findIndex((item) => item.id === notification.id);
      if (existingIndex < 0) {
        return [notification, ...items].slice(0, 10);
      }

      const next = [...items];
      next[existingIndex] = notification;
      return next;
    });
  }

  private markLocalRead(notificationId: number): void {
    this._notifications.update((items) =>
      items.map((item) =>
        item.notificationId === notificationId ? { ...item, read: true } : item,
      ),
    );
  }

  private mapNotification(notification: NotificationItemDto): LayoutNotificationItem {
    const notificationId = notification.notificationId ?? 0;
    return {
      id: String(notificationId),
      notificationId,
      title: notification.title?.trim() || 'Notification',
      body: notification.body?.trim() || '',
      when: this.formatRelativeTime(notification.createdAtUtc),
      read: notification.isRead ?? false,
      deepLinkUrl: notification.deepLinkUrl ?? undefined,
    };
  }

  private formatRelativeTime(value?: string): string {
    if (!value) {
      return 'Just now';
    }

    const createdAt = new Date(value).getTime();
    if (Number.isNaN(createdAt)) {
      return 'Just now';
    }

    const diffSeconds = Math.round((createdAt - Date.now()) / 1000);
    const absSeconds = Math.abs(diffSeconds);
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    if (absSeconds < 60) {
      return formatter.format(diffSeconds, 'second');
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, 'hour');
    }

    return formatter.format(Math.round(diffHours / 24), 'day');
  }
}
