import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

interface PlayerInfo {
    id: string;
    name: string;
    type: "ai" | "human";
}

interface GameRoom {
    gameId: string;
    inviteCode: string;
    playerBlack: { info: PlayerInfo; socket: WebSocket } | null;
    playerWhite: { info: PlayerInfo; socket: WebSocket } | null;
    board: (string | null)[][];
    currentTurn: "B" | "W";
    status: "waiting" | "playing" | "finished";
    moves: { position: [number, number]; player: "B" | "W" }[];
}

// store active games
const games = new Map<string, GameRoom>();
const inviteCodes = new Map<string, string>();
const playerSockets = new Map<WebSocket, string>();

// generate a short invite code
const generateInviteCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create empty board
const createEmptyBoard = (size: number = 15): (string | null)[][] => {
    return Array.from({ length: size }, () => new Array(size).fill(null));
};

// check for win
const checkWin = (board: (string | null)[][], row: number, col: number): boolean => {
    const color = board[row][col];
    if (!color) return false;

    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dRow, dCol] of directions) {
        let count = 1;

        // count in positive direction
        for (let i = 1; i < 5; i++) {
            const nextRow = row + dCol * i;
            const nextCol = col + dRow * i;

            if (nextRow < 0 || nextRow >= 15 || nextCol < 0 || nextCol >= 15 || board[nextRow][nextCol] !== color) break;
            count++;
        }

        // count in negative direction
        for (let i = 1; i < 5; i++) {
            const nextRow = row - dCol * i;
            const nextCol = col - dRow * i;
            if (nextRow < 0 || nextRow >= 15 || nextCol < 0 || nextCol >= 15 || board[nextRow][nextCol] !== color) break;
            count++;
        }

        if (count >= 5) return true;
    }

    return false;
};

// websocket server
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("message", (data) => {
        const message = JSON.parse(data.toString());

        switch (message.type) {
            case "create_game": {
                const gameId = uuidv4();
                const inviteCode = generateInviteCode();

                const game: GameRoom = {
                    gameId,
                    inviteCode,
                    playerBlack: { info: message.player, socket },
                    playerWhite: null,
                    board: createEmptyBoard(),
                    currentTurn: "B",
                    status: "waiting",
                    moves: []
                };

                games.set(gameId, game);
                inviteCodes.set(inviteCode, gameId);
                playerSockets.set(socket, gameId);

                socket.send(JSON.stringify({
                    type: 'game_created',
                    gameId,
                    inviteCode
                }));

                break;
            }

            case "join_game": {
                const gameId = inviteCodes.get(message.inviteCode);
                if (!gameId) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: "Invalid invite code"
                    }));
                    return;
                }

                const game = games.get(gameId);
                if (!game || game.playerWhite) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not available'
                    }));
                    return;
                }

                // add second player as white
                game.playerWhite = { info: message.player, socket }
                game.status = "playing"
                playerSockets.set(socket, gameId);

                // Inform Joining Player that they are white
                socket.send(JSON.stringify({
                    type: 'player_joined',
                    player: message.player,
                    color: "W"
                }));

                // notify creator that someone joined as white player
                game.playerBlack?.socket.send(JSON.stringify({
                    type: "player_joined",
                    player: message.player,
                    color: "W"
                }));

                // Now send game_start to BOTH players with correct player info
                const gameStartMsgForBlack = JSON.stringify({
                    type: "game_start",
                    gameId: gameId,
                    playerBlack: game.playerBlack!.info,
                    playerWhite: game.playerWhite.info
                });

                const gameStartMsgForWhite = JSON.stringify({
                    type: "game_start",
                    gameId: gameId,
                    playerBlack: game.playerBlack!.info,
                    playerWhite: game.playerWhite.info
                });

                game.playerBlack?.socket.send(gameStartMsgForBlack);
                game.playerWhite.socket.send(gameStartMsgForWhite);

                break;
            }

            case "make_move": {
                const gameId = playerSockets.get(socket);
                if (!gameId) return;

                // get game associated with this gameId
                const game = games.get(gameId);
                if (!game || game.status !== "playing") return;

                // get position
                const [row, col] = message.position;

                // validate it is this player's turn
                const isBlack = game.playerBlack?.socket === socket;
                const expectedTurn = isBlack ? "B" : "W";

                if (game.currentTurn !== expectedTurn) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: 'Not your turn'
                    }));

                    return;
                }

                // validate position
                if (game.board[row][col] !== null) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: 'Position already taken'
                    }));

                    return;
                }

                // make move
                game.board[row][col] = expectedTurn;
                game.moves.push({ position: [row, col], player: expectedTurn });

                // broadcast move to both players
                const moveMsg = JSON.stringify({
                    type: 'move_made',
                    position: [row, col],
                    player: expectedTurn
                });

                game.playerBlack?.socket.send(moveMsg);
                game.playerWhite?.socket.send(moveMsg);

                // check for a win
                if (checkWin(game.board, row, col)) {
                    game.status = "finished";
                    const endMsg = JSON.stringify({
                        type: 'game_end',
                        winner: expectedTurn
                    });

                    game.playerBlack?.socket.send(endMsg);
                    game.playerWhite?.socket.send(endMsg);
                    return;
                }

                // check for draw
                const isFull = game.board.every(row => row.every(cell => cell !== null));
                if (isFull) {
                    game.status = "finished";
                    const endMsg = JSON.stringify({
                        type: 'game_end',
                        winner: "draw"
                    });

                    game.playerBlack?.socket.send(endMsg);
                    game.playerWhite?.socket.send(endMsg);

                    return;
                }

                // switch players
                game.currentTurn = expectedTurn === "B" ? "W" : "B";

                break;
            }

            case "resign": {
                const gameId = playerSockets.get(socket);
                if (!gameId) return;

                const game = games.get(gameId);
                if (!game) return;

                const isBlack = game.playerBlack?.socket === socket;
                const winner = isBlack ? "W" : "B";

                game.status = "finished";
                const endMsg = JSON.stringify({
                    type: 'game_end',
                    winner
                });

                game.playerBlack?.socket.send(endMsg);
                game.playerWhite?.socket.send(endMsg);

                break;
            }
        }
    });

    socket.on("close", () => {
        const gameId = playerSockets.get(socket);
        if (gameId) {
            const game = games.get(gameId);
            if (game && game.status === "playing") {
                // notify the other player
                const isBlack = game.playerBlack?.socket === socket;
                const otherSocket = isBlack ? game.playerWhite?.socket : game.playerBlack?.socket;
                const disconnectedPlayer = isBlack ? game.playerBlack?.info : game.playerWhite?.info;

                if (otherSocket && disconnectedPlayer) {
                    otherSocket.send(JSON.stringify({
                        type: 'player_disconnected',
                        player: disconnectedPlayer
                    }));
                }
            }

            playerSockets.delete(socket);
        }
    });
});

console.log("Game server running on ws://localhost:8080");
