import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL, getAuthHeaders } from './base-url';
import { User } from '../model/User';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private URL = `${BASE_URL}/api/user`;

  private rolesSubject = new BehaviorSubject<string[]>([]);
  roles$ = this.rolesSubject.asObservable(); // use this in components

  constructor(private http: HttpClient) {}

  // Get profile and store roles
  loadUserProfile(): void {
    this.getUserProfile().subscribe({
      next: (res) => {
        this.rolesSubject.next(res.role); // store the full role list
      },
      error: () => {
        this.rolesSubject.next([]);
      },
    });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.URL}/profile`, getAuthHeaders());
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.URL}`, getAuthHeaders());
  }

  changeUserRole(email: string, role: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/change-role?email=${email}&role=${role}`,
      {},
      getAuthHeaders()
    );
  }

  deleteUser(email: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.URL}/delete?email=${email}`,
      getAuthHeaders()
    );
  }

  pauseUserRole(email: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/pause-role?email=${email}`,
      {}, // empty body
      getAuthHeaders()
    );
  }
}
