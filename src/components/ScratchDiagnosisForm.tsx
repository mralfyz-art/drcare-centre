import React, { useState, useEffect, useRef } from 'react';
import { Language, Lead, MediaItem, TouchZoneKey, DefectPin } from '../types';
import { translations } from '../i18n/translations';
import {
  CAR_CATALOG_BY_COUNTRY,
  BODY_TYPES,
  TOUCH_ZONES,
  DEFECT_SEVERITIES,
  PRESET_COLORS,
  CAIRO_ZONES,
  CAR_PARTS_CATALOG
} from '../data/carCatalog';
import { saveLead, playAudioRadarChime, sanitizeWhatsAppNumber, saveFormDraft, getFormDraft } from '../services/storage';
import { CarPartSelector } from './CarPartSelector';

interface ScratchDiagnosisFormProps {
  lang: Language;
  onShowToast: (msg: string, type?: 'gold' | 'success' | 'error') => void;
  onPreviewMedia: (item: MediaItem) => void;
  onLeadCreated: (lead: Lead) => void;
}

export const ScratchDiagnosisForm: React.FC<ScratchDiagnosisFormProps> = ({
  lang,
  onShowToast,
  onPreviewMedia,
  onLeadCreated
}) => {
  const t = translations[lang];

  // Form State
  const [openSection, setOpenSection] = useState<'type' | 'origin' | 'model' | null>('model');
  const [bodyType, setBodyType] = useState<string>('SUV / 4x4');
  const [country, setCountry] = useState<string>('Germany & Europe');
  const [brand, setBrand] = useState<string>('Mercedes-Benz');
  const [model, setModel] = useState<string>('S-Class');
  const [year, setYear] = useState<string>('2026');
  const [zone, setZone] = useState<string>('Main Centre — Port Said (المركز الرئيسي — بورسعيد)');
  const [color, setColor] = useState<string>('Obsidian Black (أسود)');
  const [customColorHex, setCustomColorHex] = useState<string>('#08080A');

  // Severity & Parts Selection
  const [defectSeverity, setDefectSeverity] = useState<string>('Swirl Marks & Oxidation — دوائر غسيل وبهتان');
  const [touchZoneKey, setTouchZoneKey] = useState<TouchZoneKey>('HOOD');
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(['hood']);
  const [defectPins, setDefectPins] = useState<DefectPin[]>([]);

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [resolution, setResolution] = useState<number>(1080);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessingMedia, setIsProcessingMedia] = useState<boolean>(false);
  const [clientNotes, setClientNotes] = useState<string>('');

  // Contact & GPS
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [gpsLink, setGpsLink] = useState<string>('');
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success Pass
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore draft on mount
  useEffect(() => {
    const draft = getFormDraft();
    if (draft && draft.scratch) {
      const s = draft.scratch as Record<string, string>;
      if (s.bodyType) setBodyType(s.bodyType);
      if (s.country) setCountry(s.country);
      if (s.brand) setBrand(s.brand);
      if (s.model) setModel(s.model);
      if (s.year) setYear(s.year);
      if (s.zone) setZone(s.zone);
      if (s.color) setColor(s.color);
      if (s.defectSeverity) setDefectSeverity(s.defectSeverity);
      if (s.touchZoneKey) setTouchZoneKey(s.touchZoneKey as TouchZoneKey);
      if (s.clientName) setClientName(s.clientName);
      if (s.clientPhone) setClientPhone(s.clientPhone);
      if (s.gpsLink) setGpsLink(s.gpsLink);
      if (s.clientNotes) setClientNotes(s.clientNotes);
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    saveFormDraft({
      scratch: {
        bodyType, country, brand, model, year, zone, color,
        defectSeverity, touchZoneKey, clientName, clientPhone,
        gpsLink, clientNotes
      }
    });
  }, [bodyType, country, brand, model, year, zone, color, defectSeverity, touchZoneKey, clientName, clientPhone, gpsLink, clientNotes]);

  // Handle Country Pick
  const handleCountryPick = (cKey: string) => {
    setCountry(cKey);
    const brandsObj = CAR_CATALOG_BY_COUNTRY[cKey]?.brands || {};
    const firstBrand = Object.keys(brandsObj)[0] || '';
    setBrand(firstBrand);
    const firstModel = brandsObj[firstBrand]?.[0] || '';
    setModel(firstModel);
  };

  // Handle Brand Pick
  const handleBrandPick = (bName: string) => {
    setBrand(bName);
    const modelsList = CAR_CATALOG_BY_COUNTRY[country]?.brands[bName] || [];
    setModel(modelsList[0] || '');
    setOpenSection('model');
  };

  // GPS Pin Capture
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
        onShowToast(lang === 'ar' ? 'تم تحديد إحداثيات موقع السيارة بنجاح ✓' : 'Exact GPS Parking Pin Locked! ✓', 'success');
      },
      () => {
        setIsCapturingGps(false);
        onShowToast(lang === 'ar' ? 'تعذر التقاط الموقع (يرجى السماح بالصلاحية)' : 'GPS permission denied. Please enable location.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Image resize and multi-select handling
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (mediaItems.length >= 10) {
      onShowToast(lang === 'ar' ? 'الحد الأقصى هو ١٠ صور لكل طلب.' : 'Maximum 10 photos allowed per request.', 'error');
      return;
    }

    setIsProcessingMedia(true);
    setUploadProgress(15);

    try {
      const newItems: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        if (mediaItems.length + newItems.length >= 10) break;
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await resizeImageSmart(file, resolution, 0.85);
        const cloudSafe = await resizeImageSmart(file, 640, 0.65);

        if (dataUrl) {
          newItems.push({
            id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            type: 'image',
            url: dataUrl,
            cloudSafeUrl: cloudSafe,
            resolution: `${resolution}p`
          });
        }
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setMediaItems((prev) => [...prev, ...newItems]);
      onShowToast(
        lang === 'ar' ? `تم تجهيز ${newItems.length} صورة بنجاح ✓` : `${newItems.length} photos ready for inspection ✓`,
        'gold'
      );
    } catch {
      onShowToast(lang === 'ar' ? 'حدث خطأ أثناء معالجة الصور' : 'Error processing photos', 'error');
    } finally {
      setIsProcessingMedia(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const resizeImageSmart = (file: File, maxHeight: number, initialQuality: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL('image/webp', initialQuality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', initialQuality);
          }
          resolve(dataUrl);
        };
        img.onerror = () => resolve('');
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim()) {
      setOpenSection('model');
      onShowToast(lang === 'ar' ? 'يرجى اختيار أو كتابة موديل السيارة.' : 'Please select or enter your car model.', 'error');
      return;
    }

    if (mediaItems.length === 0) {
      onShowToast(lang === 'ar' ? 'يرجى إرفاق صورة واحدة على الأقل لمكان الخدش.' : 'Please attach at least 1 photo.', 'error');
      return;
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      onShowToast(lang === 'ar' ? 'يرجى كتابة الاسم ورقم الموبايل / واتساب.' : 'Please enter your name and phone number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const leadId = 'DC-' + Math.floor(1000 + Math.random() * 9000);
      const selectedPartNames = selectedPartIds.map((id) => {
        const p = CAR_PARTS_CATALOG.find((item) => item.id === id);
        return p ? (lang === 'ar' ? p.nameAr : p.nameEn) : id;
      });
      const isFullBody = selectedPartIds.includes('full_body');
      const count = selectedPartIds.length;
      const minPrice = isFullBody ? 8500 : Math.max(1500, count * 1500);
      const maxPrice = isFullBody ? 11500 : Math.max(2000, count * 2000);
      const quoteString = `${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()} L.E`;

      const newLead: Lead = {
        id: leadId,
        requestType: 'SCRATCH_DIAGNOSIS',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        carBrand: `${bodyType} • ${country} • ${brand}`,
        carModel: `${model.trim()} • ${year}`,
        carColor: color || 'Obsidian Black',
        zone: zone,
        gpsLink: undefined,
        resolution: `${resolution}p Master HD`,
        estimatedQuote: quoteString,
        notes: `Selected Parts (${selectedPartIds.length}): ${selectedPartNames.join(', ')}\nEstimated Cost Guide: ${quoteString} (Typical ~1,500 - 2,000 L.E / panel)\nDefect Severity: ${defectSeverity}\nEarly Bird Centre Window: ${zone}${clientNotes ? '\nNote: ' + clientNotes : ''}`,
        media: mediaItems,
        status: 'NEW LIVE',
        createdAt: Date.now(),
        selectedCarParts: selectedPartNames,
        carYear: year,
        timeSlot: zone
      };

      await saveLead(newLead);
      playAudioRadarChime();
      setCreatedLead(newLead);
      onLeadCreated(newLead);
      onShowToast(lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Consultation submitted successfully!', 'success');
    } catch {
      onShowToast('Error submitting consultation request', 'error');
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
      {/* FORM HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-300 block">
            {t.scratchFormHeader}
          </span>
          <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5">
            {t.tabScratchTitle}
          </h3>
          <p className="text-xs text-zinc-300 mt-1">
            {t.consoleSub}
          </p>
        </div>
        <span className="text-xs bg-gold-400/15 border border-gold-400/40 text-gold-200 px-3.5 py-1.5 rounded-xl font-bold">
          {bodyType} • {brand} ({model} {year})
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* STEP 1: VEHICLE CONFIGURATION */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/55 border border-white/10 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300 block mb-1">
            {t.step1Title}
          </span>

          {/* 1.1 BODY TYPE */}
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

          {/* 1.2 ORIGIN & MAKE */}
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
                {/* Country Pills */}
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
                {/* Brand Pills */}
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

          {/* 1.3 MODEL, YEAR & COLOR */}
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
                    {model ? `${model} • ${year}` : `${t.phModel} • ${year}`}
                  </strong>
                </div>
              </div>
              <span className={`text-gold-300 text-xs transition-transform ${openSection === 'model' ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {openSection === 'model' && (
              <div className="p-3.5 bg-black/75 border-t border-white/10 space-y-3">
                {/* Quick Model Pills */}
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
                    placeholder={t.phModel}
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
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-leather border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-gold-400"
                  >
                    {CAIRO_ZONES.map((z) => (
                      <option key={z.value} value={z.value}>
                        {lang === 'ar' ? z.labelAr : z.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 1.4 COLOR PICKER */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-[11px] text-zinc-300 font-bold mb-2">
              {t.lblColorPick}
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <label
                className="relative w-8 h-8 rounded-full overflow-hidden border border-gold-400 shrink-0 cursor-pointer flex items-center justify-center shadow"
                title="Custom Color Wheel"
              >
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => {
                    setCustomColorHex(e.target.value);
                    setColor(`Custom Shade (${e.target.value.toUpperCase()})`);
                  }}
                  className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                />
                <span
                  className="w-full h-full block"
                  style={{ backgroundColor: customColorHex }}
                />
                <span className="absolute text-[8px] font-black text-white bg-black/40 px-1 rounded">+</span>
              </label>

              {PRESET_COLORS.map((pc) => (
                <button
                  key={pc.hex}
                  type="button"
                  onClick={() => {
                    setCustomColorHex(pc.hex);
                    setColor(pc.name);
                  }}
                  style={{ backgroundColor: pc.hex }}
                  className="w-6 h-6 paint-sphere border border-white/30 cursor-pointer"
                  title={pc.name}
                />
              ))}

              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                maxLength={60}
                className="flex-1 min-w-[160px] px-3.5 py-2 rounded-xl bg-leather border border-white/15 text-gold-200 text-xs font-bold focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* STEP 2: CAR PART SELECTOR */}
        <div className="p-4 sm:p-6 rounded-2xl bg-black/55 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300 block">
                {t.step2Title}
              </span>
              <span className="text-[11px] text-zinc-300">
                {t.sim360Sub}
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-black bg-gold-400 px-3 py-1 rounded-full shadow">
              {selectedPartIds.length} {lang === 'ar' ? 'أجزاء محددة' : 'Panels Selected'}
            </span>
          </div>

          {/* INTERACTIVE VEHICLE PART SELECTOR */}
          <CarPartSelector
            selectedPartIds={selectedPartIds}
            onChangePartIds={setSelectedPartIds}
            onSelectPrimaryZone={setTouchZoneKey}
            lang={lang}
          />

          {/* Defect Severity Selector */}
          <div className="pt-2 border-t border-white/10">
            <span className="block text-xs font-bold text-zinc-300 mb-2">
              {lang === 'ar' ? 'طبيعة وعمق الخدوش في الأجزاء المختارة:' : 'Defect severity & clear-coat depth:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEFECT_SEVERITIES.map((sev) => {
                const isSel = defectSeverity === sev.value;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setDefectSeverity(sev.value)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                      isSel
                        ? 'bg-gold-400/25 border-gold-400 text-white shadow-md'
                        : 'bg-leather border-white/15 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-extrabold">
                      {lang === 'ar' ? sev.titleAr : sev.titleEn}
                    </span>
                    <span className="block text-[10px] text-zinc-400 mt-0.5">
                      {lang === 'ar' ? sev.subAr : sev.subEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 3: UPLOAD PHOTOS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300 block">
                {t.step3Title}
              </span>
              <span className="text-[11px] text-zinc-300">
                {t.photoTipText}
              </span>
            </div>
            <select
              value={resolution}
              onChange={(e) => setResolution(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 rounded-lg bg-leather border border-white/15 text-gold-200 text-[11px] font-bold focus:outline-none"
            >
              <option value={1080}>1080p Master HD</option>
              <option value={720}>720p Fast Sync</option>
            </select>
          </div>

          {/* Multi-photo Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-gold-400/45 hover:border-gold-400 bg-white/[0.02] hover:bg-gold-400/[0.05] p-6 text-center transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <div className="w-11 h-11 rounded-2xl bg-gold-400/15 border border-gold-400/40 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition text-xl">
              📸
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-white">
              {t.dropzoneTitle}
            </p>
            <span className="text-[11px] text-gold-300 font-semibold block mt-1">
              {resolution}p Master HD • Multi-Selection Active
            </span>
          </div>

          {/* Processing Progress */}
          {isProcessingMedia && (
            <div className="p-3 rounded-xl bg-leather border border-gold-400/30 text-xs text-gold-200 space-y-1.5">
              <div className="flex justify-between">
                <span>Optimizing optical clarity...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-gold-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Thumbnail Grid */}
          {mediaItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gold-300">
                  {lang === 'ar' ? `تم إرفاق ${mediaItems.length} من ١٠ صور` : `${mediaItems.length} / 10 Photos Attached`}
                </span>
                <button
                  type="button"
                  onClick={() => setMediaItems([])}
                  className="text-rose-400 text-xs font-bold cursor-pointer hover:underline"
                >
                  {t.btnClearAll}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {mediaItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden bg-leather border border-gold-400/40 aspect-square shadow-md"
                  >
                    <img
                      src={item.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                      onClick={() => onPreviewMedia(item)}
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 text-gold-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMediaItem(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer hover:bg-rose-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            rows={2}
            maxLength={400}
            placeholder={t.phClientNoteBox}
            className="w-full px-3.5 py-2.5 rounded-xl bg-leather border border-white/15 focus:border-gold-400 text-xs text-white focus:outline-none"
          />
        </div>

        {/* STEP 4: CONTACT & LOCATION SELECTION */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
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

          <div>
            <label className="block text-[11px] text-zinc-300 font-semibold mb-1">
              {t.lblZoneSelect}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              maxLength={60}
              placeholder={t.phClientName}
              className="w-full px-4 py-3 rounded-xl bg-leather border border-white/15 focus:border-gold-400 text-white text-sm focus:outline-none"
            />
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              maxLength={20}
              placeholder={t.phClientPhone}
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl bg-leather border border-white/15 focus:border-gold-400 text-white text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-gold-elite py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t.submitScratchBtnText}</span>
            <span>→</span>
          </button>
        </div>
      </form>

      {/* SUCCESS BANNER WITH MAPS DIRECTIONS */}
      {createdLead && (
        <div className="mt-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#161512] via-[#090A0D] to-black border-2 border-gold-400/60 text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-300 text-[10px] font-black uppercase tracking-[0.2em]">
            DR. CARE RESTORATION CENTRE PASS
          </div>
          <h4 className="text-lg sm:text-xl font-black text-white">
            {t.successHeader}
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-gold-400/30">
              <span className="text-xs text-zinc-400 block">{lang === 'ar' ? 'رقم التذكرة:' : 'Pass ID:'}</span>
              <strong className="font-mono text-base text-gold-300">{createdLead.id}</strong>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gold-400/10 border border-gold-400/40">
              <span className="text-xs text-gold-200 block">{lang === 'ar' ? 'التقدير المبدئي الشفاف:' : 'Transparent Cost Guide:'}</span>
              <strong className="font-mono text-base text-gold-300">{createdLead.estimatedQuote}</strong>
            </div>
          </div>
          <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'تم تسجيل طلبك وحفظ بيانات الأجزاء المحددة. سيتواصل معك فني المركز المتخصص عبر رقم هاتفك لتنسيق موعد الفحص وتخصيص باية العمل لسيارتك في استوديو دكتور كير.'
              : 'Your request and selected panels have been recorded. Our master technician will contact your mobile to schedule your dedicated studio bay at Dr. Care Centre.'}
          </p>

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
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-400 font-semibold">
            <span>✓ {lang === 'ar' ? 'المركز الرئيسي ببورسعيد' : 'Main: Port Said'}</span>
            <span>•</span>
            <span>✓ {lang === 'ar' ? 'فرع مدينة نصر بالقاهرة' : 'Nasr City Branch'}</span>
            <span>•</span>
            <span>✓ {lang === 'ar' ? 'توصيل لموقعك لطلبات VIP' : 'VIP Doorstep Execution'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
