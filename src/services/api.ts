import type { RegisterData } from "../Types";

// API interfaces
interface User {
    id: number,
    email: string,
    username: string | null,
    firstName: string,
    lastName: string,
    password: string
}

interface LoginData {
    emailOrUsername: string,
    password: string
}

interface AuthResponse {
    message: string,
    user: User,
    token: string
}

class ApiService {
    private getAuthHeader(): HeadersInit {
        const token= localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    // ------------------------------------ Users Endpoints -------------------------------------- //

    //  Register user
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Registration failed');
        }

        return result;
    }

    // login a user
    async login({ emailOrUsername, password }: LoginData): Promise<AuthResponse> {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailOrUsername, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Login Failed')
        }

        return result;
    }

    // logout a user
    async logout(): Promise<void> {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: this.getAuthHeader()
        });
    }

    async getAllUsers() {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch users');
        }

        return result;
    };

    // ------------------------------------ Games Endpoints -------------------------------------- //
    // ------------------------------------ Stats Endpoints -------------------------------------- //
}

export const api = new ApiService();
