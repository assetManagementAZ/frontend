import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { DataService } from '../../../Services/data-service.service';
import { Router, RouterModule } from '@angular/router';

interface SupporterDetail {
  userid: number;
  username: string;
  userlastname: string;
  userphonenumber: string;
  userlandlinephonenumber: string;
  userpersonalid: number;
  buildingname: string;
  availablefloor: number;
}

@Component({
  selector: 'as-supporter-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule, RouterModule],
  templateUrl: './supporter-detail.component.html',
  styleUrl: './supporter-detail.component.css',
})
export class SupporterDetailComponent implements OnInit {
  supporters: SupporterDetail[] = [];
  currentSupporterIndex: number = 0;
  totalSupporters: number = 0;
  loading = true;
  error: string | null = null;
  noDataAvailable = false;

  constructor(
    public dialogRef: MatDialogRef<SupporterDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userpersonalid: number },
    private dataService: DataService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSupporterDetails();
  }

  fetchSupporterDetails(): void {
    const endpoint = `accounts/supporter/`;
    this.dataService.get(endpoint).subscribe({
      next: (response: any) => {
        if (response && response.body) {
          const filteredSupporters = response.body.filter(
            (supporter: any) =>
              supporter.userpersonalid === this.data.userpersonalid
          );

          if (filteredSupporters.length === 0) {
            this.noDataAvailable = true;
          } else {
            this.supporters = filteredSupporters;
            this.totalSupporters = this.supporters.length;
          }
        } else {
          this.noDataAvailable = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching supporter details:', error);
        this.error = 'خطا در دریافت اطلاعات پشتیبان';
        this.loading = false;
      },
    });
  }

  get currentSupporter(): SupporterDetail | null {
    return this.supporters[this.currentSupporterIndex] || null;
  }

  nextSupporter(): void {
    if (this.currentSupporterIndex < this.totalSupporters - 1) {
      this.currentSupporterIndex++;
    }
  }

  previousSupporter(): void {
    if (this.currentSupporterIndex > 0) {
      this.currentSupporterIndex--;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  navigateToBuilding(buildingName: string): void {
    this.dialog.closeAll();
    this.router.navigate(['/buildings'], {
      queryParams: { search: buildingName },
    });
  }
}
