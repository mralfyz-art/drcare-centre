import React, { useState, useEffect } from 'react';
import { Language, Lead } from '../types';
import { translations } from '../i18n/translations';
import {
  CAR_CATALOG_BY_COUNTRY,
  BODY_TYPES,
  WASH_PACKAGES,
  TIME_SLOTS,
  CAIRO_ZONES
} from '../data/carCatalog';
import { saveLead, playAudioRadarChime, sanitizeWhatsAppNumber, saveFormDraft, getFormDraft } from '../services/storage';

interface DryWashBookingFormProps {
  lang: Language;
  onShowToast: (msg: string, type?: 'gold' | 'success' | 'error') => void;
  onLeadCreated: (lead: Lead) => void;
}

export const DryWashBookingForm: React.FC<DryWashBookingFormProps> = ({
  lang,
  onShowToast,
  onLeadCreated
}) => {
  const t = translations[lang];

  // Tier selection
  const [selectedPkg, setSelectedPkg] = useState<string>('1. Signature Exterior Care');

  // Vehicle config
  const [openSection, setOpenSection] = useState<'type' | 'origin' | 'model' | null>('model');
  const [bodyType, setBodyType] = useState<string>('SUV / 4x4');
  const [country, setCountry] = useState<string>('Germany & Europe');
  const [brand, setBrand] = useState<string>('Mercedes-Benz');
  const [model, setModel] = useState<string>('GLC 300');
  const [year, setYear] = useState<string>('2026');
  const [color, setColor] = useState<string>('Black');

  // Slot & Zone: Friday 3pm-9pm only, Port Said / Nasr City / VIP
  const [daySlot, setDaySlot] = useState<string>('Friday | Slot 1: 03:00 PM - 05:00 PM');
  const [zone, setZone] = useState<string>('Main Centre — Port Said (المركز الرئيسي — بورسعيد)');
  const [gpsLink, setGpsLink] = useState<string>('');
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);

  // Contact
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success Pass
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);

  const isVipSelected = selectedPkg.includes('VIP') || zone.includes('VIP');

  // Restore draft
  useEffect(() => {
    const draft = getFormDraft();
    if (draft && draft.wash) {
      const w = draft.wash as Record<string, string>;
      if (w.selectedPkg) setSelectedPkg(w.selectedPkg);
      if (w.bodyType) setBodyType(w.bodyType);
      if (w.country) setCountry(w.country);
      if (w.brand) setBrand(w.brand);
      if (w.model) setModel(w.model);
      if (w.year) setYear(w.year);
      if (w.color) setColor(w.color);
      if (w.daySlot && w.daySlot.startsWith('Friday')) setDaySlot(w.daySlot);
      if (w.zone) setZone(w.zone);
      if (w.clientName) setClientName(w.clientName);
      if (w.clientPhone) setClientPhone(w.clientPhone);
      if (w.clientAddress) setClientAddress(w.clientAddress);
      if (w.gpsLink) setGpsLink(w.gpsLink);
    }
  }, []);

  // Save draft
  useEffect(() => {
    saveFormDraft({
      wash: {
        selectedPkg, bodyType, country, brand, model, year, color,
        daySlot, zone, clientName, clientPhone, clientAddress, gpsLink
      }
    });
  }, [selectedPkg, bodyType, country, brand, model, year, color, daySlot, zone, clientName, clientPhone, clientAddress, gpsLink]);

  const handleCountryPick = (cKey: string) => {
    setCountry(cKey);
    const brandsObj = CAR_CATALOG_BY_COUNTRY[cKey]?.brands || {};
    const firstBrand = Object.keys(brandsObj)[0] || '';
    setBrand(firstBrand);
    const firstModel = brandsObj[firstBrand]?.[0] || '';
    setModel(firstModel);
  };

  const handleBrandPick = (bName: string) => {
    setBrand(bName);
    const modelsList = CAR_CATALOG_BY_COUNTRY[country]?.brands[bName] || [];
    setModel(modelsList[0] || '');
    setOpenSection('model');
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      onShowToast(lang === 'ar' ? 'المتصفح لا يدعم تحديد الموقع.' : 'Geolocation is not supported by your browser.', 'error');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        setGpsLink(url);
        setIsCapturingGps(false);
        onShowToast(lang === 'ar' ? 'تم تحديد موقعك بدقة بنجاح ✓' : 'Exact GPS Location Locked! ✓', 'success');
      },
      () => {
        setIsCapturingGps(false);
        onShowToast(lang === 'ar' ? 'تعذر التقاط الموقع (يرجى السماح بالصلاحية)' : 'GPS permission denied. Please allow location.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim() || !color.trim()) {
      setOpenSection('model');
      onShowToast(lang === 'ar' ? 'يرجى كتابة موديل ولون السيارة.' : 'Please enter car model and color.', 'error');
      return;
    }

    if (!clientName.trim() || !clientPhone.trim() || !clientAddress.trim()) {
      onShowToast(lang === 'ar' ? 'يرجى استكمال البيانات والعنوان التفصيلي.' : 'Please enter your name, phone, and exact address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const leadId = 'DC-' + Math.floor(1000 + Math.random() * 9000);
      const isVip = selectedPkg.includes('VIP') || zone.includes('VIP');
      const newLead: Lead = {
        id: leadId,
        requestType: 'DRY_WASH',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        carBrand: `${bodyType} • ${country} • ${brand}`,
        carModel: `${model.trim()} (${year} - ${color.trim()})`,
        carColor: selectedPkg,
        zone: zone,
        gpsLink: gpsLink || undefined,
        resolution: isVip ? 'VIP Doorstep / Centre' : 'Centre Studio',
        estimatedQuote: 'Full Advance Booking (24h Refund Policy)',
        notes: `Selected Tier: ${selectedPkg}\nSlot: ${daySlot}\nLocation: ${zone}\nAddress: ${clientAddress.trim()}${gpsLink ? `\nGPS: ${gpsLink}` : ''}\nPolicy: Full Amount Booking | 24h Cancellation Refund`,
        media: [],
        status: 'NEW LIVE',
        createdAt: Date.now(),
        carYear: year,
        timeSlot: daySlot
      };

      await saveLead(newLead);
      playAudioRadarChime();
      setCreatedLead(newLead);
      onLeadCreated(newLead);
      onShowToast(
        lang === 'ar'
          ? 'تم تسجيل حجز يوم الجمعة بنجاح! الموقع الدقيق متوفر بتذكرتك ✓'
          : 'Friday Reservation Confirmed! Direct location unlocked ✓',
        'success'
      );
    } catch {
      onShowToast('Error saving appointment request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const years = [];
  for (let y = 2027; y >= 2000; y--) {
    years.push(String(y));
  }
  years.push('Before 2000');

  const selectedCountryInfo = CAR_CATALOG_BY_COUNTRY[country];
  const brandsList = Object.keys(selectedCountryInfo?.brands || {});
  const popularModels = selectedCountryInfo?.brands[brand] || [];

  return (
    <div className="piano-card-gold rounded-3xl p-5 sm:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-300 block">
            {t.washKicker}
          </span>
          <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5">
            {t.washHeader}
          </h3>
        </div>
        <span className="text-xs bg-gold-400/15 border border-gold-400/40 text-gold-200 px-3 py-1.5 rounded-xl font-bold">
          {t.washNoWaterBadge}
        </span>
      </div>

      {/* POLICY BADGE STRIP: FRIDAY ONLY • FULL BOOKING • 24H CXL REFUND */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-obsidian via-[#17140B] to-obsidian border border-gold-400/35">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-sm">
            🗓️
          </span>
          <div>
            <strong className="block text-xs font-black text-white">
              {lang === 'ar' ? 'الجمعة أسبوعياً فقط' : 'Every Friday Only'}
            </strong>
            <span className="text-[10px] text-gold-300 font-semibold">
              {lang === 'ar' ? 'من ٣:٠٠ عصراً حتى ٩:٠٠ مساءً' : '3:00 PM – 9:00 PM Window'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-sm">
            💳
          </span>
          <div>
            <strong className="block text-xs font-black text-white">
              {lang === 'ar' ? 'حجز بكامل المبلغ' : 'Full Amount Booking'}
            </strong>
            <span className="text-[10px] text-zinc-300">
              {lang === 'ar' ? 'لحجز وتأكيد باية المركز المخصصة' : 'Secures dedicated studio bay'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm">
            🛡️
          </span>
          <div>
            <strong className="block text-xs font-black text-emerald-300">
              {lang === 'ar' ? 'إلغاء واسترداد خلال ٢٤ ساعة' : '24h Full Refund Policy'}
            </strong>
            <span className="text-[10px] text-emerald-200">
              {lang === 'ar' ? 'استرداد كامل ١٠٠٪ قبل الموعد بـ ٢٤ ساعة' : '100% refund up to 24h prior'}
            </span>
          </div>
        </div>
      </div>

      {/* VIP ORDERS DELIVERY CALLOUT */}
      <div className="p-3.5 rounded-2xl bg-gold-400/10 border border-gold-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">👑</span>
          <div>
            <span className="text-xs font-black text-gold-200 block">
              {lang === 'ar' ? 'طلبات VIP: نقوم بتوصيل وتقديم الخدمة في موقعك' : 'VIP Orders: We Deliver Our Services To Your Location'}
            </span>
            <span className="text-[11px] text-zinc-300 block">
              {lang === 'ar'
                ? 'لطلبات الفئة الملكية VIP، ينتقل فريقنا المتخصص لموقع سيارتك أو فيلتك مباشرة.'
                : 'For Royal Atelier VIP orders, our master detailing team travels to your private villa or garage.'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedPkg('3. Royal Atelier VIP Full Protection');
            setZone('VIP Doorstep Delivery — At Your Location (خدمة VIP متنقلة حتى موقعك)');
          }}
          className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-gold-400 text-black hover:bg-gold-300 transition cursor-pointer shrink-0"
        >
          {lang === 'ar' ? 'طلب باقة VIP لموقعي' : 'Select VIP Doorstep'}
        </button>
      </div>

      {/* 3 TIERS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {WASH_PACKAGES.map((pkg) => {
          const isSel = selectedPkg === pkg.name;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg.name)}
              className={`pkg-tier-card cursor-pointer p-5 rounded-2xl bg-black/65 transition space-y-3 flex flex-col justify-between border ${
                isSel
                  ? 'border-2 border-gold-400 shadow-[0_0_28px_rgba(245,197,24,0.3)] bg-gradient-to-br from-gold-400/15 to-black/80'
                  : 'border-white/15 hover:border-gold-400/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-300">
                    {lang === 'ar' ? pkg.tierBadgeAr : pkg.tierBadgeEn}
                  </span>
                  {pkg.badgeEn && (
                    <span className="text-[10px] bg-gold-400 text-black px-2 py-0.5 rounded font-black">
                      {lang === 'ar' ? pkg.badgeAr : pkg.badgeEn}
                    </span>
                  )}
                </div>
                <h4 className={`font-black text-base ${pkg.isVip ? 'gold-luminous' : 'text-white'}`}>
                  {lang === 'ar' ? pkg.titleAr : pkg.titleEn}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {lang === 'ar' ? pkg.descAr : pkg.descEn}
                </p>
                <ul className="text-[11px] text-zinc-200 space-y-1.5 pt-2 border-t border-white/10">
                  {(lang === 'ar' ? pkg.bulletsAr : pkg.bulletsEn).map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gold-300 pt-2">
                {lang === 'ar' ? pkg.selectLabelAr : pkg.selectLabelEn}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 pt-1" noValidate>
        {/* VEHICLE CONFIGURATION */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/55 border border-white/10 space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300 block mb-1">
            {t.step1Title}
          </span>

          {/* Body Type */}
          <div className="rounded-2xl bg-leather border border-white/15 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 'type' ? null : 'type')}
              className={`w-full px-4 py-3 flex items-center justify-between text-start cursor-pointer transition ${
                openSection === 'type' ? 'bg-gradient-to-r from-gold-400/20 to-leather border-b border-gold-400/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-[11px] font-black text-gold-300">
                  01
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                    {t.sideLblType}
                  </span>
                  <strong className="text-xs font-black text-white">{bodyType}</strong>
                </div>
              </div>
              <span className={`text-gold-300 text-xs transition-transform ${openSection === 'type' ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {openSection === 'type' && (
              <div className="p-3 bg-black/70 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {BODY_TYPES.map((bt) => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => {
                      setBodyType(bt.id);
                      setOpenSection('origin');
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      bodyType === bt.id
                        ? 'bg-gold-400/25 border-gold-400 text-white shadow-md'
                        : 'bg-leather border-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span>{bt.icon} </span>
                    <span>{lang === 'ar' ? bt.labelAr : bt.labelEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Origin & Make */}
          <div className="rounded-2xl bg-leather border border-white/15 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 'origin' ? null : 'origin')}
              className={`w-full px-4 py-3 flex items-center justify-between text-start cursor-pointer transition ${
                openSection === 'origin' ? 'bg-gradient-to-r from-gold-400/20 to-leather border-b border-gold-400/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-[11px] font-black text-gold-300">
                  02
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                    {t.sideLblOrigin}
                  </span>
                  <strong className="text-xs font-black text-gold-300">
                    {selectedCountryInfo?.flag} {lang === 'ar' ? selectedCountryInfo?.labelAr : selectedCountryInfo?.labelEn} • {brand}
                  </strong>
                </div>
              </div>
              <span className={`text-gold-300 text-xs transition-transform ${openSection === 'origin' ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {openSection === 'origin' && (
              <div className="p-3.5 bg-black/75 border-t border-white/10 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.keys(CAR_CATALOG_BY_COUNTRY).map((cKey) => {
                    const cObj = CAR_CATALOG_BY_COUNTRY[cKey];
                    const isSel = cKey === country;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => handleCountryPick(cKey)}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                          isSel
                            ? 'bg-gold-400/25 border-gold-400 text-white shadow-md'
                            : 'bg-leather border-white/10 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <span>{cObj.flag}</span>
                        <span className="truncate">{lang === 'ar' ? cObj.labelAr : cObj.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 pt-2 border-t border-white/10">
                  {brandsList.map((bName) => (
                    <button
                      key={bName}
                      type="button"
                      onClick={() => handleBrandPick(bName)}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold truncate text-center cursor-pointer transition ${
                        bName === brand
                          ? 'bg-gold-400/25 border-gold-400 text-white shadow-md'
                          : 'bg-leather border-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {bName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Model, Year, Color */}
          <div className="rounded-2xl bg-leather border border-white/15 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 'model' ? null : 'model')}
              className={`w-full px-4 py-3 flex items-center justify-between text-start cursor-pointer transition ${
                openSection === 'model' ? 'bg-gradient-to-r from-gold-400/20 to-leather border-b border-gold-400/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-[11px] font-black text-gold-300">
                  03
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                    {t.sideLblModelYear}
                  </span>
                  <strong className="text-xs font-black text-white">
                    {model ? `${model} • ${year}` : `${t.phWashCarModel} • ${year}`}
                  </strong>
                </div>
              </div>
              <span className={`text-gold-300 text-xs transition-transform ${openSection === 'model' ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {openSection === 'model' && (
              <div className="p-3.5 bg-black/75 border-t border-white/10 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {popularModels.map((mName) => (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => setModel(mName === 'Custom Model' ? '' : mName)}
                      className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                        model === mName
                          ? 'bg-gold-400/25 border-gold-400 text-white shadow-md'
                          : 'bg-leather border-white/15 text-zinc-200 hover:border-gold-400'
                      }`}
                    >
                      {mName}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    maxLength={40}
                    placeholder={t.phWashCarModel}
                    className="px-3.5 py-2.5 rounded-xl bg-leather border border-gold-400/40 text-white text-xs font-bold focus:outline-none focus:border-gold-400"
                  />
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-leather border border-white/15 text-gold-200 text-xs font-extrabold focus:outline-none focus:border-gold-400"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    maxLength={30}
                    placeholder={t.phWashCarColor}
                    className="px-3.5 py-2.5 rounded-xl bg-leather border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DAY SLOT & LOCATION (PORT SAID / NASR CITY / VIP) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-zinc-300 font-semibold mb-1">
              {t.lblSelectHourSlot}
            </label>
            <select
              value={daySlot}
              onChange={(e) => setDaySlot(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-leather border border-gold-400/40 text-gold-200 text-xs font-bold focus:border-gold-400 focus:outline-none"
            >
              {TIME_SLOTS.map((slotGroup) => (
                <optgroup key={slotGroup.dayEn} label={lang === 'ar' ? slotGroup.dayAr : slotGroup.dayEn}>
                  {slotGroup.options.map((opt) => (
                    <option key={opt.val} value={opt.val}>
                      {lang === 'ar' ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="text-[10px] text-gold-300/90 font-medium block mt-1">
              {lang === 'ar'
                ? '⚡ جلسات النانو أسبوعياً كل جمعة فقط (٣:٠٠ م – ٩:٠٠ م) لحجز باية الاستوديو المخصصة'
                : '⚡ Weekly Friday sessions (3:00 PM – 9:00 PM) with dedicated studio bay time.'}
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-300 font-semibold mb-1">
              {t.lblSelectWashZone}
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-leather border border-gold-400/40 text-white text-xs font-bold focus:border-gold-400 focus:outline-none"
            >
              {CAIRO_ZONES.map((z) => (
                <option key={z.value} value={z.value}>
                  {lang === 'ar' ? z.labelAr : z.labelEn}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-zinc-400 block mt-1">
              {lang === 'ar'
                ? '📍 المركز الرئيسي ببورسعيد أو فرع مدينة نصر — احجز لاستلام رابط الموقع وخريطة الوصول بسهولة'
                : '📍 Port Said Main Centre or Nasr City Branch — Book to receive direct GPS directions easily.'}
            </span>
          </div>
        </div>

        {/* VIP ORDERS DOORSTEP LOCATION PIN (IF VIP SELECTED) */}
        {isVipSelected && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-400/15 via-[#1B170B] to-black border border-gold-400/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">👑</span>
                <span className="text-xs font-black text-gold-200">
                  {lang === 'ar' ? 'خدمة VIP متنقلة حتى موقعك' : 'VIP Mobile Unit: Direct Doorstep Execution'}
                </span>
              </div>
              <span className="text-[10px] bg-gold-400 text-black px-2 py-0.5 rounded font-black">
                VIP ONLY
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {lang === 'ar'
                ? 'لطلبات VIP الملكية، ننتقل بكامل أجهزتنا المعتمدة (RUPES & Meguiar\'s) حتى فيلتك أو موقعك الخاص لتنفيذ المعالجة بأعلى درجات الرفاهية.'
                : 'For Royal Atelier VIP orders, our certified mobile studio arrives equipped with Italian RUPES BigFoot polishers directly at your villa, residence, or private garage.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="px-4 py-2 rounded-xl bg-gold-400 text-black hover:bg-gold-300 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <span>📍</span>
                <span>
                  {isCapturingGps
                    ? (lang === 'ar' ? 'جاري التقاط الإحداثيات...' : 'Locating GPS...')
                    : (gpsLink ? (lang === 'ar' ? 'تم قفل الموقع بالـ GPS ✓' : 'GPS Pin Locked ✓') : (lang === 'ar' ? 'تحديد إحداثيات موقعي الآن' : 'Pin My Location via GPS'))}
                </span>
              </button>
              {gpsLink && (
                <span className="text-[11px] text-emerald-400 font-bold truncate max-w-xs">
                  {lang === 'ar' ? 'تم تسجيل الإحداثيات' : 'Coordinates attached'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* APPOINTMENT & CONTACT NOTICE */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300">
            {t.step4Title}
          </span>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            <span className="px-2.5 py-1 rounded-lg bg-gold-400/10 border border-gold-400/30 text-gold-300">
              {lang === 'ar' ? 'المركز الرئيسي: بورسعيد' : 'Main: Port Said'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">
              {lang === 'ar' ? 'فرع القاهرة: مدينة نصر' : 'Cairo: Nasr City'}
            </span>
          </div>
        </div>

        {/* CONTACT INPUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            maxLength={60}
            placeholder={t.phWashName}
            className="px-4 py-3 rounded-xl bg-leather border border-white/15 text-white text-xs font-bold focus:border-gold-400 focus:outline-none"
          />
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            maxLength={20}
            placeholder={t.phClientPhone}
            dir="ltr"
            className="px-4 py-3 rounded-xl bg-leather border border-white/15 text-white text-xs font-bold focus:border-gold-400 focus:outline-none"
          />
          <input
            type="text"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            maxLength={200}
            placeholder={t.phWashAddress}
            className="px-4 py-3 rounded-xl bg-leather border border-white/15 text-white text-xs font-bold focus:border-gold-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-gold-elite py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base cursor-pointer"
        >
          {isSubmitting ? (lang === 'ar' ? 'جاري التأكيد...' : 'Confirming...') : t.btnConfirmWash}
        </button>
      </form>

      {/* SUCCESS PASS WITH INSTANT LOCATION ACCESS */}
      {createdLead && (
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#161512] via-[#090A0D] to-black border-2 border-gold-400/60 text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-300 text-[10px] font-black uppercase tracking-[0.2em]">
            DR. CARE PASS • FRIDAY STUDIO BAY
          </div>
          <h4 className="text-base sm:text-lg font-black text-white">
            {t.washSuccessTitle}
          </h4>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-gold-400/30">
              <span className="text-xs text-zinc-400 block">Pass ID:</span>
              <strong className="font-mono text-sm text-gold-300">{createdLead.id}</strong>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-gold-400/10 border border-gold-400/30">
              <span className="text-xs text-gold-200 block">Scheduled Window:</span>
              <strong className="font-mono text-xs text-white">{createdLead.timeSlot}</strong>
            </div>
          </div>

          <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'تم تسجيل طلب حجز يوم الجمعة بنجاح وتجهيز الباية. إليك رابط الموقع المباشر للوصول إلينا بسهولة:'
              : 'Your Friday session has been booked. You can access the centre location and GPS directions below:'}
          </p>

          {/* INSTANT LOCATION ACCESS BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={
                createdLead.zone.includes('Port Said') || createdLead.zone.includes('بورسعيد')
                  ? 'https://www.google.com/maps/search/?api=1&query=Dr+Care+Port+Said+Egypt'
                  : createdLead.zone.includes('Nasr City') || createdLead.zone.includes('مدينة نصر')
                  ? 'https://www.google.com/maps/search/?api=1&query=Dr+Care+Nasr+City+Cairo'
                  : (createdLead.gpsLink || 'https://www.google.com/maps')
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-300 to-gold-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg hover:shadow-gold-400/30 transition cursor-pointer"
            >
              <span>📍</span>
              <span>
                {createdLead.zone.includes('VIP')
                  ? (lang === 'ar' ? 'عرض موقع التوصيل لـ VIP' : 'View Pinned VIP Location')
                  : (lang === 'ar' ? 'فتح موقع المركز على خرائط جوجل' : 'Open Location in Google Maps')}
              </span>
            </a>

            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200 font-bold flex items-center gap-2">
              <span>🛡️</span>
              <span>
                {lang === 'ar'
                  ? 'سياسة استرداد كامل ١٠٠٪ خلال ٢٤ ساعة نشطة'
                  : '100% Refund Policy Active (24h Cancellation)'}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-zinc-400 flex flex-wrap items-center justify-center gap-2 font-semibold">
            <span>✓ {lang === 'ar' ? 'جلسات الجمعة (٣م - ٩م)' : 'Friday Only (3PM - 9PM)'}</span>
            <span>•</span>
            <span>✓ {lang === 'ar' ? 'بورسعيد & مدينة نصر' : 'Port Said & Nasr City'}</span>
            <span>•</span>
            <span>✓ {lang === 'ar' ? 'توصيل لموقعك لطلبات VIP' : 'VIP Doorstep Execution'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
