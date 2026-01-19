import { del } from '@vercel/blob';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN || process.env.VITE_BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Delete API Error:", error);
        res.status(500).json({ error: error.message });
    }
}
