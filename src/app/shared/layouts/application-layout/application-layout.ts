import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';
import { heroIconHelper } from '../../functions/hero-icon-helper.fx';
import { LayoutNotifications } from '../layout-notifications/layout-notifications';
import { LayoutProfileMenu } from '../layout-profile-menu/layout-profile-menu';
import { UserSessionService } from '../../../core/services/user-session.service';

type NavigationItem = {
  label: string;
  route: string;
  icon?: string[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,selector: 'app-application-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeroIconHelperPipe,
    LayoutNotifications,
    LayoutProfileMenu
  ],
  templateUrl: './application-layout.html',
  styleUrl: './application-layout.css'
})
export class ApplicationLayout {
  readonly collapsed = signal<boolean>(false);
  readonly drawerOpened = signal<boolean>(false);
  private userSessionService = inject(UserSessionService);

  navigations: NavigationItem[] = [
    { label: 'Dashboard', route: '/', icon: heroIconHelper('home') },
    { label: 'Users', route: '/users', icon: heroIconHelper('user-group') },
    { label: 'Profile', route: '/profile', icon: heroIconHelper('user') },
    { label: 'Settings', route: '/settings', icon: heroIconHelper('cog-6-tooth') }
  ];

  readonly filteredNavigations = computed(() =>
    this.navigations.filter((item) => this.canAccess(item)),
  );

  private saveCollapsedStateEffect = effect(() => {
    localStorage.setItem('sidebar:collapsed', this.collapsed() ? '1' : '0');
  });

  constructor() {
    const saveDrawerState = localStorage.getItem('sidebar:collapsed');
    if (saveDrawerState !== null) {
      this.collapsed.set(saveDrawerState === '1');
    }
  }

  toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }

  openDrawer(): void {
    this.drawerOpened.set(true);
  }

  closeDrawer(): void {
    this.drawerOpened.set(false);
  }

  private canAccess(item: NavigationItem): boolean {
    if (item.requiredRoles?.length && !this.userSessionService.hasAnyRole(item.requiredRoles)) {
      return false;
    }
    if (
      item.requiredPermissions?.length &&
      !this.userSessionService.hasAnyPermission(item.requiredPermissions)
    ) {
      return false;
    }
    return true;
  }
}
