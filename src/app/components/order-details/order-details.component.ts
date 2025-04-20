import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../service/order.service';
import { Operation, Order } from '../../model/Order';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css'],
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  styleNo: string = '';
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
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.styleNo = this.route.snapshot.paramMap.get('styleNo') || '';

    if (this.styleNo) {
      this.orderService.getOrderByStyleNo(this.styleNo).subscribe({
        next: (res: Order) => {
          this.order = res;
          console.log(this.order);

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
      [], // Blank row to separate headers
    ];

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

    const finalData = [
      ...headerRows,
      operationHeaders,
      ...operationData,
      summaryRow,
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(finalData);

    worksheet['!cols'] = [
      { wch: 8 }, // Sl. No.
      { wch: 25 }, // Operation
      { wch: 20 }, // Section
      { wch: 15 }, // M/C Type
      { wch: 18 }, // Standard Minute
      { wch: 12 }, // Required
      { wch: 10 }, // Allocated
      { wch: 18 }, // Achieved Target
    ];

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
}
