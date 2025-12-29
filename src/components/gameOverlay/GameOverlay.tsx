import type { GameStatus, Winner } from "../../Types";
import "./GameOverlay.css";


interface GameOverlayProps {
    winner: Winner;
    gameStatus: GameStatus;
    onReset: () => void;
}


export const GameOverlay = ({ winner, gameStatus, onReset }: GameOverlayProps) => {
    // Determine Game Over message
    let gameOverMessage;

    if (gameStatus === 'draw') {
        gameOverMessage = "IT'S A DRAW!";
    } else if (winner === 'B') {
        gameOverMessage = "YOU WIN!";
    } else {
        gameOverMessage = "AI WINS!";
    }

    return (
        <div className="game-overlay-container">
            {/* Message */}
            <span className="overlay-message">{gameOverMessage}</span>

            {/* Play again button */}
            <button className="play-again-btn" onClick={onReset}>
                Play Again
            </button>
        </div>
    );
};
