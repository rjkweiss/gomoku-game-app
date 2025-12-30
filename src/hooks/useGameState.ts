import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "../gameLogic/Board";
import { AIPlayer } from "../gameLogic/player/AIPlayer";
import type { BoardState, GameStatus, PositionOrNull, StoneColor, Winner } from "../Types";

// Configuration interface
interface GameConfig {
    boardSize: number;
    cellSize: number;
    margin: number;
    aiDepth: number;
    aiDelayMs: number;
}

// Return type for the hook
interface GameStateReturn {
    boardState: BoardState;
    currentTurn: StoneColor;
    gameStatus: GameStatus;
    winner: Winner;
    isAIThinking: boolean;
    aiDepth: number;
    handleIntersectionClick: (row: number, col: number) => void;
    resetGame: () => void;
    setAIDepth: (depth: number) => void;
    convertPixelToCoords: (xPixel: number, yPixel: number) => PositionOrNull;
    // Expose config for board view
    boardSize: number;
    cellSize: number;
    margin: number;
}

const HUMAN_PLAYER: StoneColor = "B";
const AI_PLAYER: StoneColor = "W";

// Helper to create initial board state
const createInitialBoardState = (size: number): BoardState => {
    return Array.from(
        { length: size},
        () => new Array(size).fill(null)
    );
};

export const useGameState = (config: GameConfig): GameStateReturn => {
    const { boardSize, cellSize, margin, aiDepth: initialAiDepth, aiDelayMs } = config;

    // Refs for mutable game logic instances
    const boardRef = useRef<Board | null>(null);
    const aiPlayerRef = useRef<AIPlayer | null>(null);

    // State that triggers re-renders
    const [boardState, setBoardState] = useState<BoardState>(() => createInitialBoardState(boardSize));
    const [currentTurn, setCurrentTurn] = useState<StoneColor>(HUMAN_PLAYER);
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [winner, setWinner] = useState<Winner>(null);
    const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
    const [aiDepth, setAiDepthState] = useState<number>(initialAiDepth);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Initialize refs on mount
    useEffect(() => {
        boardRef.current = new Board(boardSize, cellSize, margin);
        aiPlayerRef.current = new AIPlayer(boardRef.current, aiDepth);
        setBoardState(boardRef.current.board.map(row => [...row]));
        setIsInitialized(true);
    }, [boardSize, cellSize, margin, aiDepth]);

    // Sync board state for rendering
    const updateBoardState = useCallback(() => {
        // Create new array reference to trigger React re-render
        if (boardRef.current) {
            setBoardState(boardRef.current.board.map(row => [...row]));
        }
    }, []);

    // Update AI depth
    const setAIDepth = useCallback((newDepth: number) => {
        setAiDepthState(newDepth);
        if (boardRef.current) {
            aiPlayerRef.current = new AIPlayer(boardRef.current, newDepth);
        }
    }, []);

    // Process AI move
    const makeAIMove = useCallback(() => {
        if (!aiPlayerRef.current || !boardRef.current) return;

        const aiMove = aiPlayerRef.current.findBestMove();

        if (!aiMove) {
            // no valid moves -- handle with grace
            setIsAIThinking(false);
            return;
        }

        const [row, col] = aiMove;

        // Place AI Stone
        boardRef.current.makeMove(row, col, AI_PLAYER);
        aiPlayerRef.current?.notifyMove(row, col, AI_PLAYER);
        updateBoardState();

        // Check for AI win
        if (boardRef.current.checkWin(row, col)) {
            setGameStatus("won");
            setWinner(AI_PLAYER);
            setIsAIThinking(false);
            return;
        }

        // Check for draw
        if (boardRef.current.isBoardFull()) {
            setGameStatus("draw");
            setIsAIThinking(false);
            return;
        }

        // Switch back to Human
        setCurrentTurn(HUMAN_PLAYER);
        setIsAIThinking(false);

    }, [updateBoardState]);

    // Handle human player clicks
    const handleIntersectionClick = useCallback((row: number, col: number) => {
        if (!boardRef.current || !isInitialized) return;

        // Ignore if not human player's turn or is game over
        if (currentTurn !== HUMAN_PLAYER || gameStatus !== "playing" || isAIThinking) return;

        // check if position is valid
        if (!boardRef.current.isPositionValid(row, col)) return;

        // Place stone
        boardRef.current.makeMove(row, col, HUMAN_PLAYER);
        aiPlayerRef.current?.notifyMove(row, col, HUMAN_PLAYER);
        updateBoardState();

        // Check if human won
        if (boardRef.current.checkWin(row, col)) {
            setGameStatus("won");
            setWinner(HUMAN_PLAYER);
            return;
        }

        // Check Draw
        if (boardRef.current.isBoardFull()) {
            setGameStatus("draw");
            return;
        }

        // switch to AI
        setCurrentTurn(AI_PLAYER);
        setIsAIThinking(true);

        // AI moves after some delay (thinking time for natural behavior)
        setTimeout(() => {
            makeAIMove();
        }, aiDelayMs);

    }, [currentTurn, gameStatus, isAIThinking, isInitialized, aiDelayMs, updateBoardState, makeAIMove]);

    // Reset game to initial state
    const resetGame = useCallback(() => {
        // Create fresh instances
        boardRef.current = new Board(boardSize, cellSize, margin);
        aiPlayerRef.current = new AIPlayer(boardRef.current, aiDepth);
        aiPlayerRef.current.reset();

        // Reset all states
        setBoardState(boardRef.current.board.map(row => [...row]));
        setCurrentTurn(HUMAN_PLAYER);
        setGameStatus("playing");
        setWinner(null);
        setIsAIThinking(false);

    }, [boardSize, cellSize, margin, aiDepth]);

    // Pass through for pixel conversion
    const convertPixelToCoords = useCallback((xPixel: number, yPixel: number): PositionOrNull => {
        if (!boardRef.current) return null;
        return boardRef.current.convertPixelsToBoardCoords(xPixel, yPixel);
    }, []);

    return {
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
    };
};
