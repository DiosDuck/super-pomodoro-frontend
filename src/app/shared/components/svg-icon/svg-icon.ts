import { Component, input, output } from '@angular/core';

@Component({
    selector: 'svg[appSVG]',
    templateUrl: './svg-icon.html',
})
export class SvgIcon {
    icon = input.required<string>();
}
