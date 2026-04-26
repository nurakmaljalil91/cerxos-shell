import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationLayout } from './application-layout';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { UserSessionService } from '../../../core/services/user-session.service';

describe('ApplicationLayout', () => {
  let component: ApplicationLayout;
  let fixture: ComponentFixture<ApplicationLayout>;
  let userSessionSpy: jasmine.SpyObj<Pick<UserSessionService, 'hasAnyRole' | 'hasAnyPermission'>>;

  beforeEach(async () => {
    userSessionSpy = jasmine.createSpyObj('UserSessionService', ['hasAnyRole', 'hasAnyPermission']);
    userSessionSpy.hasAnyRole.and.returnValue(true);
    userSessionSpy.hasAnyPermission.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [ApplicationLayout],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        { provide: UserSessionService, useValue: userSessionSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default collapsed = false and drawerOpened = false', () => {
    expect(component.collapsed()).toBeFalse();
    expect(component.drawerOpened()).toBeFalse();
  });

  it('should define navigation items for dashboard, profile, and settings', () => {
    expect(component.navigations.length).toBe(6);
    expect(component.navigations[0].label).toBe('Dashboard');
    expect(component.navigations[1].label).toBe('Manage Identity');
    expect(component.navigations[2].label).toBe('Profile');
    expect(component.navigations[3].label).toBe('Planning');
    expect(component.navigations[4].label).toBe('Financial');
    expect(component.navigations[5].label).toBe('Settings');
    expect(component.navigations[1].requiredRoles).toEqual(['Admin']);
    expect(component.navigations[3].children?.map((item) => item.route)).toEqual([
      '/planning',
      '/planning/manage-calendar',
    ]);
    expect(component.navigations[3].children?.[1].requiredRoles).toEqual(['Admin']);
    expect(component.navigations[1].children?.map((item) => item.route)).toEqual([
      '/identity/users',
      '/identity/groups',
      '/identity/roles',
      '/identity/permissions',
    ]);
  });

  it('should show Manage Identity for Admin users', () => {
    userSessionSpy.hasAnyRole.and.returnValue(true);

    expect(component.filteredNavigations().some((item) => item.label === 'Manage Identity')).toBeTrue();
  });

  it('should hide Manage Identity for non-admin users', () => {
    userSessionSpy.hasAnyRole.and.returnValue(false);

    expect(component.filteredNavigations().some((item) => item.label === 'Manage Identity')).toBeFalse();
  });

  it('should hide Manage Calendar for non-admin users while keeping Planning visible', () => {
    userSessionSpy.hasAnyRole.and.returnValue(false);

    const planning = component.filteredNavigations().find((item) => item.label === 'Planning');

    expect(planning).toBeTruthy();
    expect(planning?.children?.map((item) => item.label)).toEqual(['Calendar']);
  });

  it('should toggle sidebar collapsed state', () => {
    const initial = component.collapsed();
    component.toggleSidebar();
    expect(component.collapsed()).toBe(!initial);
  });

  it('should open and close drawer', () => {
    component.openDrawer();
    expect(component.drawerOpened()).toBeTrue();

    component.closeDrawer();
    expect(component.drawerOpened()).toBeFalse();
  });
});
