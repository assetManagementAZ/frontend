import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SideNavComponent } from './Shared/side-nav/side-nav.component';
import { CommonModule } from '@angular/common'; // Add this import
@Component({
  selector: 'as-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'asset-managment';
  showSidebar: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = !this.router.url.includes('/login');
      }
    });
  }
}
