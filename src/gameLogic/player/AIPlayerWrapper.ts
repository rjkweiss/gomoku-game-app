import type { Position, StoneColor } from "../../Types";
import type { Player, PlayerInfo } from "./PlayerTypes";
import { Board } from "../Board";
import { AIPlayer } from "./AIPlayer";

export class AIPlayerWrapper implements Player {
    info: PlayerInfo;
    private aiEngine: AIPlayer;
    private board: Board;
    private delayMs: number;

    constructor(
        info: PlayerInfo,
        board: Board,
        depth: number,
        delayMs: number = 500
    ) {
        this.info = {
            ...info,
            type: "ai"
        };
        this.board = board;
        this.aiEngine = new AIPlayer(board, depth);
        this.delayMs = delayMs;
    }

    async getMove(_board: readonly (readonly (StoneColor | null)[])[]): Promise<Position | null> {
        // Add artificial delay for more natural feel
        await this.delay(this.delayMs);

        // Compute best move
        const move = this.aiEngine.findBestMove();
        return move;
    }

    // Notify AI engine of moves (for Zobrist hash sync)
    notifyMove(row: number, col: number, color: StoneColor): void {
        this.aiEngine.notifyMove(row, col, color);
    }

    // Reset AI state for new game
    reset(): void {
        this.aiEngine.reset();
    }

    // Update AI depth
    setDepth(depth: number): void {
        this.aiEngine = new AIPlayer(this.board, depth);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onTurnStart(): void {
        // Could trigger "AI thinking" indicator
    }

    onGameEnd(_winner: StoneColor | "draw"): void {
        // Cleanup if needed
    }
}
