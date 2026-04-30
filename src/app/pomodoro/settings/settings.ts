import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SettingsService, Settings as SettingsModel, POMODORO_SETTINGS_KEY } from "../services/settings.service";
import { Router } from "@angular/router";
import { take } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    templateUrl: "settings.html",
    styleUrl: "settings.scss",
    imports: [ReactiveFormsModule]
})
export class Settings implements OnInit {
    private readonly settingsService = inject(SettingsService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    public readonly settingsForm = new FormGroup({
        workTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        shortBreakTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        longBreakTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        numberOfCycles: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        maxConfirmationTime: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]+(.[0-9]+)?$"), Validators.min(0)]),
        enableWaiting: new FormControl(true),
    });

    public readonly enableWaitingTime = signal<boolean>(false);

    ngOnInit(): void 
    {
        this.settingsService.settings$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(settings => {
                this.settingsForm.touched;
                this.settingsForm.get('workTime')!.setValue(settings.workTime);
                this.settingsForm.get('shortBreakTime')!.setValue(settings.shortBreakTime);
                this.settingsForm.get('longBreakTime')!.setValue(settings.longBreakTime);
                this.settingsForm.get('numberOfCycles')!.setValue(settings.cyclesBeforeLongBreak);
                this.settingsForm.get('maxConfirmationTime')!.setValue(settings.maxConfirmationTime);
                this.settingsForm.get('enableWaiting')!.setValue(settings.enableWaiting);
                this.enableWaitingTime.set(settings.enableWaiting);
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
            enableWaiting: value.enableWaiting!,
            type: POMODORO_SETTINGS_KEY,
        }
        this.settingsService
            .updateSettings(settings)
            .pipe(take(1))
            .subscribe(
                () => this.router.navigateByUrl('/pomodoro'),
            );
    }

    onBack(): void
    {
        this.router.navigateByUrl('/pomodoro');
    }

    updateWaitingTime(): void
    {
        if (this.settingsForm.get('enableWaiting')!.getRawValue()) {
            this.enableWaitingTime.set(true);
        } else {
            this.enableWaitingTime.set(false);
            this.settingsForm.get('maxConfirmationTime')!.setValue(0);
        }
    }
}
