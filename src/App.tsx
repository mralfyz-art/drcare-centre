import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Language, Lead, MediaItem } from './types';
import { translations } from './i18n/translations';
import { Header } from './components/Header';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { BrandCertifications } from './components/BrandCertifications';
import { MethodologyPillars } from './components/MethodologyPillars';
import { ScratchDiagnosisForm } from './components/ScratchDiagnosisForm';
import { DryWashBookingForm } from './components/DryWashBookingForm';
import { FaqSection } from './components/FaqSection';
import { BackofficeModal } from './components/BackofficeModal';
import { LightboxModal } from './components/LightboxModal';
import { Footer } from './components/Footer';
import { fetchAllLeads } from './services/storage';
import { testConnection } from './services/firebase';

interface ToastItem {
  id: string;
  msg: string;
  type: 'gold' | 'success' | 'error';
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'scratch' | 'booking'>('scratch');
  const [isBackofficeOpen, setIsBackofficeOpen] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const t = translations[lang];

  // Sync HTML lang and dir attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Load existing leads & test Firebase connectivity on boot
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        console.log('Firebase Firestore connection verified.');
      }
    });
    fetchAllLeads().then((data) => setLeads(data));
  }, []);

  // Check URL param ?admin=1
  useEffect(() => {
    if (window.location.search.includes('admin=1')) {
      setIsBackofficeOpen(true);
    }
  }, []);

  // Ambient mouse spotlight
  const handleMouseMove = (e: React.MouseEvent) => {
    document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
  };

  const showToast = (msg: string, type: 'gold' | 'success' | 'error' = 'gold') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const handleLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen selection:bg-gold-400 selection:text-black ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}
    >
      {/* IN-PAGE TOAST NOTIFICATION CONTAINER */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transform transition-all duration-300 ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-black/90 border-gold-400/60 text-gold-200'
            }`}
          >
            <span>{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✓' : '✨'}</span>
            <span>{toast.msg}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
        onOpenBackoffice={() => setIsBackofficeOpen(true)}
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-24 space-y-16">
        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* HERO TEXT */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-200 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-black leading-[1.12] tracking-tight text-white">
              <span>{t.heroHeadline1}</span>
              <span className="gold-luminous block mt-1">{t.heroHeadline2}</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
              {t.heroQuoteSub}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href="#clinic-console"
                onClick={() => setActiveTab('scratch')}
                className="btn-gold-elite px-6 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.heroBtnScratch}</span>
                <span>→</span>
              </a>
              <a
                href="#clinic-console"
                onClick={() => setActiveTab('booking')}
                className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-gold-400/35 text-gold-200 font-bold text-sm flex items-center justify-center transition cursor-pointer"
              >
                <span>{t.heroBtnWash}</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/15 text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block text-sm sm:text-base font-black text-gold-300">100%</span>
                <span className="text-[11px] text-zinc-300 font-semibold">{t.stat1}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gold-400/10 border border-gold-400/30">
                <span className="block text-xs sm:text-sm font-black text-white">
                  <span className="logo-rupes">RUPES</span> &amp;{' '}
                  <span className="logo-meguiars text-gold-300">Meguiar&apos;s</span>
                </span>
                <span className="text-[10px] text-gold-200 font-bold">{t.stat2}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="block text-sm sm:text-base font-black text-white">{t.stat3Title}</span>
                <span className="text-[11px] text-zinc-300 font-semibold">{t.stat3}</span>
              </div>
            </div>
          </div>

          {/* REAL TRANSFORMATION BEFORE/AFTER SLIDER */}
          <div className="lg:col-span-7">
            <BeforeAfterSlider lang={lang} />
          </div>
        </motion.section>

        {/* ATELIER QUALITY STANDARDS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="piano-card rounded-2xl p-5 border border-gold-400/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-gold-300 font-black text-base">
              💎
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {t.guarantee1Title}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t.guarantee1Desc}
            </p>
          </div>

          <div className="piano-card rounded-2xl p-5 border border-white/15 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-base">
              🔬
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {t.guarantee2Title}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t.guarantee2Desc}
            </p>
          </div>

          <div className="piano-card rounded-2xl p-5 border border-emerald-500/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-base">
              🌱
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-300">
              {t.guarantee3Title}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t.guarantee3Desc}
            </p>
          </div>
        </motion.section>

        {/* BRAND CERTIFICATIONS: MEGUIAR'S & RUPES */}
        <BrandCertifications lang={lang} />

        {/* METHODOLOGY: 3 PILLARS */}
        <MethodologyPillars lang={lang} />

        {/* INTERACTIVE CONSOLE / CLINIC */}
        <motion.section
          id="clinic-console"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 pt-4"
        >
          <div className="piano-card rounded-2xl p-1.5 flex gap-1 max-w-xl mx-auto shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTab('scratch')}
              className={`flex-1 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'scratch'
                  ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-black shadow-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <span>🔍</span>
              <span>{t.tabScratchTitle}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-black shadow-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <span>✨</span>
              <span>{t.tabBookingTitle}</span>
            </button>
          </div>

          {activeTab === 'scratch' ? (
            <ScratchDiagnosisForm
              lang={lang}
              onShowToast={showToast}
              onPreviewMedia={(item) => setPreviewMedia(item)}
              onLeadCreated={handleLeadCreated}
            />
          ) : (
            <DryWashBookingForm
              lang={lang}
              onShowToast={showToast}
              onLeadCreated={handleLeadCreated}
            />
          )}
        </motion.section>

        {/* FREQUENTLY ASKED QUESTIONS SECTION */}
        <FaqSection lang={lang} />
      </main>

      {/* FOOTER */}
      <Footer lang={lang} />

      {/* BACKOFFICE MODAL */}
      <BackofficeModal
        isOpen={isBackofficeOpen}
        onClose={() => setIsBackofficeOpen(false)}
        leads={leads}
        onLeadsChange={setLeads}
        onShowToast={showToast}
        onPreviewMedia={(item) => setPreviewMedia(item)}
      />

      {/* LIGHTBOX MODAL */}
      <LightboxModal
        item={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
