import React, { useEffect, useState } from 'react';
import { listBlobs } from '../services/blob';
import { Strip, FilterType, FrameType, StickerTheme } from '../types';
import { Icons } from '../components/Icon';
import { useNavigate, useLocation } from 'react-router-dom';

export const GalleryScreen: React.FC = () => {
  const [strips, setStrips] = useState<Strip[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const loadStrips = async () => {
    try {
      const { blobs } = await listBlobs();

      const convertedStrips: Strip[] = blobs.map(blob => ({
        id: blob.pathname, // use pathname as ID for simplicity
        createdAt: new Date(blob.uploadedAt).getTime(),
        dataUrl: blob.url,
        // Mock metadata since we don't store it in the filename yet
        filter: FilterType.ORIGINAL,
        frame: FrameType.SIMPLE,
        sticker: StickerTheme.NONE,
      }));

      // Sort by newest first
      convertedStrips.sort((a, b) => b.createdAt - a.createdAt);

      setStrips(convertedStrips);
      console.log('Loaded blobs from cloud:', convertedStrips.length);
    } catch (e) {
      console.error("Failed to load gallery from cloud", e);
    }
  };

  // Load strips on mount and when location changes
  useEffect(() => {
    loadStrips();
  }, [location.pathname]);

  return (
    <div className="h-full w-full flex flex-col bg-white relative overflow-hidden max-w-md mx-auto border-x border-gray-100">
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-0"></div>

      {/* Header */}
      <div className="pt-10 pb-4 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition">
          <Icons.Back size={22} />
        </button>
        <h1 className="font-bold text-sm uppercase tracking-widest text-gray-800">Shared Album</h1>
        <div className="w-8"></div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 z-10 custom-scrollbar">
        {strips.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <p className="font-sans text-sm font-bold tracking-wider opacity-50">EMPTY (OR LOADING...)</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 pb-10">
            {strips.map((strip) => (
              <div
                key={strip.id}
                onClick={() => navigate(`/strip/detail`, { state: { strip } })}
                className="group cursor-pointer"
              >
                <div className="w-full aspect-[2/5] overflow-hidden rounded-sm bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <img src={strip.dataUrl} alt="Memory" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};