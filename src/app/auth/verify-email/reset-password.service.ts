import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ResetPasswordService {
    private token : string = '';
    private id : number = -1;
    private readonly http = inject(HttpClient);

    setParameters(token: string, id: number): void
    {
        this.token = token;
        this.id = id;
    }

    updatePassword(newPassword: string): Observable<Object>
    {
        return this.http.post('/api/auth/password/reset-password', {
            token: this.token,
            id: this.id,
            newPassword: newPassword
        });
    }
}