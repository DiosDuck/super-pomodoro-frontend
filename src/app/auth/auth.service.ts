import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, filter, map, Observable, of, ReplaySubject, switchMap, take, tap } from 'rxjs';

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

        return this.http.post('/api/auth/logout', {}, { withCredentials: true })
            .pipe(tap(() => this.removeUser()));
    }

    refreshToken(): Observable<User>
    {
        return this.http.post<TokenResponse>('/api/auth/refresh', {}, {
            context: new HttpContext().set(SKIP_TOKEN, true),
            withCredentials: true,
        }).pipe(
            tap(token => this.userToken.set(token)),
            switchMap(() => this.getUser()),
            catchError(() => {
                this.userService.setUser(null);
                this.userToken.remove();
                return EMPTY;
            })
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
    private tokenResponse : TokenResponse | null = null;

    getToken(): string | null
    {
        return this.tokenResponse?.token ?? null;
    }

    set(tokenResponse : TokenResponse) : void
    {
        this.tokenResponse = tokenResponse;
    }

    isSet() : boolean
    {
        return this.tokenResponse !== null;
    }

    remove() : void
    {
        this.tokenResponse = null;
    }
}
