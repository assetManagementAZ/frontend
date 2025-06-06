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
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { ModalsComponent } from '../../Shared/modals/modals.component';
import { RouterLink, RouterModule } from '@angular/router';
import { PcUserComponent } from '../../Shared/modals/pc-user/pc-user.component';
import { UsersComputerDetailComponent } from '../../Shared/modals/users-computer-detail/users-computer-detail.component';
import { ComputerDetailComponent } from '../../Shared/modals/computer-detail/computer-detail.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'as-computer',
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
    NgSelectModule,
    FormsModule,
  ],
  templateUrl: './computer.component.html',
  styleUrl: './computer.component.css',
})
export class ComputerComponent implements OnInit {
  showComputerForm = false;
  showComputerTable = false;
  displayedColumns: string[] = [
    'computerpropertynumber',
    'computersealling',
    'viewDetail',
    'userPc',
    'viewUser',
    'actions',
    'delete',
  ];
  ComputerDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  originalData: any[] = [];
  searchTerm: string = '';
  osList: any[] = [];
  userList: any[] = [];
  buildingList: any[] = [];
  areaList: any[] = [];
  selectedOsVersions: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selectedOsId!: number;
  // Computer form
  computerForm!: FormGroup;
  userPcForm!: FormGroup;
  showUserPcForm = false;
  successMessage: string = '';
  errorMessage: string = '';
  showMessage = false;
  isEditing = false;
  computerpropertynumber: any;
  userPcid: any;
  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchComputer();
    this.fetchUserList();
    this.showComputerTable = true;
    this.computerForm = this.fb.group({
      computerpropertynumber: [
        '',
        [
          Validators.required,
          Validators.min(-2147483648),
          Validators.max(2147483647),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      computername: ['', [Validators.maxLength(255)]],
      computermodel: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(255),
        ],
      ],
      computerip: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(15),
          Validators.pattern(
            '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
          ),
        ],
      ],
      computermacaddress: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.pattern('^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'),
        ],
      ],
      computerispersonal: [
        '',
        [
          Validators.required,
          Validators.min(-2147483648),
          Validators.max(2147483647),
          Validators.pattern('^[0-1]$'),
        ],
      ],
      osName: ['', [Validators.required]],
      osVersionId: ['', [Validators.required]],
    });

    // Add validation listeners
    Object.keys(this.computerForm.controls).forEach((key) => {
      this.computerForm.get(key)?.valueChanges.subscribe(() => {
        this.validateField(key);
      });
    });

    this.computerForm.get('osName')?.valueChanges.subscribe((selectedOsId) => {
      this.onOsNameChange(selectedOsId);
    });

    this.fetchOsList();
    this.userPcForm = this.fb.group({
      ownerUserId: ['', Validators.required],
      areaId: ['', Validators.required],
      buildingId: ['', Validators.required],
    });
  }
  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'مورد در هر صفحه';
  }
  toggleView(view: 'form' | 'table'): void {
    if (view === 'form') {
      this.computerForm.reset();
      this.isEditing = false;
      this.showComputerForm = true;
    } else if (view === 'table') {
      this.fetchComputer();
    }

    this.showComputerTable = true;
  }

  openComputerForm(): void {
    this.isEditing = false;
    this.showComputerForm = true;
  }

  closeComputerForm(): void {
    this.computerForm.reset();
    this.showComputerForm = false;
  }
  fetchOsList(): void {
    const endpoint = 'asset/operation-system/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.osList = response.body;
      }
    });
  }

  fetchComputer(): void {
    const endpoint = 'asset/computer/';
    this.dataService.get(endpoint).subscribe({
      next: (response: any) => {
        if (response && response.body) {
          console.log(response.body);
          this.originalData = response.body;
          this.ComputerDataSource = new MatTableDataSource(response.body);
          this.ComputerDataSource.paginator = this.paginator;
          this.ComputerDataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'computerpropertynumber':
                return item.computerpropertynumber;
              case 'computername':
                return item.computername;
              case 'computermodel':
                return item.computermodel;
              case 'computerip':
                return item.computerip;
              case 'computermacaddress':
                return item.computermacaddress;
              case 'computerispersonal':
                return this.getPersonalStatus(item.computerispersonal);
              case 'osName':
                return item.operationsystemversionid.operationsystemname;
              case 'osVersionId':
                return item.operationsystemversionid.operationsystemversionname;
              default:
                return item[property];
            }
          };
          this.ComputerDataSource.sort = this.sort;
        }
      },
      error: (error) => {
        console.error('Error fetching computer data:', error);
        this.errorMessage = 'خطا در دریافت اطلاعات کامپیوترها';
        this.successMessage = '';
        this.showMessages();
      },
    });
  }

  getPersonalStatus(isPersonal: number): string {
    return isPersonal ? 'شخصی نیست' : 'شخصی است';
  }

  onSubmitComputerForm(): void {
    if (!this.computerForm.valid) {
      Object.keys(this.computerForm.controls).forEach((field) => {
        const control = this.computerForm.get(field);
        if (control?.invalid) {
          console.error(`${field} is invalid`);
          console.log(this.computerForm.value[field]);
        }
      });
    }
    if (this.computerForm.valid) {
      const formValue = this.computerForm.value;

      let endpoint: string;
      let httpMethod: 'post' | 'put';
      if (this.isEditing) {
        endpoint = `asset/computer/${this.computerpropertynumber}/`;
        httpMethod = 'put';
      } else {
        endpoint = 'asset/computer/';
        httpMethod = 'post';
      }

      // Prepare the data according to backend requirements
      const requestData = {
        computerpropertynumber: parseInt(formValue.computerpropertynumber, 10),
        computername: formValue.computername,
        computermodel: formValue.computermodel,
        computerip: formValue.computerip,
        computermacaddress: formValue.computermacaddress,
        computerispersonal: parseInt(formValue.computerispersonal, 10),
        osVersionId: parseInt(formValue.osVersionId, 10), // Changed from operationsystemversionid to osVersionId
      };

      this.dataService[httpMethod](endpoint, requestData)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 201 || response.status === 200) {
                this.successMessage = this.isEditing
                  ? 'ویرایش کامپیوتر با موفقیت انجام شد '
                  : 'ایجاد کامپیوتر با موفقیت انجام شد ';
                this.errorMessage = '';
                this.closeComputerForm();
                this.fetchComputer();
                this.computerForm.reset();
                this.showComputerForm = false;
                if (this.isEditing) {
                  this.computerForm.reset();
                  this.showComputerForm = false;
                  this.isEditing = false;
                }
              } else {
                this.errorMessage = this.isEditing
                  ? '.ویرایش کامپیوتر موفقیت آمیز نبود،لطفا دوباره امتحان کنید'
                  : '.ایجاد کامپیوتر موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
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
  editComputer(computerpropertynumber: number): void {
    this.isEditing = true;
    const endpoint = `asset/computer/${computerpropertynumber}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const computerData = response.body;
        this.computerForm.patchValue({
          computerpropertynumber: computerData.computerpropertynumber,
          computername: computerData.computername,
          computermodel: computerData.computermodel,
          computerip: computerData.computerip,
          computermacaddress: computerData.computermacaddress,
          computerispersonal: computerData.computerispersonal,
          osName: computerData.operationsystemversionid.operationsystemid,
          osVersionId:
            computerData.operationsystemversionid.operationsystemversionid,
        });
        this.computerForm
          .get('osName')
          ?.valueChanges.subscribe((selectedOsId) => {
            this.onOsNameChange(selectedOsId);
          });
        this.showComputerForm = true;
        this.computerpropertynumber = computerData.computerpropertynumber;
      }
    });
  }
  deleteComputer(computerpropertynumber: number): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {
        message: 'آیا از حذف این کامپیوتر اطمینان دارید؟',
        computerpropertynumber: computerpropertynumber,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteComputerConfirmed(computerpropertynumber);
      }
    });
  }
  deleteComputerConfirmed(computerpropertynumber: number): void {
    const endpoint = `asset/computer/${computerpropertynumber}/`; // Define your endpoint
    this.dataService.delete(endpoint).subscribe((response: any) => {
      if (response.status === 204) {
        this.successMessage = 'حذف کامپیوتر با موفقیت انجام شد';
        this.errorMessage = '';
        this.fetchComputer(); // Refresh the table after successful deletion
      } else {
        this.errorMessage =
          'حذف کامپیوتر موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
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
  onOsNameChange(selectedOsId: number): void {
    const selectedOs = this.osList.find(
      (os) => os.operationsystemid === selectedOsId
    );
    if (selectedOs && selectedOs.operationversions) {
      this.selectedOsVersions = selectedOs.operationversions;
    } else {
      this.selectedOsVersions = [];
    }
  }

  // updateOsVersions(osId: number): void {
  //   const selectedOs = this.osList.find((os) => os.operationsystemid === osId);
  //   if (selectedOs && selectedOs.operationversions) {
  //     this.selectedOsVersions = selectedOs.operationversions;
  //   } else {
  //     this.selectedOsVersions = [];
  //   }
  // }

  fetchUserList(): void {
    const endpoint = 'accounts/user/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        // Filter duplicates based on userpersonalid
        const filteredUsers = response.body.filter(
          (value: { userpersonalid: any }, index: any, self: any[]) =>
            self.findIndex(
              (v: { userpersonalid: any }) =>
                v.userpersonalid === value.userpersonalid
            ) === index
        );
        this.userList = filteredUsers;
      }
    });
  }
  fetchUserWorkingLocations(ownerUserId: number): void {
    const endpoint = `accounts/subbuser/detail/working/locations/${ownerUserId}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const workingLocations = response.body;
        workingLocations.forEach((location: any) => {
          this.fetchBuilding(location.buildingid);
          this.fetchArea(location.areaid);
        });
      }
    });
  }

  fetchBuilding(buildingId: number): void {
    const endpoint = `building/${buildingId}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (
        response &&
        response.body &&
        !this.buildingList.some(
          (b) => b.buildingid === response.body.buildingid
        )
      ) {
        this.buildingList.push(response.body);
      }
    });
  }
  fetchArea(areaId: number): void {
    const endpoint = `area/${areaId}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (
        response &&
        response.body &&
        !this.areaList.some((a) => a.areaid === response.body.areaid)
      ) {
        this.areaList.push(response.body);
      }
    });
  }
  openUserPcForm(
    computerpropertynumber: number,
    computerseallingnumber: any | null
  ): void {
    this.buildingList = [];
    this.areaList = [];
    if (computerseallingnumber === null) {
      this.errorMessage = ' شما اجازه تحویل کامپیوتر غیر پلمپ را ندارید';
      this.successMessage = '';
      this.showMessages();
    } else {
      this.showUserPcForm = true;
      this.userPcForm
        .get('ownerUserId')
        ?.valueChanges.subscribe((ownerUserId: number) => {
          if (ownerUserId) {
            this.buildingList = [];
            this.areaList = [];
            this.fetchUserWorkingLocations(ownerUserId);
          }
        });
      this.userPcid = computerpropertynumber;
    }
  }

  closeUserPcForm(): void {
    this.buildingList = [];
    this.areaList = [];
    this.userPcForm.reset();
    this.showUserPcForm = false;
    this.isEditing = false;
  }

  submitUserPc(): void {
    if (this.userPcForm.valid) {
      const formValue = this.userPcForm.value;

      formValue.ownerUserId = parseInt(formValue.ownerUserId, 10);
      formValue.areaId = parseInt(formValue.areaId, 10);
      formValue.buildingId = parseInt(formValue.buildingId, 10);

      let endpoint: string;
      let httpMethod: 'patch';
      endpoint = `asset/assign-computer-to-user/${this.userPcid}/`;
      httpMethod = 'patch';

      this.dataService[httpMethod](endpoint, formValue)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 200) {
                this.successMessage = ' تحویل  کامپیوتر با موفقیت انجام شد ';
                this.errorMessage = '';
                this.fetchComputer();
                this.userPcForm.reset();
                this.showUserPcForm = false;
              } else {
                this.errorMessage =
                  '. تحویل کامپیوتر موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
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

  viewUser(computerpropertynumber: number): void {
    const config: MatDialogConfig = {
      data: { computerpropertynumber: computerpropertynumber },
      // height: '55%',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PcUserComponent, config);

    dialogRef.afterClosed().subscribe((result) => {});
  }
  viewDetail(computerpropertynumber: number): void {
    const config: MatDialogConfig = {
      data: { computerpropertynumber },

      disableClose: true,
    };
    const dialogRef = this.dialog.open(ComputerDetailComponent, config);

    dialogRef.afterClosed().subscribe((result) => {});
  }
  applyFilters(): void {
    let filteredData = [...this.originalData];

    // Search by computer name or property number
    if (this.searchTerm) {
      filteredData = filteredData.filter((computer) => {
        // Convert property number to string for searching
        const propertyNumber =
          computer.computerpropertynumber?.toString() || '';
        const searchTerm = this.searchTerm.toLowerCase();

        // Check if property number starts with the search term
        const matchesPropertyNumber = propertyNumber.startsWith(searchTerm);

        // Check if computer name includes the search term
        const matchesName = computer.computername
          ?.toLowerCase()
          .includes(searchTerm);

        return matchesPropertyNumber || matchesName;
      });
    }

    this.ComputerDataSource = new MatTableDataSource(filteredData);
    this.ComputerDataSource.paginator = this.paginator;
    this.ComputerDataSource.sort = this.sort;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.ComputerDataSource = new MatTableDataSource(this.originalData);
    this.ComputerDataSource.paginator = this.paginator;
    this.ComputerDataSource.sort = this.sort;
  }

  validateField(fieldName: string): void {
    const control = this.computerForm.get(fieldName);
    if (control?.invalid && control?.touched) {
      switch (fieldName) {
        case 'computerpropertynumber':
          if (control.errors?.['required']) {
            this.errorMessage = 'شماره اموال الزامی است';
          } else if (control.errors?.['min'] || control.errors?.['max']) {
            this.errorMessage = 'شماره اموال باید جداکثر 9 رقم  باشد';
          } else if (control.errors?.['pattern']) {
            this.errorMessage = 'شماره اموال باید فقط شامل اعداد باشد';
          }
          break;
        case 'computername':
          if (control.errors?.['maxlength']) {
            this.errorMessage =
              'نام کامپیوتر نمی‌تواند بیشتر از 255 کاراکتر باشد';
          }
          break;
        case 'computermodel':
          if (control.errors?.['required']) {
            this.errorMessage = 'مدل کامپیوتر الزامی است';
          } else if (control.errors?.['minlength']) {
            this.errorMessage = 'مدل کامپیوتر نمی‌تواند خالی باشد';
          } else if (control.errors?.['maxlength']) {
            this.errorMessage =
              'مدل کامپیوتر نمی‌تواند بیشتر از 255 کاراکتر باشد';
          }
          break;
        case 'computerip':
          if (control.errors?.['required']) {
            this.errorMessage = 'آدرس آی پی الزامی است';
          } else if (control.errors?.['minlength']) {
            this.errorMessage = 'آدرس آی پی نمی‌تواند خالی باشد';
          } else if (control.errors?.['maxlength']) {
            this.errorMessage = 'آدرس آی پی نمی‌تواند بیشتر از 15 کاراکتر باشد';
          } else if (control.errors?.['pattern']) {
            this.errorMessage = 'فرمت آدرس آی پی نامعتبر است';
          }
          break;
        case 'computermacaddress':
          if (control.errors?.['required']) {
            this.errorMessage = 'آدرس مک الزامی است';
          } else if (control.errors?.['minlength']) {
            this.errorMessage = 'آدرس مک نمی‌تواند خالی باشد';
          } else if (control.errors?.['pattern']) {
            this.errorMessage = 'فرمت مک آدرس نامعتبر است';
          }
          break;
        case 'computerispersonal':
          if (control.errors?.['required']) {
            this.errorMessage = 'وضعیت مالکیت الزامی است';
          } else if (control.errors?.['min'] || control.errors?.['max']) {
            this.errorMessage = '';
          }
          break;
        case 'osName':
          if (control.errors?.['required']) {
            this.errorMessage = 'سیستم عامل الزامی است';
          }
          break;
        case 'osVersionId':
          if (control.errors?.['required']) {
            this.errorMessage = 'نسخه سیستم عامل الزامی است';
          }
          break;
      }
      this.showMessages();
    }
  }
}
