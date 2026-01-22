import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { UserService, LoginData, TokenResponse, nullableUser } from '../shared/utils/user.service';

export interface RegisterData {
    username: string,
    password: string,
    email: string,
    displayName: string,
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
    constructor(
        private _http: HttpClient,
        private _userService: UserService,
    ) { }

    login(loginData : LoginData): Observable<nullableUser>
    {
        return this._http.post<TokenResponse>('/api/auth/login', loginData)
            .pipe(
                switchMap(token => this._userService.loadUser(token)),
                catchError(() => of(null))
            )
        ;
    }

    register(registerData : RegisterData): Observable<Object> 
    {
        return this._http.put('/api/auth/register', registerData);
    }
    
    resetPassword(username : string): Observable<Object> 
    {
        return this._http.put('/api/auth/password/forgot-password', {username: username});
    }
}
