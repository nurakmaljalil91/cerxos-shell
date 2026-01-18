import { Component, computed, inject, signal } from '@angular/core';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router, RouterLink } from '@angular/router';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';
import { CxsAvatarComponent } from 'cerxos-ui';
import { UserSessionService } from '../../../core/services/user-session.service';

@Component({
  selector: 'app-layout-profile-menu',
  imports: [RouterLink, HeroIconHelperPipe, CxsAvatarComponent],
  standalone: true,
  templateUrl: './layout-profile-menu.html',
  styleUrl: './layout-profile-menu.css'
})
export class LayoutProfileMenu {
  authenticationService = inject(AuthenticationService);
  userSessionService = inject(UserSessionService);
  router = inject(Router);

  profileOpen = signal<boolean>(false);

  readonly session = this.userSessionService.session;
  readonly profile = computed(() => this.session()?.profile ?? null);
  readonly user = computed(() => this.session()?.user ?? null);

  readonly displayName = computed(() => {
    const profile = this.profile();
    if (profile?.displayName) {
      return profile.displayName;
    }
    const first = profile?.firstName?.trim();
    const last = profile?.lastName?.trim();
    const name = [first, last].filter(Boolean).join(' ');
    if (name) {
      return name;
    }
    return this.user()?.username ?? 'User';
  });

  readonly email = computed(() => this.user()?.email ?? '');

  readonly avatarSrc = computed(() => this.profile()?.imageUrl);

  toggleProfile() {
    this.profileOpen.update((value) => !value);
  }

  closeMenus() {
    this.profileOpen.set(false);
  }

  signOut() {
    void this.router.navigate(['/login']).then(() => {
      this.authenticationService.logout();
      this.closeMenus();
    });
  }
}
