export interface User {
    displayName: string,
    username: string,
    email: string,
    roles: role [],
    activatedAtTimeStamp: number,
}

export interface LoginData {
    username: string,
    password: string,
}

export interface TokenResponse {
    token: string,
}

export interface TokenVerification {
    token: string,
    id: number,
}

export type role = 'ROLE_USER' | 'ROLE_ADMIN';
export type nullableUser = User | null;
