import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Order } from '../../model/Order';
import { OrderService } from '../../service/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css'],
})
export class NewOrderComponent {
  orderForm: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) {
    this.orderForm = this.fb.group({
      styleNo: ['', Validators.required],
      itemNo: ['', Validators.required],
      fabric: ['', Validators.required],
      division: ['', Validators.required],
      buyer: ['', Validators.required],
      description: ['', Validators.required],
      orderQuantity: [null, [Validators.required, Validators.min(1)]],
      target: [null, [Validators.required, Validators.min(1)]],
      efficiency: [null, [Validators.required, Validators.min(1)]],
    });
  }

  // ✅ Format number with commas
  formatNumber(value: any): string {
    if (value == null || value === '') return '';
    const num = parseInt(value.toString().replace(/,/g, ''), 10);
    return isNaN(num) ? '' : num.toLocaleString('en-US');
  }

  // ✅ Update number and remove commas before storing in form
  updateNumber(controlName: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/,/g, '');
    const numericValue = parseInt(rawValue, 10);
    if (!isNaN(numericValue)) {
      this.orderForm.get(controlName)?.setValue(numericValue);
    } else {
      this.orderForm.get(controlName)?.setValue(null);
    }
  }

  // ✅ Submit the form
  onSubmit(): void {
    if (this.orderForm.valid) {
      const order: Order = this.orderForm.value;
      console.log('Submitting Order:', order);
      this.orderService.createOrder(order).subscribe({
        next: (res) => {
          alert('Order created successfully!');
          this.orderForm.reset();
        },
        error: (err) => {
          console.error('Error creating order:', err);
          alert('Failed to create order. Try again.');
        },
      });
    } else {
      this.orderForm.markAllAsTouched();
    }
  }
}
