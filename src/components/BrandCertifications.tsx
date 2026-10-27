import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface BrandCertificationsProps {
  lang: Language;
}

export const BrandCertifications: React.FC<BrandCertificationsProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* HEADER STRIP */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-obsidian via-[#14120B] to-obsidian border-y border-gold-400/25 py-3.5 px-4 rounded-2xl"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
            <span className="px-2 py-0.5 rounded bg-gold-400/20 border border-gold-400/40 text-gold-300 text-[10px] font-extrabold uppercase tracking-wider">
              {t.worldClassBadge}
            </span>
            <span>{t.worldClassText}</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-black/80 border border-gold-400/40 shadow-md">
              <span className="logo-meguiars text-lg sm:text-xl text-gold-300 tracking-wide">
                Meguiar's<span className="text-rose-500 text-xs align-top">®</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 border-s border-white/15 ps-2">USA</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-black/80 border border-white/20 shadow-md">
              <div className="leading-none">
                <span className="logo-rupes text-lg sm:text-xl text-white block">RUPES</span>
                <span className="block h-1 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-transparent rounded-full mt-0.5"></span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 border-s border-white/15 ps-2">ITALY</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DETAILED BRAND CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MEGUIAR'S CARD */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="piano-card rounded-3xl p-5 sm:p-6 border border-gold-400/25 space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="logo-meguiars text-2xl sm:text-3xl text-gold-300">
              Meguiar's<span className="text-rose-500 text-sm align-top">®</span>
            </span>
            <span className="text-[11px] font-extrabold text-gold-200 bg-gold-400/15 border border-gold-400/30 px-3 py-1 rounded-full">
              {t.megBadge}
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
            {t.megOrigin}
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {t.megFullDesc}
          </p>
        </motion.div>

        {/* RUPES CARD */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="piano-card rounded-3xl p-5 sm:p-6 border border-white/15 space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="logo-rupes text-2xl sm:text-3xl text-white block">RUPES</span>
              <span className="block h-1 w-24 bg-gradient-to-r from-rose-600 via-rose-500 to-transparent rounded-full mt-0.5"></span>
            </div>
            <span className="text-[11px] font-extrabold text-white bg-white/10 border border-white/20 px-3 py-1 rounded-full">
              {t.rupBadge}
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
            {t.rupOrigin}
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {t.rupFullDesc}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
