import { useEffect, useRef } from "react";
import { useGameState } from "../hooks/useGameState";
import { Layout } from "./layout/Layout";
import { BoardView } from "./board/Board";
import { GameInfo } from "./gameInfo/GameInfo";
import { GameOverlay } from "./gameOverlay/GameOverlay";
import { DepthSelector } from "./depthSelector/DepthSelector";
import { UserProfile } from "./userProfile/UserProfile";
import { StatsDisplay, type StatsDisplayHandle } from "./stats/StatsDisplay";
import { api } from "../services/api";
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
        boardState,
        currentTurn,
        gameStatus,
        winner,
        isAIThinking,
        aiDepth,
        handleIntersectionClick,
        resetGame,
        setAIDepth,
        convertPixelToCoords,
        boardSize,
        cellSize,
        margin
    } = useGameState(GAME_CONFIG);

    // Track if game result has been recorded
    const gameRecordRef = useRef(false);
    const statsDisplayRef = useRef<StatsDisplayHandle | null>(null);

    // Record game result when game ends
    useEffect(() => {
        const recordGameResult = async () => {
            if (gameStatus !== 'playing' && !gameRecordRef.current) {
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
                        result

                        // To-do: add moveCount, gameDurationSeconds
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

    }, [gameStatus, winner, aiDepth]);

    // Handle game reset
    const handleReset = () => {
        resetGame();
        gameRecordRef.current = false;
    };

    // Handle depth change
    const handleDepthChange = (newDepth: number) => {
        setAIDepth(newDepth);
        handleReset();
    };

    // Sidebar content
    const sidebarContent = (
        <>
            <StatsDisplay ref={statsDisplayRef} />
            <UserProfile />
        </>
    );

    return (
        <Layout sidebarContent={sidebarContent}>
            <div className="game-container">
                {/* controls above board */}
                <div className="game-controls">
                    <GameInfo
                        currentTurn={currentTurn}
                        isAIThinking={isAIThinking}
                        onReset={handleReset}
                    />
                    <DepthSelector
                        depth={aiDepth}
                        minDepth={1}
                        maxDepth={7}
                        onDepthChange={handleDepthChange}
                        disabled={isAIThinking}
                    />
                </div>

                {/* Board View */}
                <div className="board-wrapper">
                    <BoardView
                        board={boardState}
                        boardSize={boardSize}
                        cellSize={cellSize}
                        margin={margin}
                        onIntersectionClick={handleIntersectionClick}
                        convertPixelsToBoardCoords={convertPixelToCoords}
                        disabled={isAIThinking || gameStatus !== 'playing'}
                    />

                    {/* game over message overlay */}
                    {gameStatus !== 'playing' && (
                        <GameOverlay
                            winner={winner}
                            gameStatus={gameStatus}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};
