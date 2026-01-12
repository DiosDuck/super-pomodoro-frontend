import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { WorkTimeHistoryResponse } from "./profile.models";

@Injectable({
    providedIn: 'root'
})
export class UpdateUserService {
    private _http = inject(HttpClient);
    
    updatePassword(oldPassword: string, newPassword: string): Observable<Object>
    {
        return this._http.post(
            '/api/auth/password/change-password',
            {
                password: oldPassword,
                newPassword: newPassword,
            },
        );
    }

    deleteAccount(password: string): Observable<Object>
    {
        return this._http.delete(
            '/api/profile',
            {
                body: {
                    password: password
                }
            },
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class WorkSessionHistoryService {
    private _http = inject(HttpClient);

    getHistory() : Observable<WorkTimeHistoryResponse[]>
    {
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        
        let params = new HttpParams();

        return this._http.get<WorkTimeHistoryResponse[]>(
            `/api/pomodoro/session/history`,
            {
                params: params.append('timestamp', date.getTime())
            }
        );
    }
}
