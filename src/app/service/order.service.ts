import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from './base-url';
import { AllowanceRequest, LaneRequest, Order } from '../model/Order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private URL = `${BASE_URL}/api/order`;

  constructor(private http: HttpClient) {}

  // Create Order
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.URL}`, order, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  // Get All Orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.URL}`);
  }

  // Get Order by Style Number
  getOrderByStyleNo(styleNo: string): Observable<Order> {
    return this.http.get<Order>(`${this.URL}/style/${styleNo}`);
  }

  // Get Order by Item Number
  getOrderByItemNo(itemNo: string): Observable<Order> {
    return this.http.get<Order>(`${this.URL}/item/${itemNo}`);
  }

  // Upload File to Update Operations
  updateOperations(styleNo: string, file: File): Observable<Order> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<Order>(`${this.URL}/upload/${styleNo}`, formData);
  }

  // Update Allowance
  updateAllowance(allowance: AllowanceRequest): Observable<string> {
    return this.http.put(`${this.URL}/allowance`, allowance, {
      responseType: 'text',
    });
  }

  // Update Lane
  updateLane(lane: LaneRequest): Observable<string> {
    return this.http.put(`${this.URL}/lane`, lane, {
      responseType: 'text',
    });
  }
}
