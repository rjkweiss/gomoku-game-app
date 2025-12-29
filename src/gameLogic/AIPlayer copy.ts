import type { AIMove, DirectionPair, Position, PositionOrNull, StoneColor } from "../Types";
import { Board } from "./Board";

export class AIPlayer {
    gomokuBoard: Board;
    depth: number = 3;

    readonly stoneColor: StoneColor = "W";
    readonly opponentColor: StoneColor = "B";

    directions: DirectionPair[] = [
        [[-1, 0], [1, 0]],
        [[0, -1], [0, 1]],
        [[-1, -1], [1, 1]],
        [[-1, 1], [1, -1]],
    ];

    constructor(board: Board, depth: number) {
        this.gomokuBoard = board;
        this.depth = depth;
    }

    public findBestMove(): AIMove {
        // keep track of best score and best move
        let bestScore: number = -Infinity;
        let bestMove: PositionOrNull = null;

        // initialize alpha and beta values for pruning
        let alpha: number = -Infinity;
        let beta: number = Infinity;

        // get moves
        const moves = this.getPossibleMoves();

        // rank moves
        this.getRankedMoves(moves);

        for (const [row, col] of moves) {
            // make move
            this.gomokuBoard.makeMove(row, col, this.stoneColor);

            // check if there is a win
            if (this.gomokuBoard.checkWin(row, col) !== null) {
                this.gomokuBoard.undoMove(row, col);
                return [row, col];
            }

            // score
            const score = this.minimax(this.depth, false, alpha, beta);

            // undo
            this.gomokuBoard.undoMove(row, col);

            // update best score
            if (score > bestScore) {
                bestScore = score;
                bestMove = [row, col];
            }

            // update alpha
            alpha = Math.max(alpha, score);
        }

        return bestMove;
    }

    private minimax(depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
        // If depth is 0, return the score of currennt position
        if (depth === 0) return this.heuristic();

        // Get all possible moves
        const moves = this.getPossibleMoves();
        if (moves.length <= 0) return this.heuristic();

        // rank available moves
        this.getRankedMoves(moves);

        // logic for maximizer
        if (isMaximizing) {
            let bestScore: number = -Infinity;

            for (const [row, col] of moves) {
                // make move on board
                this.gomokuBoard.makeMove(row, col, this.stoneColor);

                // check if there is a win
                if (this.gomokuBoard.checkWin(row, col) !== null) {
                    this.gomokuBoard.undoMove(row, col);
                    return 1000;
                }

                // calculate score recursively
                const score = this.minimax(depth - 1, false, alpha, beta);

                // undo move
                this.gomokuBoard.undoMove(row, col);

                // update best score
                bestScore = Math.max(bestScore, score);

                // update alpha value
                alpha = Math.max(alpha, score);

                // prune if necessary
                if (beta <= alpha) break;
            }

            return bestScore;
        } else {
            let bestScore: number = Infinity;

            for (const [row, col] of moves) {
                // make move
                this.gomokuBoard.makeMove(row, col, this.opponentColor);

                // check if opponent won
                if (this.gomokuBoard.checkWin(row, col) !== null) {
                    this.gomokuBoard.undoMove(row, col);
                    return -1000;
                }

                // calculate opponent score
                const score = this.minimax(depth - 1, true, alpha, beta);

                // undo move
                this.gomokuBoard.undoMove(row, col);

                // update opponent score
                bestScore = Math.min(bestScore, score);

                // update beta value
                beta = Math.min(beta, score);

                // prune if possible
                if (beta <= alpha) break;
            }

            return bestScore;
        }
    }

    private getRankedMoves(moves: Position[]): void {
        moves.sort((moveA, moveB) => {
            const scoreA = this.scoreMove(moveA[0], moveA[1]);
            const scoreB = this.scoreMove(moveB[0], moveB[1]);

            if (scoreB > scoreA) return 1;
            if (scoreB < scoreA) return -1;

            return 0;
        });
    }

    private getPossibleMoves(): Position[] {
        // use set to avoid duplicates
        const nextMoves: Set<string> = new Set();

        // track if we found stones
        let foundStone: boolean = false;

        for (let row = 0; row < this.gomokuBoard.boardSize; row++) {
            for (let col = 0; col < this.gomokuBoard.boardSize; col++) {
                // optimize around intersections that already have stones
                if (!this.gomokuBoard.isPositionValid(row, col)) {
                    foundStone = true;

                    // check 8 directions around the stone
                    for (let dRow = -1; dRow < 2; dRow++) {
                        for (let dCol = -1; dCol < 2; dCol++) {
                            const nextRow: number = row + dRow;
                            const nextCol: number = col + dCol;

                            // check that intersections are valid
                            if (
                                !this.gomokuBoard.isCoordOutOfBounds(nextRow, nextCol) &&
                                this.gomokuBoard.isPositionValid(nextRow, nextCol)
                            ) {
                                nextMoves.add(`${nextRow},${nextCol}`)

                            }
                        }
                    }
                }
            }
        }

        // if we did not find any stones (first move), choose the center
        if (!foundStone) {
            const center = Math.floor(this.gomokuBoard.boardSize / 2);
            return [[center, center]];
        }


        const emptyIntersections: Position[] = [];

        // return any intersections found above
        if (nextMoves.size > 0) {
            for (const coords of nextMoves) {
                const [row, col] = coords.split(",");
                emptyIntersections.push([Number(row), Number(col)]);
            }

            return emptyIntersections;
        }


        // Fallback on all empty intersections
        for (let row = 0; row < this.gomokuBoard.boardSize; row++) {
            for (let col = 0; col < this.gomokuBoard.boardSize; col++) {
                if (this.gomokuBoard.isPositionValid(row, col)) {
                    emptyIntersections.push([row, col]);
                }
            }
        }

        return emptyIntersections;
    }

    private heuristic(): number {
        // keep track of ai score and human score / opponent score
        let aiScore = 0;
        let opponentScore = 0;

        for (let row = 0; row < this.gomokuBoard.boardSize; row++) {
            for (let col = 0; col < this.gomokuBoard.boardSize; col++) {
                // count AI Score
                if (this.gomokuBoard.getIntersectionValue(row, col) === this.stoneColor) {
                    aiScore += this.calculatePlayerScore(row, col);
                }

                // count opponent score (human)
                if (this.gomokuBoard.getIntersectionValue(row, col) === this.opponentColor) {
                    opponentScore += this.calculatePlayerScore(row, col);
                }
            }
        }

        return aiScore - opponentScore;
    }

    private calculatePlayerScore(row: number, col: number): number {
        let score: number = 0;

        for (const dirPair of this.directions) {
            // count in one direction
            const [count1, isOpen1] = this.gomokuBoard.countInDirection(row, col, dirPair[0]);

            // count in second direction
            const [count2, isOpen2] = this.gomokuBoard.countInDirection(row, col, dirPair[1]);

            const totalCount = count1 + 1 + count2;
            const totalOpenEnds = (isOpen1 ? 1 : 0) + (isOpen2 ? 1 : 0);

            score += this.gameStateScore(totalCount, totalOpenEnds);
        }

        return score;
    }

    private scoreMove(row: number, col: number): number {
        // AI player threat
        const maxAIThreat = this.offensiveGameScore(row, col, this.stoneColor);

        // Opponent player threat
        const opponentThreat = this.offensiveGameScore(row, col, this.opponentColor);

        // return scoring of this move
        return maxAIThreat + opponentThreat;
    }

    private offensiveGameScore(row: number, col: number, playerColor: StoneColor): number {
        // make a move
        this.gomokuBoard.makeMove(row, col, playerColor);

        // initialize threat score
        let threatScore = 0;

        // Calculate the maximum score this player can get on offensive game
        // in the 4 potential directions
        for (const dirPair of this.directions) {
            // count in direction 1
            const [count1, isOpen1] = this.gomokuBoard.countInDirection(row, col, dirPair[0]);

            // count in direction 2
            const [count2, isOpen2] = this.gomokuBoard.countInDirection(row, col, dirPair[1]);

            // total stones in sequence in current direction
            const numOfStones = count1 + 1 + count2;
            const openEnds = (isOpen1 ? 1 : 0) + (isOpen2 ? 1 : 0);

            // calculate the score for this move
            const currentScore = this.gameStateScore(numOfStones, openEnds);

            // update the maximum threat score
            threatScore = Math.max(threatScore, currentScore);
        }

        // undo move
        this.gomokuBoard.undoMove(row, col);

        // return the threat score
        return threatScore;
    }

    private gameStateScore(count: number, openEnds: number): number {
        // If we have 5 in a row, game over
        if (count >= 5) return 500000;

        // If we have 4 in a row, then we are in deep trouble
        if (count === 4) {
            // if open ends are 2, there is no stopping
            if (openEnds === 2) return 5000;

            // if we have 1 open end, we must block immediately
            if (openEnds === 1) return 1000;

            // if we do not have open ends, then this sequence leads to dead end
            return 0;
        }

        // If we have 3 in a row, we must block immediately -- threatening
        if (count === 3) {
            // if we have 2 open ends, this needs to be handled immediately
            if (openEnds === 2) return 500;

            // need to block if there is one open end
            if (openEnds === 1) return 100;

            // otherwise, this sequence leads to dead end
            return 0;
        }

        // if we have 2 in a row, it is not a big threat, but should block it if we can
        if (count === 2) {
            // if we have 2 open ends, we can block
            if (openEnds === 2) return 50;

            // if we have one open end, small score
            if (openEnds === 1) return 10;

            // otherwise, this sequence leads to dead end
            return 0;
        }

        // if we have 1 stone, we do not need to do anything
        return 1;
    }
}
