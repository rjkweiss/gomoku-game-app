import type { BoardState, PositionOrNull } from "../../Types";
import { Stone } from "../stone/Stone";


interface BoardViewProps {
    board: BoardState;
    boardSize: number;
    cellSize: number;
    margin: number;
    onIntersectionClick: (row: number, col: number) => void;
    convertPixelsToBoardCoords: (xPixel: number, yPixel: number) => PositionOrNull;
    disabled: boolean;
}


export const BoardView = ({
    board, boardSize, cellSize, margin, onIntersectionClick,
    convertPixelsToBoardCoords, disabled
}: BoardViewProps) => {

    // calculate total board dimensions
    const gridSize = (boardSize - 1) * cellSize;
    const totalSize = gridSize + 2 * margin;
    const stoneDiameter = 0.6 * cellSize;

    // Handle clicks on svg (used to render our board)
    const handleClick = (e: React.MouseEvent<SVGSVGElement>): void => {
        if (disabled) return;

        // Get click position relative to svg
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const xPixel = e.clientX - rect.left;
        const yPixel = e.clientY - rect.top;

        // find closest intersection
        const position = convertPixelsToBoardCoords(xPixel, yPixel);

        // check if position is valid
        if (position) {
            onIntersectionClick(position[0], position[1]);
        }
    };


    // generate horizontal lines
    const horizontalLines = Array.from({ length: boardSize }, (_, i) => {
        const y = margin + (i * cellSize);
        return (
            <line
                key={`h-${i}`}
                x1={margin}
                y1={y}
                x2={margin + gridSize}
                y2={y}
                stroke="#000000"
                strokeWidth={2}
            />
        );
    });


    // generate vertical lines
    const verticalLines = Array.from({ length: boardSize }, (_, i) => {
        const x = margin + (i * cellSize);
        return (
            <line
                key={`v-${i}`}
                x1={x}
                y1={margin}
                x2={x}
                y2={margin + gridSize}
                stroke="#000000"
                strokeWidth={2}
            />
        );
    });


    // generate stones from board
    const stones = board.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => {
            if (cell === null) return null;

            const x = margin + (colIndex * cellSize);
            const y = margin + (rowIndex * cellSize);

            return (
                <Stone
                    key={`stone-${rowIndex}-${colIndex}`}
                    x={x}
                    y={y}
                    color={cell}
                    diameter={stoneDiameter}
                />
            );
        })
    ).filter(Boolean);

    return (
        <svg
            width={totalSize}
            height={totalSize}
            onClick={handleClick}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
            {/* Board background */}
            <rect
                x={0}
                y={0}
                width={totalSize}
                height={totalSize}
                fill="#DEB887"
            />

            {/* Gridlines */}
            {horizontalLines}
            {verticalLines}

            {/* stones */}
            {stones}
        </svg>
    );
};
