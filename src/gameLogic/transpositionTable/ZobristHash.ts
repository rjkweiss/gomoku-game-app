import type { StoneColor } from "../../Types";

export class ZobristHash {
    private table: bigint[][][];
    private boardSize: number;
    private currentHash: bigint = 0n;

    constructor(boardSize: number) {
        this.boardSize = boardSize;
        this.table = this.initializeTable();
    }

    private initializeTable(): bigint[][][] {
        // create random 64-bit numbers for each (row, col, color) combination
        // index: table[row][col][colorIndex] where colorIndex 0 = Black, 1 = White
        const table: bigint[][][] = [];

        for (let row = 0; row < this.boardSize; row++) {
            table[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                table[row][col] = [
                    this.random64BitBigInt(),
                    this.random64BitBigInt(),
                ];
            }
        }

        return table;
    }

    private random64BitBigInt(): bigint {
        // generate a random 64-bit number using two 32-bit randoms
        const high = BigInt(Math.floor(Math.random() * 0xffffffff));
        const low = BigInt(Math.floor(Math.random() * 0xffffffff));
        return (high <<32n) | low;
    }

    private colorToIndex = (color: StoneColor): number => {
        return color === "B" ? 0 : 1;
    }

    // Call when making a move
    public applyMove = (row: number, col: number, color: StoneColor): void => {
        const colorIndex = this.colorToIndex(color);
        this.currentHash ^= this.table[row][col][colorIndex];
    }

    // Call when undoing a move
    public undoMove = (row: number, col: number, color: StoneColor): void => {
        // XOR is reversible, so this is identical to applyMove
        this.applyMove(row, col, color);
    }

    public getHash():bigint {
        return this.currentHash;
    }

    // Reset hash when starting a new game
    public reset(): void {
        this.currentHash = 0n;
    }
}
