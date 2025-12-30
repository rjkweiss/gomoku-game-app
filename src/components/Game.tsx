import { useEffect, useRef } from "react";
import { useGameSession, } from "../hooks/useGameSession";
import { Layout } from "./layout/Layout";
import { BoardView } from "./board/Board";
import { GameInfo } from "./gameInfo/GameInfo";
import { GameOverlay } from "./gameOverlay/GameOverlay";
import { DepthSelector } from "./depthSelector/DepthSelector";
import { GameModeSelector } from "./gameModeSelector/GameModeSelector";
import { MoveCounter } from "./moveCounter/MoveCounter";
import { UserProfile } from "./userProfile/UserProfile";
import { StatsDisplay, type StatsDisplayHandle } from "./stats/StatsDisplay";
import { api } from "../services/api";
import type { GameMode, PlayerInfo } from "../gameLogic/player/PlayerTypes";
import "./Game.css";

// Game Configuration
const GAME_CONFIG = {
    boardSize: 15,
    cellSize: 50,
    margin: 50,
    aiDepth: 3,
    aiDelayMs: 1250
};


export const Game = () => {

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
