import type { StoneColor } from "../../Types";


interface StoneProps {
    x: number;
    y: number;
    color: StoneColor;
    diameter: number;
}

export const Stone = ({ x, y, color, diameter }: StoneProps) => {
    const radius = diameter / 2;

    const isBlack = color === "B";

    return (
        <circle
            cx={x}
            cy={y}
            r={radius}
            fill={isBlack ? "#000000" : "#FFFFFF"}
            stroke="#000000"
            strokeWidth={1.5}
        />
    );
};
