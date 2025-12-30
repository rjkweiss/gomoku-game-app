import "./MoveCounter.css";

interface MoveCounterProps {
    count: number;
}

export const MoveCounter = ({ count }: MoveCounterProps) => {
    return (
        <div className="move-counter">
            <span className="move-count">{count}</span>
            <span className="move-label">{count === 1 ? "MOVE" : "MOVES"}</span>
        </div>
    );
};
