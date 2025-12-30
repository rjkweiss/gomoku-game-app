import type { StoneColor } from "../../Types";


interface StoneProps {
    x: number;
    y: number;
    color: StoneColor;
    diameter: number;
    isLastMove: boolean | null;
}

export const Stone = ({ x, y, color, diameter, isLastMove }: StoneProps) => {
    const radius = diameter / 2;

    const isBlack = color === "B";

    // Last move indicator size (small dot in center)
    const indicatorRadius = radius * 0.3;

    return (
        <g>
            {/* Stone shadow */}
            <circle
                cx={x + 2}
                cy={y + 2}
                r={radius}
                fill="rgba(0, 0, 0, 0.25)"
            />

            {/* Main stone */}
            <circle
                cx={x}
                cy={y}
                r={radius}
                fill={isBlack ? "#000000" : "#FFFFFF"}
                stroke={isBlack ? "#000000" : "#cccccc"}
                strokeWidth={1}
            />
            {/* last move indicator - color dot in the center */}
            {isLastMove && (
                <circle
                    cx={x}
                    cy={y}
                    r={indicatorRadius}
                    fill={isBlack ? "#ff6b6b" : "#e63946"}
                    className="last-move-indicator"
                />
            )}
        </g>

    );
};
