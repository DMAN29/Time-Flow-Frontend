import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL, getAuthHeaders } from './base-url';
import { User } from '../model/User';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private URL = `${BASE_URL}/api/user`;

  constructor(private http: HttpClient) {}

  // ✅ Get all users (assuming public or admin endpoint)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.URL}`, getAuthHeaders());
  }

  // ✅ Get profile (requires auth)
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.URL}/profile`, getAuthHeaders());
  }

  // ✅ Change user role (requires auth)
  changeUserRole(email: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/change-role?email=${email}`,
      {},
      getAuthHeaders()
    );
  }

  // ✅ Delete user (requires auth)
  deleteUser(email: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.URL}/delete?email=${email}`,
      getAuthHeaders()
    );
  }
}
