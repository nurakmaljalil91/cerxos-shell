import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';
import { heroIconHelper } from '../../functions/hero-icon-helper.fx';
import { LayoutNotifications } from '../layout-notifications/layout-notifications';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string[];
}

@Component({
  selector: 'app-application-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HeroIconHelperPipe, LayoutNotifications],
  templateUrl: './application-layout.html',
  styleUrl: './application-layout.css'
})
export class ApplicationLayout {
  collapsed = signal<boolean>(false);
  drawerOpened = signal<boolean>(false);

  navigations: NavigationItem[] = [
    { label: 'Dashboard', route: '/', icon: heroIconHelper('home') },
    { label: 'Profile', route: '/profile', icon: heroIconHelper('user') },
    { label: 'Settings', route: '/settings', icon: heroIconHelper('cog-6-tooth') }
  ];

  constructor() {
    const saveDrawerState = localStorage.getItem('sidebar:collapsed');
    if (saveDrawerState !== null) {
      this.collapsed.set(saveDrawerState === '1');
    }

    effect(() => {
      localStorage.setItem('sidebar:collapsed', this.collapsed() ? '1' : '0');
    });
  }

  toggleSidebar() {
    this.collapsed.update((value) => !value);
  }

  openDrawer() {
    this.drawerOpened.set(true);
  }

  closeDrawer() {
    this.drawerOpened.set(false);
  }

  protected readonly HeroIconHelperPipe = HeroIconHelperPipe;
}
