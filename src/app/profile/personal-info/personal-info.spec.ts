import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalInfo } from "./personal-info";
import { UserService } from "../../auth/auth.service";

describe('Personal Info Component', () => {
    let fixure: ComponentFixture<PersonalInfo>;
    let userService: UserService;
    const date = new Date();

    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(date);
    })

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PersonalInfo],
        });

        fixure = TestBed.createComponent(PersonalInfo);
        userService = TestBed.inject(UserService);
    });

    it('test page', () => {
        let component = fixure.componentInstance;
        expect(component.activatedAt()).toEqual(date);

        userService.setUser({
            displayName: "Test",
            username: "test",
            email: "test@email.com",
            roles: ["ROLE_USER"],
            activatedAtTimeStamp: 5,
        });

        fixure.detectChanges();
        expect(component.activatedAt().getTime()).toEqual(5000);
    })
});
