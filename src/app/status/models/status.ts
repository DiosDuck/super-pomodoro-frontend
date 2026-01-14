export interface StatusRequest {
    name: string,
    url: string,
    type: 'value' | 'health',
};

export interface StatusResponse {
    message: string,
    status: 'HOLD' | 'OK' | 'WARN' | 'CRIT',
}
