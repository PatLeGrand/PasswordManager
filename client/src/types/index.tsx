export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Service {
    id: string;
    userId: string;
    name: string;
    url?: string;
    username: string;
    password: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}