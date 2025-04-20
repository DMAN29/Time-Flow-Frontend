import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../service/order.service';
import { TimeStudyService } from '../../service/time-study.service';
import { Operation, Order } from '../../model/Order';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AddOperatorComponent } from './add-operator/add-operator.component';
import { AddRemarksComponent } from './add-remarks/add-remarks.component';
import { TimeStudy } from '../../model/TimeStudy';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-time-study',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './time-study.component.html',
  styleUrls: ['./time-study.component.css'],
})
export class TimeStudyComponent implements OnInit {
  operations: Operation[] = [];
  groupedOperations: {
    key: string;
    rows: any[];
    initialCount: number;
  }[] = [];

  allowance: number = 0;
  numberOfLaps: number = 10;
  laneNo: number = 0;
  lapsHeaders: string[] = [];
  canEditLaps: boolean = true;

  order: Order | null = null;

  tempAllowance: number = 0;
  tempLaps: number = 10;

  studyGroupedMap: Map<string, any[]> = new Map(); // backend study data grouped by operation+section

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private studyService: TimeStudyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (!styleNo) return;

    this.orderService.getOrderByStyleNo(styleNo).subscribe({
      next: (res) => {
        this.order = res;
        this.operations = res.operations;
        this.laneNo = res.lane;
        this.allowance = res.allowance ?? 0;
        this.tempAllowance = this.allowance;
        this.numberOfLaps = res.noOfLaps ?? 10;
        this.tempLaps = this.numberOfLaps;

        this.updateLapsHeaders();

        // First, get study data
        this.studyService.getStudyByStyleNo(styleNo).subscribe({
          next: (studyData) => {
            this.canEditLaps = studyData.length === 0;

            // Group study data by operation + section
            for (const entry of studyData) {
              const key = `${entry.operationName}__${entry.section}`;
              if (!this.studyGroupedMap.has(key)) {
                this.studyGroupedMap.set(key, []);
              }
              this.studyGroupedMap.get(key)!.push(entry);
            }

            this.groupOperations(); // Build table after grouping study data
          },
          error: () => {
            this.canEditLaps = true;
            this.groupOperations(); // Still build the table
          },
        });
      },
      error: (err) => console.error('❌ Order fetch error:', err),
    });
  }

  updateLapsHeaders(): void {
    this.lapsHeaders = Array.from(
      { length: this.numberOfLaps },
      (_, i) => `Lap${i + 1}`
    );
  }

  groupOperations(): void {
    const groupedMap = new Map<string, any[]>();

    for (const op of this.operations) {
      const key = `${op.operationName}__${op.section}`;
      const allocatedCount = Math.round(op.allocated);
      const existingStudies = this.studyGroupedMap.get(key) ?? [];

      const totalRows = Math.max(allocatedCount, existingStudies.length);

      const rows = Array.from({ length: totalRows }, (_, i) => {
        const study = existingStudies[i];
        return study
          ? {
              operationName: op.operationName,
              section: op.section,
              operatorId: study.operatorId,
              operatorName: study.operatorName,
              laps: study.laps ?? Array(this.numberOfLaps).fill(''),
              avg: study.avgTime ?? '',
              allowance: study.allowanceTime ?? '',
              capacityPH: study.capacityPH ?? '',
              capacityPD: study.capacityPD ?? '',
              remarks: study.remarks ?? '',
              machineType: study.machineType ?? op.machineType ?? '',
              id: study.id, // ⬅️ Backend unique ID
            }
          : {
              operationName: op.operationName,
              section: op.section,
              operatorId: '',
              operatorName: '',
              laps: Array(this.numberOfLaps).fill(''),
              avg: '',
              allowance: '',
              capacityPH: '',
              capacityPD: '',
              remarks: '',
              machineType: op.machineType ?? '',
              id: null,
            };
      });

      groupedMap.set(key, rows);
    }

    this.groupedOperations = Array.from(groupedMap.entries()).map(
      ([key, rows]) => ({
        key,
        rows,
        initialCount: Math.round(
          this.operations.find(
            (op) => `${op.operationName}__${op.section}` === key
          )?.allocated ?? 0
        ),
      })
    );
  }

  applyLaps(): void {
    this.numberOfLaps = Math.max(1, Math.min(this.tempLaps, 30));
    this.updateLapsHeaders();
    this.groupOperations();

    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (styleNo) {
      this.orderService
        .updateLapsCount({
          styleNo,
          noOfLaps: this.numberOfLaps,
        })
        .subscribe({
          next: (res) => {
            console.log('✅ Number of Laps updated:', res.message);
          },
          error: (err) => {
            console.error('❌ Failed to update laps', err);
          },
        });
    }
  }

  applyAllowance(): void {
    const clamped = Math.max(0, Math.min(this.tempAllowance, 100));
    this.allowance = clamped;

    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (!styleNo) return;

    this.orderService
      .updateAllowance({ styleNo, allowance: clamped })
      .subscribe({
        next: (res) => {
          console.log('✅ Allowance updated:', res.message);

          // ⬇️ Re-fetch order to get updated allowance & operations
          this.orderService.getOrderByStyleNo(styleNo).subscribe({
            next: (res) => {
              this.operations = res.operations;
              this.allowance = res.allowance ?? 0; // Update UI label as well
              this.laneNo = res.lane;
              this.numberOfLaps = res.noOfLaps ?? 10;
              this.tempLaps = this.numberOfLaps;

              this.updateLapsHeaders();

              // Then re-fetch time study
              this.studyService.getStudyByStyleNo(styleNo).subscribe({
                next: (studyData) => {
                  this.studyGroupedMap.clear();
                  for (const entry of studyData) {
                    const key = `${entry.operationName}__${entry.section}`;
                    if (!this.studyGroupedMap.has(key)) {
                      this.studyGroupedMap.set(key, []);
                    }
                    this.studyGroupedMap.get(key)!.push(entry);
                  }

                  this.groupOperations(); // 🔁 Rebuild table
                },
                error: (err) =>
                  console.error(
                    '❌ Failed to reload study after allowance',
                    err
                  ),
              });
            },
            error: (err) =>
              console.error('❌ Failed to reload order after allowance', err),
          });
        },
        error: (err) => {
          console.error('❌ Failed to update allowance', err);
        },
      });
  }

  addDuplicate(group: { rows: any[] }): void {
    const ref = group.rows[0];
    group.rows.push({
      operationName: ref.operationName,
      section: ref.section,
      operatorId: '',
      operatorName: '',
      laps: Array(this.numberOfLaps).fill(''),
      avg: '',
      allowance: '',
      capacityPH: '',
      capacityPD: '',
      remarks: '',
      machineType: ref.machineType,
      id: null,
    });
  }

  removeRow(
    group: { rows: any[]; initialCount: number },
    rIdx: number,
    rowId: string | null
  ): void {
    if (rowId != null) {
      const confirmDelete = confirm(
        'Are you sure you want to remove this row?'
      );
      if (!confirmDelete) return;
    }

    if (group.rows.length > group.initialCount) {
      // Optionally delete from backend if the row was saved
      if (rowId) {
        this.studyService.deleteStudyById(rowId).subscribe({
          next: () => console.log('✅ Row deleted from backend'),
          error: (err) => console.error('❌ Backend delete failed', err),
        });
        console.log(rowId);
      }
      group.rows.splice(rIdx, 1);
    }
  }

  openAddDataDialog(
    operationName: string,
    section: string,
    machineType: string
  ): void {
    const dialogRef = this.dialog.open(AddOperatorComponent, {
      width: '400px',
      data: { operationName, section, machineType },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const styleNo = this.route.snapshot.paramMap.get('styleNo');
        this.router.navigate(['/stop-watch'], {
          queryParams: {
            styleNo,
            operatorName: result.operatorName,
            operatorId: result.operatorId,
            operationName,
            section,
            machineType,
            noOfLaps: this.numberOfLaps,
          },
        });
      }
    });
  }

  goToStopwatch(row: TimeStudy): void {
    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    this.router.navigate(['/stop-watch'], {
      queryParams: {
        id: row.id, // ⬅️ Pass id to detect update mode
        styleNo,
        operatorName: row.operatorName,
        operatorId: row.operatorId,
        operationName: row.operationName,
        section: row.section,
        machineType: row.machineType,
        noOfLaps: this.numberOfLaps,
      },
    });
  }
  openAddRemarksDialog(row: TimeStudy): void {
    const dialogRef = this.dialog.open(AddRemarksComponent, {
      width: '400px',
      data: {
        operatorName: row.operatorName,
        operationName: row.operationName,
        section: row.section,
      },
    });

    dialogRef.afterClosed().subscribe((remark: string) => {
      if (remark && row.id) {
        this.studyService.updateRemarks(row.id, remark).subscribe({
          next: () => {
            const styleNo = this.route.snapshot.paramMap.get('styleNo');
            if (!styleNo) return;

            // Option 1: Refresh only that row (basic version)
            this.studyService.getStudyByStyleNo(styleNo).subscribe({
              next: (studyData) => {
                const updatedRow = studyData.find((r) => r.id === row.id);
                if (!updatedRow) return;

                const key = `${updatedRow.operationName}__${updatedRow.section}`;
                const group = this.groupedOperations.find((g) => g.key === key);
                if (!group) return;

                const rowIndex = group.rows.findIndex((r) => r.id === row.id);
                if (rowIndex >= 0) {
                  group.rows[rowIndex] = {
                    ...group.rows[rowIndex],
                    remarks: updatedRow.remarks,
                  };
                }
              },
              error: (err) =>
                console.error('❌ Failed to fetch updated row data', err),
            });
          },
          error: (err) => {
            console.error('❌ Failed to update remarks', err);
          },
        });
      }
    });
  }

  downloadExcel(): void {
    if (!this.order) {
      alert('Order data not loaded yet.');
      return;
    }
    const workbook = XLSX.utils.book_new();

    const header = [
      ['Line No.', this.laneNo, '', 'BUYER:', this.order?.buyer, ''],
      [
        'STYLE NO. :',
        this.order?.styleNo,
        '',
        'FABRIC :',
        this.order?.fabric,
        '',
      ],
      [
        'ITEM NO :',
        this.order?.itemNo,
        '',
        'DIVISION:',
        this.order?.division,
        '',
      ],
      [
        'DESC :',
        this.order?.description,
        '',
        'Created By:',
        this.order?.createdBy,
        '',
      ],
    ];

    const tableHeaders = [
      'S.No',
      'Operation Name',
      'Section',
      'Operator ID',
      'Operator Name',
      ...this.lapsHeaders,
      'Avg',
      `Allowance ${this.allowance}%`,
      'Cap/Hr',
      'Cap/Day',
      'Remarks',
    ];

    const tableData: any[][] = [];

    this.groupedOperations.forEach((group, groupIndex) => {
      group.rows.forEach((row) => {
        tableData.push([
          groupIndex + 1,
          row.operationName,
          row.section,
          row.operatorId,
          row.operatorName,
          ...row.laps,
          row.avg,
          row.allowance,
          row.capacityPH,
          row.capacityPD,
          row.remarks || '',
        ]);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
      ...header,
      [],
      tableHeaders,
      ...tableData,
    ]);

    // Column width adjustments
    worksheet['!cols'] = [
      { wch: 6 }, // S.No
      { wch: 25 }, // Operation Name
      { wch: 15 }, // Section
      { wch: 15 }, // Operator ID
      { wch: 18 }, // Operator Name
      ...Array(this.lapsHeaders.length).fill({ wch: 10 }), // Laps
      { wch: 12 }, // Avg
      { wch: 15 }, // Allowance
      { wch: 12 }, // Cap/Hr
      { wch: 12 }, // Cap/Day
      { wch: 20 }, // Remarks
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Study');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileData: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    FileSaver.saveAs(fileData, `TimeStudy_Line${this.laneNo}.xlsx`);
  }

  back(): void {
    this.router.navigate(['/orders']);
  }
}
