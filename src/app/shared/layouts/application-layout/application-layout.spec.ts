import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationLayout } from './application-layout';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('ApplicationLayout', () => {
  let component: ApplicationLayout;
  let fixture: ComponentFixture<ApplicationLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationLayout],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient()]
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
    expect(component.navigations.length).toBe(4);
    expect(component.navigations[0].label).toBe('Dashboard');
    expect(component.navigations[1].label).toBe('Identity Management');
    expect(component.navigations[2].label).toBe('Profile');
    expect(component.navigations[3].label).toBe('Settings');
    expect(component.navigations[1].children?.map((item) => item.route)).toEqual([
      '/identity/users',
      '/identity/groups',
      '/identity/roles',
      '/identity/permissions'
    ]);
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
