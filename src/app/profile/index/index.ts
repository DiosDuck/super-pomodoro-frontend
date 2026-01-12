import { Component } from "@angular/core";
import { PersonalInfo } from "../personal-info/personal-info";
import { ButtonList } from "../button-list/button-list";
import { SessionChart } from "../session-chart/session-chart";

@Component({
    templateUrl: 'index.html',
    styleUrl: 'index.scss',
    imports: [PersonalInfo, ButtonList, SessionChart],
})
export class Index {

}
