import type { Position, StoneColor } from "../../Types";
import type { Player, PlayerInfo } from "../player/PlayerTypes";

export class RemotePlayer implements Player {
    info: PlayerInfo;

    // promise resolver for when remote player makes a move
    private moveResolver: ((position: Position) => void) | null = null;

    constructor(info: PlayerInfo) {
        this.info = {
            ...info,
            type: 'human'
        };
    }

    // called by game loop -- waits for remote player to move
    getMove(_board: readonly (readonly (StoneColor| null)[])[]): Promise<Position | null> {
        return new Promise((resolve) => {
            this.moveResolver = resolve;
        });
    }

    // called when we receive a move from web socket
    receiveMove(position: Position): void {
        if (this.moveResolver) {
            this.moveResolver(position);
            this.moveResolver = null;
        }
    }

    // checks if we are waiting for this player's move
    isWaitingForMove(): boolean {
        return this.moveResolver !== null;
    }

    // cancel any pending moves on disconnect / reset
    cancelPendingMove(): void {
        this.moveResolver = null;
    }

    onTurnStart(): void {
        // to do -- maybe signal waiting for the other player to move?
    }

    onGameEnd(_winner: StoneColor | "draw"): void {
        this.cancelPendingMove();
    }
}
