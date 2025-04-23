import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  userRoles: string[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.roles$.subscribe((roles) => {
      this.userRoles = roles;
    });
  }

  downloadSampleOB(): void {
    const link = document.createElement('a');
    link.href = '/assets/sample-ob.xlsx';
    link.download = 'Sample_OB_Template.xlsx';
    link.click();
  }
}
