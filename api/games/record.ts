import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
import { verifyToken } from "../../lib/auth.js";

const handler = async (req: VercelRequest, res: VercelResponse) => {
    // only allow POST method
    if (req.method !== "POST") {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        // Get token from authorization headers
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'Missing or invalid authorization header'
            });
        }

        const token = authHeader.split(" ")[1];
        const payload = await verifyToken(token);
        if (!payload) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }

        // get the rest of parameters / data from request
        const { aiDepth, result, moveCount, gameDurationSeconds } = req.body;

        // validate required fields
        if (!aiDepth || !result) {
            return res.status(400).json({
                error: 'Missing required fields: aiDepth, result'
            });
        }

        // validate aiDepth range
        if (aiDepth < 1 || aiDepth > 7) {
            return res.status(400).json({
                error: 'aiDepth must be between 1 and 7'
            });
        }

        // validate result
        if (!['win', 'loss', 'draw'].includes(result)) {
            return res.status(400).json({
                error: 'result must be win, loss or draw'
            });
        }

        // create game result
        const gameResult = await prisma.gameResult.create({
            data: {
                userId: payload.userId,
                aiDepth,
                result,
                movesCount: moveCount || null,
                gameDurationSeconds: gameDurationSeconds || null
            }
        });

        return res.status(201).json({
            message: 'Game recorded successfully',
            game: gameResult
        });

    } catch (err) {
        console.error('Record game error: ', err);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export default handler;
