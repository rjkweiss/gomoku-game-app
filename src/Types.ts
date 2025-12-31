import type { PlayerInfo } from "./gameLogic/player/PlayerTypes";
// stone color
export type StoneColor = "B" | "W";

// position (row, col)
export type Position = [row: number, col: number];

// position or null
export type PositionOrNull = Position | null;

// direction
export type Direction = [dRow: number, dCol: number];

// direction pairs
export type DirectionPair = [Direction, Direction];

// count results
export type CountResults = [count: number, isOpen: boolean];

// intersection or board state
export type BoardState = (StoneColor | null)[][];

// game status
export type GameStatus = "playing" | "won" | "draw";

// winner result
export type Winner = StoneColor | null;

// AI move
export type AIMove = PositionOrNull;

// User data
export type User = {
    id: number,
    email: string,
    username: string | null;
    firstName: string,
    lastName: string,
    avatarUrl?: string
};

// User Registration data
export type RegisterData = {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
};

// User login data
export type LoginData = {
    emailOrUsername: string;
    password: string;
};

//  Auth Response type
export type AuthResponse = {
    message: string,
    user: User,
    token: string
};

// Game Data
export type GameData = {
    aiDepth: number;
    result: 'win' | 'loss' | 'draw';
    moveCount?: number;
    gameDurationSeconds?: number;
};

// Stats response
export type StatsResponse = {
    overall: {
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        highestLevelBeaten: number;
    };
    byLevel: Array<{
        depth: number;
        wins: number;
        losses: number;
        draws: number;
        total: number;
        winRate: number;
    }>;
    recentGames: Array<{
        id: number;
        aiDepth: number;
        result: string;
        moveCount: number | null;
        gameDurationSeconds: number | null;
        playedAt: string;
    }>;
};

// Message types sent or received via websocket
export type ServerMessage =
    | { type: "game_created"; gameId: string; inviteCode: string }
    | { type: "player_joined"; player: PlayerInfo; color: StoneColor }
    | { type: "game_start"; playerBlack: PlayerInfo; playerWhite: PlayerInfo }
    | { type: "move_made"; position: Position; player: StoneColor }
    | { type: "game_end"; winner: StoneColor | "draw" }
    | { type: "player_disconnected"; player: PlayerInfo }
    | { type: "error"; message: string };

export type ClientMessage =
    | { type: "create_game"; player: PlayerInfo }
    | { type: "join_game"; inviteCode: string; player: PlayerInfo }
    | { type: "make_move"; gameId: string; position: Position }
    | { type: "resign"; gameId: string }
    | { type: "rematch_request"; gameId: string };
