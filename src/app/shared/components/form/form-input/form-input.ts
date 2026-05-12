import { Component, input, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'app-form-input',
    templateUrl: 'form-input.html',
    styleUrl: 'form-input.scss',
    encapsulation: ViewEncapsulation.None
})
export class FormInput{
    public readonly label = input.required<string>();
    public readonly inputId = input.required<string>();
}
