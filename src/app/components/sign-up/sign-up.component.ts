import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../service/auth.service';
import { User } from '../../model/User';
import { CompanyService } from '../../service/company.service';
import { Company } from '../../model/Company';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatOption,
    MatProgressSpinner,
    MatSelectModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  signUpForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  companyList: Company[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private companyService: CompanyService,
    private snackBar: MatSnackBar
  ) {
    this.signUpForm = this.fb.group({
      company: ['', Validators.required],
      userId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });

    this.companyService.getCompanyList().subscribe({
      next: (res) => (this.companyList = res),
      error: (err) => console.error('Failed to fetch companies', err),
    });
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signUpForm.valid && !this.isSubmitting) {
      const { password, confirmPassword } = this.signUpForm.value;

      if (password !== confirmPassword) {
        this.signUpForm.get('confirmPassword')?.setErrors({ mismatch: true });
        return;
      }

      const newUser: Partial<User> = {
        userId: this.signUpForm.value.userId,
        email: this.signUpForm.value.email,
        firstName: this.signUpForm.value.firstName,
        lastName: this.signUpForm.value.lastName,
        password: this.signUpForm.value.password,
        company: this.signUpForm.value.company,
      };

      this.isSubmitting = true;

      this.authService.register(newUser).subscribe({
        next: () => {
          this.snackBar.open(
            'Account created successfully. Please sign in.',
            'Close',
            {
              duration: 3000,
              panelClass: ['snackbar-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
          this.router.navigate(['/sign-in']);
          this.isSubmitting = false;
        },
        error: (err) => {
          const backendError =
            err?.error || 'Registration failed. Please try again.';
          this.snackBar.open(backendError, 'Close', {
            duration: 4000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.isSubmitting = false;
        },
      });
    } else {
      this.signUpForm.markAllAsTouched();
    }
  }

  get f() {
    return this.signUpForm.controls;
  }
}
