import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { UserService, LoginData, TokenResponse } from '../shared/utils/user.service';

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

    async login(loginData : LoginData): Promise<void> 
    {
        try {
            const res = await firstValueFrom(this._http.post<TokenResponse>('/api/auth/login', loginData));
            await this._userService.loadUser(res.token);
        } catch (err) {
            throw err;
        }
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
