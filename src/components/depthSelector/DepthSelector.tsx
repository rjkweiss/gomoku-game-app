import './DepthSelector.css';


interface DepthSelectorProps {
    depth: number;
    minDepth?: number;
    maxDepth?: number;
    onDepthChange: (newDepth: number) => void;
    disabled?: boolean;
}


export const DepthSelector = ({
    depth,
    minDepth = 1,
    maxDepth = 7,
    onDepthChange,
    disabled = false
}: DepthSelectorProps) => {

    // ------------------------------------- handlers ----------------------------------- #
    const handleIncrease = () => {
        if (depth < maxDepth) {
            onDepthChange(depth + 1);
        }
    };

    const handleDecrease = () => {
        if (depth > minDepth) {
            onDepthChange(depth - 1);
        }
    };

    // ----------------------------------- level difficulty ------------------------------ #
    const getDifficultyLabel = (depth: number): string => {
        if (depth <= 2) return "Easy";
        if (depth <= 4) return "Medium";
        return "Hard";
    };

    return (
        <div className={`depth-selector-container ${disabled ? "disabled" : ""}`}>
            <span className="depth-label">Difficulty Level</span>
            <div className="depth-controls">
                <button
                    className="depth-btn decrease"
                    onClick={handleDecrease}
                    disabled={disabled || depth <= minDepth}
                    aria-label="Decrease difficulty level"
                >
                    -
                </button>

                <div className="depth-display">
                    <span className="depth-value">{depth}</span>
                    <span className={`difficulty-label ${getDifficultyLabel(depth).toLocaleUpperCase()}`}>
                        {getDifficultyLabel(depth)}
                    </span>
                </div>

                <button
                    className="depth-btn increase"
                    onClick={handleIncrease}
                    disabled={disabled || depth >= maxDepth}
                    aria-label="Increase difficulty level"
                >
                    +
                </button>
            </div>
        </div>
    );
};
