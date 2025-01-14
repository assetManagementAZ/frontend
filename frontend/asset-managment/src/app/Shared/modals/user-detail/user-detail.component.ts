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

@Component({
  selector: 'as-user-detail',
  standalone: true,
  imports: [
    HeaderComponent,
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
  // displayedColumns: string[] = [
  //   'userid',
  //   'userpersonalid',
  //   'username',
  //   'userlastname',
  //   'userphonenumber',
  //   'userlandlinephonenumber',
  //   'userroleid',
  //   'userspporter',
  //   'buildingname',
  //   'areaname',
  //   'userofficial',
  //   'roomnumber',
  //   'workActions',
  // ];
  userDataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  userList: any[] = [];
  showEditButton: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<UserDetailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      userid: number;
      showEditButton?: boolean;
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

    if (this.showEditButton) {
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

        this.userDataSource = new MatTableDataSource(this.filteredData);
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
  editWorkUser(userData: any): void {
    this.dialogRef.close(userData); // Close the dialog and send the user data
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
