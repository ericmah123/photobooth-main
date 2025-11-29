import { FilterType, FrameType, StickerTheme, AppSettings } from '../types';

const PHOTO_WIDTH = 600;
const PHOTO_HEIGHT = 450; // 4:3 Aspect Ratio
const GAP = 25;
const PADDING = 50;

// Miffy Style (Brown Outline, Pink Dress) - Updated Cartoon Style
const BUNNY_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Cg stroke='%235d4037' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Ears --%3E%3Cpath d='M60 90 V30 A15 15 0 0 1 90 30 V90' fill='%23fff'/%3E%3Cpath d='M110 90 V30 A15 15 0 0 1 140 30 V90' fill='%23fff'/%3E%3C!-- Head --%3E%3Cellipse cx='100' cy='130' rx='65' ry='50' fill='%23fff'/%3E%3C!-- Dress --%3E%3Cpath d='M65 170 L50 260 Q100 280 150 260 L135 170 Z' fill='%23fda4af'/%3E%3C!-- Hands --%3E%3Cpath d='M50 200 Q30 220 55 230' fill='%23fff'/%3E%3Cpath d='M150 200 Q170 220 145 230' fill='%23fff'/%3E%3C/g%3E%3C!-- Face --%3E%3Cg fill='%233e2723'%3E%3Ccircle cx='80' cy='130' r='6'/%3E%3Ccircle cx='120' cy='130' r='6'/%3E%3C/g%3E%3Cpath d='M92 145 L108 159 M108 145 L92 159' stroke='%233e2723' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E`;

// Cartoon Tulip
const TULIP_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg stroke='%238B5A2B' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M50 90 V55' stroke='%2386efac' stroke-width='4'/%3E%3Cpath d='M50 80 Q30 70 30 50' fill='none' stroke='%2386efac' stroke-width='3'/%3E%3Cpath d='M50 80 Q70 70 70 50' fill='none' stroke='%2386efac' stroke-width='3'/%3E%3Cpath d='M30 50 Q30 20 50 15 Q70 20 70 50 Q50 60 30 50 Z' fill='%23fca5a5'/%3E%3C/g%3E%3C/svg%3E`;

// Cartoon Lily
const LILY_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='%23fff' stroke='%238B5A2B' stroke-width='2.5' stroke-linejoin='round'%3E%3Cpath d='M50 60 Q35 30 50 20 Q65 30 50 60' fill='%23fffbeb'/%3E%3Cpath d='M50 60 Q80 45 90 60 Q80 75 50 60' fill='%23fffbeb'/%3E%3Cpath d='M50 60 Q65 90 50 95 Q35 90 50 60' fill='%23fffbeb'/%3E%3Cpath d='M50 60 Q20 75 10 60 Q20 45 50 60' fill='%23fffbeb'/%3E%3Ccircle cx='50' cy='60' r='5' fill='%23fcd34d' stroke='none'/%3E%3C/g%3E%3C/svg%3E`;

// Bow (Ribbon)
const BOW_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 50 Q30 20 10 40 Q30 60 50 50 Q70 60 90 40 Q70 20 50 50' fill='%23f9a8d4' stroke='%238B5A2B' stroke-width='3'/%3E%3Cpath d='M50 50 L30 80 M50 50 L70 80' stroke='%23f9a8d4' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E`;

// Mofusand-style Cat
const CAT_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 30 Q10 10 30 20 L40 25 L60 25 L70 20 Q90 10 80 30 C95 40 95 70 80 85 Q50 95 20 85 C5 70 5 40 20 30' fill='%23fff' stroke='%238B5A2B' stroke-width='3'/%3E%3Ccircle cx='35' cy='55' r='4' fill='%233e2723'/%3E%3Ccircle cx='65' cy='55' r='4' fill='%233e2723'/%3E%3C/svg%3E`;

const ASSETS: Record<StickerTheme, string | null> = {
  [StickerTheme.NONE]: null,
  [StickerTheme.BUNNY]: BUNNY_SVG,
  [StickerTheme.CAT]: CAT_SVG,
  [StickerTheme.FLOWERS]: TULIP_SVG,
  [StickerTheme.BOWS]: BOW_SVG,
};

export const compositeStrip = async (
  photos: string[], // Array of base64/blob urls
  filter: FilterType,
  frame: FrameType,
  sticker: StickerTheme,
  settings: AppSettings
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Determine Canvas Size based on Frame
  let canvasWidth = PHOTO_WIDTH + PADDING * 2;
  let canvasHeight = PADDING + (PHOTO_HEIGHT * 4) + (GAP * 3) + PADDING + 120; 

  if (frame === FrameType.POLAROID) {
    canvasHeight += 100; 
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 2. Fill Background
  ctx.fillStyle = '#ffffff'; // Default white
  if (frame === FrameType.RETRO) ctx.fillStyle = '#fffbe6'; // Butter cream
  if (frame === FrameType.HEARTS) ctx.fillStyle = '#fff1f2'; // Rose water
  if (frame === FrameType.FILM) ctx.fillStyle = '#1a1a1a'; // Film negative style (dark)
  
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 3. Apply Frame Borders (Background elements)
  if (frame === FrameType.HEARTS) {
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(15, 15, canvasWidth - 30, canvasHeight - 30, 20);
    ctx.stroke();
  }
  
  if (frame === FrameType.FILM) {
    // Draw film sprocket holes
    ctx.fillStyle = '#ffffff';
    const holeSize = 20;
    const holeGap = 40;
    // Left side
    for (let y = 20; y < canvasHeight; y += holeGap) {
        ctx.fillRect(10, y, holeSize, holeSize - 5);
        ctx.fillRect(canvasWidth - 10 - holeSize, y, holeSize, holeSize - 5);
    }
  }

  // 4. Draw Photos
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const y = PADDING + i * (PHOTO_HEIGHT + GAP);
    const x = PADDING;

    ctx.save();
    
    // Apply Filter
    if (filter === FilterType.BW) ctx.filter = 'grayscale(100%) contrast(1.1)';
    if (filter === FilterType.SKETCH) ctx.filter = 'grayscale(100%) contrast(2.0) brightness(1.1)';
    if (filter === FilterType.SOFT_PASTEL) ctx.filter = 'brightness(1.1) saturate(0.85) sepia(0.15)';
    if (filter === FilterType.WARM_ROMANTIC) ctx.filter = 'sepia(0.2) contrast(1.05) saturate(1.1)';
    
    // Rounded corners for photos
    ctx.beginPath();
    ctx.roundRect(x, y, PHOTO_WIDTH, PHOTO_HEIGHT, 4);
    ctx.clip();
    
    ctx.drawImage(img, x, y, PHOTO_WIDTH, PHOTO_HEIGHT);
    ctx.restore();
    
    // Inner border for definition (Black for sketch)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, PHOTO_WIDTH, PHOTO_HEIGHT);
  }

  // 5. Draw Foreground Decor (Images/Stickers)
  if (sticker !== StickerTheme.NONE) {
    const assetUrl = ASSETS[sticker];

    if (assetUrl) {
      try {
        const stickerImg = await loadImage(assetUrl);
        const stickerSize = 100;

        // Placement logic
        for (let i = 0; i < 4; i++) {
            const y = PADDING + i * (PHOTO_HEIGHT + GAP);
            
            // Alternate sides
            if (i % 2 === 0) {
                // Top Left corner
                ctx.drawImage(stickerImg, PADDING - 20, y - 20, stickerSize, stickerSize);
            } else {
                // Bottom Right corner
                ctx.drawImage(stickerImg, PADDING + PHOTO_WIDTH - 80, y + PHOTO_HEIGHT - 80, stickerSize, stickerSize);
            }
        }
      } catch (e) {
        console.warn("Failed to load sticker asset", e);
      }
    }
  }

  // 6. Draw Text / Footer
  const textColor = frame === FrameType.FILM ? '#ffffff' : '#000000';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  let footerY = PADDING + (PHOTO_HEIGHT * 4) + (GAP * 3) + 70;
  
  // Use a handwritten-style font fallback
  ctx.font = 'bold 42px "Gaegu", "Pacifico", cursive'; 
  
  const titleText = `${settings.name1} & ${settings.name2} Photo Booth`;
  ctx.fillText(titleText, canvasWidth / 2, footerY);

  footerY += 45;
  ctx.font = 'bold 24px "Nunito", sans-serif';
  ctx.fillStyle = frame === FrameType.FILM ? '#cccccc' : '#333333';
  
  const parts = [];
  if (settings.tagline) parts.push(settings.tagline);
  if (settings.showDate) {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    parts.push(dateStr);
  }
  
  if (parts.length > 0) {
      ctx.fillText(parts.join(' • '), canvasWidth / 2, footerY);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};