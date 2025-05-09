import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
} from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
    MatProgressSpinner,
  ],
})
export class NewOrderComponent {
  orderForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      styleNo: ['', [Validators.required, this.noWhitespaceValidator]],
      itemNo: ['', [Validators.required, this.noWhitespaceValidator]],
      fabric: ['', [Validators.required, this.noWhitespaceValidator]],
      division: ['', [Validators.required, this.noWhitespaceValidator]],
      buyer: ['', [Validators.required, this.noWhitespaceValidator]],
      description: ['', [Validators.required, this.noWhitespaceValidator]],
      orderQuantity: [null, [Validators.required, Validators.min(1)]],
      target: [null, [Validators.required, Validators.min(1)]],
      efficiency: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      line: [null, [Validators.required, Validators.min(1)]],
      file: [null, Validators.required],
    });
  }

  get f() {
    return this.orderForm.controls;
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString();
    const isWhitespace = value.trim().length === 0;
    return isWhitespace ? { required: true } : null;
  }

  formatWithCommas(value: any): string {
    if (value == null || value === '') return '';
    const num = parseInt(value.toString().replace(/,/g, ''), 10);
    return isNaN(num) ? '' : num.toLocaleString('en-US');
  }

  updateFormattedNumber(controlName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/,/g, '');
    const numericValue = parseInt(rawValue, 10);
    const control = this.orderForm.get(controlName);

    if (control) {
      if (!isNaN(numericValue)) {
        control.setValue(numericValue, { emitEvent: false });

        const errors = { ...control.errors };

        if (numericValue < 1) {
          errors['min'] = true;
        } else {
          delete errors['min'];
        }

        control.setErrors(Object.keys(errors).length ? errors : null);
        control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      } else {
        control.setValue(null, { emitEvent: false });
        control.setErrors({ required: true });
        control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }

      control.markAsTouched();
      target.value = this.formatWithCommas(control.value);
    }
  }

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
    if (this.orderForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const raw = this.orderForm.value;
      const sanitizedOrder = {
        styleNo: raw.styleNo.trim(),
        itemNo: raw.itemNo.trim(),
        fabric: raw.fabric.trim(),
        division: raw.division.trim(),
        buyer: raw.buyer.trim(),
        description: raw.description.trim(),
        orderQuantity: Number(raw.orderQuantity),
        target: Number(raw.target),
        efficiency: raw.efficiency,
        lane: raw.line,
      };

      const formData = new FormData();
      formData.append('file', raw.file);
      formData.append(
        'order',
        new Blob([JSON.stringify(sanitizedOrder)], { type: 'application/json' })
      );

      this.orderService.createOrder(formData).subscribe({
        next: (res: Order) => {
          this.snackBar.open('Order created successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });

          this.orderForm.reset();
          this.selectedFile = null;
          this.isSubmitting = false;
          this.router.navigate(['/order', res.styleNo]);
        },
        error: (err) => {
          console.error('Error creating order:', err);

          const backendMessage =
            err?.error && typeof err.error === 'string'
              ? err.error
              : 'Failed to create order. Try again.';

          this.snackBar.open(backendMessage, 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });

          this.isSubmitting = false;
        },
      });
    } else {
      this.orderForm.markAllAsTouched();
    }
  }
}
