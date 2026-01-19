import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';
import { heroIconHelper } from '../../functions/hero-icon-helper.fx';
import { LayoutNotifications } from '../layout-notifications/layout-notifications';
import { LayoutProfileMenu } from '../layout-profile-menu/layout-profile-menu';
import { UserSessionService } from '../../../core/services/user-session.service';
import { NgOptimizedImage } from '@angular/common';
import { CxsBadgeComponent } from 'cerxos-ui';

type NavigationItem = {
  label: string;
  route?: string;
  icon?: string[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
  children?: NavigationItem[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-application-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeroIconHelperPipe,
    LayoutNotifications,
    LayoutProfileMenu,
    NgOptimizedImage,
    CxsBadgeComponent
  ],
  templateUrl: './application-layout.html',
  styleUrl: './application-layout.css',
})
export class ApplicationLayout {
  readonly collapsed = signal<boolean>(false);
  readonly drawerOpened = signal<boolean>(false);
  private userSessionService = inject(UserSessionService);
  readonly expandedGroups = signal<Record<string, boolean>>({
    'Identity Management': false,
  });

  navigations: NavigationItem[] = [
    { label: 'Dashboard', route: '/', icon: heroIconHelper('home') },
    {
      label: 'Identity Management',
      icon: heroIconHelper('user-group'),
      children: [
        { label: 'Users', route: '/identity/users', icon: heroIconHelper('user-group') },
        { label: 'Groups', route: '/identity/groups', icon: heroIconHelper('user-group') },
        { label: 'Roles', route: '/identity/roles', icon: heroIconHelper('user') },
        {
          label: 'Permissions',
          route: '/identity/permissions',
          icon: heroIconHelper('cog-6-tooth'),
        },
      ],
    },
    { label: 'Profile', route: '/profile', icon: heroIconHelper('user') },
    { label: 'Settings', route: '/settings', icon: heroIconHelper('cog-6-tooth') },
  ];

  readonly filteredNavigations = computed(() =>
    this.navigations
      .map((item) => {
        if (!item.children?.length) {
          return this.canAccess(item) ? item : null;
        }
        const children = item.children.filter((child) => this.canAccess(child));
        if (!children.length) {
          return null;
        }
        return { ...item, children };
      })
      .filter((item): item is NavigationItem => !!item),
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
    if (this.collapsed()) {
      this.collapseAllGroups();
    }
  }

  openDrawer(): void {
    this.drawerOpened.set(true);
  }

  closeDrawer(): void {
    this.drawerOpened.set(false);
  }

  toggleGroup(label: string): void {
    this.expandedGroups.update((state) => ({
      ...state,
      [label]: !this.isGroupExpanded(label),
    }));
    if (this.collapsed()) {
      this.toggleSidebar();
    }
  }

  isGroupExpanded(label: string): boolean {
    const state = this.expandedGroups();
    if (Object.prototype.hasOwnProperty.call(state, label)) {
      return state[label];
    }
    return true;
  }

  private collapseAllGroups(): void {
    const groups = this.expandedGroups();
    const nextState: Record<string, boolean> = {};
    for (const key of Object.keys(groups)) {
      nextState[key] = false;
    }
    this.expandedGroups.set(nextState);
  }

  private canAccess(item: NavigationItem): boolean {
    if (item.requiredRoles?.length && !this.userSessionService.hasAnyRole(item.requiredRoles)) {
      return false;
    }
    return !(
      item.requiredPermissions?.length &&
      !this.userSessionService.hasAnyPermission(item.requiredPermissions)
    );
  }
}
