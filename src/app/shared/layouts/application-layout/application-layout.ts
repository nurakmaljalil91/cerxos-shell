import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-application-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './application-layout.html',
  styleUrl: './application-layout.css'
})
export class ApplicationLayout {
  collapsed = signal<boolean>(false);
  drawerOpened = signal<boolean>(false);

  navigations: NavigationItem[] = [
    { label: 'Dashboard', route: '/', icon: this.heroIconHelper('home') },
    { label: 'Profile', route: '/profile', icon: this.heroIconHelper('user') },
    { label: 'Settings', route: '/settings', icon: this.heroIconHelper('cog-6-tooth') }
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

  heroIconHelper(iconName: string): string {
    const paths: Record<string, string> = {
      home: 'M2.25 12l8.954-8.955a.75.75 0 011.06 0L21.218 12M4.5 10.5v8.25A1.5 1.5 0 006 20.25h3v-4.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v4.5h3a1.5 1.5 0 001.5-1.5V10.5',
      'puzzle-piece':
        'M11 5a2 2 0 114 0v1a2 2 0 102 2h1a2 2 0 110 4h-1a2 2 0 10-2 2v1a2 2 0 11-4 0v-1a2 2 0 10-2-2H6a2 2 0 110-4h3a2 2 0 102-2V5z',
      'cog-6-tooth':
        'M11.7 1.7a1 1 0 01.6 0l1.5.5 1-1 2.1 2.1-1 1 .5 1.5a1 1 0 010 .6l-.5 1.5 1 1-2.1 2.1-1-1-1.5.5a1 1 0 01-.6 0l-1.5-.5-1 1L5.5 9.8l1-1-.5-1.5a1 1 0 010-.6l.5-1.5-1-1L8.6 1.2l1 1 1.5-.5z M12 9.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z',
      'bars-3': 'M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5',
      'chevron-double-left':
        'M11.78 4.72a.75.75 0 010 1.06L7.56 10l4.22 4.22a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0zM17.28 4.72a.75.75 0 010 1.06L13.06 10l4.22 4.22a.75.75 0 01-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z',
      user: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
    };
    return paths[iconName] ?? iconName;
  }
}
