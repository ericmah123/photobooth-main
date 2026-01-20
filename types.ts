export enum FilterType {
  ORIGINAL = 'original',
  SOFT_PASTEL = 'softPastel',
  WARM_ROMANTIC = 'warmRomantic',
  BW = 'bw',
  SKETCH = 'sketch',
}

export enum FrameType {
  SIMPLE = 'simple',
  POLAROID = 'polaroid',
  HEARTS = 'hearts',
  RETRO = 'retro',
  FILM = 'film',
}

export enum StickerTheme {
  NONE = 'none',
  BUNNY = 'bunny', // Miffy style
  CAT = 'cat',     // Mofusand style
  FLOWERS = 'flowers', // Tulips/Lilys
  BOWS = 'bows',   // Coquette
}

export interface Strip {
  id: string;
  createdAt: number;
  dataUrl: string; // Vercel Blob URL of final composite
  filter: FilterType;
  frame: FrameType;
  sticker: StickerTheme;
}

export interface AppSettings {
  name1: string;
  name2: string;
  showDate: boolean;
  tagline: string;
  orientation: 'portrait' | 'landscape';
}