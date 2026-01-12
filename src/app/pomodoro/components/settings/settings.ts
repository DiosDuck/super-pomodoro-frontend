import { Component, inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SettingsService } from "../../pomodoro.services";
import { Router, RouterLink } from "@angular/router";
import { Settings as SettingsModel } from "../../pomodoro.model";

@Component({
    templateUrl: "settings.html",
    styleUrl: "settings.scss",
    imports: [ReactiveFormsModule, RouterLink]
})
export class Settings implements OnInit {
    settingsService = inject(SettingsService);
    router = inject(Router);

    settingsForm = new FormGroup({
        workTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        shortBreakTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        longBreakTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        numberOfCycles: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        maxConfirmationTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
    })

    ngOnInit(): void 
    {
        this.settingsService.settings.subscribe(settings => {
            this.settingsForm.touched;
            this.settingsForm.get('workTime')!.setValue(settings.workTime);
            this.settingsForm.get('shortBreakTime')!.setValue(settings.shortBreakTime);
            this.settingsForm.get('longBreakTime')!.setValue(settings.longBreakTime);
            this.settingsForm.get('numberOfCycles')!.setValue(settings.cyclesBeforeLongBreak);
            this.settingsForm.get('maxConfirmationTime')!.setValue(settings.maxConfirmationTime);
        })
    }

    onSubmit(): void
    {
        let value = this.settingsForm.value;
        let settings: SettingsModel = {
            workTime: value.workTime!,
            shortBreakTime: value.shortBreakTime!,
            longBreakTime: value.longBreakTime!,
            cyclesBeforeLongBreak: value.numberOfCycles!,
            maxConfirmationTime: value.maxConfirmationTime!,
            type: 'pomodoro.settings',
        }

        this.settingsService.updateSettings(settings);
        this.router.navigateByUrl('/pomodoro');
    }
}
