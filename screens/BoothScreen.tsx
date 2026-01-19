import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '../components/Icon';
import { FilterType, FrameType, StickerTheme, Strip } from '../types';
import { compositeStrip } from '../utils/compositor';
import { saveStrip } from '../services/db';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from '../components/SettingsModal';
import { getRandomSong } from '../utils/music';
import miffyImage from '../tumblr_7fcd99e292445d6c6779622575f12de7_33b62567_400.png';
import catImage from '../f5f0a0149d258eb885a7e461cf677064-removebg-preview.png';
import bowImage from '../vecteezy_pink-bow-cartoon_47834936.png';

const generateId = () => Math.random().toString(36).substring(2, 15);

// --- ASSETS ---

// Miffy Standing (Pink Dress) - Updated Cartoon Style
const MIFFY_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Cg stroke='%235d4037' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Ears --%3E%3Cpath d='M60 90 V30 A15 15 0 0 1 90 30 V90' fill='%23fff'/%3E%3Cpath d='M110 90 V30 A15 15 0 0 1 140 30 V90' fill='%23fff'/%3E%3C!-- Head --%3E%3Cellipse cx='100' cy='130' rx='65' ry='50' fill='%23fff'/%3E%3C!-- Dress --%3E%3Cpath d='M65 170 L50 260 Q100 280 150 260 L135 170 Z' fill='%23fda4af'/%3E%3C!-- Hands --%3E%3Cpath d='M50 200 Q30 220 55 230' fill='%23fff'/%3E%3Cpath d='M150 200 Q170 220 145 230' fill='%23fff'/%3E%3C/g%3E%3C!-- Face --%3E%3Cg fill='%233e2723'%3E%3Ccircle cx='80' cy='130' r='6'/%3E%3Ccircle cx='120' cy='130' r='6'/%3E%3C/g%3E%3Cpath d='M92 145 L108 159 M108 145 L92 159' stroke='%233e2723' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E`;

// Mofusand-style Cat Holding Flowers
const MOFUSAND_CAT_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'%3E%3C!-- Body Shape (Standing) --%3E%3Cpath d='M60 100 Q50 220 70 240 Q100 250 130 240 Q150 220 140 100' fill='%23fff' stroke='%235d4037' stroke-width='4'/%3E%3C!-- Head --%3E%3Cpath d='M50 80 Q50 20 100 20 Q150 20 150 80 Q150 120 100 120 Q50 120 50 80' fill='%23fff' stroke='%235d4037' stroke-width='4'/%3E%3C!-- Ears --%3E%3Cpath d='M55 45 L40 30 L65 35' fill='%23fff' stroke='%235d4037' stroke-width='4' stroke-linejoin='round'/%3E%3Cpath d='M145 45 L160 30 L135 35' fill='%23fff' stroke='%235d4037' stroke-width='4' stroke-linejoin='round'/%3E%3C!-- Brown Patches (Tabby markings) --%3E%3Cpath d='M100 20 Q120 20 130 40 L120 60 Q100 50 80 60 L70 40 Q80 20 100 20' fill='%23d7ccc8' opacity='0.8'/%3E%3Cpath d='M60 140 Q70 140 80 160 L60 200 Q50 180 55 140' fill='%23d7ccc8' opacity='0.8'/%3E%3C!-- Tail --%3E%3Cpath d='M60 200 Q40 200 40 170 Q40 150 50 160' fill='none' stroke='%23d7ccc8' stroke-width='12' stroke-linecap='round'/%3E%3Cpath d='M60 200 Q40 200 40 170 Q40 150 50 160' fill='none' stroke='%235d4037' stroke-width='4' stroke-linecap='round'/%3E%3C!-- Face --%3E%3Ccircle cx='85' cy='85' r='5' fill='%233e2723'/%3E%3Ccircle cx='115' cy='85' r='5' fill='%233e2723'/%3E%3Cpath d='M95 95 Q100 100 105 95' fill='none' stroke='%233e2723' stroke-width='3' stroke-linecap='round'/%3E%3C!-- Blush --%3E%3Cellipse cx='70' cy='95' rx='6' ry='4' fill='%23f48fb1' opacity='0.4'/%3E%3Cellipse cx='130' cy='95' rx='6' ry='4' fill='%23f48fb1' opacity='0.4'/%3E%3C!-- Arms --%3E%3Cellipse cx='75' cy='150' rx='15' ry='10' fill='%23fff' stroke='%235d4037' stroke-width='3' transform='rotate(45 75 150)'/%3E%3Cellipse cx='125' cy='150' rx='15' ry='10' fill='%23fff' stroke='%235d4037' stroke-width='3' transform='rotate(-45 125 150)'/%3E%3C!-- Flower Stems --%3E%3Cpath d='M100 160 L100 190' stroke='%2381c784' stroke-width='3'/%3E%3Cpath d='M100 160 L85 180' stroke='%2381c784' stroke-width='3'/%3E%3Cpath d='M100 160 L115 180' stroke='%2381c784' stroke-width='3'/%3E%3C!-- Flowers (Pink Roses) --%3E%3Ccircle cx='100' cy='145' r='12' fill='%23f48fb1' stroke='%23e91e63' stroke-width='2'/%3E%3Cpath d='M100 145 M95 145 A 5 5 0 0 0 105 145' fill='none' stroke='%23e91e63' stroke-width='2'/%3E%3Ccircle cx='80' cy='155' r='10' fill='%23f48fb1' stroke='%23e91e63' stroke-width='2'/%3E%3Ccircle cx='120' cy='155' r='10' fill='%23f48fb1' stroke='%23e91e63' stroke-width='2'/%3E%3C!-- Paws covering stems --%3E%3Ccircle cx='90' cy='165' r='8' fill='%23fff' stroke='%235d4037' stroke-width='3'/%3E%3Ccircle cx='110' cy='165' r='8' fill='%23fff' stroke='%235d4037' stroke-width='3'/%3E%3C/svg%3E`;

const CLOUD_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath d='M10 40 Q0 40 0 30 Q0 10 20 10 Q25 0 40 0 Q60 0 65 10 Q80 5 90 20 Q100 20 100 35 Q100 50 80 50 L20 50' fill='%23fff' stroke='%235d4037' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E`;

const SPARKLE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z' fill='%23fcd34d'/%3E%3C/svg%3E`;

const TULIP_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg stroke='%235d4037' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M50 90 V55' stroke='%2386efac' stroke-width='4'/%3E%3Cpath d='M50 80 Q30 70 30 50' fill='none' stroke='%2386efac' stroke-width='3'/%3E%3Cpath d='M50 80 Q70 70 70 50' fill='none' stroke='%2386efac' stroke-width='3'/%3E%3Cpath d='M30 50 Q30 20 50 15 Q70 20 70 50 Q50 60 30 50 Z' fill='%23fca5a5'/%3E%3C/g%3E%3C/svg%3E`;

const BOW_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 50 Q30 20 10 40 Q30 60 50 50 Q70 60 90 40 Q70 20 50 50' fill='%23f9a8d4' stroke='%235d4037' stroke-width='3'/%3E%3Cpath d='M50 50 L30 80 M50 50 L70 80' stroke='%23f9a8d4' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E`;

const FILTER_PRESETS = [
  { id: FilterType.ORIGINAL, label: 'Normal', color: 'bg-white border-2 border-gray-200' },
  { id: FilterType.SKETCH, label: 'Sketch', color: 'bg-gray-100 border-2 border-black' },
  { id: FilterType.BW, label: 'B&W', color: 'bg-black border-2 border-white' },
  { id: FilterType.SOFT_PASTEL, label: 'Soft', color: 'bg-rose-100 border-2 border-rose-200' },
];

const FRAME_PRESETS = [
  { id: FrameType.SIMPLE, label: 'Simple' },
  { id: FrameType.POLAROID, label: 'Polaroid' },
  { id: FrameType.HEARTS, label: 'Hearts' },
  { id: FrameType.RETRO, label: 'Retro' },
  { id: FrameType.FILM, label: 'Film' },
];

const STICKER_LIST = [
    StickerTheme.NONE,
    StickerTheme.BUNNY,
    StickerTheme.CAT,
    StickerTheme.FLOWERS,
    StickerTheme.BOWS,
];

const BG_ELEMENTS = [
  { icon: CLOUD_SVG, x: '5%', y: '5%', size: 'w-24 md:w-32', anim: 'animate-float', delay: '0s', rot: 'rotate(0deg)' },
  { icon: CLOUD_SVG, x: '80%', y: '8%', size: 'w-20 md:w-28', anim: 'animate-float', delay: '1.5s', rot: 'rotate(0deg)' },
  { icon: SPARKLE_SVG, x: '15%', y: '25%', size: 'w-8', anim: 'animate-pulse', delay: '0.5s', rot: 'rotate(12deg)' },
  { icon: SPARKLE_SVG, x: '75%', y: '35%', size: 'w-6', anim: 'animate-pulse', delay: '2s', rot: 'rotate(-10deg)' },
  { icon: TULIP_SVG, x: '85%', y: '75%', size: 'w-20 md:w-28', anim: 'animate-wiggle', delay: '1s', rot: 'rotate(-5deg)' },
];

const THEME = {
  border: 'border-[#5d4037]', 
  shadow: 'shadow-[6px_6px_0px_#5d4037]', 
  shadowSm: 'shadow-[3px_3px_0px_#5d4037]',
  shadowMd: 'shadow-[4px_4px_0px_#5d4037]',
  bgLight: 'bg-[#fff0f5]', 
  bgDark: 'bg-[#fecdd3]', 
  text: 'text-[#5d4037]',
};

// --- AUDIO UTILS ---
const playShutterSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const BoothScreen: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // State
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSecretMessage, setShowSecretMessage] = useState(false);

  // Capture State
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [finalStripUrl, setFinalStripUrl] = useState<string | null>(null);
  
  // Camera State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Options
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.ORIGINAL);
  const [activeSticker, setActiveSticker] = useState<StickerTheme>(StickerTheme.NONE);
  const [activeFrame, setActiveFrame] = useState<FrameType>(FrameType.SIMPLE);

  // Camera Implementation
  useEffect(() => {
    const shouldRunCamera = isZoomed && !finalStripUrl && !isPrinting && !hasPrinted;

    if (!shouldRunCamera) {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      return;
    }

    let localStream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        
        const s = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
        });
        
        if (!isMounted) {
            s.getTracks().forEach(t => t.stop());
            return;
        }

        localStream = s;
        setStream(s);
        
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(e => console.warn("Autoplay prevented", e));
        }
      } catch (e: any) {
        console.error("Camera access failed", e);
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
             setCameraError("Camera permission denied. Please enable camera access.");
        } else {
             setCameraError("Unable to access camera. Please try again.");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (localStream) localStream.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZoomed, finalStripUrl, isPrinting, hasPrinted, facingMode]);


  // Interactions
  const handleEnterBooth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrinted) return;
    setIsZoomed(true);
  };

  const handleExitBooth = () => {
    setIsZoomed(false);
    setTimeout(() => {
      setFinalStripUrl(null);
      setCapturedPhotos([]);
      setHasPrinted(false);
      setIsPrinting(false);
      setIsCapturing(false);
      setCountdown(null);
    }, 500);
  };

  const handleCapture = async () => {
    if (cameraError) return;
    setCapturedPhotos([]);
    setIsCapturing(true);
    const photos: string[] = [];
    
    if (!canvasRef.current || !videoRef.current) {
      setIsCapturing(false);
      return;
    }

    for (let i = 0; i < 4; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);

      playShutterSound();
      setFlashActive(true);
      await new Promise(r => setTimeout(r, 100));
      
      const vid = videoRef.current;
      const can = canvasRef.current;
      
      can.width = vid.videoWidth;
      can.height = vid.videoHeight;
      const ctx = can.getContext('2d');
      
      if (ctx) {
        if (facingMode === 'user') {
            ctx.translate(can.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(vid, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const photoData = can.toDataURL('image/jpeg', 0.9);
        photos.push(photoData);
        setCapturedPhotos([...photos]);
      }
      
      setFlashActive(false);
      if (i < 3) await new Promise(r => setTimeout(r, 800));
    }

    setIsCapturing(false);

    const url = await compositeStrip(photos, activeFilter, activeFrame, activeSticker, settings);
    setFinalStripUrl(url);

    const strip: Strip = {
      id: generateId(),
      createdAt: Date.now(),
      dataUrl: url,
      filter: activeFilter,
      frame: activeFrame,
      sticker: activeSticker,
    };
    
    // Save to storage (blob + IndexedDB)
    // This will upload to Vercel Blob if token is set, otherwise saves base64
    // Don't await to keep print animation smooth, but ensure it completes
    saveStrip(strip).then(() => {
      console.log('Strip saved successfully');
    }).catch(error => {
      console.error('Failed to save strip:', error);
      // Still show the print even if save fails
    });

    setTimeout(() => {
      setIsPrinting(true);
      setTimeout(() => {
         setIsPrinting(false);
         setHasPrinted(true);
         setIsZoomed(false);
      }, 2000);
    }, 200);
  };

  const handleStickerToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setActiveSticker(prev => {
        const nextIndex = (STICKER_LIST.findIndex(s => s === prev) + 1) % STICKER_LIST.length;
        return STICKER_LIST[nextIndex];
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#fffdf5]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {BG_ELEMENTS.map((el, i) => (
          <div 
            key={i}
            className={`absolute ${el.size} ${el.anim} opacity-80 lg:opacity-100 transition-opacity duration-700`}
            style={{ 
              left: el.x, 
              top: el.y, 
              animationDelay: el.delay, 
              transform: el.rot,
              opacity: isZoomed ? 0.2 : undefined
            }}
          >
            <img src={el.icon} alt="decor" className="w-full h-full drop-shadow-sm" />
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full h-full flex items-center justify-center relative z-10 p-2 md:p-6">
        
        <div 
          className="relative transition-transform duration-700 ease-in-out origin-center pointer-events-auto select-none"
          style={{ 
             height: 'min(82dvh, 850px)',
             aspectRatio: '16/21',
             width: 'auto',
             maxWidth: '98vw',
             transform: isZoomed ? 'scale(1.02)' : 'scale(1)', 
          }}
        >
                <div 
                   className={`absolute inset-0 flex flex-col transition-transform duration-300 rounded-[35px] border-[8px] ${THEME.border} bg-[#5d4037] ${THEME.shadow} ${!isZoomed ? 'hover:scale-[1.01]' : ''} z-20`}
                >
                   <div className={`h-16 shrink-0 flex items-center justify-center ${THEME.bgDark} border-b-[6px] ${THEME.border} relative z-30 rounded-t-[27px]`}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
                        className={`px-4 py-1 bg-yellow-100 border-[3px] ${THEME.border} rounded-full font-handwriting ${THEME.text} text-base md:text-lg hover:scale-105 transition-transform ${THEME.shadowSm} pointer-events-auto ${!isZoomed ? 'animate-sign-pulse' : ''} truncate max-w-[90%]`}
                      >
                        {settings.name1} & {settings.name2} Photo Booth
                      </button>
                   </div>

                   <div className={`flex-1 ${THEME.bgLight} relative z-30 overflow-hidden`}>
                      <div className={`absolute inset-1 rounded-xl border-[4px] ${THEME.border} overflow-hidden group isolate bg-gray-100`}>
                        <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-none">
                          <div className={`h-full w-1/2 relative transition-transform duration-1000 ease-in-out ${isZoomed ? '-translate-x-full' : 'translate-x-0'} z-10`}>
                            <div 
                              className={`w-full h-full bg-rose-300 origin-top-left ${!isZoomed ? 'animate-curtain-sway-left' : ''} pointer-events-auto ${hasPrinted ? 'cursor-not-allowed' : 'cursor-pointer'} shadow-[4px_0_10px_rgba(0,0,0,0.1)]`}
                              onClick={!isZoomed ? handleEnterBooth : undefined}
                              style={{ 
                                background: 'repeating-linear-gradient(90deg, #fda4af 0px, #fb7185 15px, #fda4af 30px)'
                              }} 
                            >
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/20"></div>
                            </div>
                          </div>
                          
                          <div className={`h-full w-1/2 relative transition-transform duration-1000 ease-in-out ${isZoomed ? 'translate-x-full' : 'translate-x-0'} z-10`}>
                            <div 
                              className={`w-full h-full bg-rose-300 origin-top-right ${!isZoomed ? 'animate-curtain-sway-right' : ''} pointer-events-auto ${hasPrinted ? 'cursor-not-allowed' : 'cursor-pointer'} shadow-[-4px_0_10px_rgba(0,0,0,0.1)]`}
                              onClick={!isZoomed ? handleEnterBooth : undefined}
                              style={{ 
                                background: 'repeating-linear-gradient(90deg, #fb7185 0px, #fda4af 15px, #fb7185 30px)'
                              }}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20"></div>
                            </div>
                          </div>

                        </div>
                        
                        {!isZoomed && !hasPrinted && (
                          <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center">
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white border-[3px] border-[#5d4037] px-6 py-3 rounded-full shadow-[4px_4px_0px_rgba(93,64,55,0.3)] animate-float flex items-center justify-center text-center">
                                    <span className="font-doodle font-bold text-[#5d4037] text-xl tracking-wider uppercase pt-1">Tap to Open</span>
                                </div>
                             </div>
                          </div>
                        )}

                        <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${isZoomed ? 'opacity-100' : 'opacity-0'}`}>
                          
                          <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
                              {cameraError ? (
                                <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center p-6 text-center z-50">
                                   <Icons.Camera size={48} className="text-red-400 mb-4" />
                                   <h3 className="text-xl font-bold text-gray-800 mb-2">Camera Error</h3>
                                   <p className="text-sm text-gray-600 mb-6">{cameraError}</p>
                                   <button 
                                      onClick={() => window.location.reload()}
                                      className="px-6 py-2 bg-black text-white rounded-full font-bold active:scale-95 transition-transform"
                                   >
                                      Retry
                                   </button>
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
                              {!stream && !cameraError && (
                                <div className="absolute inset-0 bg-white flex items-center justify-center">
                                    <div className="text-black/20 text-4xl font-black rotate-[-15deg]">LOADING...</div>
                                </div>
                              )}
                          </div>
                          
                          <div className={`absolute inset-0 pointer-events-none z-10 transition-all duration-300 ${
                            activeFrame === FrameType.POLAROID ? 'border-[16px] border-b-[50px] border-white' : 
                            activeFrame === FrameType.HEARTS ? 'border-[8px] border-rose-400 rounded-[20px]' : 
                            activeFrame === FrameType.RETRO ? 'border-[16px] border-[#fffbe6]' : 
                            activeFrame === FrameType.FILM ? 'border-x-[24px] border-black' : ''
                          }`}>
                            {activeFrame === FrameType.FILM && (
                                <div className="w-full h-full flex justify-between">
                                    <div className="w-1 h-full border-r border-dashed border-white/30 ml-[-4px]"></div>
                                    <div className="w-1 h-full border-l border-dashed border-white/30 mr-[-4px]"></div>
                                </div>
                            )}
                          </div>

                          <div className="absolute inset-0 pointer-events-none transition-all duration-300 z-10" 
                            style={{
                              backdropFilter: activeFilter === FilterType.BW ? 'grayscale(100%) contrast(1.1)' : 
                                              activeFilter === FilterType.SOFT_PASTEL ? 'brightness(1.1) saturate(0.8) sepia(0.2)' :
                                              activeFilter === FilterType.SKETCH ? 'grayscale(100%) contrast(1.5) brightness(1.1)' : 'none'
                            }} 
                          />

                          <div className={`absolute inset-0 bg-white z-[100] pointer-events-none transition-opacity duration-150 ${flashActive ? 'opacity-100' : 'opacity-0'}`} />
                          
                          {isCapturing && (
                            <div className="absolute top-4 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-top-4 duration-300">
                                <div className={`flex items-center gap-3 bg-white border-[3px] ${THEME.border} rounded-full px-5 py-2 shadow-[4px_4px_0px_#5d4037]`}>
                                    <span className={`font-doodle font-bold text-lg tracking-widest ${THEME.text}`}>SHOTS</span>
                                    <div className="w-[2px] h-5 bg-black/10"></div>
                                    <div className="flex gap-2">
                                        {[0,1,2,3].map(i => (
                                          <div key={i} className={`w-4 h-4 rounded-full border-[3px] border-[#5d4037] transition-all duration-300 ${i < capturedPhotos.length ? 'bg-yellow-400 scale-110' : 'bg-gray-100'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                          )}

                          {countdown && (
                            <div className="absolute inset-0 flex items-start justify-center pt-24 z-40">
                                <span className="text-[10rem] font-doodle font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-bounce">{countdown}</span>
                            </div>
                          )}

                          {isZoomed && !isCapturing && (
                            <div className="absolute inset-0 flex flex-col justify-between p-3 z-[9999] pointer-events-none">
                                <div className="flex justify-between items-center pointer-events-auto px-3 pt-3 w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); setFacingMode(prev => prev === 'user' ? 'environment' : 'user'); }} 
                className={`w-9 h-9 bg-white border-[3px] ${THEME.border} rounded-full text-[#5d4037] shadow-[2px_2px_0px_#5d4037] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-50`}
              >
                <Icons.Retake size={18} strokeWidth={3} />
              </button>

              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExitBooth(); }} 
                className={`w-9 h-9 bg-red-400 border-[3px] ${THEME.border} rounded-full text-white shadow-[2px_2px_0px_#5d4037] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-50`}
              >
                <Icons.Close size={18} strokeWidth={3} />
              </button>
            </div>
                                
                                <div className="flex items-center justify-around pb-2 pointer-events-auto gap-4">
                                  <button onClick={(e) => { e.stopPropagation(); setActiveFrame(prev => FRAME_PRESETS[(FRAME_PRESETS.findIndex(f => f.id === prev) + 1) % FRAME_PRESETS.length].id); }} className={`w-10 h-10 rounded-full bg-yellow-200 border-[3px] ${THEME.border} flex items-center justify-center ${THEME.text} shadow-[2px_2px_0px_#5d4037] active:translate-y-[2px] transition-all cursor-pointer`}>
                                    <Icons.Frame size={18} strokeWidth={2.5} />
                                  </button>

                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleCapture(); }} 
                                    disabled={!!cameraError}
                                    className={`w-16 h-16 rounded-full border-[4px] ${THEME.border} bg-white flex items-center justify-center active:scale-95 transition-transform shadow-[3px_3px_0px_#5d4037] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                      <div className={`w-12 h-12 bg-red-400 border-[3px] ${THEME.border} rounded-full`} />
                                  </button>

                                  <button onClick={(e) => { e.stopPropagation(); setActiveFilter(prev => FILTER_PRESETS[(FILTER_PRESETS.findIndex(f => f.id === prev)+1)%FILTER_PRESETS.length].id); }} className={`w-10 h-10 rounded-full bg-blue-200 border-[3px] ${THEME.border} flex items-center justify-center ${THEME.text} shadow-[2px_2px_0px_#5d4037] active:translate-y-[2px] transition-all cursor-pointer`}>
                                    <Icons.Palette size={18} strokeWidth={2.5} />
                                  </button>
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                   </div>

                   <div className={`h-24 shrink-0 ${THEME.bgDark} border-t-[6px] ${THEME.border} relative z-20 rounded-b-[27px]`}>
                      <div className={`relative z-30 ${THEME.bgDark} w-full flex flex-col items-center pt-2 pb-1 rounded-b-lg`}>
                          <span className="text-[9px] font-bold font-sans tracking-[0.2em] text-[#8e6e66] mb-1">PRINT DISPENSER</span>
                          <div className={`w-52 h-5 bg-gray-800 rounded-full border-[3px] ${THEME.border} shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative`}>
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 rounded-t-full"></div>
                              {isPrinting && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-full"></div>}
                          </div>
                      </div>

                      {hasPrinted && (
                        <div className="absolute top-[36px] left-0 right-0 bottom-[-500px] overflow-hidden z-25 flex justify-center items-start pointer-events-none">
                              <div className="animate-print-eject origin-top pt-2 relative">
                                    <div className="absolute -top-4 -left-6 w-8 h-8 animate-bounce delay-100 z-50"><img src={SPARKLE_SVG} alt="" /></div>
                                    <div className="absolute top-10 -right-6 w-6 h-6 animate-pulse delay-300 z-50"><img src={SPARKLE_SVG} alt="" /></div>
                                    <div className="absolute bottom-10 -left-4 w-5 h-5 animate-spin-slow delay-500 z-50"><img src={SPARKLE_SVG} alt="" /></div>

                                    <div 
                                       className="pointer-events-auto cursor-pointer transition-transform active:scale-95 hover:brightness-105"
                                       onClick={() => navigate('/gallery')}
                                       style={{ transform: 'rotate(-2deg)' }}
                                    >
                                        <img 
                                           src={finalStripUrl!} 
                                           alt="Print" 
                                           className="w-40 shadow-[0px_0px_20px_rgba(250,204,21,0.6)] rounded-[2px] border-[2px] border-white bg-white"
                                           draggable={false}
                                        />
                                        <div className="absolute -bottom-8 left-0 right-0 text-center">
                                            <span className={`text-[10px] font-doodle font-bold ${THEME.text} opacity-80 animate-pulse bg-white/50 px-2 py-1 rounded-full`}>Tap to collect</span>
                                        </div>
                                    </div>
                              </div>
                        </div>
                      )}

                      <button 
                         onClick={(e) => { e.stopPropagation(); navigate('/gallery'); }}
                         className={`absolute bottom-4 right-5 w-14 h-14 bg-white border-[3px] ${THEME.border} rounded-full shadow-[2px_2px_0px_#5d4037] flex items-center justify-center ${THEME.text} hover:scale-105 active:translate-y-[2px] active:shadow-none transition-all z-40`}
                         title="Open Gallery"
                      >
                         <Icons.Gallery size={24} strokeWidth={2.5} />
                      </button>
                   </div>
                </div>

                <div className="absolute -top-8 -right-3 md:-top-10 md:-right-8 w-20 h-20 md:w-32 md:h-32 pointer-events-none rotate-12 z-50 filter drop-shadow-lg">
                    <img src={bowImage} alt="bow" className="w-full h-full" />
                </div>
                
                <div className="absolute -bottom-6 -left-3 md:-bottom-8 md:-left-8 w-20 h-20 md:w-32 md:h-32 pointer-events-none -rotate-12 z-50 filter drop-shadow-lg">
                    <img src={bowImage} alt="bow" className="w-full h-full" />
                </div>

                <div className="absolute top-0 left-0 w-32 md:w-40 pointer-events-none z-50 filter drop-shadow-lg" style={{ transform: 'translate(-20%, -40%)' }}>
                    <img src={miffyImage} alt="miffy" className="w-full h-auto" />
                </div>
        </div>
      </div>

      {!isZoomed && !showSecretMessage && (
          <div 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowSecretMessage(true);
                // Play random song when opening secret message
                try {
                  const songUrl = getRandomSong();
                  const audio = new Audio(songUrl);
                  audio.volume = 0.5; // Set volume to 50%
                  audio.loop = true; // Loop the song
                  audio.play().catch(err => {
                    console.warn('Could not play audio:', err);
                    // Some browsers require user interaction first
                  });
                  audioRef.current = audio;
                } catch (error) {
                  console.error('Error loading music:', error);
                }
              }}
              className="absolute bottom-2 left-0 w-24 h-24 md:w-32 md:h-32 z-[100] cursor-pointer animate-cat-walk drop-shadow-lg pointer-events-auto"
              title="Click me!"
          >
              <div className="w-full h-full animate-bounce relative">
                <img src={catImage} alt="Secret Cat" className="w-full h-full object-contain animate-cat-image-flip" />
                <div className="absolute -top-2 -right-2 bg-white px-3 py-1 rounded-full border border-stone-400 text-[10px] font-bold shadow-sm text-[#5d4037] whitespace-nowrap">Click me!</div>
              </div>
          </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {showSecretMessage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[8px_8px_0px_#ec4899] border-[4px] border-pink-300 relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center overflow-y-auto max-h-[90vh]">
                <button 
                    onClick={() => {
                      // Stop music when closing
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        audioRef.current = null;
                      }
                      setShowSecretMessage(false);
                    }}
                    className="absolute top-4 right-4 text-pink-400 hover:text-pink-600 transition-colors z-10 bg-white/80 rounded-full p-1"
                >
                    <Icons.Close size={20} strokeWidth={3} />
                </button>
                
                <div className="w-28 h-28 md:w-32 md:h-32 animate-bounce mb-4">
                    <img src={catImage} alt="Cat" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                
                <h2 className="font-handwriting text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-1 drop-shadow-sm">
                    Happy 6 Months! ❤️
                </h2>
                <div className="flex gap-1 mb-6">
                    <span className="text-2xl">💕</span>
                    <span className="text-xl">✨</span>
                    <span className="text-2xl">💕</span>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm border-[3px] border-pink-200 p-5 md:p-6 rounded-2xl shadow-[inset_0_2px_8px_rgba(236,72,153,0.1)] w-full mb-6 text-left">
                    <div className="space-y-4">
                        <p className="font-handwriting text-pink-700 text-base md:text-lg leading-relaxed font-semibold">
                            Dear Gwen,
                        </p>
                        
                        <p className="font-sans text-pink-800 leading-relaxed text-sm md:text-base">
                            These past six months with you have been the most <span className="font-bold text-pink-600">rewarding and fulfilling</span> experience of my life. Every moment we have shared has become a memory I treasure, and I am endlessly grateful that I get to call you not only my girlfriend but also my <span className="font-bold text-rose-600">best friend</span> and my <span className="font-bold text-pink-600">forever baby bear</span>.
                        </p>
                        
                        <p className="font-sans text-pink-800 leading-relaxed text-sm md:text-base">
                            You are the most <span className="font-bold text-rose-600">beautiful, kind, and caring</span> person I have ever known, both inside and out, and I feel so unbelievably lucky to have you in my life.
                        </p>
                        
                        <p className="font-sans text-pink-800 leading-relaxed text-sm md:text-base">
                            I love you more than words can express, and I cannot wait for all the <span className="font-bold text-pink-600">moments, adventures, laughs, and quiet days</span> we still have ahead of us. Being with you feels like <span className="font-bold text-rose-600">home</span>, and having you as both my partner and my best friend is the greatest gift I could ever ask for.
                        </p>
                        
                        <p className="font-sans text-pink-800 leading-relaxed text-sm md:text-base">
                            One of my favorite things about us is how much joy we find in <span className="font-bold text-pink-600">photo booths</span> and how those silly snapshots manage to capture both our love and our friendship. Because of that, I wanted to create something special for you: <span className="font-bold text-rose-600">a photo booth that is truly ours</span>. It is a small gesture, but I hope it shows you how deeply I adore you.
                        </p>
                        
                        <p className="font-handwriting text-pink-700 text-lg md:text-xl leading-relaxed font-bold mt-4 text-center">
                            I love you so much, my love,<br/>
                            today, tomorrow, and always. 💕
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={() => {
                      // Stop music when closing
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        audioRef.current = null;
                      }
                      setShowSecretMessage(false);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-doodle font-bold text-lg md:text-xl rounded-full border-[3px] border-pink-600 shadow-[4px_4px_0px_#ec4899] hover:translate-y-px hover:shadow-[2px_2px_0px_#ec4899] hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 active:scale-95"
                >
                    💖 Love you! 💖
                </button>
            </div>
        </div>
      )}
    </div>
  );
}