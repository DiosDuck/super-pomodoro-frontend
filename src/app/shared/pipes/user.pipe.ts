import { Pipe, PipeTransform } from "@angular/core";
import { NavItem } from "../../layout/navbar/navbar.model";
import { nullableUser } from "../utils/user.service";

@Pipe({
    name: 'loggedIn',
})
export class LoggedInPipe implements PipeTransform {
    transform(value: NavItem[], user: nullableUser = null, onlyLoggedIn: boolean = false): NavItem[] {
        let loggedOutItems = value.filter((navItem) => !navItem.loggedIn);

        if (user === null) {
            return loggedOutItems;
        } else if (onlyLoggedIn) {
            loggedOutItems = [];
        }

        let loggedInItems = value.filter((navItem) => navItem.loggedIn)
                                .filter((navItem) => !navItem.adminRequired || user.roles.includes("ROLE_ADMIN"));

        return loggedOutItems.concat(loggedInItems);
    }
}
