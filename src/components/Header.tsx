import React, { useRef, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from '../services/firebase';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenBackoffice: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onToggleLang, onOpenBackoffice }) => {
  const t = translations[lang];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const holdTimerRef = useRef<number | null>(null);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const startHold = () => {
    clearHold();
    holdTimerRef.current = window.setTimeout(() => {
      onOpenBackoffice();
    }, 3000);
  };

  const clearHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      onOpenBackoffice();
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  const isAdmin = currentUser?.email === 'mr.alfyz@gmail.com';

  return (
    <>
      {/* TOP PRIVATE ANNOUNCEMENT BAR */}
      <div className="bg-obsidian border-b border-white/10 py-2 px-4 text-[11px]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-start">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 font-semibold tracking-wide">
              {t.topBarLive}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gold-300 font-bold tracking-wider uppercase text-[10px] sm:text-[11px]">
              {t.topBarDays}
            </span>
          </div>
        </div>
      </div>

      {/* STICKY HEADER WITH AUTHENTIC GOLD FINGERPRINT LOGO */}
      <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={clearHold}
            onMouseLeave={clearHold}
            onTouchStart={startHold}
            onTouchEnd={clearHold}
            onClick={handleLogoClick}
            className="flex items-center gap-3.5 group select-none text-start cursor-pointer focus:outline-none"
            title="DR. CARE Paint Restoration Centre (Staff: Hold 3s or Tap 5x for CRM Vault)"
          >
            {/* REAL EMBOSSED GOLD FINGERPRINT LOGO */}
            <div className="relative w-12 h-12 rounded-2xl bg-leather border border-gold-400/60 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_22px_rgba(245,197,24,0.35)] group-hover:border-gold-400 transition-all duration-300">
              <img
                src="/logo.jpg"
                alt="DR. CARE Gold Fingerprint"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-black tracking-[0.2em] gold-luminous block leading-none">
                DR. CARE
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-gold-200 font-bold block mt-1">
                {t.brandSlogan}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#clinic-console"
              className="hidden md:inline-flex px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 hover:text-gold-300 transition"
            >
              {t.navDiagnose}
            </a>

            <a
              href="#faq-section"
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 hover:text-gold-300 transition"
            >
              {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
            </a>

            {/* GOOGLE SIGN IN / USER PROFILE */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onOpenBackoffice}
                    className="px-2.5 py-1.5 rounded-lg bg-gold-400/20 border border-gold-400/50 text-[11px] font-black text-gold-300 hover:bg-gold-400/30 transition cursor-pointer"
                    title="Open Backoffice Vault"
                  >
                    👑 CRM
                  </button>
                )}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'VIP Client'}
                      className="w-6 h-6 rounded-full border border-gold-400"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-gold-400 text-black font-black text-xs flex items-center justify-center">
                      {(currentUser.displayName || 'U')[0]}
                    </span>
                  )}
                  <span className="hidden xl:inline text-xs font-semibold text-zinc-200 max-w-[90px] truncate">
                    {currentUser.displayName?.split(' ')?.[0] || 'Client'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-[10px] text-zinc-400 hover:text-rose-400 font-bold px-1 py-0.5 cursor-pointer"
                    title={lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Google</span>
                <span>{lang === 'ar' ? 'دخول' : 'Sign In'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleLang}
              className="px-3.5 py-2 rounded-xl bg-gold-400/10 hover:bg-gold-400/20 border border-gold-400/40 text-xs font-extrabold text-gold-300 transition cursor-pointer"
            >
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
