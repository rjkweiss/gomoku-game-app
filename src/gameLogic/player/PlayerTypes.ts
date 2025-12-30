import type { Position, StoneColor } from "../../Types";


export type PlayerType = "human" | "ai";

// Base player info
export interface PlayerInfo {
    id: string;
    name: string;
    type: PlayerType;
    avatarUrl?: string;
}

// Game mode
export type GameMode = "local-pvp" | "vs-ai" | "online-pvp";

// Move record for history
export interface MoveRecord {
    position: Position;
    player: StoneColor;
    timestamp: number;
    moveNumber: number;
}

// Game session status
export type SessionStatus = "waiting" | "playing" | "finished";

// Complete game session
export interface GameSession {
    sessionId: string;
    mode: GameMode;
    playerBlack: PlayerInfo;
    playerWhite: PlayerInfo;
    currentTurn: StoneColor;
    moveHistory: MoveRecord[];
    status: SessionStatus;
    winner?: StoneColor | "draw";
    createdAt: number;
}

// Player interface -  all player types must implement
export interface Player {
    info: PlayerInfo;

    // Returns a move - async to support both AI computation and remote players
    getMove(board: readonly (readonly (StoneColor | null)[])[]) : Promise<Position | null>;

    // Called when it becomes this player's turn
    onTurnStart?(): void;

    // Called when the game ends
    onGameEnd?(winner: StoneColor | "draw"): void;
}

// Factory function signatures
export interface PlayerFactory {
    createHumanPlayer(info: PlayerInfo): Player;
    createAIPlayer(info: PlayerInfo, depth: number): Player;
}
