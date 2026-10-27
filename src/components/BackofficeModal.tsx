import React, { useState, useEffect } from 'react';
import { Lead, MediaItem } from '../types';
import {
  saveLead,
  markLeadDeleted,
  formatElapsedSeconds,
  sanitizeWhatsAppNumber,
  exportLeadsToCsv,
  generateVipCertificateDataUrl,
  playAudioRadarChime
} from '../services/storage';

interface BackofficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
  onShowToast: (msg: string, type?: 'gold' | 'success' | 'error') => void;
  onPreviewMedia: (item: MediaItem) => void;
}

export const BackofficeModal: React.FC<BackofficeModalProps> = ({
  isOpen,
  onClose,
  leads,
  onLeadsChange,
  onShowToast,
  onPreviewMedia
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('drcare_crm_unlocked') === 'true';
  });
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // Time & Uptime
  const [cairoTime, setCairoTime] = useState<string>('');
  const [uptimeSec, setUptimeSec] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showCloudRules, setShowCloudRules] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Quotes being edited
  const [quotes, setQuotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCairoTime(now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo' }));
      setUptimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleUnlock = () => {
    const cleanPin = pin.trim();
    if (cleanPin === '2026' || cleanPin === '2027') {
      setIsUnlocked(true);
      sessionStorage.setItem('drcare_crm_unlocked', 'true');
      setPinError(false);
      onShowToast('Executive Access Granted', 'success');
    } else {
      setPinError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('drcare_crm_unlocked');
    setIsUnlocked(false);
    setPin('');
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    onLeadsChange(updated);
    const target = updated.find((l) => l.id === leadId);
    if (target) await saveLead(target);
    onShowToast(`Updated ${leadId} status to ${newStatus}`, 'gold');
  };

  const handleSaveQuote = async (leadId: string) => {
    const quoteVal = quotes[leadId] ?? '';
    const updated = leads.map((l) => (l.id === leadId ? { ...l, estimatedQuote: quoteVal } : l));
    onLeadsChange(updated);
    const target = updated.find((l) => l.id === leadId);
    if (target) await saveLead(target);
    onShowToast(`Estimate saved for ${leadId}`, 'success');
  };

  const handleDeleteLead = (leadId: string) => {
    markLeadDeleted(leadId);
    const updated = leads.filter((l) => l.id !== leadId);
    onLeadsChange(updated);
    onShowToast(`Archived request ${leadId}`, 'gold');
  };

  const handleGenerateVipCard = (lead: Lead) => {
    const dataUrl = generateVipCertificateDataUrl(lead);
    if (dataUrl) {
      onPreviewMedia({
        id: `cert_${lead.id}`,
        type: 'image',
        url: dataUrl,
        resolution: `VIP CERTIFICATE PASS (${lead.id})`
      });
    }
  };

  const handleSimulateLead = async () => {
    const demoCars = [
      {
        make: "Porsche",
        model: "911 GT3 RS (2025)",
        zone: "Main Centre — Port Said (المركز الرئيسي — بورسعيد)",
        name: "Karim Mansour",
        phone: "01098877665",
        type: "SCRATCH_DIAGNOSIS" as const,
        note: "Front bumper stone chips & swirl marks on hood"
      },
      {
        make: "Mercedes-Benz",
        model: "S580 Maybach (2026)",
        zone: "VIP Doorstep Delivery — At Your Location (خدمة VIP متنقلة حتى موقعك)",
        name: "Dr. Tarek El-Sayed",
        phone: "01223344556",
        type: "DRY_WASH" as const,
        note: "Royal Atelier VIP Package Friday service (Doorstep villa delivery)"
      },
      {
        make: "BMW",
        model: "X7 M60i (2025)",
        zone: "Nasr City Branch — Cairo (فرع مدينة نصر — القاهرة)",
        name: "Sherif Kamal",
        phone: "01144556677",
        type: "SCRATCH_DIAGNOSIS" as const,
        note: "Deep key scratch on passenger rear door"
      }
    ];

    const pick = demoCars[Math.floor(Math.random() * demoCars.length)];
    const newLead: Lead = {
      id: 'DC-' + Math.floor(1000 + Math.random() * 9000),
      requestType: pick.type,
      clientName: pick.name,
      clientPhone: pick.phone,
      carBrand: `SUV / Sport • Germany • ${pick.make}`,
      carModel: pick.model,
      carColor: "Obsidian Black Metallic",
      zone: pick.zone,
      gpsLink: "https://maps.google.com/?q=30.0131,31.4285",
      resolution: "1080p Master HD",
      estimatedQuote: pick.type === 'DRY_WASH' ? 'VIP Atelier 1,400 EGP' : 'Clear-Coat Surgery 2,800 EGP',
      notes: `Test Simulated Lead\nNotes: ${pick.note}`,
      media: [],
      status: 'NEW LIVE',
      createdAt: Date.now()
    };

    await saveLead(newLead);
    if (audioEnabled) playAudioRadarChime();
    onLeadsChange([newLead, ...leads]);
    onShowToast(`New Live Lead: ${newLead.id} (${pick.name})`, 'gold');
  };

  // Filtered list
  const filtered = leads.filter((lead) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.clientName.toLowerCase().includes(q) ||
      lead.clientPhone.includes(q) ||
      lead.carBrand.toLowerCase().includes(q) ||
      lead.id.toLowerCase().includes(q);

    const matchesZone = zoneFilter === 'ALL' || lead.zone.includes(zoneFilter);
    const matchesType = typeFilter === 'ALL' || lead.requestType === typeFilter;

    return matchesSearch && matchesZone && matchesType;
  });

  const scratchCount = leads.filter((l) => l.requestType === 'SCRATCH_DIAGNOSIS').length;
  const washCount = leads.filter((l) => l.requestType === 'DRY_WASH').length;

  const uptimeMins = String(Math.floor(uptimeSec / 60)).padStart(2, '0');
  const uptimeRemSec = String(uptimeSec % 60).padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl overflow-y-auto p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-w-6xl mx-auto piano-card-gold rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-gold-300 font-black">
              ⚡
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-black text-white">
                DR. CARE EXECUTIVE COMMAND
              </h3>
              <p className="text-xs text-zinc-400">
                Cairo Clock: <span className="text-gold-300 font-mono font-bold">{cairoTime || '--:--:--'}</span> • Uptime:{' '}
                <span className="text-emerald-400 font-mono font-bold">{uptimeMins}:{uptimeRemSec}s</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                onShowToast(audioEnabled ? 'Audio alerts muted' : 'Audio alerts enabled', 'gold');
              }}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-gold-200 text-xs font-bold cursor-pointer"
            >
              {audioEnabled ? '🔔 Audio: ON' : '🔕 Audio: OFF'}
            </button>
            <button
              type="button"
              onClick={() => setShowCloudRules(!showCloudRules)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 text-xs font-bold cursor-pointer"
              title="Cloud Architecture & Vault Details"
            >
              ⚙️ Cloud Setup
            </button>
            <button
              type="button"
              onClick={() => {
                const ok = exportLeadsToCsv(leads);
                if (ok) onShowToast('CSV exported successfully!', 'success');
                else onShowToast('No leads to export.', 'error');
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gold-200 text-xs font-bold cursor-pointer"
            >
              📥 CSV
            </button>
            {isUnlocked && (
              <button
                type="button"
                onClick={handleLock}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                🔒 Lock
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 text-xs font-extrabold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* PIN GATE */}
        {!isUnlocked && (
          <div className="max-w-sm mx-auto py-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mx-auto text-gold-300 text-xl">
              🔐
            </div>
            <p className="text-base font-extrabold text-white">Executive Access Vault</p>
            <p className="text-xs text-zinc-400">
              Enter your staff security PIN (2026 or 2027) to unlock live telemetry.
            </p>
            <div className={`flex items-center gap-2 justify-center pt-1 ${shake ? 'shake-error' : ''}`}>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (e.target.value === '2026' || e.target.value === '2027') {
                      setIsUnlocked(true);
                      sessionStorage.setItem('drcare_crm_unlocked', 'true');
                      setPinError(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUnlock();
                    }
                  }}
                  className="w-44 text-center text-lg tracking-widest font-black px-4 py-2.5 rounded-xl bg-black border border-gold-400/50 text-white focus:border-gold-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-gold-300 cursor-pointer"
                >
                  👁️
                </button>
              </div>
              <button
                type="button"
                onClick={handleUnlock}
                className="btn-gold-elite px-5 py-3 rounded-xl font-extrabold text-xs uppercase cursor-pointer"
              >
                Unlock
              </button>
            </div>
            {pinError && (
              <p className="text-xs font-bold text-rose-400">Unauthorized security key.</p>
            )}
          </div>
        )}

        {/* CRM DASHBOARD CONTENT */}
        {isUnlocked && (
          <div className="space-y-6">
            {/* CLOUD DIAGNOSTIC DRAWER */}
            {showCloudRules && (
              <div className="p-4 rounded-2xl bg-leather border border-gold-400/40 text-xs text-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-gold-300">☁️ Hybrid Cloud & Local Vault Architecture</strong>
                  <button
                    type="button"
                    onClick={() => setShowCloudRules(false)}
                    className="text-zinc-400 hover:text-white font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-zinc-300">
                  All consultations and dry wash appointments are instantly recorded in your browser&apos;s encrypted{' '}
                  <strong>IndexedDB + LocalStorage Vault</strong> and synchronized with Firebase Firestore when public write rules are active:
                </p>
                <pre className="p-2.5 rounded-xl bg-black/80 text-emerald-300 font-mono text-[11px] overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drcare_leads/{document} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </div>
            )}

            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Active</span>
                <p className="text-2xl font-black text-white mt-1">{leads.length}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/60 border border-gold-400/30">
                <span className="text-[10px] text-gold-300 uppercase font-bold">Scratch Cases</span>
                <p className="text-2xl font-black text-gold-300 mt-1">{scratchCount}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10">
                <span className="text-[10px] text-zinc-300 uppercase font-bold">On-Site Wash</span>
                <p className="text-2xl font-black text-white mt-1">{washCount}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Sync Engine</span>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-2">🟢 Hybrid Vault Ready</p>
              </div>
            </div>

            {/* FILTER & ACTIONS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/10">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search name, phone, car, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-leather border border-white/10 text-xs text-white focus:border-gold-400 focus:outline-none min-w-[180px]"
                />
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-leather border border-white/10 text-xs font-bold text-white"
                >
                  <option value="ALL">All Zones</option>
                  <option value="Heliopolis">Heliopolis</option>
                  <option value="Nasr City">Nasr City</option>
                  <option value="5th Settlement">5th Settlement</option>
                  <option value="Madinaty">Madinaty</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-leather border border-white/10 text-xs font-bold text-white"
                >
                  <option value="ALL">All Requests</option>
                  <option value="SCRATCH_DIAGNOSIS">Scratch Cases</option>
                  <option value="DRY_WASH">Dry Wash</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSimulateLead}
                  className="px-3 py-2 rounded-xl bg-gold-400/15 hover:bg-gold-400/25 border border-gold-400/30 text-gold-200 text-xs font-bold cursor-pointer"
                >
                  ⚡ Test Lead
                </button>
              </div>
            </div>

            {/* LIVE FEED LIST */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center text-zinc-400 text-sm">
                  No matching requests found. Click &quot;⚡ Test Lead&quot; to preview telemetry.
                </div>
              ) : (
                filtered.map((lead) => {
                  const cleanPhone = sanitizeWhatsAppNumber(lead.clientPhone);
                  const hasMedia = Array.isArray(lead.media) && lead.media.length > 0;
                  const statusBadgeColor =
                    lead.status === 'COMPLETED'
                      ? 'bg-emerald-500 text-black'
                      : lead.status === 'IN PROGRESS'
                      ? 'bg-sky-400 text-black'
                      : 'bg-gold-400 text-black';

                  return (
                    <div
                      key={lead.id}
                      className="p-4 rounded-2xl bg-black/75 border border-gold-400/30 space-y-3 shadow-lg"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded font-black ${statusBadgeColor}`}>
                            {lead.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-gold-200 text-[10px] font-bold">
                            {lead.requestType === 'DRY_WASH' ? '✨ DRY WASH' : '📸 SCRATCH DIAGNOSIS'}
                          </span>
                        </div>
                        <span className="text-gold-200">
                          📍 {lead.zone} •{' '}
                          <span className="text-zinc-400 font-mono">
                            {formatElapsedSeconds(lead.createdAt)}
                          </span>
                        </span>
                      </div>

                      <div className="text-xs text-white flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <strong>{lead.clientName}</strong> (
                          <a href={`tel:${lead.clientPhone}`} className="text-gold-300 underline">
                            {lead.clientPhone}
                          </a>
                          ) • {lead.carBrand} • {lead.carModel}
                        </div>
                        {lead.gpsLink && (
                          <a
                            href={lead.gpsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-300 underline font-bold"
                          >
                            🗺️ Open GPS Pin
                          </a>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="text-[11px] text-zinc-300 bg-white/5 p-2.5 rounded-xl whitespace-pre-line border border-white/5 font-mono">
                          {lead.notes}
                        </p>
                      )}

                      {/* Attached Inspection Photos */}
                      {hasMedia && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gold-300 uppercase font-bold block">
                            Attached Inspection Photos ({lead.media.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lead.media.map((m, mIdx) => (
                              <img
                                key={m.id || mIdx}
                                src={m.cloudSafeUrl || m.url}
                                alt={`Inspection ${mIdx + 1}`}
                                className="w-12 h-12 object-cover rounded-lg border border-gold-400/40 cursor-pointer hover:scale-105 transition"
                                onClick={() => onPreviewMedia(m)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status & Quote Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
                        <select
                          value={lead.status || 'NEW LIVE'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                          className="px-2.5 py-1.5 rounded-xl bg-leather border border-white/15 text-xs font-bold text-gold-200"
                        >
                          <option value="NEW LIVE">🟢 Status: NEW LIVE</option>
                          <option value="IN PROGRESS">🔵 Status: IN PROGRESS</option>
                          <option value="COMPLETED">✅ Status: COMPLETED</option>
                        </select>
                        <div className="flex gap-1.5 sm:col-span-2">
                          <input
                            type="text"
                            value={quotes[lead.id] ?? (lead.estimatedQuote || '')}
                            onChange={(e) =>
                              setQuotes({ ...quotes, [lead.id]: e.target.value })
                            }
                            placeholder="Estimated Quote / Price (e.g. 1,500 EGP)"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-leather border border-white/15 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveQuote(lead.id)}
                            className="px-3 py-1.5 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 border border-gold-400/40 text-gold-200 text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-white/10">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateVipCard(lead)}
                            className="px-3 py-1.5 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            📜 VIP Card
                          </button>
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1"
                          >
                            💬 WhatsApp Client
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          🗑️ Archive
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
