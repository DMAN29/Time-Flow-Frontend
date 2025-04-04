import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../service/order.service';
import { Order } from '../../model/Order';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-existing-order',
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './existing-order.component.html',
})
export class ExistingOrderComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = [
    'sno',
    'styleNo',
    'itemNo',
    'buyer',
    'orderQuantity',
    'target',
    'efficiency',
    'designOutput',
    'allowance',
    'lane',
    'lineDesign',
    'createdBy',
  ];

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res;
        console.log('Orders loaded:', this.orders);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
      },
    });
  }

  get dataSource() {
    return this.orders;
  }

  goToOrderDetails(styleNo: string) {
    this.router.navigate(['/order', styleNo]);
  }
}
