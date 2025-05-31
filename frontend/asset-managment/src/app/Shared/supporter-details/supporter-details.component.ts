import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { DataService } from '../../Services/data-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Supporter {
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
  selector: 'app-supporter-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          class="fixed inset-0 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 backdrop-blur-sm transition-opacity"
        ></div>

        <div class="relative w-full max-w-4xl mx-auto transform transition-all">
          <div
            class="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div class="relative bg-[image:var(--primary-gradient)] p-5">
              <div dir="ltr" class="flex items-center justify-between">
                <div
                  class="flex items-center space-x-3 space-x-reverse ml-[42%]"
                >
                  <h3 class="text-xl font-bold text-white">
                    جزئیات پشتیبانان {{ data.buildingName }}
                  </h3>
                </div>
                <button
                  (click)="closeDialog()"
                  class="p-1 rounded-full hover:bg-white/20 transition-colors duration-200 text-white/80 hover:text-white"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <div class="p-6">
              <div
                *ngIf="loading"
                class="flex justify-center items-center py-8"
              >
                <div
                  class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
                ></div>
              </div>

              <div
                *ngIf="error"
                class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4"
              >
                {{ error }}
              </div>

              <div *ngIf="!loading && !error" class="space-y-4">
                <div
                  *ngFor="let floor of floors"
                  class="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 space-x-reverse">
                      <span class="text-lg font-medium text-gray-800"
                        >طبقه {{ floor }}</span
                      >
                      <div
                        *ngIf="getSupporterForFloor(floor)"
                        class="flex items-center space-x-2 space-x-reverse"
                      >
                        <span class="text-gray-600">
                          {{ getSupporterForFloor(floor)?.username }}
                          {{ getSupporterForFloor(floor)?.userlastname }}
                        </span>
                        <button
                          (click)="editSupporter(floor)"
                          class="modern-btn primary-btn"
                        >
                          ویرایش پشتیبان
                        </button>
                      </div>
                      <div *ngIf="!getSupporterForFloor(floor)">
                        <button
                          (click)="chooseSupporter(floor)"
                          class="modern-btn info-btn"
                        >
                          انتخاب پشتیبان
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modern-btn {
        @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
      }
      .primary-btn {
        @apply bg-blue-500 text-white hover:bg-blue-600;
      }
      .info-btn {
        @apply bg-blue-100 text-blue-600 hover:bg-blue-200;
      }
    `,
  ],
})
export class SupporterDetailsComponent implements OnInit {
  supporters: Supporter[] = [];
  floors: number[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SupporterDetailsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { buildingId: number; buildingName: string },
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSupporters();
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
    // Reuse the existing choose supporter form
    const dialogRef = this.dialog.open(SupporterDetailsComponent, {
      width: '600px',
      data: {
        buildingId: this.data.buildingId,
        buildingName: this.data.buildingName,
        floor: floor,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchSupporters(); // Refresh the list
      }
    });
  }

  editSupporter(floor: number): void {
    const supporter = this.getSupporterForFloor(floor);
    if (supporter) {
      // Reuse the existing choose supporter form with pre-filled data
      const dialogRef = this.dialog.open(SupporterDetailsComponent, {
        width: '600px',
        data: {
          buildingId: this.data.buildingId,
          buildingName: this.data.buildingName,
          floor: floor,
          supporter: supporter,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.fetchSupporters(); // Refresh the list
        }
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
