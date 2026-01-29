import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { NullableUser, UserService } from "../../auth/auth.service";

@Component({
    templateUrl: 'personal-info.html',
    styleUrl: 'personal-info.scss',
    selector: 'app-perosnal-info',
    imports: [DatePipe],
})
export class PersonalInfo implements OnInit {
    private _userService = inject(UserService);
    user = signal<NullableUser>(null);
    activatedAt = computed(() => {
        if (this.user() === null) {
            return new Date();
        }
        return new Date(this.user()!.activatedAtTimeStamp * 1000);
    })

    ngOnInit(): void {
        this._userService.user.subscribe(
            user => {
                this.user.set(user);
            }
        );
    }
}