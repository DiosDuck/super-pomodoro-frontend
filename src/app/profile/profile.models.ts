export type DialogForm = 'change-password' | 'delete-account' | null;

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