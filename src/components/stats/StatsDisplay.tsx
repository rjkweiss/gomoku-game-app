import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { api } from "../../services/api";
import type { StatsResponse } from '../../Types';
import "./StatsDisplay.css";


export interface StatsDisplayHandle {
    loadStats: () => Promise<void>;
}

export const StatsDisplay = forwardRef<StatsDisplayHandle>((_, ref) => {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const data = await api.getStats();
            console.log("stats: ", data)
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    };


    // expose load stats to parent via ref
    useImperativeHandle(ref, () => ({
        loadStats
    }));

    useEffect(() => {
        loadStats();
    }, []);

    // -------------------------------- render loading state ---------------------------------- #
    if (isLoading) {
        return (
            <div className="stats-container">
                <h3 className="stats-title">Your Statistics</h3>
                <div className="stats-loading">Loading stats...</div>
            </div>
        );
    }


    // -------------------------------- render error state ---------------------------------- #
    if (error) {
        return (
            <div className="stats-container">
                <h3 className="stats-title">Your Statistics</h3>
                <div className="stats-error">{error}</div>
                <button className="stats-retry-btn" onClick={loadStats}>Retry</button>
            </div>
        );
    }

    // ------------------------------- render empty stats state ------------------------------- #
    if (!stats || stats.overall.totalGames === 0) {
        return (
            <div className="stats-container">
                <h3 className="stats-title">Your Statistics</h3>
                <div className="stats-empty">
                    No games played yet. Start playing to see your stats!
                </div>
            </div>
        );
    }


    // ------------------------------ get level difficulty -------------------------------- #
    const getDifficultyLevel = (depth: number): string => {
        if (depth <= 2) return "Easy";
        if (depth <= 4) return "Medium";
        return "Hard";
    };

    // ------------------------------ render the entire page ------------------------------ #
    return (
        <div className="stats-container">
            <h3 className="stats-title">Your Statistics</h3>

            {/* Overall Stats */}
            <div className="stats-section">
                <h4 className="stats-section-title">Overall</h4>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">{stats.overall.totalGames}</div>
                        <div className="stat-label">Games</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value stat-wins">{stats.overall.wins}</div>
                        <div className="stat-label">Wins</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value state-losses">{stats.overall.losses}</div>
                        <div className="stat-label">Losses</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.overall.draws}</div>
                        <div className="stat-label">Draws</div>
                    </div>
                </div>

                <div className="win-rate-bar">
                    <div className="win-rate-label">Win Rate: {stats.overall.winRate}%</div>
                    <div className="win-rate-progress">
                        <div className="win-rate-fill" style={{ width: `${stats.overall.winRate}%` }} />
                    </div>
                </div>

                {stats.overall.highestLevelBeaten > 0 && (
                    <div className="highest-depth">
                        <span className="highest-depth-label">Highest Level Beaten: </span>
                        <span className={`difficulty-badge ${getDifficultyLevel(stats.overall.highestLevelBeaten).toLowerCase()}`}>
                            {getDifficultyLevel(stats.overall.highestLevelBeaten)} (Level {stats.overall.highestLevelBeaten})
                        </span>
                    </div>
                )}
            </div>

            {/* Stats by level */}
            {stats.byLevel.length > 0 && (
                <div className="stats-section">
                    <h4 className="stats-section-title">Performance by Difficulty</h4>
                    <div className="depth-stats-list">
                        {stats.byLevel.map((depthStat) => (
                            <div key={depthStat.depth} className="depth-stat-item">
                                <div className="depth-stat-header">
                                    <span className={`difficulty-badge ${getDifficultyLevel(depthStat.depth).toLowerCase()}`}>
                                        {getDifficultyLevel(depthStat.depth)} (Level {depthStat.depth})
                                    </span>
                                    <span className="depth-win-rate">{depthStat.winRate}%</span>
                                </div>

                                <div className="depth-stat-details">
                                    <span className="depth-stat-text">
                                        {depthStat.wins}W - {depthStat.losses}L - {depthStat.draws}D
                                    </span>
                                    <div className="depth-stat-total">({depthStat.total} games)</div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
