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
import { AuthService } from '../../service/auth.service';
import { User } from '../../model/User';

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
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  signUpForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signUpForm = this.fb.group({
      userId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const { password, confirmPassword } = this.signUpForm.value;

      if (password !== confirmPassword) {
        // alert('Passwords Mismatch! Please try again.');
        this.signUpForm.get('confirmPassword')?.setErrors({ mismatch: true });
        return;
      }

      const newUser: Partial<User> = {
        userId: this.signUpForm.value.userId,
        email: this.signUpForm.value.email,
        firstName: this.signUpForm.value.firstName,
        lastName: this.signUpForm.value.lastName,
        password: this.signUpForm.value.password,
      };
      console.log('New User:', newUser);
      this.authService.register(newUser).subscribe({
        next: (res) => {
          alert('Account created successfully. Please sign in.');
          this.router.navigate(['/sign-in']);
        },
        error: (err) => {
          console.error('Registration failed:', err.error);
          alert('Registration failed. Please try again.');
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
