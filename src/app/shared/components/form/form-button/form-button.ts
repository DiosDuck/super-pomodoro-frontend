import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-form-button',
    templateUrl: './form-button.html',
    styleUrl: './form-button.scss',
})
export class FormButton {
    public readonly type = input<'button'|'submit'>('button');
    public readonly buttonStyle = input<'primary'|'secondary'|'danger'>('secondary');
    public readonly disabled = input<boolean>(false);
    public readonly buttonId = input.required<string>();
    public readonly onClick = output();

    public clicked(): void
    {
        this.onClick.emit();
    }
}
