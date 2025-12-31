import { useCallback, useEffect, useRef, useState } from "react";
import type { BoardState, Position, StoneColor } from "../Types";
import type { PlayerInfo, MoveRecord } from "../gameLogic/player/PlayerTypes";
import { Board } from "../gameLogic/Board";
import { GameSocketService } from "../gameLogic/game/gameSocket";

interface OnlineGameConfig {
    serverUrl: string;
    boardSize: number;
    cellSize: number;
    margin: number;
}

type OnlineGameStatus =
    | "disconnected"
    | "connecting"
    | "waiting_for_opponent"
    | "playing"
    | "finished";


interface OnlineGameReturn {
    // connection
    isConnected: boolean;
    connectionError: string | null;

    // game state
    gameStatus: OnlineGameStatus;
    inviteCode: string | null;
    inviteLink: string | null;

    // Board
    boardState: BoardState;
    boardSize: number;
    cellSize: number;
    margin: number;

    // players
    localPlayer: PlayerInfo | null;
    remotePlayer: PlayerInfo | null;
    localColor: StoneColor | null;
    currentTurn: StoneColor;
    isMyTurn: boolean;

    // moves
    moveHistory: MoveRecord[];
    lastMove: MoveRecord | null;
    moveCount: number;

    // results
    winner: StoneColor | "draw" | null;

    // actions
    createGame: (player: PlayerInfo) => void;
    joinGame: (inviteCode: string, player: PlayerInfo) => void;
    makeMove: (row: number, col: number) => void;
    resign: () => void;
    disconnect: () => void;

    // utilities
    convertPixelToCoords: (xPixel: number, yPixel: number) => Position | null;
}

export const useOnlineGame = (config: OnlineGameConfig): OnlineGameReturn => {
    const { serverUrl, boardSize, cellSize, margin } = config;

    // refs
    const socketRef = useRef<GameSocketService | null>(null);
    const boardRef = useRef<Board>(new Board(boardSize, cellSize, margin));
    const localColorRef = useRef<StoneColor | null>(null);

    // connection state
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // game state
    const [gameStatus, setGameStatus] = useState<OnlineGameStatus>("disconnected");
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    // board state
    const [boardState, setBoardState] = useState<BoardState>(() =>
        Array.from({ length: boardSize }, () => new Array(boardSize).fill(null))
    );

    // player state
    const [localPlayer, setLocalPlayer] = useState<PlayerInfo | null>(null);
    const [remotePlayer, setRemotePlayer] = useState<PlayerInfo | null>(null);
    const [localColor, setLocalColor] = useState<StoneColor | null>(null);
    const [currentTurn, setCurrentTurn] = useState<StoneColor>("B");

    // move tracking
    const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
    const [lastMove, setLastMove] = useState<MoveRecord | null>(null);

    // results
    const [winner, setWinner] = useState<StoneColor | "draw" | null>(null);

    // derived state
    const isMyTurn = localColor === currentTurn && gameStatus === "playing";

    // generate invite link
    const inviteLink = inviteCode ? `${window.location.origin}/join/${inviteCode}` : null;


    // ------------------------------------------------------------------------------------------------------- //

    // initialize socket connection
    useEffect(() => {
        let isMounted = true;
        const socket = new GameSocketService(serverUrl);
        socketRef.current = socket;

        const connect = async () => {
            if (!isMounted) return;

            setGameStatus("connecting");
            setConnectionError(null);

            try {
                await socketRef.current!.connect({
                    onConnectionChange: (connected) => {
                        if (!isMounted) return;
                        setIsConnected(connected);
                        if (!connect && isMounted) {
                            setConnectionError("Connection lost");
                        }
                    },
                    onGameCreated: (_gameId, code) => {
                        if (!isMounted) return;
                        setInviteCode(code);
                        setGameStatus("waiting_for_opponent");
                    },
                    onPlayerJoined: (player, _color) => {
                        if (!isMounted) return;
                        setRemotePlayer(player);
                        // if we are the creator and someone joined, we're black
                        if (localColorRef.current === "B") {
                            setRemotePlayer(player);
                        }
                    },
                    onGameStart: (blackPlayer, whitePlayer) => {
                        if (!isMounted) return;
                        setGameStatus("playing");
                        setCurrentTurn("B");

                        // set players based on color
                        if (localColorRef.current === "B") {
                            setLocalPlayer(blackPlayer);
                            setRemotePlayer(whitePlayer)
                        } else {
                            setLocalPlayer(whitePlayer);
                            setRemotePlayer(blackPlayer);
                        }

                        // reset board
                        boardRef.current = new Board(boardSize, cellSize, margin);
                        setBoardState(boardRef.current.board.map(row => [...row]));
                        setMoveHistory([]);
                        setLastMove(null);
                        setWinner(null);
                    },
                    onMoveMade: (position, player) => {
                        if (!isMounted) return;
                        const [row, col] = position;

                        // update board
                        boardRef.current.makeMove(row, col, player);
                        setBoardState(boardRef.current.board.map(row => [...row]));

                        // record move
                        const move: MoveRecord = {
                            position,
                            player,
                            timestamp: Date.now(),
                            moveNumber: moveHistory.length + 1
                        }

                        setMoveHistory(prev => [...prev, move]);
                        setLastMove(move);

                        // switch turns
                        setCurrentTurn(player === "B" ? "W" : "B");
                    },
                    onGameEnd: (result) => {
                        if (!isMounted) return;
                        setGameStatus('finished');
                        setWinner(result);
                    },
                    onPlayerDisconnected: (player) => {
                        if (!isMounted) return;
                        setConnectionError(`${player.name} disconnected`);
                    },
                    onError: (message) => {
                        if (!isMounted) return;
                        setConnectionError(message);
                    }
                });

                if (isMounted) {
                    setConnectionError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setConnectionError("Failed to connect to game server");
                    setGameStatus("disconnected");
                }
            }
        };

        connect();

        return () => {
            isMounted = false;
            socket.disconnect();
        };

    }, [serverUrl, boardSize, cellSize, margin]);

    // create a new game
    const createGame = useCallback((player: PlayerInfo) => {
        setLocalPlayer(player);
        setLocalColor("B");
        localColorRef.current = "B";
        socketRef.current?.createGame(player);
    }, []);

    // join existing game
    const joinGame = useCallback((code: string, player: PlayerInfo) => {
        setLocalPlayer(player);
        setLocalColor('W');
        localColorRef.current = "W";
        socketRef.current?.joinGame(code, player);
    }, []);

    // make move
    const makeMove = useCallback((row: number, col: number) => {
        if (!isMyTurn) return;
        if (!boardRef.current.isPositionValid(row, col)) return;

        socketRef.current?.makeMove([row, col]);
    }, [isMyTurn]);

    // resign
    const resign = useCallback(() => {
        socketRef.current?.resign();
    }, []);

    // disconnect
    const disconnect = useCallback(() => {
        socketRef.current?.disconnect();
        setGameStatus('disconnected');
    }, []);

    // convert pixels to coordinates
    const convertPixelToCoords = useCallback((xPixel: number, yPixel: number) => {
        return boardRef.current.convertPixelsToBoardCoords(xPixel, yPixel);
    }, []);

    return {
        isConnected,
        connectionError,
        gameStatus,
        inviteCode,
        inviteLink,
        boardState,
        boardSize,
        cellSize,
        margin,
        localPlayer,
        remotePlayer,
        localColor,
        currentTurn,
        isMyTurn,
        moveHistory,
        lastMove,
        moveCount: moveHistory.length,
        winner,
        createGame,
        joinGame,
        makeMove,
        resign,
        disconnect,
        convertPixelToCoords
    }
}
