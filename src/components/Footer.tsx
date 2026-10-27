import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="border-t border-gold-400/30 bg-obsidian py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <div>
          <p className="font-serif text-base sm:text-lg font-black tracking-[0.2em] gold-luminous">
            DR. CARE — REVIVING THE AUTOMOTIVE SOUL
          </p>
          <p className="text-xs sm:text-sm font-bold text-white mt-1">
            {t.footerBrightSub}{' '}
            <span className="logo-rupes text-gold-300">RUPES</span> &amp;{' '}
            <span className="logo-meguiars text-gold-300">Meguiar&apos;s</span>
          </p>
        </div>
        <div className="text-xs font-extrabold text-gold-200 bg-gold-400/10 border border-gold-400/30 px-4 py-2 rounded-xl">
          {t.footerZonesTag}
        </div>
      </div>
    </footer>
  );
};
