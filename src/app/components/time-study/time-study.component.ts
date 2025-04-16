import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../service/order.service';
import { TimeStudyService } from '../../service/time-study.service';
import { Operation } from '../../model/Order';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AddOperatorComponent } from './add-operator/add-operator.component';

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

  tempAllowance: number = 0;
  tempLaps: number = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private studyService: TimeStudyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (styleNo) {
      this.orderService.getOrderByStyleNo(styleNo).subscribe({
        next: (res) => {
          this.operations = res.operations;
          this.laneNo = res.lane;
          this.allowance = res.allowance ?? 0;
          this.tempAllowance = this.allowance;
          this.numberOfLaps = res.noOfLaps ?? 10;
          this.tempLaps = this.numberOfLaps;

          this.updateLapsHeaders();
          this.groupOperations(); // ⬅️ First build the table

          // ⬅️ THEN inject time study into rows
          this.studyService.getStudyByStyleNo(styleNo).subscribe({
            next: (studyData) => {
              this.canEditLaps = studyData.length === 0;
              console.log(studyData);
              for (const entry of studyData) {
                const key = `${entry.operationName}__${entry.section}`;
                const group = this.groupedOperations.find((g) => g.key === key);
                if (group && group.rows.length > 0) {
                  // Find the first empty row in the group to insert into
                  const targetRow = group.rows.find(
                    (row) => !row.operatorId && !row.operatorName
                  );

                  if (targetRow) {
                    targetRow.operatorId = entry.operatorId;
                    targetRow.operatorName = entry.operatorName;
                    targetRow.machineType = entry.machineType;
                    targetRow.laps =
                      entry.laps ?? Array(this.numberOfLaps).fill('');
                    targetRow.avg = entry.avgTime ?? '';
                    targetRow.allowance = entry.allowanceTime ?? '';
                    targetRow.capacityPH = entry.capacityPH ?? '';
                    targetRow.capacityPD = entry.capacityPD ?? '';
                    targetRow.remarks = entry.remarks ?? '';
                  } else {
                    console.warn(
                      `⚠️ No available row to map for ${entry.operationName} - ${entry.operatorName}`
                    );
                  }
                }
              }
            },
            error: () => (this.canEditLaps = true),
          });
        },
        error: (err) => console.error('❌ Order fetch error:', err),
      });
    }
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
      const times = Math.round(op.allocated);

      const rows = Array.from({ length: times }, () => ({
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
        machineType: op.machineType || '',
      }));

      if (groupedMap.has(key)) {
        groupedMap.get(key)!.push(...rows);
      } else {
        groupedMap.set(key, rows);
      }
    }

    this.groupedOperations = Array.from(groupedMap.entries()).map(
      ([key, rows]) => ({
        key,
        rows,
        initialCount: rows.length,
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
    this.allowance = Math.max(0, Math.min(this.tempAllowance, 100));
    this.groupedOperations.forEach((group) =>
      group.rows.forEach((row) => (row.allowance = this.allowance))
    );

    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (styleNo) {
      this.orderService
        .updateAllowance({ styleNo, allowance: this.allowance })
        .subscribe({
          next: (res) => console.log('✅ Allowance updated:', res.message),
          error: (err) => console.error('❌ Failed to update allowance', err),
        });
    }
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
    });
  }

  removeRow(group: { rows: any[]; initialCount: number }, rIdx: number): void {
    if (group.rows.length > group.initialCount) group.rows.splice(rIdx, 1);
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

  goToStopwatch(row: any): void {
    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    this.router.navigate(['/stop-watch'], {
      queryParams: {
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
}
