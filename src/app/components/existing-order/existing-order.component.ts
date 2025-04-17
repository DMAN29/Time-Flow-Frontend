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
import { UserService } from '../../service/user.service';
import { ApiResponse } from '../../model/ApiResponse';

@Component({
  selector: 'app-existing-order',
  standalone: true,
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
  isAdmin: boolean = false;

  displayedColumns: string[] = [
    'sno',
    'styleNo',
    'itemNo',
    'buyer',
    'orderQuantity',
    'target',
    'efficiency',
    'designOutput',
    'lane',
    'lineDesign',
    'view',
    'timeStudy',
  ];

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to admin role
    this.userService.isAdmin$.subscribe((res) => {
      this.isAdmin = res;
      if (this.isAdmin && !this.displayedColumns.includes('delete')) {
        this.displayedColumns.push('delete');
      }
    });

    // Load all orders
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
    this.filteredOrders = value
      ? this.orders.filter((order) =>
          order.styleNo.toLowerCase().includes(value)
        )
      : this.orders;
  }

  goToOrderDetails(styleNo: string) {
    this.router.navigate(['/order', styleNo]);
  }

  goToTimeStudy(styleNo: string) {
    this.router.navigate(['/time-study', styleNo]);
  }

  deleteOrder(styleNo: string): void {
    if (confirm(`Are you sure you want to delete Style No: ${styleNo}?`)) {
      this.orderService.deleteOrder(styleNo).subscribe({
        next: (res: ApiResponse) => {
          console.log('✅', res.message);
          // Remove from UI
          this.filteredOrders = this.filteredOrders.filter(
            (order) => order.styleNo !== styleNo
          );
        },
        error: (err) => console.error('❌ Failed to delete order:', err),
      });
    }
  }
}
