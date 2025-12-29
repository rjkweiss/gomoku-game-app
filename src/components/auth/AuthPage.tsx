import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import './AuthPage.css';


type AuthView = 'login' | 'register';

export const AuthPage = () => {
    const [currentView, setCurrentView] = useState<AuthView>('login');

    return (
        <div className="auth-page">
            <div className="auth-page-background">
                {/* decorative background pattern */}
                <div className="auth-bg-pattern"></div>
            </div>

            <div className="auth-page-content">
                <div className="auth-page-header">
                    <h1 className="auth-page-title">GOMOKU</h1>
                    <p className="auth-page-tagline">Master the ancient game of five in a row</p>
                </div>

                {currentView === 'login' ? (
                    <LoginForm onSwitchToRegister={() => setCurrentView('register')} />
                ): (
                    <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
                )}

                <div className="auth-page-footer">
                    <p className="auth-footer-text">
                        Challenging yourself against AI opponents of varying difficulty
                    </p>
                </div>
            </div>
        </div>
    );
};
