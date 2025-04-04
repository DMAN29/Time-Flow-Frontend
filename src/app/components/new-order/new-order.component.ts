import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../service/order.service';
import { Order } from '../../model/Order';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatIcon } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatIcon,
    MatError,
  ],
})
export class NewOrderComponent {
  orderForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      styleNo: ['', Validators.required],
      itemNo: ['', Validators.required],
      fabric: ['', Validators.required],
      division: ['', Validators.required],
      buyer: ['', Validators.required],
      description: ['', Validators.required],
      orderQuantity: [null, [Validators.required, Validators.min(1)]],
      target: [null, [Validators.required, Validators.min(1)]],
      efficiency: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      allowance: [
        null,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      line: ['', Validators.required],
      file: [null, Validators.required],
    });
  }

  get f() {
    return this.orderForm.controls;
  }

  // formatNumber(value: any): string {
  //   if (value == null || value === '') return '';
  //   const num = parseInt(value.toString().replace(/,/g, ''), 10);
  //   return isNaN(num) ? '' : num.toLocaleString('en-US');
  // }

  // updateNumber(controlName: string, event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const rawValue = target.value.replace(/,/g, '');
  //   const numericValue = parseInt(rawValue, 10);
  //   const control = this.orderForm.get(controlName);

  //   if (!isNaN(numericValue)) {
  //     control?.setValue(numericValue);
  //   } else {
  //     control?.setValue(null);
  //   }

  //   // ✅ Ensure touched state so error appears
  //   control?.markAsTouched();
  // }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.orderForm.patchValue({ file: this.selectedFile });
      this.f['file'].markAsTouched();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.orderForm.patchValue({ file: this.selectedFile });
      this.f['file'].markAsTouched();
    }
  }

  onSubmit(): void {
    console.log('Form submitted');
    if (this.orderForm.valid) {
      const raw = this.orderForm.value;
      const formData = new FormData();

      formData.append('file', raw.file);
      formData.append(
        'order',
        new Blob(
          [
            JSON.stringify({
              styleNo: raw.styleNo,
              itemNo: raw.itemNo,
              fabric: raw.fabric,
              division: raw.division,
              buyer: raw.buyer,
              description: raw.description,
              orderQuantity: raw.orderQuantity,
              target: raw.target,
              efficiency: raw.efficiency,
              lane: raw.line,
              allowance: raw.allowance,
            }),
          ],
          { type: 'application/json' }
        )
      );

      this.orderService.createOrder(formData).subscribe({
        next: (res: Order) => {
          alert('Order created successfully!');
          console.log('Order created:', res);
          this.orderForm.reset();
          this.selectedFile = null;
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
