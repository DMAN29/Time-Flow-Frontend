import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL, getAuthHeaders } from './base-url';
import { LapsRequest, TimeStudy } from '../model/TimeStudy';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class TimeStudyService {
  private URL = `${BASE_URL}/api/study`;

  constructor(private http: HttpClient) {}

  // ✅ Store a new TimeStudy
  storeStudy(study: Partial<TimeStudy>): Observable<TimeStudy> {
    return this.http.post<TimeStudy>(`${this.URL}`, study, getAuthHeaders());
  }

  // ✅ Get all TimeStudy records
  getAllStudies(): Observable<TimeStudy[]> {
    return this.http.get<TimeStudy[]>(`${this.URL}`, getAuthHeaders());
  }

  getStudyByStyleNo(styleNo: string): Observable<TimeStudy[]> {
    return this.http.get<TimeStudy[]>(
      `${this.URL}/${styleNo}`,
      getAuthHeaders()
    );
  }

  // ✅ Get TimeStudy by operatorId & styleNo via query params
  getStudyByOperator(
    operatorId: string,
    styleNo: string
  ): Observable<TimeStudy> {
    return this.http.get<TimeStudy>(`${this.URL}/operator`, {
      params: {
        operatorId,
        styleNo,
      },
      headers: getAuthHeaders().headers, // ✅ Extract the headers only
    });
  }

  // ✅ Update Laps
  updateLaps(laps: LapsRequest): Observable<TimeStudy> {
    return this.http.put<TimeStudy>(
      `${this.URL}/update`,
      laps,
      getAuthHeaders()
    );
  }

  // ✅ Update Remarks
  updateRemarks(id: string, remark: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.URL}/remarks/${id}?remarks=${encodeURIComponent(remark)}`,
      {}, // empty body
      getAuthHeaders()
    );
  }

  deleteStudyById(id: string): Observable<any> {
    return this.http.delete(`${this.URL}/delete/${id}`, getAuthHeaders());
  }

  updateLapsReading(
    id: string,
    study: Partial<TimeStudy>
  ): Observable<TimeStudy> {
    return this.http.put<any>(
      `${this.URL}/update/${id}`,
      study,
      getAuthHeaders()
    );
  }
}
