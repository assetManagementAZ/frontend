import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { DataService } from '../../../Services/data-service.service';
import { DeliveredGoodsComputerComponent } from '../delivered-goods-computer/delivered-goods-computer.component';
import moment from 'jalali-moment';

@Component({
  selector: 'as-computer-inside-goods',
  standalone: true,
  imports: [
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
  templateUrl: './computer-inside-goods.component.html',
  styleUrl: './computer-inside-goods.component.css',
})
export class ComputerInsideGoodsComponent implements OnInit {
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'deliveredgoodsid',
    'goodsname',
    'ispartinsidecomputer',
    'isallowedtosendout',
    'isallowedtobeaborted',
    'isallowedtomove',
    'ispossibletorepair',
    'isAbortion',
    'deliveredgoodscreatetime',
    'deliveredgoodsupdatetime',
  ];
  deliveredGoodsPcDataSource!: MatTableDataSource<any>;
  filteredData: any[] = [];
  allDeliveryGoods: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  showMessage = false;
  currentGoodDetailIndex: number = 0;
  totalGoodDetails: number = 0;
  currentGood: any = null;

  constructor(
    public dialogRef: MatDialogRef<DeliveredGoodsComputerComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      computerpropertynumber: number;
    },
    private dataservice: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const endpoint = `asset/computer/`;
    this.dataservice.get(endpoint).subscribe((response: any) => {
      if (response && response.body) {
        // Filter data based on deliveredgoodsserial
        this.filteredData = response.body.filter(
          (item: any) =>
            item.computerpropertynumber === this.data.computerpropertynumber
        );
        this.flattenDeliveryGoods(this.filteredData);
        this.totalGoodDetails = this.allDeliveryGoods.length;
        this.updateCurrentGoodDetail();
        this.dataSource = new MatTableDataSource(this.allDeliveryGoods);
      }
    });
  }

  updateCurrentGoodDetail(): void {
    if (this.allDeliveryGoods.length > 0) {
      this.currentGood =
        this.allDeliveryGoods[this.currentGoodDetailIndex] || null;
    }
  }

  nextGoodDetail(): void {
    if (this.currentGoodDetailIndex < this.totalGoodDetails - 1) {
      this.currentGoodDetailIndex++;
      this.updateCurrentGoodDetail();
    }
  }

  previousGoodDetail(): void {
    if (this.currentGoodDetailIndex > 0) {
      this.currentGoodDetailIndex--;
      this.updateCurrentGoodDetail();
    }
  }

  flattenDeliveryGoods(computers: any[]): void {
    this.allDeliveryGoods = computers.reduce((acc: any[], computer: any) => {
      if (computer.relateddeliveredgoods) {
        acc.push(...computer.relateddeliveredgoods);
      }
      return acc;
    }, []);
  }

  showMessages(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  convertDate(dateString: string): string {
    return moment(dateString, 'YYYY/MM/DD').locale('fa').format('YYYY/MM/DD');
  }

  getIsPartinsideComputer(ispartinsidecomputer: number): string {
    switch (ispartinsidecomputer) {
      case 1:
        return 'است';
      case 0:
        return ' نیست';
      default:
        return 'نامشخص';
    }
  }

  getIsAllowedToSendOut(isallowedtosendout: number): string {
    switch (isallowedtosendout) {
      case 1:
        return 'دارد';
      case 2:
        return ' ندارد';
      default:
        return 'نامشخص';
    }
  }

  getIsAllowedToBeAborted(isallowedtobeaborted: number): string {
    switch (isallowedtobeaborted) {
      case 1:
        return 'دارد';
      case 2:
        return ' ندارد';
      default:
        return 'نامشخص';
    }
  }

  getIsAllowedToMove(isallowedtomove: number): string {
    switch (isallowedtomove) {
      case 1:
        return 'دارد';
      case 2:
        return ' ندارد';
      default:
        return 'نامشخص';
    }
  }

  getIsPossibleToRepair(ispossibletorepair: number): string {
    switch (ispossibletorepair) {
      case 1:
        return 'دارد';
      case 2:
        return ' ندارد';
      default:
        return 'نامشخص';
    }
  }

  getAbortion(isAbortion: boolean): string {
    switch (isAbortion) {
      case false:
        return 'اسقاط نشده است';
      case true:
        return ' اسقاط شده است';
      default:
        return 'نامشخص';
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
