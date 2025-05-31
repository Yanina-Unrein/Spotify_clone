export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    created_at: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    message?: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetResponse {
    message: string;
    success: boolean;
}

export interface TokenValidationResponse {
    valid: boolean;
    email?: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}