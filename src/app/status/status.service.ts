import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StatusRequest {
    name: string,
    url: string,
    type: 'value' | 'health',
};

export interface StatusResponse {
    message: string,
    status: 'HOLD' | 'OK' | 'WARN' | 'CRIT',
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  constructor(private http: HttpClient) {}

  getResponse(url: string): Observable<StatusResponse>
  {
    return this.http.get<StatusResponse>(url);
  }
}
