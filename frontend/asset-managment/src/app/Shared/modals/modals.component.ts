import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'as-modals',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, CommonModule],
  template: `
    <div class="dialog-container">
      <h1 mat-dialog-title class="dialog-title">
        تایید حذف
        <mat-icon class="close-icon" (click)="onNoClick()">close</mat-icon>
      </h1>

      <div mat-dialog-content class="dialog-content">
        <p id="warning" class="message">آیا از حذف این بخش اطمینان دارید؟</p>
        <img
          src="assets/Images/warning.svg"
          alt="Warning Icon"
          class="warning-icon"
        />
      </div>

      <div mat-dialog-actions align="end" class="dialog-actions">
        <button type="button" class="btn btn-danger" (click)="onNoClick()">
          خیر
        </button>
        <button type="button" class="btn btn-success" (click)="onYesClick()">
          بله
        </button>
      </div>
    </div>
  `,
  styleUrl: './modals.component.css',
})
export class ModalsComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close('delete');
  }
}
