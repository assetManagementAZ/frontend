import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../Services/data-service.service';
import { HttpResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { tap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalsComponent } from '../../Shared/modals/modals.component';
import { RouterLink, RouterModule } from '@angular/router';
import moment from 'jalali-moment';

@Component({
  selector: 'as-op-system',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './op-system.component.html',
  styleUrl: './op-system.component.css',
})
export class OpSystemComponent implements OnInit {
  showOpForm = false;
  showOpTable = false;
  displayedColumns: string[] = [
    'operationsystemid',
    'operationsystemname',
    'operationsystemcreatetime',
    'operationsystemupdatetime',
    'actions',
    'delete',
  ];

  opDataSource!: MatTableDataSource<any>;
  originalData: any[] = [];
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // op form
  opForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  showMessage = false;
  isEditing = false;
  operationsystemid: any;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchOp();
    this.showOpTable = true;
    this.opForm = this.fb.group({
      operationsystemname: ['', Validators.required],
    });
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'مورد در هر صفحه';
  }

  toggleView(view: 'form' | 'table'): void {
    if (view === 'form') {
      this.isEditing = false;
      this.opForm.reset();
      this.showOpForm = true;
    } else if (view === 'table') {
      this.fetchOp();
    }

    this.showOpTable = true;
  }

  openOpForm(): void {
    this.showOpForm = true;
  }

  closeOpForm(): void {
    this.showOpForm = false;
    this.opForm.reset();
  }

  fetchOp(): void {
    const endpoint = 'asset/operation-system/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.originalData = response.body;
        this.opDataSource = new MatTableDataSource(response.body);
        this.opDataSource.paginator = this.paginator;
        this.opDataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'operationsystemid':
              return item.operationsystemid;
            case 'operationsystemname':
              return item.operationsystemname;
            default:
              return item[property];
          }
        };
        this.opDataSource.sort = this.sort;
      }
    });
  }

  convertDate(dateString: string): string {
    return moment(dateString, 'YYYY/MM/DD').locale('fa').format('YYYY/MM/DD');
  }

  onSubmitOpForm(): void {
    if (this.opForm.valid) {
      const formValue = this.opForm.value;

      let endpoint: string;
      let httpMethod: 'post' | 'put';
      if (this.isEditing) {
        endpoint = `asset/operation-system/${this.operationsystemid}/`;
        httpMethod = 'put';
      } else {
        endpoint = 'asset/operation-system/';
        httpMethod = 'post';
      }

      this.dataService[httpMethod](endpoint, formValue)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 201 || response.status === 200) {
                this.successMessage = this.isEditing
                  ? 'ویرایش سیستم عامل با موفقیت انجام شد '
                  : 'ایجاد سیستم عامل با موفقیت انجام شد ';
                this.errorMessage = '';
                this.closeOpForm();
                this.fetchOp();
                this.opForm.reset();
                if (this.isEditing) {
                  this.isEditing = false;
                }
              } else {
                this.errorMessage = this.isEditing
                  ? '.ویرایش سیستم عامل موفقیت آمیز نبود،لطفا دوباره امتحان کنید'
                  : '.ایجاد سیستم عامل موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
                this.successMessage = '';
              }
              this.showMessages();
            },
            error: (error) => {
              console.error('Error submitting form :', error);
              this.errorMessage =
                '.مشکلی در ارسال اطلاعات به وجود آمد ، لطفا دوباره امتحان کنید';
              this.successMessage = '';
              this.showMessages();
            },
          })
        )
        .subscribe();
    } else {
      this.errorMessage = '.لطفا همه فیلد ها را پر کنید';
      this.successMessage = '';
      this.showMessages();
    }
  }

  editOp(operationsystemid: number): void {
    this.isEditing = true;
    const endpoint = `asset/operation-system/${operationsystemid}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const opData = response.body;
        this.opForm.patchValue({
          operationsystemid: opData.operationsystemid,
          operationsystemname: opData.operationsystemname,
        });
        this.showOpForm = true;
        this.operationsystemid = opData.operationsystemid;
      }
    });
  }

  deleteOp(operationsystemid: number): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {
        message: 'آیا از حذف این سیستم عامل اطمینان دارید؟',
        operationsystemid: operationsystemid,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteOpConfirmed(operationsystemid);
      }
    });
  }

  deleteOpConfirmed(operationsystemid: number): void {
    const endpoint = `asset/operation-system/${operationsystemid}/`;
    this.dataService.delete(endpoint).subscribe((response: any) => {
      if (response.status === 204) {
        this.successMessage = 'حذف سیستم عامل با موفقیت انجام شد';
        this.errorMessage = '';
        this.fetchOp();
      } else {
        this.errorMessage =
          'حذف سیستم عامل موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
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

  applyFilters(): void {
    let filteredData = [...this.originalData];

    // Search by op system name
    if (this.searchTerm) {
      filteredData = filteredData.filter((op) =>
        op.operationsystemname
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    this.opDataSource = new MatTableDataSource(filteredData);
    this.opDataSource.paginator = this.paginator;
    this.opDataSource.sort = this.sort;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.opDataSource = new MatTableDataSource(this.originalData);
    this.opDataSource.paginator = this.paginator;
    this.opDataSource.sort = this.sort;
  }
}
