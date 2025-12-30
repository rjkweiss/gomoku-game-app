import type { Position, StoneColor } from "../../Types";
import type { Player, PlayerInfo } from "./PlayerTypes";

export class HumanPlayer implements Player {
    info: PlayerInfo;

    // Promise resolution function - called when human clicks
    private moveResolver: ((position: Position) => void) | null = null;

    constructor(info: PlayerInfo) {
        this.info = {
            ...info,
            type: "human"
        };
    }

    // Called by game loop - waits for human input
    getMove(_board: readonly (readonly (StoneColor | null)[])[]): Promise<Position | null> {
        return new Promise((resolve) => {
            this.moveResolver = resolve;
        });
    }

    // Called when human clicks on the board
    submitMove(position: Position): void {
        if (this.moveResolver) {
            this.moveResolver(position);
            this.moveResolver = null;
        }
    }

    // Check if we're waiting for this player's input
    isWaitingForMove(): boolean {
        return this.moveResolver !== null;
    }

    // Cancel pending move (e.g., on game reset)
    cancelPendingMove(): void {
        this.moveResolver = null;
    }

    onTurnStart(): void {
        // Could trigger UI indicator, sound, etc.
    }

    onGameEnd(_winner: StoneColor | "draw"): void {
        this.cancelPendingMove();
    }
}
