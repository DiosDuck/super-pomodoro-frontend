import { describe, expect, it } from "vitest";
import { LoggedInPipe } from "./user.pipe";
import { NavItem } from "../../layout/navbar/navbar.model";
import { User } from "../../auth/auth.service";

describe('User Pipe Test', () => {
    const loggedInPipe = new LoggedInPipe();
    const values: NavItem[] = [
        {
            name: 'Test 1',
            url: '/test1',
            loggedIn: false,
            adminRequired: false,
        },
        {
            name: 'Test 2',
            url: '/test2',
            loggedIn: true,
            adminRequired: false,
        },
        {
            name: 'Test 3',
            url: '/test3',
            loggedIn: false,
            adminRequired: true,
        },
        {
            name: 'Test 4',
            url: '/test4',
            loggedIn: true,
            adminRequired: true,
        }
    ];

    it('Test not logged in', () => {
        const results = loggedInPipe.transform(values);
        expect(results.length).toBe(2);
    });

    it('Test not logged in elements only logged in', () => {
        const results = loggedInPipe.transform(values, null, true);
        expect(results.length).toBe(0);
    });

    it('Test normal user', () => {
        const user: User = {
            displayName: 'Tester',
            username: 'tester',
            email: 'tester@email.com',
            roles: ["ROLE_USER"],
            activatedAtTimeStamp: 0,
        }
        const results = loggedInPipe.transform(values, user);
        expect(results.length).toBe(3);
    });

    it('Test normal user only logged in', () => {
        const user: User = {
            displayName: 'Tester',
            username: 'tester',
            email: 'tester@email.com',
            roles: ["ROLE_USER"],
            activatedAtTimeStamp: 0,
        }
        const results = loggedInPipe.transform(values, user, true);
        expect(results.length).toBe(1);
    });

    it('Test admin user', () => {
        const user: User = {
            displayName: 'Admin',
            username: 'admin',
            email: 'admin@email.com',
            roles: ["ROLE_USER", "ROLE_ADMIN"],
            activatedAtTimeStamp: 0,
        }
        const results = loggedInPipe.transform(values, user);
        expect(results.length).toBe(4);
    });

    it('Test admin user only logged in', () => {
        const user: User = {
            displayName: 'Admin',
            username: 'admin',
            email: 'admin@email.com',
            roles: ["ROLE_USER", "ROLE_ADMIN"],
            activatedAtTimeStamp: 0,
        }
        const results = loggedInPipe.transform(values, user, true);
        expect(results.length).toBe(2);
    });
});
