import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "./local-storage";
import { Router } from "@angular/router";
import { ToastService } from "./toast";

@Injectable({
    providedIn: 'root',
})
export class LastRouteService {
    private _localStorageService = inject(LocalStorageService);
    private _toastService = inject(ToastService);
    private _router = inject(Router);
    private readonly _localStorageKey = 'lastRoute';

    async redirectToLastRoute(): Promise<boolean>
    {
        let lastRoute = this.getLastRoute();
        let result = await this._router.navigateByUrl(lastRoute);
        if (result === false) {
            this._toastService.addToast('Failed to redirect', 'error');
        }

        return result;
    }

    updateLastRoute(url : string | null = null): void
    {
        if (url === null) {
            url = this._router.url;
        }

        if (url.includes('auth')) {
            return;
        }

        this._localStorageService.set(this._localStorageKey, url);
    }

    private getLastRoute(): string
    {
        return this._localStorageService.get(this._localStorageKey) ?? '/';
    }
}
