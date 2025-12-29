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
    lastName: string
};

// User Registration data
export type RegisterData = {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
};
