import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { DataService } from '../../../Services/data-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';

interface Supporter {
  userid: number;
  username: string;
  userlastname: string;
  userphonenumber: string;
  userlandlinephonenumber: string;
  userpersonalid: number;
  buildingname: string;
  availablefloor: number | string;
}

@Component({
  selector: 'app-supporter-building',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgSelectModule,
  ],
  templateUrl: './supporter-building.component.html',
  styleUrls: ['./supporter-building.component.css'],
})
export class SupporterBuildingComponent implements OnInit {
  supporters: Supporter[] = [];
  floors: number[] = [];
  loading = true;
  error: string | null = null;
  showChooseSupporterForm = false;
  showEditSupporterForm = false;
  chooseSupporterForm!: FormGroup;
  editSupporterForm!: FormGroup;
  userList: any[] = [];
  selectedFloor: number | null = null;
  showMessage = false;
  successMessage = '';
  errorMessage = '';
  currentSupporter: Supporter | null = null;

  constructor(
    public dialogRef: MatDialogRef<SupporterBuildingComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { buildingId: number; buildingName: string },
    private dataService: DataService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.chooseSupporterForm = this.fb.group({
      userpersonalid: ['', Validators.required],
      buildingid: ['', Validators.required],
      floor: ['', Validators.required],
    });

    this.editSupporterForm = this.fb.group({
      old_supporterpersonalId: ['', Validators.required],
      new_supporterpersobalId: ['', Validators.required],
      buildingid: ['', Validators.required],
      floor: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchSupporters();
    this.fetchUsers();
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

  fetchSupporters(): void {
    const endpoint = 'accounts/supporter/';
    this.dataService.get(endpoint).subscribe({
      next: (response: any) => {
        if (response && response.body) {
          this.supporters = response.body.filter(
            (supporter: Supporter) =>
              supporter.buildingname === this.data.buildingName
          );

          // Get building details to determine number of floors
          const buildingEndpoint = `building/${this.data.buildingId}/`;
          this.dataService.get(buildingEndpoint).subscribe({
            next: (buildingResponse: any) => {
              if (buildingResponse && buildingResponse.body) {
                const floorCount = buildingResponse.body.buildingfloorcount;
                this.floors = Array.from(
                  { length: floorCount },
                  (_, i) => i + 1
                );
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Error fetching building details:', error);
              this.error = 'خطا در دریافت اطلاعات ساختمان';
              this.loading = false;
            },
          });
        }
      },
      error: (error) => {
        console.error('Error fetching supporters:', error);
        this.error = 'خطا در دریافت اطلاعات پشتیبانان';
        this.loading = false;
      },
    });
  }

  getSupporterForFloor(floor: number): Supporter | undefined {
    return this.supporters.find((s) => s.availablefloor === floor);
  }

  chooseSupporter(floor: number): void {
    this.selectedFloor = floor;
    this.chooseSupporterForm.patchValue({
      buildingid: this.data.buildingId,
      floor: floor,
    });
    this.showChooseSupporterForm = true;
  }

  closeChooseSupporterForm(): void {
    this.chooseSupporterForm.reset();
    this.showChooseSupporterForm = false;
    this.selectedFloor = null;
  }

  showMessages(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }

  onSubmitChooseSupporter(): void {
    if (this.chooseSupporterForm.valid) {
      const formValue = this.chooseSupporterForm.value;
      formValue.userpersonalid = parseInt(formValue.userpersonalid, 10);
      formValue.buildingid = parseInt(formValue.buildingid, 10);
      formValue.floor = parseInt(formValue.floor, 10);

      const endpoint = 'accounts/supporter/';
      this.dataService.post(endpoint, formValue).subscribe(
        (response: any) => {
          if (response.status === 201) {
            this.successMessage = 'پشتیبان با موفقیت اضافه شد';
            this.errorMessage = '';
            this.fetchSupporters(); // Refresh the list after successful addition
            this.closeChooseSupporterForm();
          } else {
            this.errorMessage =
              'عملیات موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
            this.successMessage = '';
          }
          this.showMessages();
        },
        (error: any) => {
          console.error('Error submitting form:', error);
          this.errorMessage =
            error.error['non_field_errors'] || 'خطا در ثبت اطلاعات';
          this.successMessage = '';
          this.showMessages();
        }
      );
    } else {
      this.errorMessage = '.لطفا همه فیلد ها را پر کنید';
      this.successMessage = '';
      this.showMessages();
    }
  }

  editSupporter(floor: number): void {
    const supporter = this.getSupporterForFloor(floor);
    if (supporter) {
      this.currentSupporter = supporter;
      this.selectedFloor = floor;
      this.editSupporterForm.patchValue({
        old_supporterpersonalId: supporter.userpersonalid,
        buildingid: this.data.buildingId,
        floor: floor,
      });
      this.showEditSupporterForm = true;
    }
  }

  closeEditSupporterForm(): void {
    this.editSupporterForm.reset();
    this.showEditSupporterForm = false;
    this.selectedFloor = null;
    this.currentSupporter = null;
  }

  onSubmitEditSupporter(): void {
    if (this.editSupporterForm.valid) {
      const formValue = this.editSupporterForm.value;
      formValue.old_supporterpersonalId = parseInt(
        formValue.old_supporterpersonalId,
        10
      );
      formValue.new_supporterpersobalId = parseInt(
        formValue.new_supporterpersobalId,
        10
      );
      formValue.buildingid = parseInt(formValue.buildingid, 10);
      formValue.floor = parseInt(formValue.floor, 10);

      const endpoint = 'accounts/supporter/';
      this.dataService.put(endpoint, formValue).subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.successMessage = 'پشتیبان با موفقیت ویرایش شد';
            this.errorMessage = '';
            this.fetchSupporters(); // Refresh the list after successful update
            this.closeEditSupporterForm();
          } else {
            this.errorMessage =
              'عملیات ویرایش موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
            this.successMessage = '';
          }
          this.showMessages();
        },
        (error: any) => {
          console.error('Error updating supporter:', error);
          this.errorMessage =
            error.error['non_field_errors'] || 'خطا در ویرایش اطلاعات';
          this.successMessage = '';
          this.showMessages();
        }
      );
    } else {
      this.errorMessage = '.لطفا همه فیلد ها را پر کنید';
      this.successMessage = '';
      this.showMessages();
    }
  }

  deleteSupporter(floor: number): void {
    const supporter = this.getSupporterForFloor(floor);
    if (supporter) {
      const payload = {
        userpersonalid: supporter.userpersonalid,
        buildingid: this.data.buildingId,
        floor: floor,
      };

      const endpoint = 'accounts/supporter/';
      this.dataService.delete(endpoint, payload).subscribe(
        (response: any) => {
          if (response.status === 204) {
            this.successMessage = 'پشتیبان با موفقیت حذف شد';
            this.errorMessage = '';
            this.fetchSupporters(); // Refresh the list after successful deletion
          } else {
            this.errorMessage =
              'عملیات حذف موفقیت آمیز نبود،لطفا دوباره امتحان کنید';
            this.successMessage = '';
          }
          this.showMessages();
        },
        (error: any) => {
          console.error('Error deleting supporter:', error);
          this.errorMessage =
            error.error['non_field_errors'] || 'خطا در حذف اطلاعات';
          this.successMessage = '';
          this.showMessages();
        }
      );
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
