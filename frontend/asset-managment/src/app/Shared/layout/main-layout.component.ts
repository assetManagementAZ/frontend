import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SideNavComponent, CommonModule],
  template: `
    <div class="layout-container">
      <as-header></as-header>
      <div class="main-content">
        <as-side-nav></as-side-nav>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .main-content {
        display: flex;
        flex: 1;
        position: relative;
      }

      .content-wrapper {
        flex: 1;
        padding: 20px;
        margin-right: 80px;
        transition: margin-right 0.3s ease;
      }

      /* When side nav is closed */
      .sidebar.close ~ .content-wrapper {
        margin-right: 98px;
      }

      @media (max-width: 768px) {
        .content-wrapper {
          margin-right: 0;
          padding: 15px;
        }

        .sidebar.close ~ .content-wrapper {
          margin-right: 0;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {}
