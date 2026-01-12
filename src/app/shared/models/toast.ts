export type status = "success" | "error" | "note";

export interface Toast {
    id: number,
    status: status,
    message: string;
}
