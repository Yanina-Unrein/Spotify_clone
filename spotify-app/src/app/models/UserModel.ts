export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password?: string; 
    created_at: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}