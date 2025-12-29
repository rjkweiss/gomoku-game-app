import { useAuth } from "../../context/useAuth";
import "./UserProfile.css";


export const UserProfile = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    const displayName = user.username || `${user.firstName} ${user.lastName}`;
    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

    return (
        <div className="user-profile-container">
            <div className="user-profile-header">
                <div className="user-avatar">{initials}</div>
                <div className="user-info">
                    <div className="user-name">{displayName}</div>
                    <div className="user-email">{user.email}</div>
                </div>
            </div>

            <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
};
