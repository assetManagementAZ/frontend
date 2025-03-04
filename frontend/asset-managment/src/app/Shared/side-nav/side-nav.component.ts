import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  Router,
} from '@angular/router';
import { ThemeService } from '../../Services/theme.service';
import { AuthService } from '../../Services/auth.service';
import { DataService } from '../../Services/data-service.service';

@Component({
  selector: 'as-side-nav',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, MatIconModule],
  providers: [ThemeService, AuthService, DataService],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})
export class SideNavComponent implements AfterViewInit {
  isDarkMode: boolean;
  userRole: string;
  userList: any[] = [];
  @ViewChild('sidebar', { static: false }) sidebar!: ElementRef; // Reference to sidebar
  @ViewChild('sidebarBtn', { static: false }) sidebarBtn!: ElementRef; // Reference to sidebar button
  constructor(
    private themeService: ThemeService,
    private authservice: AuthService,
    private dataService: DataService
  ) {
    this.isDarkMode = this.themeService.isDarkMode();
    this.userRole = this.authservice.getUserRole();
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }
  ngAfterViewInit() {
    this.sidebarFunc();
    this.profile();
    console.log(this.userList);
  }
  sidebarFunc(): void {
    const sidebar = this.sidebar.nativeElement;

    sidebar.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains('arrow') ||
        target.classList.contains('iocn-link')
      ) {
        const arrowParent = target.closest('.iocn-link')?.parentElement;
        if (arrowParent) {
          arrowParent.classList.toggle('showMenu');
        } else {
          console.error('Arrow parent not found');
        }
      }
    });

    if (this.sidebarBtn.nativeElement && this.sidebar.nativeElement) {
      this.sidebarBtn.nativeElement.addEventListener('click', () => {
        this.sidebar.nativeElement.classList.toggle('close');
      });
    }
  }
  profile(): void {
    const endpoint = 'user/profile/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.userList = response.body;
      }
    });
  }
  getUserRoleString(userRoleId: number): string {
    switch (userRoleId) {
      case 2:
        return 'پشتیبان';
      case 3:
        return 'کاربر عادی';
      default:
        return 'کاربر';
    }
  }
}
