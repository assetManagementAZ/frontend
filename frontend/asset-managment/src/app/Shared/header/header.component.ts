import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../Services/theme.service';
@Component({
  selector: 'as-header',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isDarkMode: boolean;
  authService = inject(AuthService);
  router = inject(Router);
  userRole: string;
  constructor(
    private authservice: AuthService,
    private themeService: ThemeService
  ) {
    this.isDarkMode = this.themeService.isDarkMode();
    this.userRole = this.authService.getUserRole();
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }
  log_out() {
    const refreshToken = this.authService.getRefreshToken();

    if (refreshToken) {
      this.authService
        .logout(refreshToken)
        .pipe(
          tap(() => {
            console.log('Logout initiated');
            this.router.navigate(['/login']);
            console.log('logout successful');
          }),
          catchError((error: any) => {
            console.error('Logout failed in header component:', error);
            // Navigate to login regardless of success or failure
            this.router.navigate(['/login']);
            // Return an empty Observable to satisfy the catchError requirement
            return throwError(() => error);
          })
        )
        .subscribe();
    } else {
      console.log('No refresh token available but log out anyway');
      this.router.navigate(['/login']);
    }
  }
}
