import { put, list, ListBlobResult } from '@vercel/blob';

/**
 * Converts a base64 data URL to a Blob
 */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Uploads an image to Vercel Blob storage
 * @param dataUrl - Base64 data URL of the image
 * @param filename - Optional filename (will generate one if not provided)
 * @returns The blob URL
 */
export const uploadToBlob = async (
  dataUrl: string,
  filename?: string
): Promise<string> => {
  const blob = dataUrlToBlob(dataUrl);

  // Generate filename if not provided
  const finalFilename = filename || `photobooth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;

  // Get token from environment variable (for Vite, use import.meta.env)
  const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;

  if (!token) {
    const errorMsg = 'VITE_BLOB_READ_WRITE_TOKEN is not set. Please add it to your .env file. See BLOB_SETUP.md for instructions.';
    console.error(errorMsg);
    console.error('Current env vars:', Object.keys(import.meta.env).filter(k => k.includes('BLOB')));
    throw new Error(errorMsg);
  }

  console.log('Uploading to Vercel Blob:', finalFilename, 'Size:', blob.size, 'bytes');

  try {
    // Upload to Vercel Blob
    const { url } = await put(finalFilename, blob, {
      access: 'public',
      contentType: 'image/jpeg',
      token: token,
    });

    console.log('Successfully uploaded to Vercel Blob:', url);
    return url;
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
    });
    throw error;
  }
};

/**
 * Deletes a blob from Vercel Blob storage
 * Note: This requires the blob URL or blob path
 */
export const deleteFromBlob = async (url: string): Promise<void> => {
  // Extract the blob path from the URL
  // Vercel Blob URLs are in format: https://[hash].public.blob.vercel-storage.com/[path]
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.substring(1); // Remove leading slash

    // Note: The @vercel/blob package doesn't have a direct delete method in client-side
    // You may need to create an API route for deletion, or use the Vercel Blob API directly
    // For now, we'll just log a warning
    console.warn('Blob deletion not implemented. You may want to create an API route for this.');
  } catch (error) {
    console.error('Error deleting blob:', error);
  }
};

/**
 * Lists all blobs in the store via API
 */
export const listBlobs = async (): Promise<{ blobs: any[] }> => {
  // If we are in production (or if the API exists), fetch from the endpoint
  try {
    const response = await fetch('/api/gallery');
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const blobs = await response.json();
    return { blobs };
  } catch (error) {
    console.warn("Could not fetch from /api/gallery (likely running locally without vercel dev). Falling back to direct SDK call if possible, or failing.");

    // Fallback: If local and token is available, try direct SDK (might fail CORS but worth a shot for local dev if configured)
    const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        return await list({ token });
      } catch (e) {
        console.warn("Direct SDK fallback failed:", e);
      }
    }

    return { blobs: [] };
  }
};
