# Vercel Blob Storage Setup

This app uses Vercel Blob to store photo strips instead of storing them as base64 in IndexedDB.

## Setup Instructions

### 1. Get your Vercel Blob Token

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to the "Storage" section
4. Create a new Blob store or use an existing one
5. Copy the `BLOB_READ_WRITE_TOKEN`

### 2. Set Environment Variable

For local development, create a `.env` file in the root directory:

```env
VITE_BLOB_READ_WRITE_TOKEN=your_token_here
```

**Important:** The `VITE_` prefix is required for Vite to expose the variable to the client-side code.

### 3. For Production (Vercel Deployment)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name:** `VITE_BLOB_READ_WRITE_TOKEN`
   - **Value:** Your blob token
   - **Environment:** Production, Preview, Development (as needed)

### 4. Update the Blob Service (if needed)

If you need to use a different token name or want to use an API route instead, you can modify `services/blob.ts`.

## How It Works

1. When a photo strip is created, it's initially a base64 data URL
2. The `saveStrip` function automatically uploads it to Vercel Blob
3. The blob URL is stored in IndexedDB instead of the base64 string
4. This reduces IndexedDB size and improves performance

## Migration

Existing strips stored as base64 will be automatically uploaded to Vercel Blob the next time they're saved. However, you may want to create a migration script to upload existing strips.

