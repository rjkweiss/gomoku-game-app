import { useEffect, useRef, useState } from "react";
import type { GameMode, PlayerInfo } from "../gameLogic/player/PlayerTypes";
import { api } from "../services/api";
import { useGameSession, } from "../hooks/useGameSession";
import { Layout } from "./layout/Layout";
import { BoardView } from "./board/Board";
import { GameInfo } from "./gameInfo/GameInfo";
import { GameOverlay } from "./gameOverlay/GameOverlay";
import { DepthSelector } from "./depthSelector/DepthSelector";
import { GameModeSelector } from "./gameModeSelector/GameModeSelector";
import { MoveCounter } from "./moveCounter/MoveCounter";
import { OnlineGame } from "./onlineGame/OnlineGame";
import { UserProfile } from "./userProfile/UserProfile";
import { StatsDisplay, type StatsDisplayHandle } from "./stats/StatsDisplay";
import "./Game.css";

// Game Configuration
const GAME_CONFIG = {
    boardSize: 15,
    cellSize: 50,
    margin: 50,
    aiDepth: 3,
    aiDelayMs: 1250
};

// WebSocket server URL
const WS_SERVER_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

// View mode type
type ViewMode = "local" | "online";

interface GameProps {
    user?: {
        id: number | string;
        name: string;
        email: string;
    } | null;
}


export const Game = ({ user }: GameProps) => {

    // Track whether we're in local or online mode
    const [viewMode, setViewMode] = useState<ViewMode>("local");

    // Current user - in real app, get from auth context
    const currentUser: PlayerInfo = {
        id: user?.id?.toString() || `guest-${Date.now()}`,
        name: user?.name || 'Guest',
        type: 'human'
    };

    const {
        // board
        boardState,
        boardSize,
        cellSize,
        margin,

        // game state
        currentTurn,
        currentPlayer,
        gameStatus,
        winner,
        isAIThinking,

        // move tracking
        lastMove,
        moveCount,

        // players
        playerBlack,
        playerWhite,
        gameMode,

        // ai settings
        aiDepth,
        setAIDepth,

        // actions
        handleIntersectionClick,
        startGame,
        resetGame,
        convertPixelToCoords,

    } = useGameSession(GAME_CONFIG);

    // Track if game result has been recorded
    const gameRecordRef = useRef(false);
    const statsDisplayRef = useRef<StatsDisplayHandle | null>(null);

    // Record game result when game ends
    useEffect(() => {
        const recordGameResult = async () => {
            if (gameStatus !== 'playing' && !gameRecordRef.current && gameMode === "vs-ai") {
                gameRecordRef.current = true;

                try {
                    let result: 'win' | 'loss' | 'draw';
                    if (gameStatus === 'draw') {
                        result = 'draw';
                    } else if (winner === 'B') {
                        result = 'win';
                    } else {
                        result = 'loss';
                    }

                    await api.recordGame({
                        aiDepth,
                        result,
                        moveCount

                        // To-do: add gameDurationSeconds
                    });

                    // Reload stats after recording
                    if (statsDisplayRef.current) {
                        statsDisplayRef.current.loadStats();
                    }

                } catch (error) {
                    console.error('Failed to record game: ', error);
                }
            }
        };
        recordGameResult();

    }, [gameStatus, winner, aiDepth, gameMode, moveCount]);


    // --------------------------------------------------- handlers ---------------------------------------------------- //

    // Handle game reset
    const handleReset = () => {
        resetGame();
        gameRecordRef.current = false;
    };

    const handleStartGame = (mode: GameMode, blackPlayer: PlayerInfo, whitePlayer: PlayerInfo) => {
        startGame(mode, blackPlayer, whitePlayer);
        gameRecordRef.current = false;
    };

    // Handle depth change
    const handleDepthChange = (newDepth: number) => {
        setAIDepth(newDepth);
        handleReset();
    };

    // Handle play online
    const handlePlayOnline = () => {
        setViewMode("online");
    };

    // Handle exit online mode
    const handleExitOnline = () => {
        setViewMode("local");
    }

    // -------------------------------------------------------------------------------------------------------------- //

    // get winner's name for overlay
    const getWinnerName = (): string | null => {
        if (!winner) return null;
        if (winner === "B") return playerBlack?.name || "Black";
        return playerWhite?.name || "White";
    };

    // Sidebar content
    const sidebarContent = (
        <>
            <StatsDisplay ref={statsDisplayRef} />
        </>
    );

    // online game view
    if (viewMode === "online") {
        return (
            <Layout
                sidebarContent={sidebarContent}
                headerContent={<UserProfile />}
            >
                <OnlineGame
                    currentUser={currentUser}
                    serverUrl={WS_SERVER_URL}
                    onExit={handleExitOnline}
                />
            </Layout>
        )
    }

    // -------------------------------------------------------------------------------------------------------------- //

    return (
        <Layout
            sidebarContent={sidebarContent}
            headerContent={<UserProfile />}
        >
            <div className="game-container">
                <div className="game-setup">
                    <GameModeSelector
                        currentMode={gameMode}
                        onStartGame={handleStartGame}
                        onPlayOnline={handlePlayOnline}
                        disabled={isAIThinking}
                    />
                </div>

                {/* controls above board */}
                <div className="game-controls">
                    <GameInfo
                        currentTurn={currentTurn}
                        currentPlayer={currentPlayer}
                        isAIThinking={isAIThinking}
                        onReset={handleReset}
                    />

                    <MoveCounter count={moveCount} />

                    {/* only show depth selector for AI games */}
                    {gameMode === 'vs-ai' && (
                        <DepthSelector
                            depth={aiDepth}
                            minDepth={1}
                            maxDepth={7}
                            onDepthChange={handleDepthChange}
                            disabled={isAIThinking}
                        />
                    )}
                </div>

                {/* Board View */}
                <div className="board-wrapper">
                    <BoardView
                        board={boardState}
                        boardSize={boardSize}
                        cellSize={cellSize}
                        margin={margin}
                        lastMove={lastMove}
                        onIntersectionClick={handleIntersectionClick}
                        convertPixelsToBoardCoords={convertPixelToCoords}
                        disabled={isAIThinking || gameStatus !== 'playing'}
                    />

                    {/* game over message overlay */}
                    {gameStatus !== 'playing' && (
                        <GameOverlay
                            winner={winner}
                            winnerName={getWinnerName()}
                            gameStatus={gameStatus}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};
