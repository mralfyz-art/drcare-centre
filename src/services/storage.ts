import { Lead } from '../types';
import { syncLeadToFirestore, fetchFirestoreLeads } from './firebase';

const IDB_NAME = 'DrCarePhotoVault_v33';
const IDB_STORE = 'leads_store';
const LS_BACKUP_KEY = 'drcare_leads_ls_backup_v33';
const DELETED_IDS_KEY = 'drcare_deleted_ids_v33';
const FORM_DRAFT_KEY = 'drcare_form_draft_v33';

let idbDatabase: IDBDatabase | null = null;

// Initialize IndexedDB
export async function initIndexedDB(): Promise<IDBDatabase | null> {
  if (idbDatabase) return idbDatabase;
  if (!('indexedDB' in window)) return null;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        idbDatabase = (e.target as IDBOpenDBRequest).result;
        resolve(idbDatabase);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function getDeletedLeadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
}

export function markLeadDeleted(id: string) {
  const set = getDeletedLeadIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}

  if (idbDatabase) {
    try {
      const tx = idbDatabase.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
    } catch {}
  }
}

export async function fetchAllLeads(): Promise<Lead[]> {
  const deleted = getDeletedLeadIds();
  const leadsMap = new Map<string, Lead>();

  // 1. Try Firestore Cloud Database
  try {
    const cloudLeads = await fetchFirestoreLeads();
    if (Array.isArray(cloudLeads)) {
      cloudLeads.forEach((l) => {
        if (!deleted.has(l.id)) leadsMap.set(l.id, l);
      });
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to local storage:', err);
  }

  // 2. Try LocalStorage backup
  try {
    const raw = localStorage.getItem(LS_BACKUP_KEY);
    if (raw) {
      const list: Lead[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((l) => {
          if (!deleted.has(l.id) && !leadsMap.has(l.id)) leadsMap.set(l.id, l);
        });
      }
    }
  } catch {}

  // 3. Try IndexedDB
  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      await new Promise((res) => {
        req.onsuccess = () => {
          const list: Lead[] = req.result || [];
          list.forEach((l) => {
            if (!deleted.has(l.id) && !leadsMap.has(l.id)) leadsMap.set(l.id, l);
          });
          res(true);
        };
        req.onerror = () => res(false);
      });
    } catch {}
  }

  // If entirely empty, seed 2 sample leads for immediate backoffice preview
  if (leadsMap.size === 0) {
    const sample1: Lead = {
      id: 'DC-8842',
      requestType: 'SCRATCH_DIAGNOSIS',
      clientName: 'Dr. Karim Mansour',
      clientPhone: '01098877665',
      carBrand: 'Porsche',
      carModel: '911 GT3 RS • 2025',
      carColor: 'Obsidian Black Metallic',
      zone: 'Dr. Care Centre Studio Bay',
      resolution: '1080p Master HD',
      estimatedQuote: '2,800 EGP',
      notes: 'Severity: Swirl Marks & Deep Scratch\nSelected Panels: Front Hood, Front Bumper\nEarly Bird Morning Bay 1',
      media: [],
      status: 'IN PROGRESS',
      createdAt: Date.now() - 1000 * 60 * 45
    };
    const sample2: Lead = {
      id: 'DC-9120',
      requestType: 'DRY_WASH',
      clientName: 'Eng. Tarek El-Sayed',
      clientPhone: '01223344556',
      carBrand: 'Mercedes-Benz',
      carModel: 'S580 Maybach (2026)',
      carColor: '3. Royal Centre VIP Full Protection',
      zone: 'Dr. Care Centre Studio Bay',
      resolution: 'Centre Studio',
      estimatedQuote: '1,400 EGP',
      notes: 'Selected Tier: Royal Centre Full Protection\nSlot: Afternoon Precision Slot (1:00 PM - 5:00 PM)',
      media: [],
      status: 'NEW LIVE',
      createdAt: Date.now() - 1000 * 60 * 15
    };
    leadsMap.set(sample1.id, sample1);
    leadsMap.set(sample2.id, sample2);
    saveLead(sample1);
    saveLead(sample2);
  }

  return Array.from(leadsMap.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveLead(lead: Lead): Promise<void> {
  // 1. Save to IndexedDB
  const db = await initIndexedDB();
  if (db) {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(lead);
    } catch {}
  }

  // 2. Update LocalStorage backup
  try {
    const raw = localStorage.getItem(LS_BACKUP_KEY);
    let list: Lead[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((l) => l.id === lead.id);
    if (idx >= 0) {
      list[idx] = lead;
    } else {
      list.unshift(lead);
    }
    localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {}

  // 3. Sync to Cloud Firestore in background
  syncLeadToFirestore(lead).catch((err) => {
    console.warn('Firestore cloud sync skipped or offline:', err);
  });
}

export function playAudioRadarChime() {
  // Audio chime disabled per user preference
}

export function formatElapsedSeconds(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - (Number(timestamp) || Date.now())) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

export function sanitizeWhatsAppNumber(phone: string): string {
  let clean = String(phone || '').replace(/\D/g, '');
  if (clean.startsWith('01')) clean = '2' + clean;
  if (!clean.startsWith('2') && clean.length === 10) clean = '20' + clean;
  return clean;
}

export function exportLeadsToCsv(leads: Lead[]) {
  if (!leads.length) return false;
  const headers = ["ID", "Status", "Type", "Name", "Phone", "Car", "Model", "Color/Package", "Zone", "Estimate", "Created At"];
  const rows = leads.map(l => [
    l.id,
    `"${(l.status || 'NEW LIVE').replace(/"/g, '""')}"`,
    l.requestType,
    `"${(l.clientName || '').replace(/"/g, '""')}"`,
    `"${l.clientPhone || ''}"`,
    `"${(l.carBrand || '').replace(/"/g, '""')}"`,
    `"${(l.carModel || '').replace(/"/g, '""')}"`,
    `"${(l.carColor || '').replace(/"/g, '""')}"`,
    `"${(l.zone || '').replace(/"/g, '""')}"`,
    `"${(l.estimatedQuote || '').replace(/"/g, '""')}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`
  ]);
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DrCare_Leads_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export function generateVipCertificateDataUrl(lead: Lead): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, '#07080C');
  bgGrad.addColorStop(0.5, '#10121A');
  bgGrad.addColorStop(1, '#050507');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.strokeStyle = '#F5C518';
  ctx.lineWidth = 5;
  ctx.strokeRect(36, 36, 1008, 1278);
  ctx.strokeStyle = 'rgba(245, 197, 24, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, 976, 1246);

  ctx.direction = 'ltr';
  ctx.fillStyle = '#F5C518';
  ctx.font = '900 54px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('DR. CARE CENTRE', 540, 145);

  ctx.fillStyle = '#E5E7EB';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OFFICIAL OPTICAL PAINT TELEMETRY & RESTORATION PASS', 540, 188);

  ctx.strokeStyle = 'rgba(245, 197, 24, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 225);
  ctx.lineTo(960, 225);
  ctx.stroke();

  ctx.fillStyle = 'rgba(245, 197, 24, 0.15)';
  ctx.fillRect(300, 250, 480, 56);
  ctx.strokeStyle = '#F5C518';
  ctx.strokeRect(300, 250, 480, 56);
  ctx.fillStyle = '#FFF1B8';
  ctx.font = '800 24px monospace';
  ctx.fillText(`PASS ID: ${lead.id} • ${lead.status || 'NEW LIVE'}`, 540, 287);

  const startX = 100;
  let curY = 375;
  const hasArabic = (str: string) => /[\u0600-\u06FF]/.test(String(str || ''));

  const drawField = (labelEn: string, labelAr: string, value: string, highlight = false) => {
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 20px "Plus Jakarta Sans", Cairo, sans-serif';
    ctx.fillText(`${labelEn} — ${labelAr}`, startX, curY);

    const valStr = String(value || '-').slice(0, 52);
    ctx.direction = hasArabic(valStr) ? 'rtl' : 'ltr';
    ctx.textAlign = 'left';
    ctx.fillStyle = highlight ? '#F5C518' : '#FFFFFF';
    ctx.font = '800 28px "Plus Jakarta Sans", Cairo, sans-serif';
    ctx.fillText(valStr, startX, curY + 38);
    curY += 105;
  };

  drawField('VEHICLE OWNER', 'مالك السيارة', lead.clientName);
  drawField('VEHICLE PROFILE', 'السيارة والموديل', `${lead.carBrand} — ${lead.carModel}`, true);
  drawField('PAINT FINISH / PACKAGE', 'اللون أو الباقة', lead.carColor);
  drawField('SERVICE ZONE', 'نطاق الخدمة المتنقلة', lead.zone);

  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(90, curY - 10, 900, 250);
  ctx.strokeStyle = 'rgba(245, 197, 24, 0.35)';
  ctx.strokeRect(90, curY - 10, 900, 250);

  ctx.fillStyle = '#F5C518';
  ctx.font = '800 22px "Plus Jakarta Sans", Cairo, sans-serif';
  ctx.fillText('X-RAY TOUCH INSPECTION & TREATMENT NOTES:', 120, curY + 35);

  ctx.fillStyle = '#F3F4F6';
  ctx.font = '600 21px "Plus Jakarta Sans", Cairo, sans-serif';
  const noteLines = String(lead.notes || '').split('\n');
  let lineY = curY + 80;
  noteLines.slice(0, 4).forEach(line => {
    ctx.direction = hasArabic(line) ? 'rtl' : 'ltr';
    ctx.textAlign = 'left';
    ctx.fillText(line.slice(0, 68), 120, lineY);
    lineY += 42;
  });

  curY += 300;
  ctx.direction = 'ltr';
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.fillRect(90, curY, 900, 95);
  ctx.strokeStyle = '#10B981';
  ctx.strokeRect(90, curY, 900, 95);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#6EE7B7';
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AUTHORIZED ATELIER RESTORATION ESTIMATE / STATUS', 540, curY + 35);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px "Plus Jakarta Sans", Cairo, sans-serif';
  ctx.fillText(lead.estimatedQuote || 'BESPOKE ASSESSMENT IN PROGRESS', 540, curY + 76);

  ctx.fillStyle = '#F5C518';
  ctx.font = 'italic 900 28px Montserrat, sans-serif';
  ctx.fillText('CERTIFIED SYSTEMS:   RUPES (ITALY)   •   MEGUIAR\'S (USA)', 540, 1220);

  return canvas.toDataURL('image/png');
}

export function saveFormDraft(data: Record<string, unknown>) {
  try {
    sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

export function getFormDraft(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(FORM_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
