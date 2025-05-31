import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../Services/data-service.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { tap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalsComponent } from '../../Shared/modals/modals.component';
import { RouterLink, RouterModule } from '@angular/router';
import moment from 'jalali-moment';
import { NgSelectModule } from '@ng-select/ng-select';
import { SupporterBuildingComponent } from '../../Shared/modals/supporter-building/supporter-building.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    RouterModule,
    NgSelectModule,
    FormsModule,
  ],
  templateUrl: './buildings.component.html',
  styleUrl: './buildings.component.css',
})
export class BuildingsComponent implements OnInit {
  showBuildingForm = false;
  showBuildingsTable = false;
  chooseSupporterForm!: FormGroup;
  showChooseSupporterForm = false;
  displayedColumns: string[] = [
    'buildingname',
    'buildingabbrivationname',
    'buildingfloorcount',
    'buildingroomcount',
    'buildingcreatetime',
    'buildingupdatetime',
    'actions',
    'delete',
    'selectSupporter',
    'supporterDetails',
  ];
  buildingsDataSource!: MatTableDataSource<any>;
  searchTerm: string = '';
  selectedFloorCount: string = '';
  floorCountOptions: number[] = [];
  filteredBuildingsDataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Building form
  buildingForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  showMessage = false;
  isEditing = false;
  buildingId: any;
  userList: any[] = [];
  floorOptions: number[] = [];
  supporterList: any[] = [];
  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {} // Inject DataService and FormBuilder

  ngOnInit(): void {
    this.fetchBuildings();
    this.fetchUsers();
    this.showBuildingsTable = true;
    this.buildingForm = this.fb.group({
      buildingname: ['', [Validators.required, Validators.minLength(4)]],
      buildingabbrivationname: [
        '',
        [Validators.required, Validators.minLength(2)],
      ],
      buildingfloorcount: ['', [Validators.required, Validators.min(1)]],
      buildingroomcount: ['', [Validators.required, Validators.min(1)]],
    });

    this.chooseSupporterForm = this.fb.group({
      userpersonalid: ['', Validators.required],
      buildingid: ['', Validators.required],
      floor: ['all', Validators.required],
    });
  }
  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'مورد در هر صفحه';
  }
  toggleView(view: 'form' | 'table'): void {
    if (view === 'form') {
      this.isEditing = false;
      this.buildingForm.reset();
      this.showBuildingForm = true;
    } else if (view === 'table') {
      this.fetchBuildings();
    }

    this.showBuildingsTable = true;
  }

  openBuildingForm(): void {
    this.showBuildingForm = true;
  }

  closeBuildingForm(): void {
    this.showBuildingForm = false;
    this.buildingForm.reset();
  }

  fetchBuildings(): void {
    const endpoint = 'building/create/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.buildingsDataSource = new MatTableDataSource(response.body);
        this.filteredBuildingsDataSource = new MatTableDataSource(
          response.body
        );
        this.filteredBuildingsDataSource.paginator = this.paginator;
        this.filteredBuildingsDataSource.sortingDataAccessor = (
          item,
          property
        ) => {
          switch (property) {
            case 'buildingid':
              return item.buildingid;
            case 'buildingname':
              return item.buildingname;
            case 'buildingabbrivationname':
              return item.buildingabbrivationname;
            case 'buildingfloorcount':
              return item.buildingfloorcount;
            case 'buildingroomcount':
              return item.buildingroomcount;
            default:
              return item[property];
          }
        };
        this.filteredBuildingsDataSource.sort = this.sort;

        // Generate floor count options
        const floorCounts = new Set(
          response.body.map((building: any) => building.buildingfloorcount)
        );
        this.floorCountOptions = Array.from(floorCounts)
          .map((count) => Number(count))
          .sort((a, b) => a - b);
      }
    });
  }
  convertDate(dateString: string): string {
    return moment(dateString, 'YYYY/MM/DD').locale('fa').format('YYYY/MM/DD');
  }
  onSubmitBuildingForm(): void {
    if (this.buildingForm.valid) {
      const formValue = this.buildingForm.value;

      // Only include fields that have values
      const payload: any = {};
      if (formValue.buildingname) payload.buildingname = formValue.buildingname;
      if (formValue.buildingabbrivationname)
        payload.buildingabbrivationname = formValue.buildingabbrivationname;
      if (formValue.buildingfloorcount)
        payload.buildingfloorcount = parseInt(formValue.buildingfloorcount, 10);
      if (formValue.buildingroomcount)
        payload.buildingroomcount = parseInt(formValue.buildingroomcount, 10);

      let endpoint: string;
      let httpMethod: 'post' | 'put';
      if (this.isEditing) {
        endpoint = `building/${this.buildingId}/`;
        httpMethod = 'put';
      } else {
        endpoint = 'building/create/';
        httpMethod = 'post';
      }

      this.dataService[httpMethod](endpoint, payload)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 201 || response.status === 200) {
                this.successMessage = this.isEditing
                  ? 'ویرایش ساختمان با موفقیت انجام شد'
                  : 'ایجاد ساختمان با موفقیت انجام شد';
                this.errorMessage = '';
                this.fetchBuildings();
                this.buildingForm.reset();
                this.showBuildingForm = false;
                if (this.isEditing) {
                  this.isEditing = false;
                  this.buildingId = null;
                }
              } else {
                this.errorMessage = this.isEditing
                  ? 'ویرایش ساختمان موفقیت آمیز نبود، لطفا دوباره امتحان کنید'
                  : 'ایجاد ساختمان موفقیت آمیز نبود، لطفا دوباره امتحان کنید';
                this.successMessage = '';
              }
              this.showMessages();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error submitting form:', error);
              this.errorMessage =
                error.error['non_field_errors'] ||
                (this.isEditing
                  ? 'خطا در ویرایش ساختمان'
                  : 'خطا در ایجاد ساختمان');
              this.successMessage = '';
              this.showMessages();
            },
          })
        )
        .subscribe();
    } else {
      this.errorMessage = 'لطفا فیلدهای الزامی را پر کنید';
      this.successMessage = '';
      this.showMessages();
    }
  }
  editBuilding(buildingId: number): void {
    this.isEditing = true;
    this.buildingId = buildingId;
    const endpoint = `building/${buildingId}/`;
    this.dataService.get(endpoint).subscribe({
      next: (response: any) => {
        if (response && response.body) {
          const buildingData = response.body;
          // Only patch the fields that exist in the response
          const formData: any = {};
          if (buildingData.buildingname)
            formData.buildingname = buildingData.buildingname;
          if (buildingData.buildingabbrivationname)
            formData.buildingabbrivationname =
              buildingData.buildingabbrivationname;
          if (buildingData.buildingfloorcount)
            formData.buildingfloorcount = buildingData.buildingfloorcount;
          if (buildingData.buildingroomcount)
            formData.buildingroomcount = buildingData.buildingroomcount;

          this.buildingForm.patchValue(formData);
          this.showBuildingForm = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'خطا در دریافت اطلاعات ساختمان';
        this.successMessage = '';
        this.showMessages();
      },
    });
  }
  deleteBuilding(buildingId: number): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {
        message: 'آیا از حذف این ساختمان اطمینان دارید؟',
        itemName: this.buildingsDataSource.data.find(
          (b) => b.buildingid === buildingId
        )?.buildingname,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteBuildingConfirmed(buildingId);
      }
    });
  }
  deleteBuildingConfirmed(buildingId: number): void {
    const endpoint = `building/${buildingId}/`;
    this.dataService.delete(endpoint).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.status === 200) {
          this.successMessage = 'حذف ساختمان با موفقیت انجام شد';
          this.errorMessage = '';
          this.fetchBuildings(); // Refresh the table after successful deletion
        } else {
          this.errorMessage =
            'حذف ساختمان موفقیت آمیز نبود، لطفا دوباره امتحان کنید';
          this.successMessage = '';
        }
        this.showMessages();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting building:', error);
        this.errorMessage =
          error.error['non_field_errors'] || 'خطا در حذف ساختمان';
        this.successMessage = '';
        this.showMessages();
      },
    });
  }
  showMessages(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000); // Hide message after 1minute
  }
  fetchUsers(): void {
    const endpoint = 'accounts/user/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const filteredUser = response.body.filter(
          (user: any) => user.userroleid === 2
        );
        // Filter duplicates based on userpersonalid
        const filteredUsers = filteredUser.filter(
          (value: { userpersonalid: any }, index: any, self: any[]) =>
            self.findIndex(
              (v: { userpersonalid: any }) =>
                v.userpersonalid === value.userpersonalid
            ) === index
        );
        this.userList.push(filteredUsers);
      }
    });
  }
  fetchFloorOptions(buildingId: number): void {
    const buildingData = this.buildingsDataSource.data.find(
      (building: any) => building.buildingid === buildingId
    );
    if (buildingData) {
      const floorCount = buildingData.buildingfloorcount;

      this.floorOptions = Array.from({ length: floorCount }, (_, i) => i + 1);
    }
  }
  openChooseSupporterForm(buildingid: any): void {
    // First check if any floor has a supporter
    const endpoint = 'accounts/supporter/';
    this.dataService.get(endpoint).subscribe({
      next: (response: any) => {
        if (response && response.body) {
          // Get the building name from the buildings data
          const building = this.buildingsDataSource.data.find(
            (b: any) => b.buildingid === buildingid
          );

          if (!building) {
            this.errorMessage = 'خطا در یافتن اطلاعات ساختمان';
            this.successMessage = '';
            this.showMessages();
            return;
          }

          const buildingSupporters = response.body.filter(
            (supporter: any) => supporter.buildingname === building.buildingname
          );

          if (buildingSupporters.length > 0) {
            this.errorMessage = 'از قسمت جزئیات پشتیبانان استفاده کنید';
            this.successMessage = '';
            this.showMessages();
          } else {
            // Only open the form if no supporters exist
            this.fetchFloorOptions(buildingid);
            this.chooseSupporterForm.patchValue({
              buildingid: buildingid,
            });
            this.showChooseSupporterForm = true;
          }
        }
      },
      error: (error) => {
        console.error('Error checking supporters:', error);
        this.errorMessage = 'خطا در بررسی وضعیت پشتیبانان';
        this.successMessage = '';
        this.showMessages();
      },
    });
  }
  closeChooseSupporterForm(): void {
    this.chooseSupporterForm.reset();
    this.showChooseSupporterForm = false;
  }

  fetchSupporter(): void {
    // Fetch supporter list from API
    const endpoint = 'accounts/supporter/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.supporterList = response.body;
      }
    });
  }
  onSubmitChooseSupporter(): void {
    if (this.chooseSupporterForm.valid) {
      const formValue = this.chooseSupporterForm.value;
      formValue.userpersonalid = parseInt(formValue.userpersonalid, 10);
      formValue.buildingid = parseInt(formValue.buildingid, 10);

      // Send API request with 'all' as floor
      const apiPayload = { ...formValue, floor: 'all' };
      this.sendSupporterSelectionToApi(apiPayload);
      this.closeChooseSupporterForm();
    } else {
      this.errorMessage = '.لطفا همه فیلد ها را پر کنید';
      this.successMessage = '';
      this.showMessages();
    }
  }
  sendSupporterSelectionToApi(payload: any): void {
    const endpoint = 'accounts/supporter/';

    this.dataService.post(endpoint, payload).subscribe(
      (response: any) => {
        if (response.status === 201) {
          this.successMessage = 'انتخاب پشتیبان با موفقیت انجام شد';
          this.errorMessage = '';
        } else {
          this.errorMessage = 'عملیات موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
          this.successMessage = '';
        }
        this.showMessages();
      },
      (error: HttpErrorResponse) => {
        console.error(
          'Error submitting first step:',
          error.error['non_field_errors']
        );
        this.errorMessage = error.error['non_field_errors'];
        this.successMessage = '';
        this.showMessages();
      }
    );
  }
  applyFilters(): void {
    let filteredData = [...this.buildingsDataSource.data];

    // Search by building name
    if (this.searchTerm) {
      filteredData = filteredData.filter(
        (building) =>
          building.buildingname
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          building.buildingabbrivationname
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by floor count
    if (this.selectedFloorCount) {
      filteredData = filteredData.filter(
        (building) =>
          building.buildingfloorcount.toString() === this.selectedFloorCount
      );
    }

    this.filteredBuildingsDataSource = new MatTableDataSource(filteredData);
    this.filteredBuildingsDataSource.paginator = this.paginator;
    this.filteredBuildingsDataSource.sort = this.sort;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedFloorCount = '';
    this.filteredBuildingsDataSource = this.buildingsDataSource;
    this.filteredBuildingsDataSource.paginator = this.paginator;
    this.filteredBuildingsDataSource.sort = this.sort;
  }

  openSupporterDetails(buildingId: number, buildingName: string): void {
    const dialogRef = this.dialog.open(SupporterBuildingComponent, {
      width: '800px',
      data: { buildingId, buildingName },
    });
  }
}
