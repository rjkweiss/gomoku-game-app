import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import type { BoardState, GameStatus, PositionOrNull, StoneColor, Winner } from "../Types";
import type { GameMode, MoveRecord, PlayerInfo } from "../gameLogic/player/PlayerTypes";
import { GameSessionManager } from "../gameLogic/GameSession";

interface GameConfig {
    boardSize: number;
    cellSize: number;
    margin: number;
    aiDepth: number;
}

interface GameSessionReturn {
    // Board state
    boardState: BoardState;
    boardSize: number;
    cellSize: number;
    margin: number;

    // Game state
    currentTurn: StoneColor;
    currentPlayer: PlayerInfo | null;
    gameStatus: GameStatus;
    winner: Winner;
    isAIThinking: boolean;

    // Move tracking
    moveHistory: MoveRecord[];
    lastMove: MoveRecord | null;
    moveCount: number;

    // Players
    playerBlack: PlayerInfo | null;
    playerWhite: PlayerInfo | null;
    gameMode: GameMode;

    // AI settings
    aiDepth: number;
    setAIDepth: (depth: number) => void;

    // Actions
    handleIntersectionClick: (row: number, col: number) => void;
    startGame: (mode: GameMode, playerBlack: PlayerInfo, playerWhite: PlayerInfo) => void;
    resetGame: () => void;
    convertPixelToCoords: (xPixel: number, yPixel: number) => PositionOrNull;
}



// Default player info
const DEFAULT_HUMAN: PlayerInfo = {
    id: "local-player",
    name: "Player",
    type: "human"
};

const DEFAULT_AI: PlayerInfo = {
    id: "ai-player",
    name: "Computer",
    type: "ai"
};

export const useGameSession = (config: GameConfig): GameSessionReturn => {
    const { boardSize, cellSize, margin, aiDepth: initialAiDepth } = config;
    const { user } = useAuth();

    let authUser: PlayerInfo | null = null;
    if (user) {
        authUser = {
            id: 'auth-user',
            name: user.firstName,
            type: 'human'
        }
    }

    // Game session ref
    const sessionRef = useRef<GameSessionManager | null>(null);

    // UI State
    const [boardState, setBoardState] = useState<BoardState>(() =>
        Array.from({ length: boardSize }, () => new Array(boardSize).fill(null))
    );
    const [currentTurn, setCurrentTurn] = useState<StoneColor>("B");
    const [currentPlayer, setCurrentPlayer] = useState<PlayerInfo | null>(null);
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [winner, setWinner] = useState<Winner>(null);
    const [isAIThinking, setIsAIThinking] = useState(false);

    // Move tracking
    const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
    const [lastMove, setLastMove] = useState<MoveRecord | null>(null);

    // Players
    const [playerBlack, setPlayerBlack] = useState<PlayerInfo | null>(authUser);
    const [playerWhite, setPlayerWhite] = useState<PlayerInfo | null>(null);
    const [gameMode, setGameMode] = useState<GameMode>("vs-ai");

    // Settings
    const [aiDepth, setAiDepthState] = useState(initialAiDepth);

    // Initialize session
    useEffect(() => {
        const callbacks = {
            onBoardUpdate: (board: BoardState) => setBoardState(board),
            onTurnChange: (turn: StoneColor, player: PlayerInfo) => {
                setCurrentTurn(turn);
                setCurrentPlayer(player);
            },
            onGameEnd: (result: StoneColor | "draw", _winningPlayer?: PlayerInfo) => {
                setGameStatus(result === "draw" ? "draw" : "won");
                setWinner(result === "draw" ? null : result);
            },
            onMoveRecorded: (move: MoveRecord) => {
                setMoveHistory(prev => [...prev, move]);
                setLastMove(move);
            },
            onThinkingChange: (thinking: boolean) => setIsAIThinking(thinking)
        };

        sessionRef.current = new GameSessionManager(
            { boardSize, cellSize, margin },
            callbacks
        );

        // Start default game (vs AI)
        const humanPlayer = playerBlack ? playerBlack : DEFAULT_HUMAN;
        sessionRef.current.setupGame("vs-ai", humanPlayer, DEFAULT_AI, initialAiDepth);
        setPlayerBlack(humanPlayer);
        setPlayerWhite(DEFAULT_AI);
        setCurrentPlayer(humanPlayer);

    }, [boardSize, cellSize, margin, initialAiDepth]);

    // Start a new game with specific players
    const startGame = useCallback((
        mode: GameMode,
        blackPlayer: PlayerInfo,
        whitePlayer: PlayerInfo
    ) => {
        if (!sessionRef.current) return;

        sessionRef.current.setupGame(mode, blackPlayer, whitePlayer, aiDepth);

        setGameMode(mode);
        setPlayerBlack(blackPlayer);
        setPlayerWhite(whitePlayer);
        setCurrentPlayer(blackPlayer);
        setGameStatus("playing");
        setWinner(null);
        setMoveHistory([]);
        setLastMove(null);
        setIsAIThinking(false);

    }, [aiDepth]);

    // Reset current game
    const resetGame = useCallback(() => {
        if (!sessionRef.current) return;

        const black = playerBlack || DEFAULT_HUMAN;
        const white = playerWhite || DEFAULT_AI;

        startGame(gameMode, black, white);

    }, [gameMode, playerBlack, playerWhite, startGame]);

    // Handle board clicks
    const handleIntersectionClick = useCallback((row: number, col: number) => {
        sessionRef.current?.handleBoardClick(row, col);
    }, []);

    // Update AI depth
    const setAIDepth = useCallback((depth: number) => {
        setAiDepthState(depth);
        // Depth will be applied on next game start
    }, []);

    // Coordinate conversion
    const convertPixelToCoords = useCallback((xPixel: number, yPixel: number): PositionOrNull => {
        return sessionRef.current?.convertPixelsToBoardCoords(xPixel, yPixel) ?? null;
    }, []);

    return {
        boardState,
        boardSize,
        cellSize,
        margin,
        currentTurn,
        currentPlayer,
        gameStatus,
        winner,
        isAIThinking,
        moveHistory,
        lastMove,
        moveCount: moveHistory.length,
        playerBlack,
        playerWhite,
        gameMode,
        aiDepth,
        setAIDepth,
        handleIntersectionClick,
        startGame,
        resetGame,
        convertPixelToCoords
    };
};
