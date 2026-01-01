import { useOnlineGame } from "../../hooks/useOnlineGame";
import type { PlayerInfo } from "../../gameLogic/player/PlayerTypes";
import { OnlineLobby } from "./lobby/OnlineLobby";
import { OnlineGameHeader } from "./header/OnlineGameHeader";
import { BoardView } from "../board/Board";
import { GameOverlay } from "../gameOverlay/GameOverlay";
import "./OnlineGame.css";

interface OnlineGameProps {
    currentUser: PlayerInfo;
    serverUrl: string;
    onExit: () => void;
}

const GAME_CONFIG = {
    boardSize: 15,
    cellSize: 50,
    margin: 50
};

export const OnlineGame = ({ currentUser, serverUrl, onExit }: OnlineGameProps) => {
    const {
        // Connection
        isConnected,
        connectionError,

        // Game state
        gameStatus,
        inviteCode,
        inviteLink,

        // Board
        boardState,
        boardSize,
        cellSize,
        margin,

        // Players
        localPlayer,
        remotePlayer,
        localColor,
        currentTurn,
        isMyTurn,

        // Moves
        lastMove,
        moveCount,

        // Results
        winner,

        // Actions
        createGame,
        joinGame,
        makeMove,
        resign,
        disconnect
    } = useOnlineGame({
        serverUrl,
        ...GAME_CONFIG
    });

    // Handle exit - disconnect and go back
    const handleExit = () => {
        disconnect();
        onExit();
    };

    // Handle board click
    const handleIntersectionClick = (row: number, col: number) => {
        if (isMyTurn) {
            makeMove(row, col);
        } else {
            console.log('Not my turn!');
        }
    };

    // Get winner name for overlay
    const getWinnerName = (): string | null => {
        if (!winner || winner === "draw") return null;
        if (winner === localColor) return localPlayer?.name || "You";
        return remotePlayer?.name || "Opponent";
    };

    // Show lobby if not playing
    if (gameStatus !== "playing" && gameStatus !== "finished") {
        return (
            <OnlineLobby
                currentUser={currentUser}
                inviteCode={inviteCode}
                inviteLink={inviteLink}
                isConnected={isConnected}
                connectionError={connectionError}
                onCreateGame={createGame}
                onJoinGame={joinGame}
                onCancel={handleExit}
            />
        );
    }

    // Game view
    return (
        <div className="online-game">
            <OnlineGameHeader
                localPlayer={localPlayer}
                remotePlayer={remotePlayer}
                localColor={localColor}
                currentTurn={currentTurn}
                isConnected={isConnected}
                moveCount={moveCount}
                onResign={resign}
                onDisconnect={handleExit}
            />

            <div className="board-wrapper">
                <BoardView
                    board={boardState}
                    boardSize={boardSize}
                    cellSize={cellSize}
                    margin={margin}
                    lastMove={lastMove}
                    onIntersectionClick={handleIntersectionClick}
                    convertPixelsToBoardCoords={(x, y) => {
                        // Simple conversion - could use ref if needed
                        const col = Math.round((x - margin) / cellSize);
                        const row = Math.round((y - margin) / cellSize);
                        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
                            return [row, col];
                        }
                        return null;
                    }}
                    disabled={!isMyTurn || gameStatus === "finished"}
                />

                {/* Turn indicator overlay when not your turn */}
                {!isMyTurn && gameStatus === "playing" && (
                    <div className="waiting-overlay">
                        <span>Waiting for {remotePlayer?.name || "opponent"}...</span>
                    </div>
                )}

                {/* Game over overlay */}
                {gameStatus === "finished" && (
                    <GameOverlay
                        winner={winner === "draw" ? null : winner}
                        winnerName={getWinnerName()}
                        gameStatus={winner === "draw" ? "draw" : "won"}
                        onReset={handleExit}
                    />
                )}
            </div>
        </div>
    );
};
