import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { UserService, UserToken } from '../shared/utils/user.service';

export interface User {
    displayName: string,
    username: string,
    email: string,
    roles: role [],
    activatedAtTimeStamp: number,
}

export interface LoginData {
    username: string,
    password: string,
}

export interface TokenResponse {
    token: string,
    refresh_token: string,
}

export interface TokenVerification {
    token: string,
    id: number,
}

export type role = 'ROLE_USER' | 'ROLE_ADMIN';
export type nullableUser = User | null;

export const SKIP_TOKEN = new HttpContextToken<boolean>(() => false);

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
        private _userToken: UserToken,
    ) { }

    login(loginData : LoginData): Observable<User>
    {
        return this._http.post<TokenResponse>(
            '/api/auth/login', 
            loginData, 
            {context: new HttpContext().set(SKIP_TOKEN, true)}
        ).pipe(
            switchMap(token => {
                this._userToken.set(token);
                return this.getUser();
            }),
        )
        ;
    }

    loadUser(token : TokenResponse | null = null): Observable<User | null> 
    {
        if (token !== null) {
            this._userToken.set(token);
        }

        if (!this._userToken.isSet()) {
            this.removeUser();
            return of(null);
        }

        return this.getUser();
    }


    register(registerData : RegisterData): Observable<Object> 
    {
        return this._http.put('/api/auth/register', registerData, {context: new HttpContext().set(SKIP_TOKEN, true)});
    }
    
    resetPassword(username : string): Observable<Object> 
    {
        return this._http.put('/api/auth/password/forgot-password', {username: username});
    }

    logout(): Observable<unknown>
    {
        if (!this._userToken.isSet()) {
            this._userService.setUser(null);
            return of(null);
        }

        return this._http.post('/api/auth/logout', {
            refresh_token: this._userToken.getRefreshToken()
        })
            .pipe(tap(() => this.removeUser()));
    }

    refreshToken(): Observable<User>
    {
        return this._http.post<TokenResponse>('/api/auth/token/refresh', {
            refresh_token: this._userToken.getRefreshToken()
        }, {context: new HttpContext().set(SKIP_TOKEN, true)}).pipe(
            switchMap(token => {this._userToken.set(token); return this.getUser()}),
            catchError((error) => {this.removeUser(); return throwError(() => error)})
        );
    }

    getToken(): string | null
    {
        return this._userToken.getToken();
    }

    private removeUser(): void
    {
        this._userService.setUser(null);
        this._userToken.remove();
    }

    private getUser(): Observable<User>
    {
        return this._http.get<User>('/api/profile')
            .pipe(
                tap(user => this._userService.setUser(user)),
            )
        ;
    }
}
