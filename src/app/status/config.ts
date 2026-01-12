import { StatusRequest } from "./models/status";

export const STATUS_LIST : StatusRequest [] = [
    {
        name: 'Server Status',
        url: '/api/health/ping',
    },
    {
        name: 'Database Status',
        url: '/api/health/database',
    },
];
