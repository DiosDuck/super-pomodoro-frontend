import { NavItem } from "../components/navbar/models/nav-elems";

export const NAV_MENU_ITEMS : NavItem [] = [
    {
        name: 'Pomodoro',
        url: '/pomodoro',
        loggedIn: false,
        adminRequired: false,
    },
    {
        name: 'Status',
        url: '/status',
        loggedIn: true,
        adminRequired: true,
    },
];
