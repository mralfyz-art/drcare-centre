import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface MethodologyPillarsProps {
  lang: Language;
}

export const MethodologyPillars: React.FC<MethodologyPillarsProps> = ({ lang }) => {
  const t = translations[lang];
  const [activePillar, setActivePillar] = useState<number>(1);

  return (
    <motion.section
      id="methodology-section"
      className="piano-card rounded-3xl p-5 sm:p-8 space-y-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-black uppercase tracking-widest">
          {t.xrayBadge}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
          {t.xrayTitle}
        </h2>
      </div>

      {/* PILLAR SELECTOR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => setActivePillar(1)}
          className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer border ${
            activePillar === 1
              ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-black border-gold-400 shadow-[0_0_20px_rgba(245,197,24,0.35)]'
              : 'bg-leather/80 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
          }`}
        >
          {t.pillar1Btn}
        </button>
        <button
          type="button"
          onClick={() => setActivePillar(2)}
          className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer border ${
            activePillar === 2
              ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-black border-gold-400 shadow-[0_0_20px_rgba(245,197,24,0.35)]'
              : 'bg-leather/80 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
          }`}
        >
          {t.pillar2Btn}
        </button>
        <button
          type="button"
          onClick={() => setActivePillar(3)}
          className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer border ${
            activePillar === 3
              ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-black border-gold-400 shadow-[0_0_20px_rgba(245,197,24,0.35)]'
              : 'bg-leather/80 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
          }`}
        >
          {t.pillar3Btn}
        </button>
      </div>

      {/* TAB CONTENT ANIMATED */}
      <AnimatePresence mode="wait">
        {/* PILLAR 1: CLEAR COAT SURGERY */}
        {activePillar === 1 && (
          <motion.div
            key="pillar-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
          >
            <div className="p-4 rounded-2xl bg-black/60 border border-gold-400/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-gold-300 tracking-wider">Layer 01</span>
              <h4 className="font-extrabold text-sm text-white">{t.layer1Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.layer1Desc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Layer 02</span>
              <h4 className="font-extrabold text-sm text-white">{t.layer2Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.layer2Desc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">Guaranteed 100%</span>
              <h4 className="font-extrabold text-sm text-emerald-300">{t.layer3Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.layer3Desc}</p>
            </div>
          </motion.div>
        )}

        {/* PILLAR 2: NANO DRY WASH SCIENCE */}
        {activePillar === 2 && (
          <motion.div
            key="pillar-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
          >
            <div className="p-4 rounded-2xl bg-black/60 border border-gold-400/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-gold-300 tracking-wider">Science 01</span>
              <h4 className="font-extrabold text-sm text-white">{t.nano1Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.nano1Desc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Materials 02</span>
              <h4 className="font-extrabold text-sm text-white">{t.nano2Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.nano2Desc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-gold-400/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-gold-300 tracking-wider">Protection 03</span>
              <h4 className="font-extrabold text-sm text-white">{t.nano3Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.nano3Desc}</p>
            </div>
          </motion.div>
        )}

        {/* PILLAR 3: CENTRE CRAFT & DIAGNOSIS */}
        {activePillar === 3 && (
          <motion.div
            key="pillar-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
          >
            <div className="p-4 rounded-2xl bg-black/60 border border-gold-400/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-gold-300 tracking-wider">
                {lang === 'ar' ? 'الفروع المعتمدة ٠١' : 'Official Centres 01'}
              </span>
              <h4 className="font-extrabold text-sm text-white">{t.mob1Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.mob1Desc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                {lang === 'ar' ? 'جلسات الجمعة ٠٢' : 'Friday Sessions 02'}
              </span>
              <h4 className="font-extrabold text-sm text-white">{t.mob2Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.mob2Desc}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                {lang === 'ar' ? 'خدمة VIP متنقلة ٠٣' : 'VIP Mobile Service 03'}
              </span>
              <h4 className="font-extrabold text-sm text-emerald-300">{t.mob3Title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{t.mob3Desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
