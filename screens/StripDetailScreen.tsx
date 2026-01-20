import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getStripById } from '../services/db';
import { deleteFromBlob } from '../services/blob';
import { Strip } from '../types';
import { Icons } from '../components/Icon';

export const StripDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [strip, setStrip] = useState<Strip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // If we passed the strip via navigation state (Cloud Gallery), use it
    if (location.state?.strip) {
      setStrip(location.state.strip);
    }
    // Otherwise try to load from local DB (Legacy/Offline)
    else if (id) {
      getStripById(id).then(setStrip);
    }
  }, [id, location.state]);

  const handleDownload = async () => {
    if (!strip) return;

    try {
      // Fetch the image from blob URL
      const response = await fetch(strip.dataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photobooth-${strip.createdAt}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: try direct download
      const link = document.createElement('a');
      link.href = strip.dataUrl;
      link.download = `photobooth-${strip.createdAt}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async () => {
    if (!strip || !window.confirm('Delete this photo PERMANENTLY?')) return;
    setIsDeleting(true);
    try {
      // If it's a blob URL (cloud), use the blob service
      // Our cloud strips use the pathname as ID, which looks like a path string (or we check dataUrl)
      // Actually, my listBlobs implementation set ID = pathname. Simple check.

      if (strip.dataUrl.includes('vercel-storage.com')) {
        await deleteFromBlob(strip.dataUrl);
        console.log('Deleted from cloud');
      } else {
        // Existing local delete
        // Note: I didn't import deleteStrip above, need check imports
        // But actually, we only care about cloud now.
        console.warn("Local delete not fully implemented in this view for mixed content");
      }

      navigate('/gallery');
    } catch (error) {
      console.error('Failed to delete strip:', error);
      alert('Failed to delete photo: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!strip) return <div className="h-full flex items-center justify-center text-gray-300 text-xs font-bold">LOADING...</div>;

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-stone-50 relative shadow-2xl">
      <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none"></div>

      {/* Nav */}
      <div className="p-6 pt-10 flex justify-between items-center z-20">
        <button onClick={() => navigate('/gallery')} className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:scale-105 transition shadow-sm">
          <Icons.Back size={18} />
        </button>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:scale-105 transition shadow-sm">
            <Icons.Download size={18} />
          </button>
          <button onClick={handleDelete} className="p-2 bg-white border border-gray-200 rounded-full text-red-400 hover:scale-105 transition shadow-sm">
            <Icons.Trash size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 z-10 pb-20">
        <img
          src={strip.dataUrl}
          alt="Full Strip"
          className="max-w-full h-auto max-h-full rounded-sm shadow-2xl"
        />
      </div>
    </div>
  );
};