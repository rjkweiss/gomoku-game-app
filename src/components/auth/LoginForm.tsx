import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import './AuthForm.css';


interface LoginFormPro {
    onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormPro) => {
    const { login } = useAuth();
    const [emailOrUsername, setEmailOrUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(emailOrUsername, password);
        } catch {
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Login in to continue playing</p>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="auth-error">{ error }</div>
                )}

                {/* Email or Username */}
                <div className="form-group">
                    <label htmlFor="emailOrUsername">Email or Username</label>
                    <input
                        id="emailOrUsername"
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="Enter your email or username"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Log In'}
                </button>
            </form>

            {/* Switch account */}
            <div className="auth-switch">
                Don't have an account?{' '}
                <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={onSwitchToRegister}
                    disabled={isLoading}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};
