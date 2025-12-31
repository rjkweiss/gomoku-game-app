import type { StoneColor } from "../../../Types";
import type { PlayerInfo } from "../../../gameLogic/player/PlayerTypes";
import "./OnlineGameHeader.css";

interface OnlineGameHeaderProps {
    localPlayer: PlayerInfo | null;
    remotePlayer: PlayerInfo | null;
    localColor: StoneColor | null;
    currentTurn: StoneColor;
    isConnected: boolean;
    moveCount: number;
    onResign: () => void;
    onDisconnect: () => void;
}

export const OnlineGameHeader = ({
    localPlayer,
    remotePlayer,
    localColor,
    currentTurn,
    isConnected,
    moveCount,
    onResign,
    onDisconnect
}: OnlineGameHeaderProps) => {
    const isMyTurn = localColor === currentTurn;

    const getPlayerStone = (isLocal: boolean): StoneColor => {
        if (isLocal) return localColor || "B";
        return localColor === "B" ? "W" : "B";
    };

    return (
        <div className="online-game-header">
            {/* Local player */}
            <div className={`player-card ${isMyTurn ? "active" : ""}`}>
                <div className={`player-stone ${getPlayerStone(true) === "B" ? "black" : "white"}`}></div>
                <div className="player-info">
                    <span className="player-name">{localPlayer?.name || "You"}</span>
                    <span className="player-label">You</span>
                </div>
                {isMyTurn && <span className="turn-badge">Your Turn</span>}
            </div>

            {/* Game info center */}
            <div className="game-center">
                <div className="vs-badge">VS</div>
                <div className="move-count">{moveCount} moves</div>
                {!isConnected && (
                    <div className="connection-warning">
                        <span className="warning-dot"></span>
                        Reconnecting...
                    </div>
                )}
            </div>

            {/* Remote player */}
            <div className={`player-card ${!isMyTurn ? "active" : ""}`}>
                <div className={`player-stone ${getPlayerStone(false) === "B" ? "black" : "white"}`}></div>
                <div className="player-info">
                    <span className="player-name">{remotePlayer?.name || "Opponent"}</span>
                    <span className="player-label">Opponent</span>
                </div>
                {!isMyTurn && <span className="turn-badge">Their Turn</span>}
            </div>

            {/* Actions */}
            <div className="header-actions">
                <button className="action-btn resign" onClick={onResign}>
                    Resign
                </button>
                <button className="action-btn leave" onClick={onDisconnect}>
                    Leave
                </button>
            </div>
        </div>
    );
};
