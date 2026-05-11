import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-pomodoro-icon-button',
    templateUrl: './icon-button.html',
    styleUrl: './icon-button.scss',
})
export class IconButton {
    buttonId = input.required<string>();
    icon = input.required<string>();
    disabled = input(false);
    clicked = output<void>();
}
