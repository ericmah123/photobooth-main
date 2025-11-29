import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '../components/Icon';
import { FilterType, FrameType, StickerTheme, Strip } from '../types';
import { compositeStrip } from '../utils/compositor';
import { saveStrip } from '../services/db';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const FILTER_PRESETS = [
  { id: FilterType.ORIGINAL, label: 'Original', color: 'bg-gray-200' },
  { id: FilterType.SOFT_PASTEL, label: 'Pastel', color: 'bg-rose-200' },
  { id: FilterType.WARM_ROMANTIC, label: 'Warm', color: 'bg-orange-200' },
  { id: FilterType.BW, label: 'B&W', color: 'bg-gray-700 text-white' },
];

const FRAME_PRESETS = [
  { id: FrameType.SIMPLE, label: 'Simple' },
  { id: FrameType.POLAROID, label: 'Polaroid' },
  { id: FrameType.HEARTS, label: 'Hearts' },
  { id: FrameType.RETRO, label: 'Retro' },
];

const STICKER_PRESETS = [
  { id: StickerTheme.NONE, label: 'None' },
  { id: StickerTheme.BUNNY, label: 'Bunny' },
  { id: StickerTheme.CAT, label: 'Cat' },
  { id: StickerTheme.FLOWERS, label: 'Flowers' },
  { id: StickerTheme.BOWS, label: 'Bows' },
];

export const CaptureScreen: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Capture State
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]); // Base64 strings
  
  // Customization State
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.ORIGINAL);
  const [activeFrame, setActiveFrame] = useState<FrameType>(FrameType.SIMPLE);
  const [activeSticker, setActiveSticker] = useState<StickerTheme>(StickerTheme.NONE);
  
  // Result State
  const [finalStripUrl, setFinalStripUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Tab State for controls
  const [activeTab, setActiveTab] = useState<'filter' | 'frame' | 'sticker'>('filter');

  const { settings } = useSettings();
  const navigate = useNavigate();

  // Camera Initialization
  useEffect(() => {
    if (finalStripUrl) return; // Don't start camera if showing result
    
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (stream) {
           stream.getTracks().forEach(track => track.stop());
        }

        let newStream: MediaStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false,
          });
        } catch (e: any) {
          console.warn(`Camera fallback used`, e);
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
             setCameraError("Camera permission denied. Please allow access.");
             return;
          }
          // Try fallback without constraints
          try {
             newStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
             });
          } catch(err: any) {
             setCameraError("Unable to access camera.");
             return;
          }
        }

        if (!isMounted) {
          newStream.getTracks().forEach(track => track.stop());
          return;
        }

        currentStream = newStream;
        setStream(newStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          try {
             await videoRef.current.play();
          } catch(e) {
             console.warn("Auto-play failed", e);
          }
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera initialization failed.");
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (stream && stream !== currentStream) {
         stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, finalStripUrl]);

  // Capture Logic
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.9);
    }
    return null;
  };

  const startCaptureSequence = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCapturedPhotos([]);

    const TOTAL_PHOTOS = 4;
    const COUNTDOWN_SEC = 3;
    const tempPhotos: string[] = [];

    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      for (let c = COUNTDOWN_SEC; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);

      const photo = capturePhoto();
      if (photo) tempPhotos.push(photo);
      
      if (i < TOTAL_PHOTOS - 1) {
         await new Promise(r => setTimeout(r, 1000));
      }
    }

    setIsCapturing(false);
    setCapturedPhotos(tempPhotos);
    generatePreview(tempPhotos);
  };

  const generatePreview = async (photos: string[]) => {
    try {
      const url = await compositeStrip(photos, activeFilter, activeFrame, activeSticker, settings);
      setFinalStripUrl(url);
    } catch (e) {
      console.error(e);
      alert('Error generating strip');
    }
  };

  // Re-generate preview when options change
  useEffect(() => {
    if (finalStripUrl && capturedPhotos.length === 4) {
      generatePreview(capturedPhotos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, activeFrame, activeSticker, settings]);

  const handleSave = async () => {
    if (!finalStripUrl) return;
    setIsSaving(true);
    const strip: Strip = {
      id: generateId(),
      createdAt: Date.now(),
      dataUrl: finalStripUrl,
      filter: activeFilter,
      frame: activeFrame,
      sticker: activeSticker,
    };
    
    try {
      await saveStrip(strip);
      navigate('/gallery');
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setFinalStripUrl(null);
    setCapturedPhotos([]);
  };

  const handleStickerSelect = (sticker: StickerTheme) => {
    setActiveSticker(sticker);
  }

  // Render Final Result View
  if (finalStripUrl) {
    return (
      <div className="flex flex-col h-full bg-brand-50 overflow-hidden">
        <div className="flex-1 relative overflow-y-auto no-scrollbar p-6 flex items-center justify-center">
          <img 
            src={finalStripUrl} 
            alt="Strip Preview" 
            className="max-w-full shadow-2xl rounded-sm"
            style={{ maxHeight: 'none' }} 
          />
        </div>

        {/* Editing Controls in Preview */}
        <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-10 flex flex-col">
           {/* Tab Switcher */}
          <div className="flex justify-center gap-6 pt-4 pb-2">
             <button onClick={() => setActiveTab('filter')} className={`flex flex-col items-center gap-1 text-xs font-bold ${activeTab === 'filter' ? 'text-brand-500' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full ${activeTab === 'filter' ? 'bg-brand-50' : 'bg-gray-100'}`}><Icons.Palette size={20} /></div>
                Filter
             </button>
             <button onClick={() => setActiveTab('frame')} className={`flex flex-col items-center gap-1 text-xs font-bold ${activeTab === 'frame' ? 'text-brand-500' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full ${activeTab === 'frame' ? 'bg-brand-50' : 'bg-gray-100'}`}><Icons.Frame size={20} /></div>
                Frame
             </button>
             <button onClick={() => setActiveTab('sticker')} className={`flex flex-col items-center gap-1 text-xs font-bold ${activeTab === 'sticker' ? 'text-brand-500' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full ${activeTab === 'sticker' ? 'bg-brand-50' : 'bg-gray-100'}`}><Icons.Sparkles size={20} /></div>
                Stickers
             </button>
          </div>

          {/* Option Scroller */}
          <div className="overflow-x-auto no-scrollbar py-4 px-6">
             <div className="flex gap-3 w-max mx-auto">
                {activeTab === 'filter' && FILTER_PRESETS.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === f.id ? 'bg-brand-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {f.label}
                  </button>
                ))}
                {activeTab === 'frame' && FRAME_PRESETS.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setActiveFrame(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeFrame === f.id ? 'bg-brand-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {f.label}
                  </button>
                ))}
                {activeTab === 'sticker' && STICKER_PRESETS.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => handleStickerSelect(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeSticker === f.id ? 'bg-brand-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 pt-2">
            <button 
              onClick={handleRetake}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform"
            >
              <Icons.Retake size={18} /> Retake
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] py-3 rounded-xl bg-brand-500 text-white font-bold flex justify-center items-center gap-2 shadow-lg shadow-brand-200 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : <>Save to Gallery <Icons.Heart size={18} className="fill-white" /></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera View
  return (
    <div className="h-full relative bg-black">
      <canvas ref={canvasRef} className="hidden" />
      {cameraError ? (
         <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-stone-100 text-center">
             <Icons.Camera size={48} className="text-red-400 mb-4" />
             <h3 className="text-lg font-bold text-gray-800 mb-2">Camera Access Error</h3>
             <p className="text-sm text-gray-600 mb-6 max-w-xs">{cameraError}</p>
             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-black text-white rounded-full font-bold">Retry</button>
         </div>
      ) : (
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />
      )}
      
      <div className="absolute inset-0 pointer-events-none" style={{
        backdropFilter: activeFilter === FilterType.BW ? 'grayscale(100%) contrast(1.1)' : 
                        activeFilter === FilterType.SOFT_PASTEL ? 'brightness(1.1) saturate(0.8) sepia(0.2)' :
                        activeFilter === FilterType.WARM_ROMANTIC ? 'sepia(0.3) contrast(1.1) saturate(1.2)' : 'none'
      }} />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        <button 
           onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
           className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"
        >
          <Icons.Retake size={24} />
        </button>
      </div>

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <span key={countdown} className="text-9xl font-handwriting text-white drop-shadow-lg animate-bounce">
            {countdown}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 flex flex-col items-center gap-6 bg-gradient-to-t from-black/60 to-transparent z-20">
        {!isCapturing && !cameraError && (
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar mask-linear">
             {FILTER_PRESETS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`w-8 h-8 rounded-full border-2 ${f.color} ${activeFilter === f.id ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                />
             ))}
          </div>
        )}

        <button 
          onClick={startCaptureSequence}
          disabled={isCapturing || !!cameraError}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isCapturing || !!cameraError ? 'scale-90 opacity-50' : 'hover:scale-105 active:scale-95'}`}
        >
          <div className="w-16 h-16 bg-white rounded-full" />
        </button>
        
        <p className="text-white/80 font-handwriting text-lg">
           {isCapturing ? 'Get Ready! 💕' : 'Tap to Start'}
        </p>
      </div>
    </div>
  );
};