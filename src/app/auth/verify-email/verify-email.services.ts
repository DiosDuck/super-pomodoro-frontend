import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ResetPasswordService {
    private _token : string = '';
    private _id : number = -1;
    private _http = inject(HttpClient);

    setParameters(token: string, id: number): void
    {
        this._token = token;
        this._id = id;
    }

    updatePassword(newPassword: string): Observable<Object>
    {
        return this._http.post('/api/auth/password/reset-password', {
            token: this._token,
            id: this._id,
            newPassword: newPassword
        });
    }
}