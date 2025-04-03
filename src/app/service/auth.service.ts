import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';
import { LoginResponse } from '../model/LoginResponse';
import { ApiResponse } from '../model/ApiResponse';
import { Observable } from 'rxjs';
import { BASE_URL } from './base-url';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private URL = BASE_URL;

  constructor(private http: HttpClient) {}

  // 🔐 Login (expects jwt + message)
  login(user: User): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.URL}/login`, user);
  }

  // 📝 Register (expects JSON response with message)
  register(user: Partial<User>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.URL}/register`, user);
  }
}
