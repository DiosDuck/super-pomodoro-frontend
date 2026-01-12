import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { User, nullableUser } from '../models/user';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private _user = new ReplaySubject<nullableUser>(1);
    user = this._user.asObservable();

    private _http = inject(HttpClient);
    private _userToken = inject(UserToken);

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
    private _cookieService = inject(CookieService);

    get(): string | null
    {
        return this._cookieService.check(this._key) 
            ? this._cookieService.get(this._key) : null;
    }

    set(token : string) : void
    {
        this._cookieService.set(this._key, token);
    }

    isSet() : boolean
    {
        return this._cookieService.check(this._key);
    }

    remove() : void
    {
        this._cookieService.delete(this._key);
    }
}
