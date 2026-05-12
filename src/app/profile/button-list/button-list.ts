import { Component, signal } from "@angular/core";
import { DialogForm } from "../profile.service";
import { ChangePassword } from "../dialog-section/change-password/change-password";
import { DeleteAccount } from "../dialog-section/delete-account/delete-account";
import { SvgIcon } from "../../shared/components/svg-icon/svg-icon";

@Component({
    selector: 'app-profile-button-list',
    templateUrl: 'button-list.html',
    styleUrl: 'button-list.scss',
    imports: [ChangePassword, DeleteAccount, SvgIcon],
})
export class ButtonList {
    isActie = signal(false);
    windowSelected = signal<DialogForm>(null);
    
    activateDialog(dialog : DialogForm) {
        this.windowSelected.set(dialog);
        this.isActie.set(true);
    }

    closeDialog() {
        this.windowSelected.set(null);
        this.isActie.set(false);
    }
}