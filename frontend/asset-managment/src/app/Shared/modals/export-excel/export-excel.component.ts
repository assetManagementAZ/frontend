import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-export-excel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      <div
        class="flex items-center justify-center min-h-screen px-4 text-center"
      >
        <div
          class="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
        ></div>

        <div
          class="relative inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-right bg-white rounded-xl shadow-2xl"
        >
          <!-- Header -->
          <div
            class="px-8 pt-6 pb-4 border-b border-gray-100 bg-[image:var(--primary-gradient)] text-center"
          >
            <div
              dir="ltr"
              class="flex items-center justify-between text-center"
            >
              <h3 class="text-center text-2xl font-bold text-white ml-[37%]">
                تنظیمات خروجی اکسل
              </h3>
              <button
                (click)="onCancel()"
                class="text-white hover:text-blue-500"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <p class="mt-2 text-sm text-blue-100">
              ستون‌ های مورد نظر برای خروجی را انتخاب نمایید
            </p>
          </div>

          <!-- Main Content -->
          <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <form [formGroup]="exportForm">
              <!-- Column Selection -->
              <div class="mb-8">
                <div class="flex items-center justify-between mb-6">
                  <h4
                    class="text-lg font-semibold text-gray-800 flex items-center"
                  >
                    <mat-icon class="ml-2 text-blue-600">view_column</mat-icon>
                    انتخاب ستون‌ها
                  </h4>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      (click)="selectAll(true)"
                      class="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 flex items-center"
                    >
                      <mat-icon class="text-sm mr-1">check_box</mat-icon>
                      انتخاب همه
                    </button>
                    <button
                      type="button"
                      (click)="selectAll(false)"
                      class="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center"
                    >
                      <mat-icon class="text-sm mr-1"
                        >check_box_outline_blank</mat-icon
                      >
                      عدم انتخاب
                    </button>
                  </div>
                </div>

                <div
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                >
                  <div
                    *ngFor="let column of availableColumns"
                    class="relative flex items-start p-3 space-x-2 space-x-reverse rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div class="flex items-center h-5">
                      <input
                        type="checkbox"
                        [id]="column.key"
                        [formControlName]="column.key"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <label
                        [for]="column.key"
                        class="block text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {{ column.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview Section -->
              <div class="mt-8 border-t pt-6 border-gray-200">
                <h4
                  class="text-lg font-semibold text-gray-800 mb-4 flex items-center"
                >
                  <mat-icon class="ml-2 text-blue-600">preview</mat-icon>
                  پیش نمایش داده‌ها
                </h4>

                <div class="border rounded-lg overflow-hidden shadow-sm">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-blue-600">
                        <tr>
                          <th
                            *ngFor="let col of selectedColumns"
                            class="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                          >
                            {{ col.label }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr
                          *ngFor="let user of previewData"
                          class="hover:bg-blue-50 transition-colors"
                        >
                          <td
                            *ngFor="let col of selectedColumns"
                            class="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium"
                          >
                            {{ user[col.key] || '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div
                    class="bg-blue-50 px-4 py-2 text-xs text-blue-700 text-center"
                  >
                    نمایش {{ previewData.length }} ردیف از
                    {{ data.users.length }} ردیف
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div
            class="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3"
          >
            <button
              (click)="onCancel()"
              class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg 
hover:bg-red-400 hover:text-red-500 transition-all flex items-center shadow-sm"
            >
              <mat-icon class="ml-1">cancel</mat-icon>
              انصراف
            </button>
            <button
              (click)="onSubmit()"
              class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md flex items-center"
            >
              <mat-icon class="ml-1">file_download</mat-icon>
              دریافت فایل اکسل
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Custom checkbox styling */
      input[type='checkbox'] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 1.2rem;
        height: 1.2rem;
        border: 2px solid #d1d5db;
        border-radius: 0.25rem;
        outline: none;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        margin-left: 10px;
      }

      input[type='checkbox']:checked {
        border-color: #2563eb;
        background-color: #2563eb;
      }

      input[type='checkbox']:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        width: 0.3rem;
        height: 0.6rem;
        border: solid white;
        border-width: 0 2px 2px 0;
      }

      input[type='checkbox']:focus {
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
      }
    `,
  ],
})
export class ExportExcelComponent implements OnInit {
  exportForm: FormGroup;
  availableColumns = [
    { key: 'rowNumber', label: 'ردیف' },
    { key: 'userpersonalid', label: 'کد پرسنلی' },
    { key: 'username', label: 'نام' },
    { key: 'userlastname', label: 'نام خانوادگی' },
    { key: 'userid', label: 'کد کاربری' },
    { key: 'userphonenumber', label: 'تلفن همراه' },
    { key: 'userlandlinephonenumber', label: 'تلفن ثابت' },
    { key: 'userroleid', label: 'سطح کاربری' },
    { key: 'usersupportid', label: 'کد پشتیبان' },
    { key: 'areaname', label: 'حوزه' },
    { key: 'buildingname', label: 'ساختمان' },
    { key: 'userofficial', label: 'سمت' },
    { key: 'roomnumber', label: 'اتاق' },
    { key: 'is_active', label: 'وضعیت' },
  ];

  previewData: any[] = [];
  selectedColumns: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExportExcelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: any[] }
  ) {
    this.exportForm = this.fb.group({});
    this.availableColumns.forEach((col) => {
      this.exportForm.addControl(col.key, this.fb.control(true));
    });
  }

  ngOnInit() {
    // Get first 3 users for preview
    this.previewData = this.data.users.slice(0, 3);
    this.updateSelectedColumns();

    // Subscribe to form changes to update preview
    this.exportForm.valueChanges.subscribe(() => {
      this.updateSelectedColumns();
    });
  }

  toggleColumn(key: string) {
    const control = this.exportForm.get(key);
    if (control) {
      control.setValue(!control.value);
    }
  }

  selectAll(select: boolean) {
    this.availableColumns.forEach((col) => {
      this.exportForm.get(col.key)?.setValue(select);
    });
  }

  updateSelectedColumns() {
    this.selectedColumns = this.availableColumns.filter(
      (col) => this.exportForm.get(col.key)?.value
    );
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    const selectedColumns = this.availableColumns.filter(
      (col) => this.exportForm.get(col.key)?.value
    );
    this.dialogRef.close(selectedColumns);
  }
}
