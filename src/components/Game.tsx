import { BoardView } from "./board/Board";
import { useGameState } from "../hooks/useGameState";


// Game Configuration
const GAME_CONFIG = {
    boardSize: 15,
    cellSize: 50,
    margin: 50,
    aiDepth: 3,
    aiDelayMs: 2000
};


export const Game = () => {

    const {
        boardState,
        gameStatus,
        isAIThinking,
        handleIntersectionClick,
        convertPixelToCoords,
        boardSize,
        cellSize,
        margin
    } = useGameState(GAME_CONFIG);

    return (
        <div className="game-container">
            <div className="board-wrapper">
                <BoardView
                    board={boardState}
                    boardSize={boardSize}
                    cellSize={cellSize}
                    margin={margin}
                    onIntersectionClick={handleIntersectionClick}
                    convertPixelsToBoardCoords={convertPixelToCoords}
                    disabled={isAIThinking ||gameStatus !== 'playing'}
                />
            </div>
        </div>
    )
};
