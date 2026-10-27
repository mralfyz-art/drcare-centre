import React, { useState } from 'react';
import { Language, TouchZoneKey, CarPartItem } from '../types';
import { CAR_PARTS_CATALOG } from '../data/carCatalog';
import { playAudioRadarChime } from '../services/storage';

interface CarPartSelectorProps {
  selectedPartIds: string[];
  onChangePartIds: (partIds: string[]) => void;
  onSelectPrimaryZone: (zone: TouchZoneKey) => void;
  lang: Language;
}

export const CarPartSelector: React.FC<CarPartSelectorProps> = ({
  selectedPartIds,
  onChangePartIds,
  onSelectPrimaryZone,
  lang
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'front' | 'sides' | 'rear' | 'roof'>('all');

  const filteredParts = CAR_PARTS_CATALOG.filter((part) => {
    if (filterCategory === 'all') return true;
    return part.category === filterCategory;
  });

  const togglePart = (part: CarPartItem) => {
    playAudioRadarChime();

    // If selecting full_body, select it exclusively or toggle
    if (part.id === 'full_body') {
      if (selectedPartIds.includes('full_body')) {
        onChangePartIds([]);
        onSelectPrimaryZone('HOOD');
      } else {
        onChangePartIds(['full_body']);
        onSelectPrimaryZone('FULL_BODY');
      }
      return;
    }

    // If full_body was previously selected and user picks a specific part, remove full_body
    let next = selectedPartIds.filter((id) => id !== 'full_body');

    if (next.includes(part.id)) {
      next = next.filter((id) => id !== part.id);
    } else {
      next = [...next, part.id];
    }

    onChangePartIds(next);

    // Map primary zone for existing diagnostic logic
    if (next.length === 0) {
      onSelectPrimaryZone('HOOD');
    } else {
      const lastPicked = CAR_PARTS_CATALOG.find((p) => p.id === next[next.length - 1]);
      if (lastPicked) {
        onSelectPrimaryZone(lastPicked.zoneKey);
      }
    }
  };

  const handleSelectAll = () => {
    playAudioRadarChime();
    const allSpecific = CAR_PARTS_CATALOG.filter((p) => p.id !== 'full_body').map((p) => p.id);
    onChangePartIds(allSpecific);
    onSelectPrimaryZone('FULL_BODY');
  };

  const handleClear = () => {
    onChangePartIds([]);
    onSelectPrimaryZone('HOOD');
  };

  // Pricing calculations
  const isFullBody = selectedPartIds.includes('full_body');
  const count = selectedPartIds.length;
  const minPrice = isFullBody ? 8500 : count * 1500;
  const maxPrice = isFullBody ? 11500 : count * 2000;

  return (
    <div className="space-y-4">
      {/* FILTER TABS & BULK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-gold-400 text-black shadow-md font-black'
                : 'bg-leather border border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'جميع أجزاء السيارة' : 'All Car Panels'} ({CAR_PARTS_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCategory === 'front'
                ? 'bg-gold-400 text-black shadow-md font-black'
                : 'bg-leather border border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'المقدمة والكبوت' : 'Front End'}
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('sides')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCategory === 'sides'
                ? 'bg-gold-400 text-black shadow-md font-black'
                : 'bg-leather border border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'الأبواب والجوانب' : 'Doors & Sides'}
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('rear')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterCategory === 'rear'
                ? 'bg-gold-400 text-black shadow-md font-black'
                : 'bg-leather border border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'الخلفية والشنطة' : 'Rear End'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] font-bold text-gold-300 hover:text-gold-200 underline cursor-pointer"
          >
            {lang === 'ar' ? 'تحديد جميع الأجزاء' : 'Select All'}
          </button>
          {selectedPartIds.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء التحديد' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* INTERACTIVE CAR PART CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredParts.map((part) => {
          const isSelected = selectedPartIds.includes(part.id);

          return (
            <div
              key={part.id}
              onClick={() => togglePart(part)}
              className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#201c10] to-[#0d0f17] border-gold-400 shadow-[0_0_20px_rgba(245,197,24,0.22)]'
                  : 'bg-leather/90 border-white/10 hover:border-gold-400/40 hover:bg-leather'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{part.icon}</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-black transition ${
                      isSelected
                        ? 'bg-gold-400 border-gold-400 text-black shadow'
                        : 'border-white/20 text-transparent group-hover:border-white/40'
                    }`}
                  >
                    ✓
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-gold-200 transition">
                    {lang === 'ar' ? part.nameAr : part.nameEn}
                  </h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {lang === 'ar' ? part.typicalIssueAr : part.typicalIssueEn}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-mono text-[10px]">
                  {part.id === 'full_body'
                    ? lang === 'ar' ? 'باقة شاملة' : 'Complete Body'
                    : lang === 'ar' ? 'قطعة فردية' : 'Single Panel'}
                </span>
                <span className={`font-bold ${isSelected ? 'text-gold-300' : 'text-zinc-400'}`}>
                  {part.id === 'full_body'
                    ? lang === 'ar' ? 'عرض خاص' : 'Special Concours'
                    : '~1,500 – 2,000 L.E'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DYNAMIC TRANSPARENT PRICE & TIME ESTIMATE CARD */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#1c1910] via-[#0d0f16] to-[#07080c] border border-gold-400/40 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">💰</span>
              <span className="text-xs font-black uppercase tracking-wider text-gold-300">
                {lang === 'ar' ? 'دليل التكلفة الشفافة والحجز المبكر' : 'Transparent Cost Guide & Early Bird Policy'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {lang === 'ar'
                ? 'التكلفة تعتمد دائماً على مدى تأثر طبقة الورنيش، ولكن في الخدوش العميقة تكلفة الجزء المختار تتراوح بين ١٥٠٠ إلى ٢٠٠٠ جنيه مصري.'
                : 'Pricing always depends on how the damage affected your car, but for deep scratches each selected car part costs around 1,500 to 2,000 L.E.'}
            </p>
          </div>

          <div className="bg-black/80 px-4 py-2 rounded-xl border border-gold-400/50 text-end">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
              {lang === 'ar' ? 'التقدير المبدئي للأجزاء المحددة' : 'Estimated Range for Selection'}
            </span>
            <span className="text-base sm:text-lg font-black text-gold-300 font-mono">
              {count === 0 ? '1,500 – 2,000 L.E / Panel' : `${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()} L.E`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-gold-400 font-bold">⏱️ {lang === 'ar' ? 'الوقت المستغرق:' : 'Time:'}</span>
            <span>
              {lang === 'ar'
                ? 'يعتمد على عمق الخدش وعدد الأجزاء، ويُطبق نظام الحجز المبكر (Early Bird).'
                : 'Depends on defect depth, and early bird booking applies.'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="font-bold">🛡️ {lang === 'ar' ? 'قيمة الفابريكا:' : 'Factory Value:'}</span>
            <span>
              {lang === 'ar'
                ? 'حماية ١٠٠٪ لدهان المصنع وتوفير أكثر من ١٥,٠٠٠ ج هبوط بسعر إعادة البيع.'
                : '100% factory paint preserved, avoiding 15,000+ L.E resale depreciation.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
