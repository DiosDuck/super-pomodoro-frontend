import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, filter, firstValueFrom, Observable, ReplaySubject, take, tap } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export const SKIP_TOKEN = new HttpContextToken<boolean>(() => false);

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


@Injectable({
  providedIn: 'root'
})
export class UserService {
    private _user = new ReplaySubject<nullableUser>(1);
    user = this._user.asObservable();

    private _http = inject(HttpClient);
    private _userToken = inject(UserToken);

    waitFirstUser() : Observable<nullableUser>
    {
        return this.user.pipe(filter(user => undefined !== user), take(1));
    }

    logout(): void
    {
        this._userToken.remove();
        this.setUser(null);
    }

    loadUser(token : TokenResponse | null = null): Observable<nullableUser> {
        if (token !== null) {
            this._userToken.set(token);
        }

        if (!this._userToken.isSet()) {
            this.setUser(null);
            return this.user;
        }

        return this._http.get<User>('/api/profile')
            .pipe(
                tap(user => this.setUser(user)),
            )
        ;
    }

    refreshToken(): Observable<TokenResponse>
    {
        return this._http.post<TokenResponse>('/api/auth/token/refresh', {
            refresh_token: this._userToken.getRefreshToken()!
        }, {context: new HttpContext().set(SKIP_TOKEN, true)});
    }

    private setUser(user: nullableUser): void
    {
        this._user.next(user);
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
