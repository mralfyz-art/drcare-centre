# DR. CARE | Factory Paint. Reborn. — Bespoke Automotive Atelier

A production-grade, bilingual (Arabic & English) React + TypeScript + Vite + Tailwind CSS web application for **DR. CARE**, Cairo's premier bespoke mobile automotive paint restoration and nano dry-wash atelier.

---

## 🌟 Key Features

1. **Bilingual Atelier (English & Arabic with RTL/LTR)**
   - Instant language switching with dedicated Arabic typography (`Cairo`) and English luxury serif fonts (`Cinzel`, `Plus Jakarta Sans`, `Playfair Display`, `Montserrat`).
   - Dynamic direction switching (`dir="rtl"` / `dir="ltr"`).

2. **Real Transformation Drag Slider**
   - Interactive before-and-after image comparison showing factory paint clear-coat restoration.
   - Quick 15% / 85% comparison presets and smooth touch/mouse dragging.

3. **Certified Systems Integration**
   - **Meguiar's® (USA, Since 1901)**: Micro-abrasive clear coat restoration technology.
   - **RUPES® (Italy, Since 1947)**: BigFoot® random orbital polishing systems eliminating holograms and paint burn.

4. **The DR. CARE Methodology (3 Pillars)**
   - Clear-Coat Surgery (Clear coat micro-leveling without repainting).
   - Nano Dry Wash Science (Polymer encapsulation & virgin edgeless microfiber).
   - On-Site Mobile Service (Heliopolis, Nasr City, 5th Settlement, Madinaty with zero water mess).

5. **Instant Touch Diagnosis (Scratch Restoration Console)**
   - 4-step interactive configuration:
     - Step 1: Cascading Vehicle Selector (Body type, Country of origin, Make, Model, Year, Color wheel + 8 preset paint spheres).
     - Step 2: X-Ray Touch Selector with 3 defect severities and 4 zones (Hood, Doors, Bumpers, Full body).
     - Step 3: Multi-select photo upload with client-side smart compression (1080p / 720p), thumbnail preview, and notes.
     - Step 4: Contact details & 1-tap exact GPS parking pin capture.
   - Generates Pass ID (`DC-XXXX`) and direct WhatsApp priority review link.

6. **On-Site Nano Dry Wash (Concierge Service)**
   - 3 distinct tiers:
     - Tier 1: Signature Exterior Care (45 mins)
     - Tier 2: Concours Exterior + Rims & Tires (60 mins)
     - Tier 3: Royal Atelier VIP Full Protection (90 mins)
   - Vehicle selector, day/hourly slots (Thu, Fri, Sat), Cairo zone selector, 1-tap GPS pin, and direct WhatsApp booking.

7. **Executive Command Vault (Backoffice CRM)**
   - Accessible via holding the logo for 3 seconds or tapping 5 times in 1.5 seconds (or `?admin=1`).
   - 4-digit staff security PIN gate (`2026` / `2027`).
   - Live Cairo clock and stream uptime counter.
   - Audio Radar alert toggle with Web Audio synthesizer chimes.
   - Real-time KPIs (Total active, scratch cases, dry wash bookings, sync status).
   - Search by name, phone, car, or pass ID, with zone and service type filters.
   - Live status changer (`NEW LIVE`, `IN PROGRESS`, `COMPLETED`) and price quote editor.
   - **VIP Certificate Card Generator**: Generates an official 1080x1350 canvas certificate pass with inspection report for instant download.
   - Direct WhatsApp customer messaging and lead archiving.
   - Full CSV export and simulated test leads.

8. **Hybrid Storage Engine**
   - Offline-capable hybrid vault combining IndexedDB and LocalStorage with Firebase Firestore syncing.

---

## 🛠 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio & Graphics**: Web Audio API, HTML5 2D Canvas

---

## 🚀 Development & Build

```bash
# Start development server
npm run dev

# Compile TypeScript and build for production
npm run build

# Preview production build
npm run preview
```