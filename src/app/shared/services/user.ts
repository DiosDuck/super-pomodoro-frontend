import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, firstValueFrom, Observable, ReplaySubject, take } from 'rxjs';
import { User, nullableUser } from '../models/user';
import { LocalStorageService } from './local-storage';

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

    async loadUser(token : string | null = null): Promise<void> {
        if (token !== null) {
            this._userToken.set(token);
        }

        if (!this._userToken.isSet()) {
            this.setUser(null);
            return;
        }

        let user : nullableUser;
        try {
            user = await firstValueFrom(this._http.get<User>('/api/profile'));
        } catch (err) {
            user = null;
            this._userToken.remove();
        }

        this.setUser(user);
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
    private readonly _key = 'token';
    private _localStorageService = inject(LocalStorageService);

    get(): string | null
    {
        return this._localStorageService.get(this._key);
    }

    set(token : string) : void
    {
        this._localStorageService.set(this._key, token);
    }

    isSet() : boolean
    {
        return this._localStorageService.get(this._key) !== null;
    }

    remove() : void
    {
        this._localStorageService.remove(this._key);
    }
}
