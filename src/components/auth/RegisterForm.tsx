import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import type { RegisterData } from "../../Types";
import './AuthForm.css';


interface RegisterFormProps {
    onSwitchToLogin: () => void;
}


export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState<RegisterData>({
        email: '',
        username: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);


    // -------------------------------------- form handlers -------------------------------------- //

    const handleChange = (field: keyof RegisterData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        // check password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }

        // check password match
        if (formData.password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        // check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Invalid email format');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await register(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Sign up to start playing</p>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="auth-error">{error}</div>
                )}

                {/* Name row */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            placeholder="First name"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            placeholder="Last name"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Username */}
                <div className="form-group">
                    <label htmlFor="username">Username (Optional)</label>
                    <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="Choose a username"
                        disabled={isLoading}
                    />
                </div>

                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="At least 8 characters"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            {/* Switch to Login */}
            <div className="auth-switch">
                Already have an account?{' '}
                <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={onSwitchToLogin}
                    disabled={isLoading}
                >
                    Log In
                </button>
            </div>
        </div>
    );
};
