import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../model/User';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterModule,
    MatMenuModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  // isAdmin: boolean = false;
  userRoles: string[] = [];
  menuOpen: boolean = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Load user profile to populate BehaviorSubject
    this.userService.loadUserProfile();

    // Subscribe to admin status
    this.userService.roles$.subscribe((roles) => {
      this.userRoles = roles;
      // this.isAdmin = roles.includes('ROLE_ADMIN');
    });

    // Optionally load full profile for display purposes
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        console.error('Failed to fetch user profile', err);
      },
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/sign-in']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
