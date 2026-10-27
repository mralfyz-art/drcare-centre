import React, { useState } from 'react';
import { MediaItem } from '../types';

interface LightboxModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose }) => {
  const [zoom, setZoom] = useState<number>(1);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full bg-leather border border-gold-400/40 rounded-3xl p-4 space-y-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-gold-300 uppercase tracking-wider">
            {item.resolution || 'Optical Paint Inspection'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                zoom === 1 ? 'bg-gold-400 text-black' : 'bg-white/10 hover:bg-gold-400/20 text-white'
              }`}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => setZoom(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                zoom === 2 ? 'bg-gold-400 text-black' : 'bg-white/10 hover:bg-gold-400/20 text-gold-200'
              }`}
            >
              🔍 2x
            </button>
            <button
              type="button"
              onClick={() => setZoom(3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                zoom === 3 ? 'bg-gold-400 text-black' : 'bg-white/10 hover:bg-gold-400/20 text-gold-300'
              }`}
            >
              🔬 3x
            </button>
            <a
              href={item.url}
              download={`DrCare_Inspection_${Date.now()}.png`}
              className="px-3 py-1 rounded-lg bg-gold-400 text-black text-xs font-extrabold hover:bg-gold-300 transition"
            >
              ⬇ Download Image
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-bold hover:bg-rose-500/30 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center max-h-[75vh] overflow-auto rounded-2xl bg-black p-2">
          <img
            src={item.url}
            alt="Optical Inspection Zoom"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="max-h-[70vh] w-auto object-contain rounded-xl transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
};
