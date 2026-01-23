import { inject, Injectable } from '@angular/core';
import { filter, Observable, ReplaySubject, take, tap } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { nullableUser, TokenResponse } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private _user = new ReplaySubject<nullableUser>(1);
    user = this._user.asObservable();

    waitFirstUser() : Observable<nullableUser>
    {
        return this.user.pipe(filter(user => undefined !== user), take(1));
    }

    setUser(user: nullableUser): void
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
