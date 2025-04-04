import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../model/User';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = [
    'serial',
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
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      },
    });
  }

  updateRole(email: string): void {
    this.userService.changeUserRole(email).subscribe({
      next: () => {
        alert('Role updated!');
        this.ngOnInit(); // refresh the table
      },
      error: (err) => {
        console.error('Error updating role:', err);
      },
    });
  }

  deleteUser(email: string): void {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      this.userService.deleteUser(email).subscribe({
        next: () => {
          alert('User deleted!');
          this.ngOnInit();
        },
        error: (err) => {
          console.error('Error deleting user:', err.error);
          alert(err.error || 'Failed to delete user!');
        },
      });
    }
  }
}
