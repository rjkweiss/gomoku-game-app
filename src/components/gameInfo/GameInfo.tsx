import type { StoneColor } from "../../Types";
import type { PlayerInfo } from "../../gameLogic/player/PlayerTypes";
import './GameInfo.css';


interface GameInfoProps {
    currentTurn: StoneColor;
    currentPlayer: PlayerInfo | null;
    isAIThinking: boolean;
    onReset: () => void;
}

export const GameInfo = ({ currentTurn, currentPlayer, isAIThinking, onReset }: GameInfoProps) => {

    const getMessage = () => {
        if (isAIThinking) return `${currentPlayer?.name || "AI"} is thinking...`;
        const playerName = currentPlayer?.name || (currentTurn === "B" ? "Black" : "White");
        return `${playerName}'s turn`;
    };

    return (
        <div className="game-info-container">
            {/* Turn Indicator */}
            <div className="turn-indicator-container">
                <div className={`turn-indicator-box${currentTurn === "B" ? "black-stone" : "white-stone"}`}>
                    {isAIThinking && <div className="thinking"></div>}
                </div>
                <span className="indicator-message">{getMessage()}</span>
            </div>

            {/* New Game Button */}
            <button className="new-game-btn" onClick={onReset}>
                New Game
            </button>
        </div>
    );
};
