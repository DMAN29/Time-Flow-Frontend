import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL, getAuthHeaders } from './base-url';
import {
  AllowanceRequest,
  EfficiencyRequest,
  LaneRequest,
  LapsCountRequest,
  Order,
  TargetRequest,
} from '../model/Order';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private URL = `${BASE_URL}/api/order`;

  constructor(private http: HttpClient) {}

  // Create Order
  createOrder(order: any): Observable<Order> {
    // console.log('Creating order:', order); // 👈 console log here

    return this.http.post<Order>(`${this.URL}`, order, getAuthHeaders());
  }

  // Get All Orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.URL}`, getAuthHeaders());
  }

  // Get Order by Style Number
  getOrderByStyleNo(styleNo: string): Observable<Order> {
    return this.http.get<Order>(
      `${this.URL}/style/${encodeURIComponent(styleNo)}`,
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

  updateLapsCount(lap: LapsCountRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/laps`,
      lap,
      getAuthHeaders() // or just `{ headers: ... }`
    );
  }

  deleteOrder(styleNo: string): Observable<ApiResponse> {
    const encodedStyleNo = encodeURIComponent(styleNo);
    return this.http.delete<ApiResponse>(
      `${this.URL}/delete/${encodedStyleNo}`,
      getAuthHeaders()
    );
  }

  // Update Target
  updateTarget(target: TargetRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/update/target`,
      target,
      getAuthHeaders()
    );
  }

  // Update Efficiency
  updateEfficiency(efficiency: EfficiencyRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/update/efficiency`,
      efficiency,
      getAuthHeaders()
    );
  }
}
