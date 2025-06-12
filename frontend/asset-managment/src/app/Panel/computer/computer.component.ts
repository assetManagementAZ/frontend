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
import { trigger, transition, style, animate } from '@angular/animations';
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
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '150ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '100ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class ComputerComponent implements OnInit {
  showComputerForm = false;
  showComputerTable = false;
  isLoadingDetail = false;
  detailLoadingMessage = '';
  createdSealId: number | null = null;
  infoMessage: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showMessage = false;
  displayedColumns: string[] = [
    'computerpropertynumber',
    'computername',
    'computermodel',
    'computerip',
    'computermacaddress',
    'computerispersonal',
    'osName',
    'osVersionId',
    'actions',
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
  computerForm!: FormGroup;
  userPcForm!: FormGroup;
  showUserPcForm = false;
  isEditing = false;
  computerpropertynumber: any;
  userPcid: any;
  showHandoverSteps = false;
  handoverStep = 0;
  selectedComputerForHandover: {
    propertyNumber: number;
    sealingNumber: any;
  } | null = null;

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
    this.buildingList = [];
    this.areaList = [];

    // If no user is selected (null or undefined), clear the form controls
    if (!ownerUserId) {
      this.userPcForm.get('buildingId')?.setValue(null);
      this.userPcForm.get('areaId')?.setValue(null);
      return;
    }

    const endpoint = `accounts/subbuser/detail/working/locations/${ownerUserId}/`;
    console.log('Fetching working locations for user:', ownerUserId);
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const workingLocations = response.body;
        console.log('Working locations received:', workingLocations);
        // Only fetch buildings initially
        workingLocations.forEach((location: any) => {
          this.fetchBuilding(location.buildingid);
        });
      }
    });
  }

  fetchBuilding(buildingId: number): void {
    const endpoint = `building/${buildingId}/`;
    console.log('Fetching building:', buildingId);
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (
        response &&
        response.body &&
        !this.buildingList.some(
          (b) => b.buildingid === response.body.buildingid
        )
      ) {
        console.log('Adding building to list:', response.body);
        this.buildingList.push(response.body);
      }
    });
  }

  // Add new method to fetch areas for a specific building
  onBuildingSelect(buildingId: number): void {
    this.areaList = []; // Clear previous areas
    const endpoint = `accounts/subbuser/detail/working/locations/${
      this.userPcForm.get('ownerUserId')?.value
    }/`;
    this.dataService.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        const workingLocations = response.body;
        // Filter locations for the selected building
        const buildingLocations = workingLocations.filter(
          (location: any) => location.buildingid === buildingId
        );
        // Fetch areas only for the selected building
        buildingLocations.forEach((location: any) => {
          this.fetchArea(location.areaid);
        });
      }
    });
  }

  fetchArea(areaId: number): void {
    const endpoint = `area/${areaId}/`;
    console.log('Fetching area:', areaId);
    this.dataService.get(endpoint).subscribe((response: any) => {
      console.log('Area response:', response);
      if (
        response &&
        response.body &&
        !this.areaList.some((a) => a.areaid === response.body.areaid)
      ) {
        console.log('Adding area to list:', response.body);
        this.areaList.push(response.body);
        console.log('Current areaList:', this.areaList);
      }
    });
  }
  openUserPcForm(
    computerpropertynumber: number,
    computerseallingnumber: any | null,
    isFromUserAction: boolean = false
  ): void {
    this.fetchComputer();
    // First check if computer has an owner
    const computer = this.ComputerDataSource.data.find(
      (c) => c.computerpropertynumber === computerpropertynumber
    );
    if (computer?.owneruserid && isFromUserAction) {
      this.infoMessage = `این کامپیوتر قبلاً به <span class="font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">${computer.owneruserid.username} ${computer.owneruserid.userlastname}</span> تحویل داده شده است`;
      this.errorMessage = '';
      this.successMessage = '';
      this.showMessages();
      return;
    }
    this.handoverSteps.forEach((step) => (step.status = 'pending'));
    this.selectedComputerForHandover = {
      propertyNumber: computerpropertynumber,
      sealingNumber: computerseallingnumber,
    };
    this.showHandoverSteps = true;

    if (computerseallingnumber === null) {
      this.executeStep(1); // Start with step 1 if no seal exists
    } else {
      // Skip to step 3 if seal already exists
      this.handoverSteps[0].status = 'success';
      this.handoverSteps[1].status = 'success';
      this.handoverSteps[2].status = 'in-progress';
      this.fetchUserList();
    }
  }
  // New method to execute steps
  executeStep(stepNumber: number): void {
    const step = this.handoverSteps[stepNumber - 1];
    step.status = 'in-progress';

    switch (stepNumber) {
      case 1: // Create seal
        this.createAndAssignSeal(
          this.selectedComputerForHandover!.propertyNumber
        );
        break;
      case 2: // Assign seal to computer
        if (this.createdSealId !== null) {
          this.assignSealToComputer(
            this.selectedComputerForHandover!.propertyNumber,
            this.createdSealId
          );
        }
        break;
      case 3: // Assign computer to user
        this.fetchUserList(); // Fetch user list for the form

        break;
    }
  }

  closeHandoverSteps(): void {
    this.showHandoverSteps = false;
    this.handoverStep = 0;
    this.selectedComputerForHandover = null;
    this.userPcForm.reset();
    this.buildingList = [];
    this.areaList = [];
  }

  createAndAssignSeal(computerpropertynumber: number): void {
    const step = this.handoverSteps[0];

    const sealData = {
      computerseallingnumber: Math.floor(Math.random() * 1000000),
      title: 'Computerseallingnumber',
      isexpired: 0,
    };

    this.dataService.post(step.apiEndpoint, sealData).subscribe({
      next: (response: any) => {
        if (response && response.body) {
          this.createdSealId = response.body.computerseallingid;
          step.status = 'success';
          this.executeStep(2); // Proceed to next step
        } else {
          step.status = 'error';
          this.errorMessage = 'خطا در ایجاد پلمپ جدید';
          this.showMessages();
        }
      },
      error: (error) => {
        step.status = 'error';
        this.errorMessage = 'خطا در ایجاد پلمپ جدید';
        this.showMessages();
        console.error('Error creating seal:', error);
      },
    });
  }

  // Update the seal assignment method
  assignSealToComputer(computerpropertynumber: number, sealId: number): void {
    const step = this.handoverSteps[1];
    const endpoint = `asset/assign-seall-to-computer/${sealId}/`;

    const assignData = {
      computerpropertynumber: computerpropertynumber,
    };

    this.dataService.put(endpoint, assignData).subscribe({
      next: (response: any) => {
        if (response && response.status === 200) {
          step.status = 'success';
          this.fetchComputer();
          this.fetchUserList();
          // Update step 3 status
          this.handoverSteps[2].status = 'in-progress';
        } else {
          step.status = 'error';
          this.errorMessage = 'خطا در اختصاص پلمپ به کیس';
          this.showMessages();
        }
      },
      error: (error) => {
        step.status = 'error';
        this.errorMessage = 'خطا در اختصاص پلمپ به کیس';
        this.showMessages();
        console.error('Error assigning seal:', error);
      },
    });
  }

  // Update the submit method
  submitUserPc(): void {
    if (this.userPcForm.valid && this.selectedComputerForHandover) {
      const step = this.handoverSteps[2];
      step.status = 'in-progress';

      const formData = this.userPcForm.value;
      const endpoint = `asset/assign-computer-to-user/${this.selectedComputerForHandover.propertyNumber}/`;

      this.dataService.put(endpoint, formData).subscribe({
        next: (response) => {
          step.status = 'success';
          this.successMessage = 'کامپیوتر با موفقیت به کاربر تحویل داده شد';
          this.errorMessage = '';
          this.showMessages();
          // Close both forms
          this.showUserPcForm = false;
          this.showHandoverSteps = false;
          this.fetchComputer();
        },
        error: (error) => {
          step.status = 'error';
          this.errorMessage =
            error.error.detail || 'خطا در تحویل کامپیوتر به کاربر';
          this.successMessage = '';
          this.showMessages();
        },
      });
    }
  }
  viewUser(computerpropertynumber: number): void {
    const config: MatDialogConfig = {
      data: { computerpropertynumber: computerpropertynumber },
      // height: '55%',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PcUserComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      this.fetchComputer();
    });
  }
  viewDetail(computerpropertynumber: number): void {
    this.isLoadingDetail = true;
    this.detailLoadingMessage = 'در حال دریافت اطلاعات...';

    const config: MatDialogConfig = {
      data: { computerpropertynumber },
      disableClose: true,
    };

    const dialogRef = this.dialog.open(ComputerDetailComponent, config);

    // Clear loading state when dialog is opened
    dialogRef.afterOpened().subscribe(() => {
      this.isLoadingDetail = false;
      this.detailLoadingMessage = '';
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Additional cleanup if needed
    });
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
    this.applyFilters();
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
  handoverSteps = [
    {
      id: 1,
      title: 'ایجاد پلمپ جدید',
      description: 'در حال ایجاد پلمپ جدید برای کیس...',
      completedDescription: 'پلمپ جدید با موفقیت ایجاد شد',
      status: 'pending', // 'pending', 'in-progress', 'success', 'error'
      apiEndpoint: 'asset/computer-sealling/',
      apiMethod: 'post',
    },
    {
      id: 2,
      title: 'پلمپ کردن کیس',
      description: 'در حال پلمپ کردن کیس...',
      completedDescription: 'کیس با موفقیت پلمپ شد',
      status: 'pending',
      apiEndpoint: 'asset/assign-seall-to-computer/{sealId}/',
      apiMethod: 'put',
    },
    {
      id: 3,
      title: 'تحویل کیس به کاربر',
      description: 'در حال تحویل کیس به کاربر...',
      completedDescription: 'کیس با موفقیت به کاربر تحویل داده شد',
      status: 'pending',
      apiEndpoint: 'asset/assign-computer-to-user/{propertyNumber}/',
      apiMethod: 'put',
      showFormButton: true,
    },
  ];
  getCompletedStepsCount(): number {
    return this.handoverSteps.filter((step) => step.status === 'success')
      .length;
  }

  getCurrentStep(): number {
    const inProgressStep = this.handoverSteps.find(
      (step) => step.status === 'in-progress'
    );
    if (inProgressStep) return inProgressStep.id;

    const firstPendingStep = this.handoverSteps.find(
      (step) => step.status === 'pending'
    );
    return firstPendingStep ? firstPendingStep.id : this.handoverSteps.length;
  }

  showUserPcFormModal(): void {
    this.userPcForm.reset();
    this.showUserPcForm = true;
  }

  closeUserPcForm(): void {
    this.showUserPcForm = false;
  }
}
