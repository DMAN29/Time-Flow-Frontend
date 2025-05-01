import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../service/order.service';
import { AuthService } from '../../service/auth.service';
import { Operation, Order } from '../../model/Order';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditOrderValueComponent } from './edit-order-value/edit-order-value.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css'],
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  styleNo: string = '';
  loggedInEmail: string = '';
  dataSource = new MatTableDataSource<Operation>();
  machineSummary: { machineType: string; count: number }[] = [];
  machineDisplayedColumns: string[] = ['sno', 'machineType', 'count'];
  displayedColumns: string[] = [
    'id',
    'operationName',
    'section',
    'sam',
    'machineType',
    'required',
    'allocated',
    'target',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loggedInEmail = this.authService.getCurrentUserEmail();
    this.styleNo = this.route.snapshot.paramMap.get('styleNo') || '';
    if (this.styleNo) {
      this.orderService.getOrderByStyleNo(this.styleNo).subscribe({
        next: (res: Order) => {
          this.order = res;
          const summary: Operation = {
            id: '',
            operationName: 'Total',
            section: '',
            sam: res.totalSam ?? 0,
            machineType: '',
            required: res.totalRequired ?? 0,
            allocated: res.totalAllocation ?? 0,
            target: res.designOutput,
          };
          const operationsWithSummary = [...(res.operations ?? []), summary];
          this.dataSource.data = operationsWithSummary;
          this.computeMachineSummary();
        },
        error: (err) => {
          console.error('Failed to fetch order:', err);
        },
      });
    }
  }

  computeMachineSummary(): void {
    const machineMap: { [key: string]: number } = {};
    this.order?.operations?.forEach((op) => {
      if (op.machineType) {
        if (!machineMap[op.machineType]) {
          machineMap[op.machineType] = 0;
        }
        machineMap[op.machineType] += op.allocated ?? 0;
      }
    });
    this.machineSummary = Object.entries(machineMap).map(
      ([machineType, count]) => ({
        machineType,
        count,
      })
    );
  }

  downloadExcel(): void {
    if (!this.order) return;
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    const operationHeaders = [
      'Sl. No.',
      'Operation',
      'Section',
      'M/C Type',
      'Standard Minute',
      'Required',
      'Allocated',
      'Achieved Target',
    ];
    const operationData = this.order.operations.map((op, index) => [
      index + 1,
      op.operationName,
      op.section,
      op.machineType,
      op.sam,
      op.required,
      op.allocated,
      op.target,
    ]);
    const summaryRow = [
      '',
      'Total',
      '',
      '',
      this.order.totalSam,
      this.order.totalRequired,
      this.order.totalAllocation,
      this.order.designOutput,
    ];
    const headerRows = [
      [
        'Line No.',
        this.order.lane,
        '',
        'BUYER:',
        this.order.buyer,
        '',
        'ORDER QTY :',
        this.order.orderQuantity,
      ],
      [
        'STYLE NO. :',
        this.order.styleNo,
        '',
        'FABRIC :',
        this.order.fabric,
        '',
        'Daily Target',
        this.order.target,
      ],
      [
        'ITEM NO :',
        this.order.itemNo,
        '',
        'DIVISION:',
        this.order.division,
        '',
        'Efficiency',
        `${this.order.efficiency}%`,
      ],
      [
        'DESC :',
        this.order.description,
        '',
        'Created By:',
        this.order.createdBy,
        '',
        'Line design',
        this.order.lineDesign,
      ],
      [],
    ];
    const machineSummaryTitle = [[''], ['Machine Allocation Summary'], []];
    const machineSummaryHeaders = [['S.No', 'Machine', 'Allocated']];
    const machineSummaryData = this.machineSummary.map((m, i) => [
      i + 1,
      m.machineType,
      m.count,
    ]);

    const finalData = [
      ...headerRows,
      operationHeaders,
      ...operationData,
      summaryRow,
      [],
      ...machineSummaryTitle,
      ...machineSummaryHeaders,
      ...machineSummaryData,
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(finalData);
    worksheet['!cols'] = new Array(8).fill({ wch: 20 });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Order Details');
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const fileData: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    FileSaver.saveAs(fileData, `${this.order.styleNo}_OrderDetails.xlsx`);
  }

  goToDesign(): void {
    this.router.navigate(['/table', this.styleNo]);
  }

  back(): void {
    this.router.navigate(['/orders']);
  }

  getTargetInfo(opTarget: number | undefined): {
    color: string;
    tooltip: string;
  } {
    if (!this.order || opTarget == null) return { color: '', tooltip: '' };

    const orderTarget = this.order.target ?? 0;
    const diff = opTarget - orderTarget;
    const diffPercent = Math.round((diff / orderTarget) * 100);

    // 🟡 Yellow: Within ±5% → Bottleneck
    if (Math.abs(diffPercent) <= 5) {
      return {
        color: 'text-amber-500 font-semibold',
        tooltip: `Bottleneck ‼️`,
      };
    }

    // 🟢 Green: Between ±5% and ±25% → Safe Zone
    if (diffPercent > 5 && diffPercent <= 25) {
      return {
        color: 'text-emerald-600 font-semibold',
        tooltip: `Safe Zone 👍`,
      };
    }

    if (diffPercent < -5 && diffPercent >= -25) {
      return {
        color: 'text-emerald-600 font-semibold',
        tooltip: `Safe Zone 👍`,
      };
    }

    // 🔴 Red: Above +25% → Danger Zone
    if (diffPercent > 25) {
      return {
        color: 'text-rose-500 font-semibold',
        tooltip: `Danger Zone ⛔️`,
      };
    }

    // 🔴 Red: Below -25% → Danger Zone
    return {
      color: 'text-rose-500 font-semibold',
      tooltip: `Danger Zone ⛔️`,
    };
  }

  editTarget(): void {
    if (!this.order) return;
    const dialogRef = this.dialog.open(EditOrderValueComponent, {
      width: '300px',
      data: { value: this.order.target, label: 'Target' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != null && result !== this.order?.target) {
        this.orderService
          .updateTarget({ styleNo: this.styleNo, target: result })
          .subscribe({
            next: (res) => {
              this.order!.target = result;
              this.snackBar.open(res.message, 'Close', {
                duration: 3000,
                panelClass: ['snackbar-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.ngOnInit();
            },
          });
      }
    });
  }

  editEfficiency(): void {
    if (!this.order) return;
    const dialogRef = this.dialog.open(EditOrderValueComponent, {
      width: '300px',
      data: { value: this.order.efficiency, label: 'Efficiency' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != null && result !== this.order?.efficiency) {
        this.orderService
          .updateEfficiency({ styleNo: this.styleNo, efficiency: result })
          .subscribe({
            next: (res) => {
              this.order!.efficiency = result;
              this.snackBar.open(res.message, 'Close', {
                duration: 3000,
                panelClass: ['snackbar-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              this.ngOnInit();
            },
          });
      }
    });
  }
}
