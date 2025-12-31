import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import type { GameMode, PlayerInfo } from "../../gameLogic/player/PlayerTypes";

import "./GameModeSelector.css";

interface GameModeSelectorProps {
    currentMode: GameMode;
    onStartGame: (mode: GameMode, playerBlack: PlayerInfo, playerWhite: PlayerInfo) => void;
    onPlayOnline: () => void;
    disabled?: boolean;
};

// default players
const DEFAULT_AI: PlayerInfo = {
    id: "ai-player",
    name: "Computer",
    type: "ai"
}

export const GameModeSelector = ({ currentMode, onStartGame, onPlayOnline, disabled }: GameModeSelectorProps) => {
    const { user } = useAuth();

    const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
    const [player1Name, setPlayer1Name] = useState<string>("Player 1");
    const [player2Name, setPlayer2Name] = useState<string>("Player 2");
    const [showSetup, setShowSetup] = useState<boolean>(false);

    const handleModeSelect = (mode: GameMode) => {
        setSelectedMode(mode);

        if (mode === "vs-ai") {
            // Start immediately
            const humanPlayer: PlayerInfo = {
                id: "human-player",
                name: user?.firstName || 'Player',
                type: 'human'
            };

            onStartGame(mode, humanPlayer, DEFAULT_AI);
        } else {
            // show setup for pvp games
            setShowSetup(true);
        }
    };

    const handleStartPvP = () => {
        const blackPlayer: PlayerInfo = {
            id: `human-${Date.now()}-black`,
            name: player1Name || 'Player 1',
            type: 'human'
        };

        const whitePlayer: PlayerInfo = {
            id: `human-${Date.now()}-white`,
            name: player2Name || 'Player 2',
            type: 'human'
        }

        onStartGame("local-pvp", blackPlayer, whitePlayer);
        setShowSetup(false);
    };


    return (
        <div className="game-mode-selector">
            <div className="mode-buttons">
                <button
                    className={`mode-btn ${selectedMode === "vs-ai" ? "active" : ""}`}
                    onClick={() => handleModeSelect("vs-ai")}
                    disabled={disabled}
                >
                    vs Computer
                </button>

                <button
                    className={`mode-btn ${selectedMode === "local-pvp" ? "active" : ""}`}
                    onClick={() => handleModeSelect("local-pvp")}
                    disabled={disabled}
                >
                    vs Human
                </button>
                <button
                    className="mode-btn online"
                    onClick={onPlayOnline}
                    disabled={disabled}
                >
                    🌐 Play Online
                </button>
            </div>

            {showSetup && selectedMode === 'local-pvp' && (
                <div className="pvp-setup">
                    <div className="player-input">
                        <label>
                            <span className="stone black-stone"></span>
                            <input
                                type="text"
                                value={player1Name}
                                onChange={(e) => setPlayer1Name(e.target.value)}
                                placeholder="Player 1 (Black)"
                                maxLength={20}
                            />
                        </label>
                    </div>
                    <div className="player-input">
                        <label>
                            <span className="stone white-stone"></span>
                            <input
                                type="text"
                                value={player2Name}
                                onChange={(e) => setPlayer2Name(e.target.value)}
                                placeholder="Player 2 (White)"
                                maxLength={20}
                            />
                        </label>
                    </div>
                    <button
                        className="start-btn"
                        onClick={handleStartPvP}
                        disabled={disabled}
                    >
                        Start Game
                    </button>
                </div>
            )}
        </div>
    );
};
