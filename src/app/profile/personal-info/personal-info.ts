import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { UserService } from "../../shared/services/user";
import { nullableUser } from "../../shared/models/user";
import { DatePipe } from "@angular/common";

@Component({
    templateUrl: 'personal-info.html',
    styleUrl: 'personal-info.scss',
    selector: 'app-perosnal-info',
    imports: [DatePipe],
})
export class PersonalInfo implements OnInit {
    private _userService = inject(UserService);
    user = signal<nullableUser>(null);
    activatedAt = computed(() => {
        if (this.user() === null) {
            return new Date();
        }
        return new Date(this.user()!.activatedAtTimeStamp * 1000);
    })

    ngOnInit(): void {
        this._userService.user.subscribe(
            (user: nullableUser) => {
                this.user.set(user);
            }
        );
    }
}