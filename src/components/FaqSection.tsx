import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Language } from '../types';
import { FAQ_ITEMS } from '../data/carCatalog';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string>('faq-who');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      id="faq-section"
      className="space-y-6 pt-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* SECTION HEADER */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-black uppercase tracking-widest">
          {lang === 'ar' ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
          {lang === 'ar' ? 'كل ما تحتاج معرفته عن دكتور كير' : 'Everything You Need To Know About Dr. Care'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300">
          {lang === 'ar'
            ? 'إجابات مباشرة وشفافة حول خبرتنا، تكلفة إصلاح الخدوش، مواعيد الحجز، وموقع المركز.'
            : 'Clear, transparent answers regarding our experience, pricing per part, turnaround, and centre appointments.'}
        </p>
      </div>

      {/* TRUST METRICS BANNER WITH STAGGER */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-leather/80 border border-gold-400/30 text-center space-y-1 shadow-lg"
        >
          <span className="block text-2xl font-black text-gold-300 font-serif">8+ Years</span>
          <span className="text-xs font-bold text-white block">
            {lang === 'ar' ? 'خبرة متخصصة بالدهان' : 'Paint Restoration Mastery'}
          </span>
          <span className="text-[10px] text-zinc-400 block">
            {lang === 'ar' ? 'منذ عام ٢٠١٦' : 'Dedicated craft since 2016'}
          </span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-leather/80 border border-white/15 text-center space-y-1 shadow-lg"
        >
          <span className="block text-2xl font-black text-white font-serif">200+</span>
          <span className="text-xs font-bold text-white block">
            {lang === 'ar' ? 'عميل تم خدمتهم بنجاح' : 'Clients & Vehicles Restored'}
          </span>
          <span className="text-[10px] text-zinc-400 block">
            {lang === 'ar' ? 'مختلف حالات الخدوش والدهان' : 'Across diverse defect scenarios'}
          </span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-leather/80 border border-emerald-500/30 text-center space-y-1 shadow-lg"
        >
          <span className="block text-2xl font-black text-emerald-300 font-serif">100%</span>
          <span className="text-xs font-bold text-emerald-300 block">
            {lang === 'ar' ? 'فابريكا بدون رش' : 'Factory Paint Preserved'}
          </span>
          <span className="text-[10px] text-zinc-400 block">
            {lang === 'ar' ? 'حماية تامة لقيمة السيارة' : 'Zero resale depreciation'}
          </span>
        </motion.div>
      </motion.div>

      {/* ACCORDION FAQ ITEMS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="space-y-3 max-w-4xl mx-auto"
      >
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-gradient-to-r from-[#19160e] via-[#0e1017] to-leather border-gold-400/50 shadow-xl'
                  : 'bg-leather/90 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(item.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-sm shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {lang === 'ar' ? item.qAr : item.qEn}
                  </span>
                </div>
                <span
                  className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-gold-300 font-bold transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-gold-400 text-black border-gold-400' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/10">
                      <p className="mt-2 text-zinc-200">
                        {lang === 'ar' ? item.aAr : item.aEn}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
};
