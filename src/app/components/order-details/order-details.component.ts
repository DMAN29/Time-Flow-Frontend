import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../service/order.service';
import { Operation, Order } from '../../model/Order';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
  dataSource = new MatTableDataSource<Operation>();
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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const styleNo = this.route.snapshot.paramMap.get('styleNo');
    if (styleNo) {
      this.orderService.getOrderByStyleNo(styleNo).subscribe({
        next: (res: Order) => {
          this.order = res;

          const summary: Operation = {
            id: '', // Or 'summary'
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
        },
        error: (err) => {
          console.error('Failed to fetch order:', err);
        },
      });
    }
  }
}
