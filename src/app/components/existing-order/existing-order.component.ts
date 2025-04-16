import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../service/order.service';
import { Order } from '../../model/Order';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-existing-order',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButton,
    MatLabel,
    FormsModule,
    MatFormField,
    MatInput,
  ],
  templateUrl: './existing-order.component.html',
})
export class ExistingOrderComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchText: string = '';
  displayedColumns: string[] = [
    'sno',
    'styleNo',
    'itemNo',
    'buyer',
    'orderQuantity',
    'target',
    'efficiency',
    'designOutput',
    // 'allowance',
    'lane',
    'lineDesign',
    'view',
    'timeStudy',
  ];

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data;
      },
      error: (err) => console.error('Error loading orders', err),
    });
  }

  applyFilter(): void {
    const value = this.searchText.trim().toLowerCase();
    if (!value) {
      // If input is empty, show all
      this.filteredOrders = this.orders;
    } else {
      // Filter by styleNo
      this.filteredOrders = this.orders.filter((order) =>
        order.styleNo.toLowerCase().includes(value)
      );
    }
  }

  goToOrderDetails(styleNo: string) {
    this.router.navigate(['/order', styleNo]);
  }
  goToTimeStudy(styleNo: string) {
    this.router.navigate(['/time-study', styleNo]);
  }
}
