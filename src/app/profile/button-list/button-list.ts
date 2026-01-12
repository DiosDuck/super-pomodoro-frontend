import { Component, signal } from "@angular/core";
import { DialogForm } from "../profile.models";
import { ChangePassword } from "../dialog-section/change-password/change-password";
import { DeleteAccount } from "../dialog-section/delete-account/delete-account";

@Component({
    selector: 'app-profile-button-list',
    templateUrl: 'button-list.html',
    styleUrl: 'button-list.scss',
    imports: [ChangePassword, DeleteAccount],
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