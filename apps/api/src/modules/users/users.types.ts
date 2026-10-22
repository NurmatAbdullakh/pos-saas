export interface CreateUserData {
    name: string;
    email: string;
    passwordHash: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}