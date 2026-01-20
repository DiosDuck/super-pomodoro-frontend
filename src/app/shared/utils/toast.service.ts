import { Injectable, signal } from "@angular/core";

export type status = "success" | "error" | "note";

export interface Toast {
    id: number,
    status: status,
    message: string,
    time: number,
}

@Injectable({
    providedIn: "root",
})
export class ToastService {
    private _index : number = 0;
    private _toastList = signal<Toast[]>([]);

    toastList = this._toastList.asReadonly();

    addToast(message: string, status: status = "note", time: number = 5): number 
    {
        let toast : Toast = {
            id: ++this._index,
            message: message,
            status: status,
            time: time,
        }
        this._toastList.set(this._toastList().concat(toast));

        return this._index;
    }

    removeToast(id : number): void
    {
        this._toastList.set(
            this._toastList().filter((toast) => toast.id !== id)
        );
    }
}
