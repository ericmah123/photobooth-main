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
        res.status(500).json({ error: error.message });
    }
}
