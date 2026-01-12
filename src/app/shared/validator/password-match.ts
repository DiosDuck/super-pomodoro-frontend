import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

export const passwordMatchValidator : ValidatorFn = (
    group: AbstractControl
) : ValidationErrors | null => {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    return (!password || !confirmPassword || password.value === confirmPassword.value) 
        ? null 
        : {passwordMatch: true}
    ;
}
