import { useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { User, RegisterData } from "../Types";
import { AuthContext } from "./AuthContext";

const getInitialUser = (): User | null => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        try {
            return JSON.parse(user);
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(getInitialUser);
    const [isLoading] = useState<boolean>(false);

    const login = async (emailOrUsername: string, password: string) => {
        const response = await api.login({ emailOrUsername, password });

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const register = async (data: RegisterData) => {
        const response = await api.register(data);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const logout = () => {
        api.logout();

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}
