import type { AuthResponse, GameData, LoginData, RegisterData, StatsResponse } from "../Types";

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
    }

    // ------------------------------------ Games Endpoints -------------------------------------- //
    async recordGame(data: GameData): Promise<void> {
        const response = await fetch('/api/games/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader()
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to record game');
        }
    }

    // ------------------------------------ Stats Endpoints -------------------------------------- //

    // get stats
    async getStats(): Promise<StatsResponse> {
        const response = await fetch('/api/stats', {
            method: 'GET',
            headers: this.getAuthHeader()
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to Load stats');
        }

        return result;
    }
}

export const api = new ApiService();
