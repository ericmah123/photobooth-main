import React from 'react';
import { Camera, Image as ImageIcon, Settings, Download, Trash2, X, ChevronLeft, Heart, Sparkles, Palette, Frame, Check, Play, RotateCcw } from 'lucide-react';

export const Icons = {
  Camera,
  Gallery: ImageIcon,
  Settings,
  Download,
  Trash: Trash2,
  Close: X,
  Back: ChevronLeft,
  Heart,
  Sparkles,
  Palette,
  Frame,
  Check,
  Play,
  Retake: RotateCcw,
};

export type IconName = keyof typeof Icons;