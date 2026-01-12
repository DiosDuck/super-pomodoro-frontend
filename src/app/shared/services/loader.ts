import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class LoaderService
{
    private _loader = signal<boolean>(false);
    loader = this._loader.asReadonly();

    startLoading()
    {
        this._loader.set(true);
    }

    stopLoading()
    {
        this._loader.set(false);
    }
}