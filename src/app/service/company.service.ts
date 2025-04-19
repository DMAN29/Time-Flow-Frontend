import { Injectable } from '@angular/core';
import { BASE_URL, getAuthHeaders } from './base-url';
import { HttpClient } from '@angular/common/http';
import { Company } from '../model/Company';
import { Observable } from 'rxjs';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private URL = `${BASE_URL}/api/company`;
  constructor(private http: HttpClient) {}

  addCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(`${this.URL}`, company, getAuthHeaders());
  }

  getCompanyList(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.URL}`);
  }

  deleteCompany(name: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.URL}/delete/${name}`,
      getAuthHeaders()
    );
  }
  checkCompanyUsage(name: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.URL}/check/${name}`,
      getAuthHeaders()
    );
  }
}
