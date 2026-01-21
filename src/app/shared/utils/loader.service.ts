import { computed, Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class LoaderService
{
    private _loader = signal<number>(0);
    loader = computed(() => this._loader() > 0)

    startLoading()
    {
        this._loader.set(
            this._loader() + 1
        );
    }

    stopLoading()
    {
        this._loader.set(
            this._loader() - 1
        );
    }
}