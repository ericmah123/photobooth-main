import { Strip } from '../types';
import { uploadToBlob } from './blob';

const DB_NAME = 'OurPhotoboothDB';
const STORE_NAME = 'strips';
const VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Saves a strip to IndexedDB after uploading the image to Vercel Blob
 * If dataUrl is a base64 string, it will be uploaded to Vercel Blob first
 * If dataUrl is already a blob URL, it will be saved directly
 * If blob upload fails, it will still save the base64 URL to IndexedDB
 */
export const saveStrip = async (strip: Strip): Promise<void> => {
  let finalStrip = strip;
  
  // Check if dataUrl is a base64 data URL (starts with data:)
  if (strip.dataUrl.startsWith('data:')) {
    try {
      // Upload to Vercel Blob
      const blobUrl = await uploadToBlob(
        strip.dataUrl,
        `photobooth-${strip.id}.jpg`
      );
      
      console.log('Successfully uploaded to Vercel Blob:', blobUrl);
      
      // Replace dataUrl with blob URL
      finalStrip = {
        ...strip,
        dataUrl: blobUrl,
      };
    } catch (error) {
      console.error('Failed to upload to Vercel Blob:', error);
      console.warn('Saving with base64 URL instead. Make sure VITE_BLOB_READ_WRITE_TOKEN is set in your .env file.');
      // Continue with base64 URL if blob upload fails
      // This ensures the photo is still saved even if blob storage isn't configured
    }
  }
  
  // Save to IndexedDB (always save, even if blob upload failed)
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(finalStrip);

    request.onsuccess = () => {
      console.log('Strip saved to IndexedDB:', finalStrip.id);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

export const getStrips = async (): Promise<Strip[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by createdAt desc
      const results = request.result as Strip[];
      results.sort((a, b) => b.createdAt - a.createdAt);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getStripById = async (id: string): Promise<Strip | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteStrip = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};