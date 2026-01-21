import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

export function passwordMatchValidator(passwordLabel : string = 'password', confirmPasswordLabel : string = 'confirmPassword') : ValidatorFn {
    return (
        group: AbstractControl
    ) : ValidationErrors | null => {
        const password = group.get(passwordLabel);
        const confirmPassword = group.get(confirmPasswordLabel);

        return (!password || !confirmPassword || password.value === confirmPassword.value) 
            ? null 
            : {passwordMatch: true}
        ;
    }
}
