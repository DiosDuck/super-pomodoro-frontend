import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusResponse } from '../models/status';

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
