import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, filter, Observable, of, ReplaySubject, switchMap, take, tap, throwError } from 'rxjs';
import { LocalStorageService } from '../shared/utils/local-storage.service';

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
export type NullableUser = User | null;

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
    private readonly http = inject(HttpClient);
    private readonly userService = inject(UserService);
    private readonly userToken = inject(UserToken);

    login(loginData : LoginData): Observable<User>
    {
        return this.http.post<TokenResponse>(
            '/api/auth/login', 
            loginData, 
            {context: new HttpContext().set(SKIP_TOKEN, true)}
        ).pipe(
            switchMap(token => {
                this.userToken.set(token);
                return this.getUser();
            }),
        )
        ;
    }

    loadUser(token : TokenResponse | null = null): Observable<NullableUser> 
    {
        if (token !== null) {
            this.userToken.set(token);
        }

        if (!this.userToken.isSet()) {
            this.removeUser();
            return of(null);
        }

        return this.getUser();
    }

    getObservableUser(): Observable<NullableUser>
    {
        return this.userService.user$;
    }

    register(registerData : RegisterData): Observable<Object> 
    {
        return this.http.put('/api/auth/register', registerData, {context: new HttpContext().set(SKIP_TOKEN, true)});
    }
    
    resetPassword(username : string): Observable<Object> 
    {
        return this.http.put('/api/auth/password/forgot-password', {username: username});
    }

    logout(): Observable<unknown>
    {
        if (!this.userToken.isSet()) {
            this.userService.setUser(null);
            return of(null);
        }

        return this.http.post('/api/auth/logout', {
            refresh_token: this.userToken.getRefreshToken()
        })
            .pipe(tap(() => this.removeUser()));
    }

    refreshToken(): Observable<User>
    {
        return this.http.post<TokenResponse>('/api/auth/token/refresh', {
            refresh_token: this.userToken.getRefreshToken()
        }, {context: new HttpContext().set(SKIP_TOKEN, true)}).pipe(
            switchMap(token => {this.userToken.set(token); return this.getUser()}),
            catchError((error) => {this.removeUser(); return throwError(() => error)})
        );
    }

    getToken(): string | null
    {
        return this.userToken.getToken();
    }

    private removeUser(): void
    {
        this.userService.setUser(null);
        this.userToken.remove();
    }

    private getUser(): Observable<User>
    {
        return this.http.get<User>('/api/profile')
            .pipe(
                tap(user => this.userService.setUser(user)),
            )
        ;
    }
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
    private userSubject = new ReplaySubject<NullableUser>(1);
    user$ = this.userSubject.asObservable();

    waitFirstUser() : Observable<NullableUser>
    {
        return this.user$.pipe(filter(user => undefined !== user), take(1));
    }

    setUser(user: NullableUser): void
    {
        this.userSubject.next(user);
    }
}


@Injectable({
  providedIn: 'root'
})
export class UserToken {
    private readonly _token = 'token';
    private readonly _refreshToken = 'refresh_token';
    private _localStorageService = inject(LocalStorageService);

    get(): TokenResponse | null
    {
        if (!this.isSet()) {
            return null;
        }

        return {
            token: this.getToken()!,
            refresh_token: this.getRefreshToken()!,
        }
    }

    getToken(): string | null
    {
        return this._localStorageService.get(this._token);
    }

    getRefreshToken(): string | null
    {
        return this._localStorageService.get(this._refreshToken);
    }

    set(tokenResponse : TokenResponse) : void
    {
        this._localStorageService.set(this._token, tokenResponse.token);
        this._localStorageService.set(this._refreshToken, tokenResponse.refresh_token);
    }

    isSet() : boolean
    {
        return this._localStorageService.get(this._token) !== null;
    }

    remove() : void
    {
        this._localStorageService.remove(this._token);
        this._localStorageService.remove(this._refreshToken);
    }
}
