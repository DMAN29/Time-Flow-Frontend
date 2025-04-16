import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-operator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './add-operator.component.html',
  styleUrls: ['./add-operator.component.css'],
})
export class AddOperatorComponent {
  operatorId: string = '';
  operatorName: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      operationName: string;
      section: string;
      machineType: string;
    },
    private dialogRef: MatDialogRef<AddOperatorComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onNext(): void {
    if (this.operatorId && this.operatorName) {
      this.dialogRef.close({
        operatorId: this.operatorId,
        operatorName: this.operatorName,
        machineType: this.data.machineType,
      });
    }
  }
}
