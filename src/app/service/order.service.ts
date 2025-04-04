import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL, getAuthHeaders } from './base-url';
import { AllowanceRequest, LaneRequest, Order } from '../model/Order';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private URL = `${BASE_URL}/api/order`;

  constructor(private http: HttpClient) {}

  // Create Order
  createOrder(order: any): Observable<Order> {
    return this.http.post<Order>(`${this.URL}`, order, getAuthHeaders());
  }

  // Get All Orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.URL}`, getAuthHeaders());
  }

  // Get Order by Style Number
  getOrderByStyleNo(styleNo: string): Observable<Order> {
    return this.http.get<Order>(
      `${this.URL}/style/${styleNo}`,
      getAuthHeaders()
    );
  }

  // Get Order by Item Number
  getOrderByItemNo(itemNo: string): Observable<Order> {
    return this.http.get<Order>(`${this.URL}/item/${itemNo}`, getAuthHeaders());
  }

  // // Upload File to Update Operations
  // updateOperations(styleNo: string, file: File): Observable<Order> {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   return this.http.put<Order>(`${this.URL}/upload/${styleNo}`, formData);
  // }

  // Update Allowance
  updateAllowance(allowance: AllowanceRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/allowance`,
      allowance,
      getAuthHeaders()
    );
  }

  // Update Lane
  updateLane(lane: LaneRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/lane`,
      lane,
      getAuthHeaders()
    );
  }
}
