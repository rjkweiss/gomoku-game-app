import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from 'bcrypt';
import { prisma } from "../../lib/prisma.js";
import { createToken } from "../../lib/auth.js";


const SALT_ROUND = 10;

const handler = async (req: VercelRequest, res: VercelResponse) => {
    // only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        // get data from the request
        const { email, username, password, firstName, lastName } = req.body;

        //validate required fields
        if (!email || password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Missing required fields: email, password, firstName, lastName'
            });
        }

        // validate email format
        const emailRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // validate password strength (minimum 8 characters)
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters'
            });
        }

        // check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }

        // if username is provided, check if username already exists
        if (username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username }
            });

            if (existingUsername) {
                return res.status(409).json({
                    error: 'Username already taken'
                });
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUND);

        // create user
        const user = await prisma.user.create({
            data: {
                email,
                username: username || null,
                passwordHash,
                firstName,
                lastName
            }
        })

        // create token
        const token = await createToken({
            userId: user.id,
            email: user.email
        });

        // return successfully created user
        return res.status(200).json({
            message: 'User registered successfully',
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
