import type { BoardState, CountResults, Direction, DirectionPair, Position, PositionOrNull, StoneColor } from "../Types";

export class Board {
    readonly boardSize: number = 15;
    cellSize: number;
    margin: number;
    board: BoardState;

    // Direction pairs
    directions: DirectionPair[] = [
        [[1, 0], [-1, 0]],
        [[0, 1], [0, -1]],
        [[1, 1], [-1, -1]],
        [[-1, 1], [1, -1]]
    ];

    constructor(N: number, cellSize: number, margin: number) {
        this.boardSize = N;
        this.cellSize = cellSize;
        this.margin = margin;

        this.board = Array.from(
            { length: this.boardSize },
            () => new Array(this.boardSize).fill(null)
        );
    }

    public getIntersectionValue(row: number, col: number): StoneColor | null {
        return this.board[row][col];
    }

    public isPositionValid(row: number, col: number): boolean {
        return this.board[row][col] === null;
    }

    public makeMove(row: number, col: number, stone: StoneColor): void {
        this.board[row][col] = stone;
    }

    public undoMove(row: number, col: number): void {
        this.board[row][col] = null;
    }

    public isBoardFull(): boolean {
        return this.board.every((row) => {
            return row.every(cell => cell !== null)
        });
    }

    public convertBoardCoordsToPixels(row: number, col: number): Position {
        const xPixel = col * this.cellSize + this.margin;
        const yPixel = row * this.cellSize + this.margin;

        return [xPixel, yPixel];
    }

    public convertPixelsToBoardCoords(xPixel: number, yPixel: number): PositionOrNull {
        let minDist: number = Infinity;

        let closestRow: number = -1;
        let closestCol: number = -1;

        // For every intersection, let's find the one that's closest to the click
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {

                // get pixels of current intersections
                const [currXPixel, currYPixel] = this.convertBoardCoordsToPixels(row, col);

                // Calculate Euclidean distance
                const dist =((xPixel - currXPixel) ** 2 + (yPixel - currYPixel) ** 2) ** 0.5;
                if (dist < minDist) {
                    minDist = dist;
                    closestRow = row;
                    closestCol = col;
                }
            }
        }

        // allow for some tolerance so that clicks within 30% of intersections are matched
        const maxAllowedDist = 0.3 * this.cellSize;
        if (minDist <= maxAllowedDist) {
            return [closestRow, closestCol];
        }

        return null;
    }

    public checkWin(row: number, col: number): StoneColor | null {
        // get current player color
        const playerColor = this.board[row][col];

        // go over directional pairs to explore win paths from current row, col
        for (const dirPair of this.directions) {
            const totalStones = (
                this.countInDirection(row, col, dirPair[0])[0] +
                1 +
                this.countInDirection(row, col, dirPair[1])[0]
            );

            if (totalStones >= 5) {
                return playerColor;
            }
        }

        return null;
    }

    public isCoordOutOfBounds(row: number, col: number): boolean {
        return (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize);
    }

    public countInDirection(row: number, col: number, direction: Direction): CountResults {
        let numOfStones: number = 0;
        const [dRow, dCol] = direction;

        // get next row and col
        let nextRow = row + dRow;
        let nextCol = col + dCol;

        // count the number of stones for current player
        while (!this.isCoordOutOfBounds(nextRow, nextCol)) {
            if (this.board[nextRow][nextCol] === this.board[row][col]) {
                numOfStones++;

                nextRow += dRow;
                nextCol += dCol;
            } else {
                break;
            }
        }

        // count number of openings
        let isOpen: boolean = false;
        if (!this.isCoordOutOfBounds(nextRow, nextCol) && this.board[nextRow][nextCol] === null) {
            isOpen = true;
        }

        return [numOfStones, isOpen];
    }
};
