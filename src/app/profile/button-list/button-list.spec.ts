import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { ButtonList } from "./button-list";
import { Component } from "@angular/core";

@Component({
    selector: "app-profile-change-password",
    template: "<div>Profile Change Password</div>"
})
class ProfileChangePasswordStub {

}

@Component({
    selector: "app-profile-delete-account",
    template: "<div>Profile Delete Account</div>"
})
class ProfileDeleteAccountStub {

}

describe('Profile Button List Component', () => {
    let fixure: ComponentFixture<ButtonList>;
    let nativeElement: HTMLElement;
    let component: ButtonList;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonList],
        }).overrideComponent(
            ButtonList, {set: {imports: [ProfileChangePasswordStub, ProfileDeleteAccountStub]}}
        ).compileComponents();

        fixure = TestBed.createComponent(ButtonList);
        component = fixure.componentInstance;
        nativeElement = fixure.nativeElement;
    });

    it('test button interactions', () => {
        expect(component.isActie()).toBe(false);
        expect(component.windowSelected()).toBe(null);

        component.activateDialog('change-password');
        fixure.detectChanges();

        expect(nativeElement.querySelector('.button-dialog__content--row')?.textContent).toEqual('Profile Change Password');
        expect(component.isActie()).toBe(true);
        expect(component.windowSelected()).toBe('change-password');

        component.closeDialog();
        fixure.detectChanges();

        expect(component.isActie()).toBe(false);
        expect(component.windowSelected()).toBe(null);
    });
});
