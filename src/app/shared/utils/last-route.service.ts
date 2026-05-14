import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { Router } from "@angular/router";
import { ToastService } from "./toast.service";

@Injectable({
    providedIn: 'root',
})
export class LastRouteService {
    private readonly localStorageService = inject(LocalStorageService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);
    private readonly _localStorageKey = 'lastRoute';

    async redirectToLastRoute(): Promise<boolean>
    {
        let lastRoute = this.getLastRoute();
        let result = await this.router.navigateByUrl(lastRoute);
        if (result === false) {
            this.toastService.addToast('Failed to redirect', 'error');
        }

        return result;
    }

    updateLastRoute(url : string | null = null): void
    {
        if (url === null) {
            url = this.router.url;
        }

        if (url.includes('auth')) {
            return;
        }

        this.localStorageService.set(this._localStorageKey, url);
    }

    private getLastRoute(): string
    {
        return this.localStorageService.get(this._localStorageKey) ?? '/';
    }
}
