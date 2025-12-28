import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../lib/prisma";

const handler = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const allUsers = await prisma.user.findMany();
        res.status(200).json({ allUsers })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Internal error: ${error}`});
    }
};

export default handler;
