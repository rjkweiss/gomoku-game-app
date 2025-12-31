import type { Position, StoneColor, ServerMessage, ClientMessage } from "../../Types";
import type { PlayerInfo } from "../player/PlayerTypes";

// Event callbacks
export interface GameSocketCallbacks {
    onGameCreated?: (gameId: string, inviteCode: string) => void;
    onPlayerJoined?: (player: PlayerInfo, color: StoneColor) => void;
    onGameStart?: (playerBlack: PlayerInfo, playerWhite: PlayerInfo) => void;
    onMoveMade?: (position: Position, player: StoneColor) => void;
    onGameEnd?: (winner: StoneColor | "draw") => void;
    onPlayerDisconnected?: (player: PlayerInfo) => void;
    onError?: (message: string) => void;
    onConnectionChange?: (connected: boolean) => void;
}

export class GameSocketService {
    private socket: WebSocket | null = null;
    private callBacks: GameSocketCallbacks = {};
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private gameId: string | null = null;
    private intentionalDisconnect = false;

    constructor(private serverUrl: string) {}

    // connect to websocket server
    connect(callBacks: GameSocketCallbacks): Promise<void> {
        this.callBacks = callBacks;
        this.intentionalDisconnect = false;

        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(this.serverUrl);

                this.socket.onopen = () => {
                    this.reconnectAttempts = 0;
                    this.callBacks?.onConnectionChange?.(true);
                    resolve();
                };

                this.socket.onclose = () => {
                    this.callBacks.onConnectionChange?.(false);
                    if (!this.intentionalDisconnect) {
                        this.attemptReconnect();
                    }
                };

                this.socket.onerror = (error) => {
                    console.error("Websocket error: ", error);
                    reject(error);
                };

                this.socket.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // create a new game
    createGame(player: PlayerInfo): void {
        this.send({ type: 'create_game', player });
    }

    // join existing game with an invite game
    joinGame(inviteCode: string, player: PlayerInfo):void {
        this.send({ type: 'join_game', inviteCode, player });
    }

    // send move
    makeMove(position: Position): void {
        if (this.gameId) {
            this.send({ type: 'make_move', gameId: this.gameId, position });
        }
    }

    // resign
    resign(): void {
        if (this.gameId) {
            this.send({ type: 'resign', gameId: this.gameId });
        }
    }

    // request rematch
    requestRematch(): void {
        if (this.gameId) {
            this.send({ type: 'rematch_request', gameId: this.gameId });
        }
    }

    // disconnect
    disconnect(): void {
        this.intentionalDisconnect = true;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.gameId = null;
    }

    // check if it is connected
    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    // --------------------- helpers ------------------ //
    // attempt reconnection
    private attemptReconnect(): void {
        if (this.intentionalDisconnect) return;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 3000);

            setTimeout(() => {
                if (!this.intentionalDisconnect) {
                    console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
                    this.connect(this.callBacks).catch(console.error);
                }
            }, delay);
        }
    }

    // handle incoming messages
    private handleMessage(message: ServerMessage): void {
        switch(message.type) {
            case "game_created":
                this.gameId = message.gameId;
                this.callBacks.onGameCreated?.(message.gameId, message.inviteCode);
                break;

            case "player_joined":
                this.callBacks.onPlayerJoined?.(message.player, message.color);
                break;

            case "game_start":
                this.callBacks.onGameStart?.(message.playerBlack, message.playerWhite);
                break;

            case "move_made":
                this.callBacks.onMoveMade?.(message.position, message.player);
                break;

            case "game_end":
                this.callBacks.onGameEnd?.(message.winner);
                break;

            case "player_disconnected":
                this.callBacks.onPlayerDisconnected?.(message.player);
                break;

            case "error":
                this.callBacks.onError?.(message.message);
                break;
        }
    }

    // send message to server
    private send(message: ClientMessage): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("Websocket not connected");
        }
    }


};
