import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface BeforeAfterSliderProps {
  lang: Language;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ lang }) => {
  const t = translations[lang];
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeImgRef = useRef<HTMLImageElement>(null);

  const syncWidth = useCallback(() => {
    if (containerRef.current && beforeImgRef.current) {
      beforeImgRef.current.style.width = `${containerRef.current.offsetWidth}px`;
    }
  }, []);

  useEffect(() => {
    syncWidth();
    window.addEventListener('resize', syncWidth);
    return () => window.removeEventListener('resize', syncWidth);
  }, [syncWidth]);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(4, Math.min(96, pos));
    setSliderPos(clamped);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div className="piano-card p-3 rounded-3xl studio-light-tunnel">
      <div className="flex items-center justify-between mb-2.5 px-1 text-xs">
        <span className="font-bold text-white">
          {t.sliderHeader}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setSliderPos(85); syncWidth(); }}
            className={`text-[10px] px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              sliderPos >= 70 ? 'bg-gold-400 text-black font-extrabold' : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            {t.btnBefore}
          </button>
          <button
            type="button"
            onClick={() => { setSliderPos(15); syncWidth(); }}
            className={`text-[10px] px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              sliderPos <= 30 ? 'bg-gold-400 text-black font-extrabold' : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            {t.btnAfter}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative w-full h-[360px] md:h-[420px] overflow-hidden select-none touch-pan-y rounded-2xl cursor-ew-resize !ltr"
        style={{ direction: 'ltr' }}
      >
        {/* AFTER IMAGE (BACKGROUND LAYER) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/after.jpeg"
            alt="After DR. CARE Paint Correction"
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              // Fallback to stylized high-contrast dark paint
              (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
            }}
          />
          <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 border border-gold-400/50 text-gold-300 text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-sm pointer-events-none">
            {t.afterTag}
          </span>
        </div>

        {/* BEFORE IMAGE (OVERLAY CLIP LAYER) */}
        <div
          className="absolute top-0 left-0 bottom-0 overflow-hidden z-10"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            ref={beforeImgRef}
            src="/before.jpeg"
            alt="Before Paint Correction"
            className="absolute top-0 left-0 h-full max-w-none object-cover"
            loading="eager"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
            }}
          />
          <span className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/85 border border-white/20 text-zinc-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-sm pointer-events-none">
            {t.beforeTag}
          </span>
        </div>

        {/* DRAGGABLE DIVIDER HANDLE */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-gold-300 via-gold-400 to-transparent z-20 -translate-x-1/2 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-obsidian/95 border-2 border-gold-400 shadow-[0_0_24px_rgba(245,197,24,0.8)] flex items-center justify-center text-gold-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
              <polyline points="9 18 3 12 9 6"></polyline>
              <polyline points="9 6 15 12 9 18"></polyline>
              <polyline points="15 6 21 12 15 18"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
