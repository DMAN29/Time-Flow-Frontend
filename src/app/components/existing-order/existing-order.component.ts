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
  // isAdmin: boolean = false;
  userRoles: string[] = [];

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
    this.userService.roles$.subscribe((roles) => {
      this.userRoles = roles; // Store all roles locally

      // Show "delete" column only for users with ROLE_ADMIN
      if (
        roles.includes('ROLE_ADMIN') &&
        !this.displayedColumns.includes('delete')
      ) {
        this.displayedColumns.push('delete');
      }

      // You can add more conditions here based on other roles (e.g., ROLE_HEAD)
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

    if (!value) {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter((order) => {
        const styleNoMatch = order.styleNo.toLowerCase().includes(value);
        const buyerMatch = order.buyer.toLowerCase().includes(value);
        return styleNoMatch || buyerMatch;
      });
    }
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
