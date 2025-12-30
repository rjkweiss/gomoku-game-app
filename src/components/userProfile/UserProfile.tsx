import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import "./UserProfile.css";

export const UserProfile = () => {
    const [showDropdown, setShowDropdown] = useState(false);

    const { user, logout } = useAuth();


    const displayUser = {
        name: `${user?.firstName} ${user?.lastName}` || "Example User",
        email: `${user?.email}` || "exampleUser@example.com",
    };

    const initials = displayUser.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="user-profile-header">
            <button className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="avatar">
                    {user?.avatarUrl ? (
                        <img src={user?.avatarUrl} alt={displayUser.name} />
                    ) : (
                        <span className="avatar-initials">{initials}</span>
                    )}
                </div>
                <span className="profile-name">{displayUser.name}</span>
                <svg
                    className={`dropdown-arrow ${showDropdown ? "open" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                >
                    <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </svg>
            </button>
            {showDropdown && (
                <div className="profile-dropdown">
                    <div className="dropdown-header">
                        <div className="avatar large">
                            {user?.avatarUrl ? (
                                <img src={user?.avatarUrl} alt={displayUser.name} />
                            ) : (
                                <span className="avatar-initials">{initials}</span>
                            )}
                        </div>
                        <div className="dropdown-user-info">
                            <span className="dropdown-name">{displayUser.name}</span>
                            <span className="dropdown-email">{displayUser.email}</span>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={logout}>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
};
