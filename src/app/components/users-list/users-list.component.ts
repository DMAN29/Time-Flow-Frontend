import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../model/User';
import { MatTableModule } from '@angular/material/table';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButton,
    MatButtonModule,
    MatLabel,
    FormsModule,
    MatFormField,
    MatInput,
    MatIcon,
    MatSelectModule,
    MatTooltip,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  filterValue: string = '';
  loggedInRoles: string[] = [];
  displayedColumns: string[] = [
    'S.No',
    'name',
    'email',
    'role',
    'createdAt',
    'update',
    'delete',
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.roles$.subscribe((roles) => {
      this.loggedInRoles = roles;

      if (
        this.loggedInRoles.includes('ROLE_HEAD') &&
        !this.displayedColumns.includes('company')
      ) {
        this.displayedColumns.splice(4, 0, 'company'); // insert after role
      }
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      },
    });
  }

  applyFilter(): void {
    const term = this.filterValue.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const company = user.company?.toLowerCase() || '';

        if (this.loggedInRoles.includes('ROLE_ADMIN')) {
          return fullName.includes(term) || company.includes(term);
        } else {
          return fullName.includes(term);
        }
      });
    }
  }

  getCurrentRole(user: User): string {
    if (user.role.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (user.role.includes('ROLE_USER')) return 'ROLE_USER';
    return 'NONE';
  }

  updateRole(email: string, role: string): void {
    this.userService.changeUserRole(email, role).subscribe({
      next: () => {
        alert(`Role updated to ${role}`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating role:', err);
        alert('Failed to update role.');
      },
    });
  }

  deleteUser(email: string): void {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      this.userService.deleteUser(email).subscribe({
        next: () => {
          alert('User deleted!');
          this.loadUsers();
        },
        error: (err) => console.error('Error deleting user:', err),
      });
    }
  }
}
