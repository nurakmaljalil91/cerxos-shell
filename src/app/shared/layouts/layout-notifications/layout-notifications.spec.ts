import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutNotifications } from './layout-notifications';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

describe('LayoutNotifications', () => {
  let component: LayoutNotifications;
  let fixture: ComponentFixture<LayoutNotifications>;
  let notificationServiceSpy: jasmine.SpyObj<
    Pick<NotificationService, 'markAllRead' | 'openNotification'>
  >;

  beforeEach(async () => {
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'markAllRead',
      'openNotification',
    ]);
    Object.assign(notificationServiceSpy, {
      notifications: signal([]).asReadonly(),
      unreadCount: signal(0).asReadonly(),
      loading: signal(false).asReadonly(),
      error: signal(null).asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [LayoutNotifications],
      providers: [
        provideZonelessChangeDetection(),
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutNotifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
