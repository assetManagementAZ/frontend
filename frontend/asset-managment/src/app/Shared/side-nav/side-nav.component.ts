import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChild,
  inject,
  OnInit,
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
import { SideNavService } from '../../Services/side-nav.service';

@Component({
  selector: 'as-side-nav',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, MatIconModule],
  providers: [ThemeService, AuthService, DataService],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})
export class SideNavComponent implements AfterViewInit, OnInit {
  isDarkMode: boolean;
  userRole: string;
  userList: any[] = [];
  isVisible$ = this.sideNavService.isVisible$;
  isFormOpen$ = this.sideNavService.isFormOpen$;
  @ViewChild('sidebar', { static: false }) sidebar!: ElementRef;
  @ViewChild('sidebarBtn', { static: false }) sidebarBtn!: ElementRef;

  constructor(
    private themeService: ThemeService,
    private authservice: AuthService,
    private dataService: DataService,
    private sideNavService: SideNavService
  ) {
    this.isDarkMode = this.themeService.isDarkMode();
    this.userRole = this.authservice.getUserRole();
  }

  ngOnInit() {
    this.sideNavService.isVisible$.subscribe((isVisible) => {
      if (this.sidebar) {
        if (isVisible) {
          this.sidebar.nativeElement.classList.remove('close');
        } else {
          this.sidebar.nativeElement.classList.add('close');
        }
      }
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  ngAfterViewInit() {
    this.sidebarFunc();
    this.profile();
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
        }
      }
    });

    if (this.sidebarBtn.nativeElement && this.sidebar.nativeElement) {
      this.sidebarBtn.nativeElement.addEventListener('click', () => {
        this.sideNavService.toggle();
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
