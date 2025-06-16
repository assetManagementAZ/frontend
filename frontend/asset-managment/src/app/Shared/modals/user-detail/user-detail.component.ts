import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../Shared/header/header.component';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../../Services/data-service.service';
import { HttpResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { tap } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ModalsComponent } from '../../../Shared/modals/modals.component';
import { RouterLink, RouterModule } from '@angular/router';
import { PcUserComponent } from '../../../Shared/modals/pc-user/pc-user.component';
import { MatIconModule } from '@angular/material/icon';
import { SupporterDetailComponent } from '../supporter-detail/supporter-detail.component';

interface User {
  userid: number;
  userpersonalid: number;
  username: string;
  userlastname: string;
  userphonenumber: string;
  userlandlinephonenumber: string;
  userroleid: number;
  usersupportid: number;
  areaname: string;
  buildingname: string;
  userofficial: string;
  roomnumber: string;
}

@Component({
  selector: 'as-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit {
  filteredData: any[] = [];
  displayedColumns: string[] = [];
  userDataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  userList: any[] = [];
  showEditButton: boolean = false;
  user: User | null = null;
  currentWorkDetailIndex: number = 0;
  totalWorkDetails: number = 0;
  successMessage: string = '';
  errorMessage: string = '';
  showMessage: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserDetailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      userid: number;
      showEditButton?: boolean;
      hideButtons?: boolean;
      computerpropertynumber?: number;
    },
    private dataservice: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.showEditButton = this.data.showEditButton ?? false;
    this.setupDisplayedColumns();
    this.getDetail();
  }

  setupDisplayedColumns(): void {
    this.displayedColumns = [
      'userid',
      'userpersonalid',
      'username',
      'userlastname',
      'userphonenumber',
      'userlandlinephonenumber',
      'userroleid',
      'userspporter',
      'areaname',
      'buildingname',
      'userofficial',
      'roomnumber',
    ];

    if (this.showEditButton && !this.data.hideButtons) {
      this.displayedColumns.push('workActions');
    }
  }

  getDetail(): void {
    const endpoint = `accounts/user/`;
    this.dataservice.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.filteredData = response.body.filter(
          (item: any) => item.userid === this.data.userid
        );
        this.totalWorkDetails = this.filteredData.length;
        this.updateCurrentWorkDetail();
        this.userDataSource = new MatTableDataSource(this.filteredData);
      }
    });
  }

  updateCurrentWorkDetail(): void {
    if (this.filteredData.length > 0) {
      this.user = this.filteredData[this.currentWorkDetailIndex] || null;
    }
  }

  nextWorkDetail(): void {
    if (this.currentWorkDetailIndex < this.totalWorkDetails - 1) {
      this.currentWorkDetailIndex++;
      this.updateCurrentWorkDetail();
    }
  }

  previousWorkDetail(): void {
    if (this.currentWorkDetailIndex > 0) {
      this.currentWorkDetailIndex--;
      this.updateCurrentWorkDetail();
    }
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

  viewSupporterDetails(supporterId: number): void {
    if (supporterId) {
      const endpoint = `accounts/supporter/`;
      this.dataservice.get(endpoint).subscribe({
        next: (response: any) => {
          if (response && response.body) {
            const supporter = response.body.find(
              (item: any) => item.userid === supporterId
            );
            this.dialog.open(SupporterDetailComponent, {
              width: '80%',
              data: {
                userpersonalid: supporter?.userpersonalid || supporterId,
              },
              disableClose: true,
            });
          } else {
            this.dialog.open(SupporterDetailComponent, {
              width: '80%',
              data: { userpersonalid: supporterId },
              disableClose: true,
            });
          }
        },
        error: (error) => {
          console.error('Error fetching supporter details:', error);
          this.dialog.open(SupporterDetailComponent, {
            width: '80%',
            data: { userpersonalid: supporterId },
            disableClose: true,
          });
        },
      });
    }
  }

  editWorkUser(userData: any): void {
    this.dialogRef.close(userData);
  }

  editUser(userData: any): void {
    this.dialogRef.close({ type: 'editUser', data: userData });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  deleteOwner(): void {
    if (!this.data.computerpropertynumber) return;

    const dialogRef = this.dialog.open(ModalsComponent, {});

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'delete') {
        this.deleteOwnerConfirmed();
      }
    });
  }

  deleteOwnerConfirmed(): void {
    if (!this.data.computerpropertynumber) return;

    const endpoint = `asset/assign-computer-to-user/${this.data.computerpropertynumber}/`;
    this.dataservice.delete(endpoint).subscribe((response: any) => {
      if (response.status === 204) {
        this.successMessage = 'حذف مالک با موفقیت انجام شد';
        this.errorMessage = '';
        this.dialogRef.close(true);
      } else {
        this.errorMessage = 'حذف مالک موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
        this.successMessage = '';
      }
      this.showMessages();
    });
  }

  showMessages(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
}
