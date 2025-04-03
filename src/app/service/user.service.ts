import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from './base-url';
import { User } from '../model/User';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private URL = `${BASE_URL}/api/user`;

  constructor(private http: HttpClient) {}

  // ✅ Auth header helper
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // ✅ Get all users (assuming public or admin endpoint)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.URL}`);
  }

  // ✅ Get profile (requires auth)
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.URL}/profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Change user role (requires auth)
  changeUserRole(email: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/change-role?email=${email}`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // ✅ Delete user (requires auth)
  deleteUser(email: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.URL}/delete?email=${email}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
