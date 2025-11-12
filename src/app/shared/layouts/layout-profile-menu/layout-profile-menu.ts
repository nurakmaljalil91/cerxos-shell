import { Component, inject, signal } from '@angular/core';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router, RouterLink } from '@angular/router';
import { HeroIconHelperPipe } from '../../pipes/hero-icon-helper.pipe';

@Component({
  selector: 'app-layout-profile-menu',
  imports: [RouterLink, HeroIconHelperPipe],
  standalone: true,
  templateUrl: './layout-profile-menu.html',
  styleUrl: './layout-profile-menu.css'
})
export class LayoutProfileMenu {
  authenticationService = inject(AuthenticationService);
  router = inject(Router);

  profileOpen = signal<boolean>(false);

  username = 'John Doe';
  email = 'john@example.com';

  userInitials = () =>
    this.username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

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
