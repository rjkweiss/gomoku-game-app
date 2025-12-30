import type { GameStatus, Winner } from "../../Types";
import "./GameOverlay.css";


interface GameOverlayProps {
    winner: Winner;
    winnerName: string | null;
    gameStatus: GameStatus;
    onReset: () => void;
}


export const GameOverlay = ({ winner, winnerName, gameStatus, onReset }: GameOverlayProps) => {
    const getGameOverMessage = (): string => {
        if (gameStatus === "draw") {
            return "IT'S A DRAW!";
        }

        if (winnerName) {
            return `${winnerName.toUpperCase()} WINS!`;
        }

        // Fallback for backwards compatibility
        return winner === "B" ? "BLACK WINS!" : "WHITE WINS!";
    };

    // Determine winner stone color for visual indicator
    const getWinnerStoneClass = (): string => {
        if (gameStatus === "draw") return "";
        return winner === "B" ? "black-winner" : "white-winner";
    };

    return (
        <div className="game-overlay-container">
            {/* Winner stone indicator */}
            {gameStatus !== "draw" && (
                <div className={`winner-stone ${getWinnerStoneClass()}`}></div>
            )}

            {/* Message */}
            <span className="overlay-message">{getGameOverMessage()}</span>

            {/* Play again button */}
            <button className="play-again-btn" onClick={onReset}>
                Play Again
            </button>
        </div>
    );
};
