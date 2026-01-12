import { Injectable, signal } from "@angular/core";
import { status, Toast } from "../models/toast";

@Injectable({
    providedIn: "root",
})
export class ToastService {
    private _index : number = 0;
    private _toastList = signal<Toast[]>([]);

    toastList = this._toastList.asReadonly();

    addToast(message: string, status: status = "note"): number 
    {
        let toast : Toast = {
            id: ++this._index,
            message: message,
            status: status,
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
