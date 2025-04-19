import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../service/company.service';
import { Company } from '../../model/Company';
import { ApiResponse } from '../../model/ApiResponse';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-company',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
    CommonModule,
    MatTooltip,
  ],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css'],
})
export class CompanyComponent implements OnInit {
  companies: Company[] = [];
  displayedColumns: string[] = ['sno', 'name', 'createdAt', 'actions'];
  newCompanyName: string = '';
  isLoading = false;
  companyUsage: { [key: string]: boolean } = {};
  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompanyList().subscribe({
      next: (companies) => {
        this.companies = companies;
        companies.forEach((company) => {
          this.companyService.checkCompanyUsage(company.name).subscribe({
            next: (inUse) => (this.companyUsage[company.name] = inUse),
            error: () => (this.companyUsage[company.name] = false),
          });
        });
      },
    });
  }
  addCompany(): void {
    const name = this.newCompanyName.trim().toUpperCase();
    if (!name) return;

    this.companyService.addCompany({ name }).subscribe({
      next: () => {
        this.newCompanyName = '';
        this.loadCompanies();
      },
      error: (err) => {
        console.error('Error adding company:', err.error);
        alert(`Failed to add company. \n${err.error}`);
      },
    });
  }

  deleteCompany(name: string): void {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      this.companyService.deleteCompany(name).subscribe({
        next: () => this.loadCompanies(),
        error: (err) => {
          console.error('Error deleting company:', err);
          alert('Failed to delete company.');
        },
      });
    }
  }
}
