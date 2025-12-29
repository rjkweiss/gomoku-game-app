import type { StoneColor } from "../../Types";
import './GameInfo.css';


interface GameInfoProps {
    currentTurn: StoneColor;
    isAIThinking: boolean;
    onReset: () => void;
}

export const GameInfo = ({ currentTurn, isAIThinking, onReset }: GameInfoProps) => {
    const isHuman = currentTurn === "B";

    const getMessage = () => {
        if (isAIThinking) return "AI Thinking...";
        return isHuman ? "Your Turn" : "AI's Turn"
    };

    return (
        <div className="game-info-container">
            {/* Turn Indicator */}
            <div className="turn-indicator-container">
                <div
                    className={`turn-indicator-box
                        ${isHuman ? 'black-stone' : 'white-stone'}
                        ${isAIThinking ? "thinking" : ""}
                    `}
                />
                <span className={`indicator-message ${isAIThinking ? 'thinking': ""}`}>
                    {getMessage()}
                </span>
            </div>

            {/* New Game Button */}
            <button className="new-game-btn" onClick={onReset}>
                New Game
            </button>
        </div>
    );
};
