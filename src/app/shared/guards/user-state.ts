import { inject } from "@angular/core";
import { CanActivateChildFn, CanActivateFn } from "@angular/router";
import { UserService } from "../services/user";
import { filter, map, take } from "rxjs";

const waitUser = (userService : UserService) => 
    userService.user.pipe(filter(user => undefined !== user), take(1));

export const unsignedGuard: CanActivateChildFn = () => {
    const userService = inject(UserService);

    return waitUser(userService).pipe(map(user => user === null));
}

export const signedGuard: CanActivateChildFn = () => {
    const userService = inject(UserService);

    return waitUser(userService).pipe(map(user => user !== null));
}

export const adminGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    
    return waitUser(userService).pipe(
        map(user =>  user !== null && user.roles.includes("ROLE_ADMIN"))
    );
}
