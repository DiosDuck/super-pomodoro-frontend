import { Component, computed, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { NullableUser, UserService } from "../../auth/auth.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
    templateUrl: 'personal-info.html',
    styleUrl: 'personal-info.scss',
    selector: 'app-perosnal-info',
    imports: [DatePipe],
})
export class PersonalInfo {
    private userService = inject(UserService);
    user = toSignal(this.userService.user$, { initialValue: null as NullableUser });
    activatedAt = computed(() => {
        if (this.user() === null) {
            return new Date();
        }
        return new Date(this.user()!.activatedAtTimeStamp * 1000);
    })
}
