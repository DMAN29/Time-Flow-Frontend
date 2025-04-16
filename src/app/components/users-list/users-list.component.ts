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

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButton,
    MatLabel,
    FormsModule,
    MatFormField,
    MatInput,
    MatIcon,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  filterValue: string = '';

  displayedColumns: string[] = [
    'S.No',
    'name',
    'email',
    'role',
    'update',
    'delete',
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
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
      this.filteredUsers = this.users.filter((user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
      );
    }
  }

  updateRole(email: string): void {
    this.userService.changeUserRole(email).subscribe({
      next: () => {
        alert('Role updated!');
        this.ngOnInit(); // Refresh
      },
      error: (err) => console.error('Error updating role:', err),
    });
  }

  deleteUser(email: string): void {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      this.userService.deleteUser(email).subscribe({
        next: () => {
          alert('User deleted!');
          this.ngOnInit();
        },
        error: (err) => console.error('Error deleting user:', err),
      });
    }
  }
}
