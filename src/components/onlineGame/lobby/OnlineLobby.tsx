import { useState } from "react";
import type { PlayerInfo } from "../../../gameLogic/player/PlayerTypes";
import "./OnlineLobby.css";

type LobbyView = "menu" | "creating" | "joining";

interface OnlineLobbyProps {
    currentUser: PlayerInfo;
    inviteCode: string | null;
    inviteLink: string | null;
    isConnected: boolean;
    connectionError: string | null;
    onCreateGame: (player: PlayerInfo) => void;
    onJoinGame: (code: string, player: PlayerInfo) => void;
    onCancel: () => void;
}

export const OnlineLobby = ({
    currentUser,
    inviteCode,
    inviteLink,
    isConnected,
    connectionError,
    onCreateGame,
    onJoinGame,
    onCancel
}: OnlineLobbyProps) => {
    const [view, setView] = useState<LobbyView>("menu");
    const [joinCode, setJoinCode] = useState("");
    const [codeCopied, setCodeCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);

    // --------------------------------- handlers -------------------------- //
    const handleCreateGame = () => {
        setView("creating");
        onCreateGame(currentUser);
    };

    const handleJoinGame = () => {
        const trimmedCode = joinCode.trim()
        if (!trimmedCode) {
            setJoinError("Please enter an invite code");
            return;
        }

        setJoinError(null);
        onJoinGame(trimmedCode.toUpperCase(), currentUser);
    };

    const handleCopyCode = async () => {
        if (inviteCode) {
            await navigator.clipboard.writeText(inviteCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
            ;
        }
    };

    const handleCopyLink = async () => {
        if (inviteLink) {
            await navigator.clipboard.writeText(inviteLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    const handleBack = () => {
        setView("menu");
        setJoinCode("");
        setJoinError(null);
        onCancel();
    };

    // -------------------------------------------- render user interface --------------------------------------------- //
    if (connectionError) {
        return (
            <div className="online-lobby">
                <div className="lobby-card error">
                    <div className="error-icon">⚠️</div>
                    <h3>Connection Error</h3>
                    <p>{connectionError}</p>
                    <button className="lobby-btn secondary" onClick={handleBack}> Go Back</button>
                </div>
            </div>
        );
    }

    // connecting state
    if (!isConnected) {
        return (
            <div className="online-lobby">
                <div className="lobby-card">
                    <div className="spinner"></div>
                    <p>Connecting to the server...</p>
                </div>
            </div>
        );
    }

    // main menu
    if (view === "menu") {
        return (
            <div className="online-lobby">
                <div className="lobby-card">
                    <h2>Play Online</h2>
                    <p className="lobby-subtitle">Challenge a friend to a game</p>

                    <div className="lobby-actions">
                        <button
                            className="lobby-btn primary"
                            onClick={handleCreateGame}
                        >
                            <span className="btn-icon">+</span>
                            Create Game
                        </button>

                        {/* joining game button */}
                        <button
                            className="lobby-btn secondary"
                            onClick={() => setView("joining")}
                        >
                            <span className="btn-icon">🔗</span>
                            Join Game
                        </button>
                    </div>

                    <button className="lobby-btn text" onClick={onCancel}>
                        ← Back to Local Play
                    </button>
                </div>
            </div>
        );
    }

    // creating game -- waiting for opponent
    if (view === "creating") {
        return (
            <div className="online-lobby">
                <div className="lobby-card">
                    <div className="waiting-header">
                        <div className="pulse-ring"></div>
                        <h2>Waiting for Opponent</h2>
                    </div>

                    <p className="lobby-subtitle">Share this code with a friend</p>

                    <div className="invite-section">
                        <label>Invite Code</label>
                        <div className="copy-field">
                            <span className="code-display">{inviteCode || "..."}</span>
                            <button
                                className="copy-btn"
                                onClick={handleCopyCode}
                                disabled={!inviteCode}
                            >
                                {codeCopied ? "✓ Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div className="invite-section">
                        <label>Or share this link</label>
                        <div className="copy-field">
                            <span className="link-display">{inviteLink || "..." }</span>
                            <button
                                className="copy-btn"
                                onClick={handleCopyLink}
                                disabled={!inviteLink}
                            >
                                {linkCopied ? "✓ Copied!": "Copy"}
                            </button>
                        </div>
                    </div>

                    <div className="waiting-indicator">
                        <div className="spinner small"></div>
                        <span>Waiting for player to join...</span>
                    </div>

                    <button className="lobby-btn text" onClick={handleBack}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // joining
    if (view === "joining") {
        return (
            <div className="online-lobby">
                <div className="lobby-card">
                    <h2>Join Game</h2>
                    <p className="lobby-subtitle">Enter the invite code from your friend</p>

                    <div className="join-section">
                        <input
                            type="text"
                            className="code-input"
                            placeholder="Enter code (e.g., ABC123)"
                            value={joinCode}
                            onChange={(e) => {
                                setJoinCode(e.target.value.toUpperCase());
                                setJoinError(null);
                            }}
                            maxLength={10}
                            autoFocus
                        />
                        {joinError && <span className="input-error">{joinError}</span>}
                    </div>

                    <div className="lobby-actions">
                        <button
                            className="lobby-btn primary"
                            onClick={handleJoinGame}
                            disabled={!joinCode.trim()}
                        >
                            Join Game
                        </button>
                    </div>

                    <button className="lobby-btn text" onClick={handleBack}>
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
