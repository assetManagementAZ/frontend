import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DataService } from '../../Services/data-service.service';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { FormsModule } from '@angular/forms';

import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { first, tap } from 'rxjs';
import { RouterLink, RouterModule } from '@angular/router';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { UserDetailComponent } from '../../Shared/modals/user-detail/user-detail.component';
import { UsersPropertyComponent } from '../../Shared/modals/users-property/users-property.component';
import { HttpErrorResponse } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from '@angular/material/tooltip';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExportExcelComponent } from '../../Shared/modals/export-excel/export-excel.component';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 700,
  hideDelay: 0,
  touchendHideDelay: 1000,
};

function mobileNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    if (value.length !== 11 || !value.startsWith('09')) {
      return { invalidMobile: true };
    }
    return null;
  };
}

function landlineNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    if (value.length !== 11 || !value.startsWith('0')) {
      return { invalidLandline: true };
    }
    return null;
  };
}

@Component({
  selector: 'as-users',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatPaginatorModule,

    CommonModule,
    RouterLink,
    RouterModule,
    NgSelectModule,
    MatTooltipModule,
    FormsModule,
  ],
  providers: [
    provideAnimations(),
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults },
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  currentStep: number = 1;
  changePasswordForm!: FormGroup;
  showChangePasswordForm = false;
  isSupporter = false;
  ifSupporter = false;
  isAdmin = false;
  isEditing = false;
  supporter_id = '';
  submittedSupporterId: any;
  editingUserRoleid: any;
  UserPersonalId!: any;
  private fetchedBuildings: Set<number> = new Set();
  private fetchedAreas: Set<number> = new Set();
  firstStepForm!: FormGroup;
  editingProfileForm!: FormGroup;
  secondStepForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  showMessage = false;
  showUsersForm = false;
  showUsersTable = false;
  showMultiStepForm = false;
  buildingList: any[] = [];
  areaList: any[] = [];
  selectedRole: string = '';
  isActive: string = '';
  searchTerm: string = '';
  displayedColumns: string[] = [
    'rowNumber',
    'userid',
    'user',
    'is_active',
    'viewDetail',
    'viewProperty',
    'toggle',
    'userpass',
    'actions',
    // 'workActions',
  ];

  usersDataSource!: MatTableDataSource<any>;
  filteredUsersDataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}
  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'مورد در هر صفحه';
  }
  ngOnInit(): void {
    this.userAuth();
    this.DisplayedColumns();
    this.fetchUsers();
    this.showUsersTable = true;
    this.showUsersForm = false;
    this.firstStepForm = this.fb.group({
      userpersonalid: ['', Validators.required],
      username: ['', Validators.required],
      userlastname: ['', Validators.required],
      userphonenumber: ['', [Validators.required, mobileNumberValidator()]],
      userlandlinephonenumber: ['', landlineNumberValidator()],
      userroleid: [''],
      supporterid: [''],
    });

    // Subscribe to mobile number changes
    this.firstStepForm
      .get('userphonenumber')
      ?.valueChanges.subscribe((value) => {
        if (value && (value.length !== 11 || !value.startsWith('09'))) {
          this.errorMessage = 'شماره موبایل باید 11 رقم بوده و با 09 شروع شود';
          this.successMessage = '';
          this.showMessages();
        }
      });

    // Subscribe to landline number changes
    this.firstStepForm
      .get('userlandlinephonenumber')
      ?.valueChanges.subscribe((value) => {
        if (value && (value.length !== 11 || !value.startsWith('0'))) {
          this.errorMessage =
            'شماره تلفن ثابت باید 11 رقم بوده و با 0 شروع شود';
          this.successMessage = '';
          this.showMessages();
        }
      });

    this.secondStepForm = this.fb.group({
      userpersonalid: [''],
      areaId: ['', Validators.required],
      buildingId: ['', Validators.required],
      userofficial: ['', Validators.required],
      roomnumber: ['', Validators.required],
    });
    this.firstStepForm.get('userroleid')?.valueChanges.subscribe((value) => {
      this.ifSupporter = value === '2';
    });
    this.changePasswordForm = this.fb.group({
      userpersonalid: ['', Validators.required],
      new_password: ['', Validators.required],
    });
  }
  DisplayedColumns(): void {
    if (!this.isAdmin) {
      this.displayedColumns.splice(11, 2);
      // this.displayedColumns.splice(6, 1);
    } else {
      this.displayedColumns;
    }
  }
  handleUserRoleChange(role: number): void {
    if (role === 2) {
      this.fetchBuildingList();
      this.fetchAreaList();
    } else {
      this.findSupporterID(this.UserPersonalId);
      const supporterID = this.findSupporterID(this.UserPersonalId);
      if (supporterID !== null) {
        this.ftchSubUsersBuildingArea(supporterID);
      }
    }
  }
  handleUserRoleChangeOnCreate(role: number): void {
    if (role === 2) {
      this.fetchBuildingList();
      this.fetchAreaList();
    } else {
      if (this.UserPersonalId !== null) {
        this.ftchSubUsersBuildingArea(this.UserPersonalId);
      }
    }
  }
  ftchSubUsersBuildingArea(supporterId: number) {
    this.ngOnDestroy();
    const endpoint = `accounts/subbuser/detail/working/locations/${supporterId}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const workingLocations = response.body;

        workingLocations.forEach((location: any) => {
          const buildingId = location.buildingid;
          const areaId = location.areaid;

          if (!this.fetchedBuildings.has(buildingId)) {
            this.fetchBuilding(buildingId);
            this.fetchedBuildings.add(buildingId);
          }

          if (!this.fetchedAreas.has(areaId)) {
            this.fetchArea(areaId);
            this.fetchedAreas.add(areaId);
          }
        });
      }
    });
  }
  ngOnDestroy() {
    this.fetchedBuildings.clear();
    this.fetchedAreas.clear();
  }

  toggleView(view: 'form' | 'table'): void {
    if (view === 'form') {
      this.showUsersForm = true;
      this.currentStep = 1;
      this.firstStepForm.reset();
      this.secondStepForm.reset();
    } else if (view === 'table') {
      this.fetchUsers();
    }
    this.showUsersTable = true;
  }

  submitUserData(userData: any): void {
    const endpoint = 'accounts/user/';
    this.dataService.post(endpoint, userData).subscribe({
      next: (response: any) => {
        this.successMessage = 'کاربر با موفقیت ایجاد شد';
        this.showMessage = true;
        setTimeout(() => {
          this.showMessage = false;
        }, 3000);
        this.fetchUsers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'خطا در ایجاد کاربر';
        this.showMessage = true;
        setTimeout(() => {
          this.showMessage = false;
        }, 3000);
      },
    });
  }

  openUsersForm(): void {
    this.showUsersForm = true;
  }

  closeUsersForm(): void {
    this.firstStepForm.reset();
    this.secondStepForm.reset();
    this.showUsersForm = false;
    this.currentStep = 1;
    this.ngOnDestroy();
  }
  fetchUsers(): void {
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

        this.usersDataSource = new MatTableDataSource(filteredUsers);
        this.filteredUsersDataSource = new MatTableDataSource(filteredUsers);
        this.filteredUsersDataSource.paginator = this.paginator;
        this.usersDataSource.paginator = this.paginator;
        this.usersDataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'userid':
              return item.userid;
            case 'userpersonalid':
              return item.userpersonalid;
            case 'user':
              return item.username;
            default:
              return item[property];
          }
        };
        this.usersDataSource.sort = this.sort;
      }
    });
  }

  onSubmitFirstStep(): void {
    if (!this.firstStepForm.valid) {
      Object.keys(this.firstStepForm.controls).forEach((field) => {
        const control = this.firstStepForm.get(field);
        if (control?.invalid) {
          console.error(`${field} is invalid`);
          console.log(this.firstStepForm.value[field]);
        }
      });
    }

    if (this.firstStepForm.valid) {
      const formValue = this.firstStepForm.value;

      let endpoint: string;
      let httpMethod: 'post' | 'put';
      let formData: any;

      if (this.isEditing) {
        endpoint = `accounts/change/subuser/profile/`;
        httpMethod = 'put';

        // For editing mode, match exactly with ChangeSubUserInfoSerializer
        formData = {
          userpersonalid: parseInt(formValue.userpersonalid, 10),
          username: formValue.username || undefined,
          userlastname: formValue.userlastname || undefined,
          userphonenumber: formValue.userphonenumber || undefined,
          userlandlinephonenumber:
            formValue.userlandlinephonenumber || undefined,
        };

        // Remove undefined values to match serializer's optional fields
        formData = Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== undefined)
        );
      } else {
        endpoint = 'accounts/user/';
        httpMethod = 'post';

        // For creation mode, keep existing logic
        formData = {
          userpersonalid: parseInt(formValue.userpersonalid, 10),
          username: formValue.username,
          userlastname: formValue.userlastname,
          userphonenumber: formValue.userphonenumber,
          userlandlinephonenumber: formValue.userlandlinephonenumber,
          userroleid: parseInt(formValue.userroleid, 10),
          supporterid: formValue.supporterid
            ? parseInt(formValue.supporterid, 10)
            : undefined,
        };

        // Filter out empty values for creation
        formData = Object.fromEntries(
          Object.entries(formData)
            .map(([key, value]) => [key, value ?? ''])
            .filter(([key, value]) => {
              return (
                !(key === 'userroleid' || key === 'supporterid') || value !== ''
              );
            })
        );
      }

      this.dataService[httpMethod](endpoint, formData)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 201) {
                this.successMessage = 'مرحله اول با موفقیت انجام شد ';
                this.errorMessage = '';
                this.currentStep = 2;
                this.secondStepForm.patchValue({
                  userpersonalid: formValue.userpersonalid,
                });
                // Capture userroleid and supporterid after submission
                const submittedUserRoleid = parseInt(formValue.userroleid, 10);
                this.submittedSupporterId = formValue.supporterid
                  ? parseInt(formValue.supporterid, 10)
                  : null;
                if (this.isAdmin) {
                  this.UserPersonalId = this.submittedSupporterId;
                  this.handleUserRoleChangeOnCreate(submittedUserRoleid);
                } else if (this.isSupporter) {
                  this.fetchUserWorkingLocations();
                  this.firstStepForm.patchValue({
                    supporterid: this.supporter_id,
                  });
                }

                this.firstStepForm.reset();
              } else if (response.status === 200) {
                this.successMessage = 'ویرایش حساب کاربر با موفقیت انجام شد ';
                this.errorMessage = '';
                this.showUsersForm = false;
                this.isEditing = false;
                this.firstStepForm.reset();
                this.fetchUsers();
              } else {
                this.errorMessage =
                  '.عملیات موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
                this.successMessage = '';
              }

              this.showMessages();
            },

            error: (error: HttpErrorResponse) => {
              console.error(
                'Error submitting first step:',
                error.error['non_field_errors']
              );

              switch (true) {
                case formValue.userroleid === 3 &&
                  (formValue.supporterid == null ||
                    formValue.supporterid.trim() === ''):
                  this.errorMessage =
                    ' .هنگام ایجاد کاربر عادی ، باید کد پشتیبان مربوطه را وارد نمایید';
                  break;
                case formValue.userroleid === null:
                  this.errorMessage = ' سطح کاربری را انتخاب کنید';
                  break;
                default:
                  this.errorMessage = error.error['non_field_errors'];
              }

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

  onSubmitSecondStep(): void {
    if (!this.secondStepForm.valid) {
      Object.keys(this.secondStepForm.controls).forEach((field) => {
        const control = this.secondStepForm.get(field);
        if (control?.invalid) {
          console.error(`${field} is invalid`);
          console.log(this.secondStepForm.value[field]);
        }
      });
    }
    if (this.secondStepForm.valid) {
      const secondFormValue = this.secondStepForm.value;

      let endpoint: string;
      let httpMethod: 'post' | 'put';
      let formData: any;

      if (this.isEditing) {
        endpoint = `accounts/user/working/locations/`;
        httpMethod = 'put';

        formData = {
          userpersonalid: parseInt(secondFormValue.userpersonalid, 10),
          areaId: secondFormValue.areaId
            ? parseInt(secondFormValue.areaId, 10)
            : undefined,
          buildingId: secondFormValue.buildingId
            ? parseInt(secondFormValue.buildingId, 10)
            : undefined,
          userofficial: secondFormValue.userofficial || undefined,
          roomnumber: secondFormValue.roomnumber
            ? parseInt(secondFormValue.roomnumber, 10)
            : undefined,
        };

        formData = Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== undefined)
        );
      } else {
        endpoint = 'accounts/user/working/locations/';
        httpMethod = 'post';

        formData = {
          userpersonalid: parseInt(secondFormValue.userpersonalid, 10),
          areaId: parseInt(secondFormValue.areaId, 10),
          buildingId: parseInt(secondFormValue.buildingId, 10),
          userofficial: secondFormValue.userofficial,
          roomnumber: parseInt(secondFormValue.roomnumber, 10),
        };
      }

      this.dataService[httpMethod](endpoint, formData)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 201) {
                this.successMessage = 'ایجاد کاربر با موفقیت انجام شد';
                this.errorMessage = '';
                this.showMessages();
                this.showUsersForm = false;
                this.isEditing = false;
                this.firstStepForm.reset();
                this.secondStepForm.reset();
                this.currentStep = 1;
                this.fetchUsers();
              } else if (response.status === 200) {
                this.successMessage = 'ویرایش بخش کاری با موفقیت انجام شد';
                this.errorMessage = '';
                this.showMessages();
                this.showUsersForm = false;
                this.isEditing = false;
                this.firstStepForm.reset();
                this.secondStepForm.reset();
                this.currentStep = 1;
                this.fetchUsers();
              } else {
                this.secondStepForm.reset();
                this.errorMessage =
                  'عملیات موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
                this.successMessage = '';
                this.showMessages();
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error submitting second step:', error);
              console.error('Request data:', formData);
              console.error('Error details:', error.error);

              if (error.status === 500) {
                this.errorMessage = 'خطای سرور. لطفا با پشتیبانی تماس بگیرید.';
              } else if (error.error && error.error['non_field_errors']) {
                this.errorMessage = error.error['non_field_errors'];
              } else {
                this.errorMessage =
                  'خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید.';
              }

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

  fetchUserWorkingLocations(): void {
    const endpoint = 'accounts/user/working/locations/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const workingLocations = response.body;
        workingLocations.forEach((location: any) => {
          this.fetchBuilding(location.buildingid);
          this.fetchArea(location.areaid);
          if (location.userid) {
            this.supporter_id = location.userid;
          }
        });
      }
    });
  }

  fetchBuilding(buildingId: number): void {
    this.buildingList = [];
    const endpoint = `building/${buildingId}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.buildingList.push(response.body);
      }
    });
  }
  fetchArea(areaId: number): void {
    this.areaList = [];
    const endpoint = `area/${areaId}/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.areaList.push(response.body);
      }
    });
  }
  fetchBuildingList(): void {
    this.buildingList = [];
    const endpoint = 'building/create/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.buildingList = response.body;
      }
    });
  }
  fetchAreaList(): void {
    this.areaList = [];
    const endpoint = 'area/';
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        this.areaList = response.body;
      }
    });
  }
  showMessages(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }

  openMultiStepForm(): void {
    this.showUsersForm = true;
  }

  closeForm(): void {
    this.showUsersForm = false;
    this.isEditing = false;
    this.currentStep = 1;
    this.firstStepForm.reset();
    this.secondStepForm.reset();
  }

  getIsActiveString(isActive: number): string {
    return isActive === 1 ? 'فعال' : 'غیر فعال';
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
  findSupporterID(userPersonalID: number): number | null {
    const user = this.usersDataSource.data.find(
      (u) => u.userpersonalid === userPersonalID
    );

    if (user) {
      return user.usersupportid;
    } else {
      return null;
    }
  }

  editUser(userData: any): void {
    this.isEditing = true;
    this.firstStepForm.patchValue({
      userpersonalid: userData.userpersonalid,
      username: userData.username,
      userlastname: userData.userlastname,
      userphonenumber: userData.userphonenumber,
      userlandlinephonenumber: userData.userlandlinephonenumber,
    });

    this.showUsersForm = true;
  }
  editWorkUser(userData: any): void {
    this.isEditing = true;
    this.currentStep = 2;

    this.secondStepForm.patchValue({
      userpersonalid: userData.userpersonalid,
      areaId: userData.areaid,
      buildingId: userData.buildingid,
      userofficial: userData.userofficial,
      roomnumber: userData.roomnumber,
    });
    this.UserPersonalId = userData.userpersonalid;
    this.editingUserRoleid = userData.userroleid;
    if (this.isAdmin) {
      this.handleUserRoleChange(this.editingUserRoleid);
    } else if (this.isSupporter) {
      this.fetchUserWorkingLocations();
      this.firstStepForm.patchValue({
        supporterid: this.supporter_id,
      });
    }
    this.showUsersForm = true;
  }
  resetFormFields() {
    this.isEditing = false;
    const newUserpersonalid = this.secondStepForm.get('userpersonalid')?.value;
    this.secondStepForm.reset();
    this.secondStepForm.patchValue({ userpersonalid: newUserpersonalid });
  }
  toggleUserStatus(userPersonalId: number, isActive: boolean): void {
    const endpoint = '/accounts/user/';
    const method = isActive ? 'delete' : 'put';
    const data = {
      userpersonalid: userPersonalId,
    };

    this.dataService[method](endpoint, data).subscribe({
      next: (response) => {
        if (response.status === 200 || response.status === 201) {
          this.fetchUsers();
          const index = this.usersDataSource.data.findIndex(
            (u) => u.userpersonalid === userPersonalId
          );
          if (index !== -1) {
            this.usersDataSource.data[index].is_active = !isActive;
            this.usersDataSource._updateChangeSubscription();
          }
          this.successMessage = 'عملیات با موفقیت انجام شد.';
          this.errorMessage = '';
        } else {
          this.errorMessage = 'خطا در انجام عملیات. لطفاً دوباره امتحان کنید.';
          this.successMessage = '';
        }
        this.showMessages();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.errorMessage = 'خطا در ارسال درخواست. لطفاً دوباره امتحان کنید.';
        this.successMessage = '';
        this.showMessages();
      },
    });
  }
  userAuth(): void {
    const userRole = this.authService.getUserRole();
    this.isSupporter = userRole === 'supporter';
    this.isAdmin = userRole === 'admin';
  }
  openChangePasswordForm(user: any): void {
    this.changePasswordForm.patchValue({
      userpersonalid: user.userpersonalid,
    });
    this.showChangePasswordForm = true;
  }
  closeChangePasswordForm(): void {
    this.changePasswordForm.reset();
    this.showChangePasswordForm = false;
  }

  onSubmitChangePassword(): void {
    if (this.changePasswordForm.valid) {
      const formValue = this.changePasswordForm.value;
      const endpoint = '/accounts/change/subuser/password/';

      this.dataService
        .put(endpoint, formValue)
        .pipe(
          tap({
            next: (response) => {
              if (response.status === 200) {
                this.successMessage = 'تغییر رمز عبور با موفقیت انجام شد';
                this.errorMessage = '';
                this.showMessages();
                this.closeChangePasswordForm();
              } else {
                this.errorMessage =
                  'عملیات موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
                this.successMessage = '';
                this.showMessages();
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error(
                'Error submitting first step:',
                error.error['non_field_errors']
              );
              this.errorMessage = error.error['non_field_errors'];
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
  viewDetail(userid: number): void {
    const config: MatDialogConfig = {
      data: { userid, showEditButton: true },
      disableClose: true,
    };
    const dialogRef = this.dialog.open(UserDetailComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.type === 'editUser') {
          this.editUser(result.data);
        } else {
          this.editWorkUser(result);
        }
      }
    });
  }
  viewProperty(userpersonalid: number): void {
    const config: MatDialogConfig = {
      data: { userpersonalid },
      disableClose: true,
    };
    const dialogRef = this.dialog.open(UsersPropertyComponent, config);

    dialogRef.afterClosed().subscribe((result) => {});
  }
  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.usersDataSource.filter = filterValue.trim().toLowerCase();

  //   if (this.usersDataSource.paginator) {
  //     this.usersDataSource.paginator.firstPage();
  //   }
  // }
  applyFilters(): void {
    let filteredData = [...this.usersDataSource.data];

    if (this.selectedRole && this.selectedRole !== '') {
      filteredData = filteredData.filter(
        (user) => user.userroleid.toString() === this.selectedRole
      );
    }
    if (this.isActive && this.isActive !== '') {
      filteredData = filteredData.filter(
        (user) => user.is_active.toString() === this.isActive
      );
    }
    // Search Filtering
    if (this.searchTerm) {
      filteredData = filteredData.filter(
        (user) =>
          user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.userlastname
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredUsersDataSource = new MatTableDataSource(filteredData);
    this.filteredUsersDataSource.paginator = this.paginator;
  }

  resetFilters(): void {
    this.selectedRole = '';
    this.isActive = '';

    this.filteredUsersDataSource = this.usersDataSource;
  }

  get progressPercentage(): number {
    return (this.currentStep / 2) * 100;
  }

  close(): void {
    this.showUsersForm = false;
    this.currentStep = 1;
    this.firstStepForm.reset();
    this.secondStepForm.reset();
    this.isEditing = false;
    this.ngOnDestroy();
  }

  getRowNumber(index: number): number {
    if (this.paginator) {
      return this.paginator.pageIndex * this.paginator.pageSize + index + 1;
    }
    return index + 1;
  }

  exportUsersToExcel(): void {
    const dialogRef = this.dialog.open(ExportExcelComponent, {
      width: '800px',
      data: { users: this.usersDataSource.data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const users = this.usersDataSource.data;
        const exportData = users.map((user, idx) => {
          const row: any = {};
          result.forEach((col: any) => {
            if (col.key === 'rowNumber') {
              row[col.label] = idx + 1;
            } else if (col.key === 'userroleid') {
              row[col.label] = this.getUserRoleString(user[col.key]);
            } else if (col.key === 'is_active') {
              row[col.label] = this.getIsActiveString(user[col.key]);
            } else {
              row[col.label] = user[col.key];
            }
          });
          return row;
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = {
          Sheets: { Users: worksheet },
          SheetNames: ['Users'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        const blob: Blob = new Blob([excelBuffer], {
          type: 'application/octet-stream',
        });
        saveAs(blob, 'users.xlsx');
      }
    });
  }
}
