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

  ngOnInit(): void {}
}
