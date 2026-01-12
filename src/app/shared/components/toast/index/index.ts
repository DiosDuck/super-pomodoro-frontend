import { Component, inject } from "@angular/core";
import { ToastService } from "../../../services/toast";
import { Line } from "../line/line";

@Component({
  selector: 'app-toast',
  templateUrl: './index.html',
  styleUrl: './index.scss',
  imports: [Line],
})
export class Index {
    private _toastService = inject(ToastService);
    toastList = this._toastService.toastList;

    deleteToast(id : number): void
    {
        this._toastService.removeToast(id);
    }
}
