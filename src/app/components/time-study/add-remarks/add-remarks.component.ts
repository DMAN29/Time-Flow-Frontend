import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-add-remarks',
  standalone: true,
  templateUrl: './add-remarks.component.html',
  styleUrls: ['./add-remarks.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
  ],
})
export class AddRemarksComponent {
  remarks: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddRemarksComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      operatorName: string;
      section: string;
      operationName: string;
    }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.remarks);
  }
}
