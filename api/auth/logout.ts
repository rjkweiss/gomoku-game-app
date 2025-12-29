import type { VercelRequest, VercelResponse } from "@vercel/node";

const handler = async (req: VercelRequest, res: VercelResponse) => {
    // only allow POST calls
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    //  With JWT, logout is handled client-side by removing the token
    // Endpoint is just for consistency / any future enhancement e.g. token blacklisting, clearing HTTP-only cookies, etc

    return res.status(200).json({
        message: 'Logged out successfully'
    });
};

export default handler;
