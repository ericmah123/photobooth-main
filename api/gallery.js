import { list } from '@vercel/blob';

export const config = {
    runtime: 'edge', // Optional: Use edge runtime for speed
};

export default async function handler(req) {
    try {
        const { blobs } = await list({
            token: process.env.VITE_BLOB_READ_WRITE_TOKEN, // Vercel makes process.env available
        });

        return new Response(JSON.stringify(blobs), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                // Allow CORS if needed, though usually same-origin on Vercel
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
