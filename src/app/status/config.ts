import { StatusRequest } from "./status.service";

export const STATUS_LIST : StatusRequest [] = [
    {
        name: 'Version',
        url: '/api/version/app',
        type: 'value',
    },
    {
        name: 'Server Status',
        url: '/api/health/ping',
        type: 'health',
    },
    {
        name: 'Database Status',
        url: '/api/health/database',
        type: 'health',
    },
];
