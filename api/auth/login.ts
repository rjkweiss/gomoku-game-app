import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt';
import { createToken } from "../../lib/auth.js";


const handler = async (req: VercelRequest, res: VercelResponse) => {
    // only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    try {
        const { emailOrUsername, password } = req.body;

        // Validate required fields
        if (!emailOrUsername || !password) {
            return res.status(400).json({
                error: 'Missing required field: emailOrUsername, password'
            });
        }

        // Find user with email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid password'
            });
        }

        // create JWT token
        const token = await createToken({
            userId: user.id,
            email: user.email
        });

        // Return success on user log in
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            },
            token
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export default handler;
