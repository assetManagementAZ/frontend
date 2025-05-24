import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DataService } from '../Services/data-service.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'as-panel',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent implements OnInit {
  router = inject(Router);
  role: string;
  userRole: string;
  activeUsersCount: number = 0;
  totalUsersCount: number = 0;
  userCountChange: number = 0;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
    this.role = '';
    if (this.userRole == 'admin') {
      this.role = 'ادمین';
    } else if (this.userRole == 'supporter') {
      this.role = 'پشتیبان';
    } else if (this.userRole == 'user') {
      this.role = 'کاربر عادی';
    }
  }

  ngOnInit(): void {
    this.fetchUserStatistics();
  }

  fetchUserStatistics(): void {
    const endpoint = 'accounts/user/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        // Filter out duplicates based on userpersonalid
        const uniqueUsers = response.body.filter(
          (value: { userpersonalid: any }, index: any, self: any[]) =>
            self.findIndex(
              (v: { userpersonalid: any }) =>
                v.userpersonalid === value.userpersonalid
            ) === index
        );

        this.totalUsersCount = uniqueUsers.length;
        this.activeUsersCount = uniqueUsers.filter(
          (user: any) => user.is_active === 1
        ).length;

        // Calculate percentage change (mock data for now)
        // In a real application, you would compare with previous month's data
        this.userCountChange = 12; // This should be calculated based on actual data
      }
    });
  }
}
