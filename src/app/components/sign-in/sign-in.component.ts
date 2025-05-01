import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../service/auth.service';
import { User } from '../../model/User';
import { LoginResponse } from '../../model/LoginResponse';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signin',
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
    MatProgressSpinner,
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  signInForm: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isSubmitting = true;

      const loginData: User = this.signInForm.value;

      this.authService.login(loginData).subscribe({
        next: (res: LoginResponse) => {
          localStorage.setItem('token', res.jwt);
          localStorage.setItem('email', res.email);
          this.router.navigate(['/']);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Login failed', err.error);
          alert(
            'Login failed. Please check your email and password and try again.'
          );
          this.isSubmitting = false;
        },
      });
    } else {
      this.signInForm.markAllAsTouched();
    }
  }

  get f() {
    return this.signInForm.controls;
  }
}
