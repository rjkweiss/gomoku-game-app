import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from '../../lib/prisma.js';
import { verifyToken } from "../../lib/auth.js";

const handler = async (req: VercelRequest, res: VercelResponse) => {
    // only allow GET methods
    if (req.method !== "GET") {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Missing or invalid authorization header'
            });
        }

        // get token and payload from header
        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);
        if (!payload) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }

        // Get overall stats
        const allGames = await prisma.gameResult.findMany({
            where: {
                userId: payload.userId
            }
        });

        const overallStats = {
            totalGames: allGames.length,
            wins: allGames.filter(g => g.result === 'win').length,
            losses: allGames.filter(g => g.result === 'loss').length,
            draws: allGames.filter(g => g.result === 'draw').length
        };

        // Get stats by level of difficulties
        const statsByLevel: Record<number, {wins: number; losses: number; draws: number; total: number;}> = {};

        for (const game of allGames) {
            if (!statsByLevel[game.aiDepth]) {
                statsByLevel[game.aiDepth] = { wins: 0, losses: 0, draws: 0, total: 0 };
            }

            statsByLevel[game.aiDepth].total++;

            // update the game results
            if (game.result === 'win') {
                statsByLevel[game.aiDepth].wins++;
            } else if (game.result === 'loss') {
                statsByLevel[game.aiDepth].losses++;
            } else {
                statsByLevel[game.aiDepth].draws++;
            }
        }

        // Calculate win rate and format by depth
        const byLevel = Object.entries(statsByLevel).map(([depth, stats]) => ({
            depth: parseInt(depth),
            ...stats,
            winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0
        })).sort((a, b) => a.depth - b.depth);

        // Find highest depth beaten
        const highestLevelBeaten = allGames
            .filter(g => g.result === "win")
            .reduce((max, g) => Math.max(max, g.aiDepth), 0);


        // Get recent games
        const recentGames = await prisma.gameResult.findMany({
            where: { userId: payload.userId },
            orderBy: { playedAt: 'desc' },
            take: 10
        });

        return res.status(200).json({
            overall:{
                ...overallStats,
                winRate: overallStats.totalGames > 0
                    ? Math.round((overallStats.wins / overallStats.totalGames) * 100)
                    : 0,
                highestLevelBeaten
            },
            byLevel,
            recentGames
        });

    } catch (err) {
        console.error('stats error: ', err);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export default handler;
