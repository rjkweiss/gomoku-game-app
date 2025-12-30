import type { StoneColor, BoardState } from "../Types";
import type {
    Player,
    PlayerInfo,
    GameMode,
    MoveRecord,
    SessionStatus,
    GameSession as GameSessionData
} from "./player/PlayerTypes";
import { Board } from "./Board";
import { HumanPlayer } from "./player/HumanPlayer";
import { AIPlayerWrapper } from "./player/AIPlayerWrapper";

// Callbacks for UI updates
export interface GameSessionCallbacks {
    onBoardUpdate: (board: BoardState) => void;
    onTurnChange: (turn: StoneColor, player: PlayerInfo) => void;
    onGameEnd: (winner: StoneColor | "draw", winningPlayer?: PlayerInfo) => void;
    onMoveRecorded: (move: MoveRecord) => void;
    onThinkingChange: (isThinking: boolean) => void;
}

export class GameSessionManager {
    private sessionId: string;
    private mode: GameMode;
    private board: Board;

    private playerBlack: Player;
    private playerWhite: Player;
    private currentTurn: StoneColor = "B";

    private moveHistory: MoveRecord[] = [];
    private status: SessionStatus = "waiting";
    private winner?: StoneColor | "draw";

    private callbacks: GameSessionCallbacks;
    private createdAt: number;

    constructor(
        config: {
            boardSize: number;
            cellSize: number;
            margin: number;
        },
        callbacks: GameSessionCallbacks
    ) {
        this.sessionId = this.generateSessionId();
        this.mode = "vs-ai"; // Default
        this.board = new Board(config.boardSize, config.cellSize, config.margin);
        this.callbacks = callbacks;
        this.createdAt = Date.now();

        // Initialize with placeholder players - will be set properly via setupGame
        this.playerBlack = new HumanPlayer({ id: "", name: "", type: "human" });
        this.playerWhite = new HumanPlayer({ id: "", name: "", type: "human" });
    }

    // Setup a new game with specific players
    setupGame(
        mode: GameMode,
        playerBlackInfo: PlayerInfo,
        playerWhiteInfo: PlayerInfo,
        aiDepth: number = 3
    ): void {
        this.mode = mode;
        this.status = "playing";
        this.currentTurn = "B";
        this.moveHistory = [];
        this.winner = undefined;

        // Reset board
        this.board = new Board(
            this.board.boardSize,
            this.board.cellSize,
            this.board.margin
        );

        // Create players based on their types
        this.playerBlack = this.createPlayer(playerBlackInfo, aiDepth);
        this.playerWhite = this.createPlayer(playerWhiteInfo, aiDepth);

        // Notify UI
        this.callbacks.onBoardUpdate(this.getBoardState());
        this.callbacks.onTurnChange(this.currentTurn, this.playerBlack.info);

        // If black is AI, start its turn
        this.processCurrentTurn();
    }

    private createPlayer(info: PlayerInfo, aiDepth: number): Player {
        if (info.type === "ai") {
            return new AIPlayerWrapper(info, this.board, aiDepth);
        }
        return new HumanPlayer(info);
    }

    // Handle click from UI - routes to appropriate human player
    handleBoardClick(row: number, col: number): void {
        if (this.status !== "playing") return;

        // Validate position
        if (!this.board.isPositionValid(row, col)) return;

        const currentPlayer = this.getCurrentPlayer();

        // Only process if current player is human and waiting for input
        if (currentPlayer instanceof HumanPlayer && currentPlayer.isWaitingForMove()) {
            currentPlayer.submitMove([row, col]);
        }
    }

    // Main game loop for current turn
    private async processCurrentTurn(): Promise<void> {
        if (this.status !== "playing") return;

        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.onTurnStart?.();

        // Show thinking indicator for AI
        if (currentPlayer.info.type === "ai") {
            this.callbacks.onThinkingChange(true);
        }

        // Get move from current player
        const move = await currentPlayer.getMove(this.board.board);

        if (currentPlayer.info.type === "ai") {
            this.callbacks.onThinkingChange(false);
        }

        if (!move || this.status !== "playing") return;

        // Execute the move
        this.executeMove(move[0], move[1]);
    }

    private executeMove(row: number, col: number): void {
        // Place stone
        this.board.makeMove(row, col, this.currentTurn);

        // Notify AI of move (for hash sync)
        this.notifyPlayersOfMove(row, col, this.currentTurn);

        // Record move
        const moveRecord: MoveRecord = {
            position: [row, col],
            player: this.currentTurn,
            timestamp: Date.now(),
            moveNumber: this.moveHistory.length + 1
        };
        this.moveHistory.push(moveRecord);
        this.callbacks.onMoveRecorded(moveRecord);

        // Update UI
        this.callbacks.onBoardUpdate(this.getBoardState());

        // Check for win
        const winner = this.board.checkWin(row, col);
        if (winner) {
            this.endGame(winner);
            return;
        }

        // Check for draw
        if (this.board.isBoardFull()) {
            this.endGame("draw");
            return;
        }

        // Switch turns
        this.currentTurn = this.currentTurn === "B" ? "W" : "B";
        this.callbacks.onTurnChange(this.currentTurn, this.getCurrentPlayer().info);

        // Process next turn
        this.processCurrentTurn();
    }

    private notifyPlayersOfMove(row: number, col: number, color: StoneColor): void {
        // Notify AI players to keep their hash in sync
        if (this.playerBlack instanceof AIPlayerWrapper) {
            this.playerBlack.notifyMove(row, col, color);
        }
        if (this.playerWhite instanceof AIPlayerWrapper) {
            this.playerWhite.notifyMove(row, col, color);
        }
    }

    private endGame(result: StoneColor | "draw"): void {
        this.status = "finished";
        this.winner = result;

        const winningPlayer = result === "draw"
            ? undefined
            : result === "B"
                ? this.playerBlack.info
                : this.playerWhite.info;

        this.playerBlack.onGameEnd?.(result);
        this.playerWhite.onGameEnd?.(result);

        this.callbacks.onGameEnd(result, winningPlayer);
    }

    // Getters
    getCurrentPlayer(): Player {
        return this.currentTurn === "B" ? this.playerBlack : this.playerWhite;
    }

    getOpponentPlayer(): Player {
        return this.currentTurn === "B" ? this.playerWhite : this.playerBlack;
    }

    getBoardState(): BoardState {
        return this.board.board.map(row => [...row]);
    }

    getMoveHistory(): MoveRecord[] {
        return [...this.moveHistory];
    }

    getLastMove(): MoveRecord | null {
        return this.moveHistory.length > 0
            ? this.moveHistory[this.moveHistory.length - 1]
            : null;
    }

    getMoveCount(): number {
        return this.moveHistory.length;
    }

    getSessionData(): GameSessionData {
        return {
            sessionId: this.sessionId,
            mode: this.mode,
            playerBlack: this.playerBlack.info,
            playerWhite: this.playerWhite.info,
            currentTurn: this.currentTurn,
            moveHistory: this.moveHistory,
            status: this.status,
            winner: this.winner,
            createdAt: this.createdAt
        };
    }

    getStatus(): SessionStatus {
        return this.status;
    }

    // Coordinate conversion passthrough
    convertPixelsToBoardCoords(xPixel: number, yPixel: number) {
        return this.board.convertPixelsToBoardCoords(xPixel, yPixel);
    }

    private generateSessionId(): string {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
