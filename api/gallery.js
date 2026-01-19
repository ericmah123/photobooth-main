import { list } from '@vercel/blob';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    try {
        const { blobs } = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN || process.env.VITE_BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json(blobs);
    } catch (error) {
        console.error("Gallery API Error:", error);
        // Debugging: Log (safely) if token exists
        const token1 = process.env.BLOB_READ_WRITE_TOKEN;
        const token2 = process.env.VITE_BLOB_READ_WRITE_TOKEN;

        console.log("Debug Token Status:", {
            BLOB_READ_WRITE_TOKEN_EXISTS: !!token1,
            VITE_BLOB_READ_WRITE_TOKEN_EXISTS: !!token2,
            TOKEN_LENGTH: (token1 || token2)?.length
        });

        res.status(500).json({
            error: error.message,
            debug: {
                hasToken: !!(token1 || token2),
                envKeys: Object.keys(process.env).filter(k => k.includes('BLOB') || k.includes('VITE'))
            }
        });
    }
}
