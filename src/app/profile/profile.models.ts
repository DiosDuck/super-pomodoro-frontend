export type DialogForm = 'change-password' | 'delete-account' | null;

export interface ChartRowResponse {
    heigth: number,
    text: number | string,
    timestamp: number,
}

export interface ChartRow {
    heigth: number,
    text: number | string,
    date: Date,
}

export interface WorkTimeHistoryResponse {
    workTimeTotal: number,
    sessionAmount: number,
    timestamp: number,
}

export interface WorkTimeHistory {
    workTimeTotal: number,
    sessionAmount: number,
    date: Date,
}

export const TEST_CHART_ROW_LIST : ChartRowResponse[] = [
    {
        heigth: 5,
        text: 1,
        timestamp: 1767916800000,
    },
    {
        heigth: 20,
        text: 4,
        timestamp: 1767830400000,
    },
    {
        heigth: 40,
        text: 2,
        timestamp: 1767744000000,
    },
    {
        heigth: 60,
        text: 6,
        timestamp: 1767657600000,
    },
    {
        heigth: 45,
        text: 8,
        timestamp: 1767571200000,
    },
    {
        heigth: 80,
        text: 7,
        timestamp: 1767484800000,
    },
];