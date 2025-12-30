import { useRef } from "react";
import type { BoardState, PositionOrNull } from "../../Types";
import type { MoveRecord } from "../../gameLogic/player/PlayerTypes";
import { Stone } from "../stone/Stone";
import "./Board.css";


interface BoardViewProps {
    board: BoardState;
    boardSize: number;
    cellSize: number;
    margin: number;
    lastMove: MoveRecord | null;
    onIntersectionClick: (row: number, col: number) => void;
    convertPixelsToBoardCoords: (xPixel: number, yPixel: number) => PositionOrNull;
    disabled: boolean;
}


export const BoardView = ({
    board, boardSize, cellSize, margin, lastMove, onIntersectionClick,
    convertPixelsToBoardCoords, disabled
}: BoardViewProps) => {

    const svgRef = useRef<SVGSVGElement>(null);

    // calculate total board dimensions
    const gridSize = (boardSize - 1) * cellSize;
    const totalSize = gridSize + 2 * margin;
    const stoneDiameter = 0.6 * cellSize;

    // Handle clicks on svg (used to render our board)
    const handleClick = (e: React.MouseEvent<SVGSVGElement>): void => {
        if (disabled) return;

        const svg = svgRef.current;
        if (!svg) return;

        // Get click position relative to svg
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
                x2={totalSize - margin}
                y2={y}
                stroke="#000000"
                strokeWidth={1.5}
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
                y2={totalSize - margin}
                stroke="#000000"
                strokeWidth={1.5}
            />
        );
    });


    // generate stones from board
    const stones = board.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => {
            if (cell === null) return null;

            const isLastMove = lastMove && lastMove.position[0] === rowIndex && lastMove.position[1] === colIndex;

            const x = margin + (colIndex * cellSize);
            const y = margin + (rowIndex * cellSize);

            return (
                <Stone
                    key={`stone-${rowIndex}-${colIndex}`}
                    x={x}
                    y={y}
                    color={cell}
                    diameter={stoneDiameter}
                    isLastMove={isLastMove}
                />
            );
        })
    ).filter(Boolean);

    return (
        <div className="board-container">
            <svg
                ref={svgRef}
                width={totalSize}
                height={totalSize}
                onClick={handleClick as any}
                className={`board-svg ${disabled ? "disabled": ""}`}
            >
                {/* Board background */}
                <rect
                    x={0}
                    y={0}
                    width={totalSize}
                    height={totalSize}
                    fill="#DEB887"
                    rx={8}
                />

                {/* Gridlines */}
                {horizontalLines}
                {verticalLines}

                {/* stones */}
                {stones}
            </svg>
        </div>

    );
};
