import { CarCatalog, TouchZoneDetail, DefectSeverity, WashPackageTier } from '../types';

export const CAR_CATALOG_BY_COUNTRY: CarCatalog = {
  "Germany & Europe": {
    flag: "🇩🇪",
    labelEn: "Germany & Europe",
    labelAr: "ألمانيا وأوروبا",
    brands: {
      "Mercedes-Benz": ["S-Class", "E-Class", "C-Class", "CLA", "GLA", "GLC", "GLE", "GLS", "G-Class", "EQS"],
      "BMW": ["7 Series", "5 Series", "3 Series", "X1", "X3", "X5", "X6", "X7", "iX"],
      "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
      "Range Rover": ["Vogue", "Sport", "Velar", "Evoque", "Defender"],
      "Audi": ["A3", "A4", "A6", "Q3", "Q5", "Q7", "Q8"],
      "Volkswagen": ["Tiguan", "Passat", "Golf", "Touareg", "ID.4"],
      "Skoda": ["Octavia", "Kodiaq", "Superb"],
      "Peugeot": ["3008", "5008", "2008", "408", "508"],
      "Volvo": ["XC90", "XC60", "XC40"]
    }
  },
  "China & EV": {
    flag: "🇨🇳",
    labelEn: "China & EV",
    labelAr: "الصين والكهربائية",
    brands: {
      "MG": ["ZS", "RX5 Plus", "MG 5", "MG 6", "MG 7", "HS", "MG 4 EV"],
      "Chery": ["Tiggo 8 Pro", "Tiggo 7 Pro", "Tiggo 4 Pro", "Arrizo 5"],
      "Jetour": ["T2", "Dashing", "X70 Plus", "X90 Plus"],
      "Haval": ["Jolion", "H6", "H6 GT", "Dargo"],
      "Geely": ["Coolray", "Starray", "Okavango", "Emgrand"],
      "BYD": ["Song Plus", "Yuan Plus", "Seal", "Han", "Dolphin"],
      "Changan": ["UNI-T", "UNI-K", "UNI-V", "CS55 Plus"],
      "Xiaomi": ["SU7", "SU7 Max"],
      "Exeed": ["RX", "VX", "TXL"],
      "Tank": ["Tank 300", "Tank 500"]
    }
  },
  "Japan": {
    flag: "🇯🇵",
    labelEn: "Japan",
    labelAr: "اليابان",
    brands: {
      "Toyota": ["Corolla", "Land Cruiser", "Prado", "RAV4", "Fortuner", "Camry", "Yaris"],
      "Lexus": ["LX600", "RX", "NX", "ES", "LS"],
      "Nissan": ["Qashqai", "X-Trail", "Juke", "Sunny", "Sentra", "Patrol"],
      "Honda": ["Civic", "CR-V", "Accord"],
      "Mitsubishi": ["Eclipse Cross", "Xpander", "Montero Sport"],
      "Mazda": ["Mazda 3", "CX-3", "CX-5", "CX-9"],
      "Suzuki": ["Fronx", "Grand Vitara", "Jimny", "Swift"]
    }
  },
  "Korea": {
    flag: "🇰🇷",
    labelEn: "Korea",
    labelAr: "كوريا",
    brands: {
      "Hyundai": ["Tucson", "Elantra CN7", "Santa Fe", "Kona", "Accent RB", "Ioniq 5"],
      "Kia": ["Sportage", "XCeed", "Cerato", "Sorento", "Seltos", "K5", "EV6"],
      "Genesis": ["GV80", "GV70", "G80"]
    }
  },
  "USA": {
    flag: "🇺🇸",
    labelEn: "USA",
    labelAr: "أمريكا",
    brands: {
      "Jeep": ["Grand Cherokee", "Wrangler", "Renegade", "Compass"],
      "Chevrolet": ["Captiva", "Tahoe", "Malibu"],
      "Ford": ["Kuga", "Focus", "Territory", "Mustang", "Explorer"],
      "Tesla": ["Model Y", "Model 3", "Model S", "Model X"]
    }
  },
  "Other": {
    flag: "🌍",
    labelEn: "Other Make",
    labelAr: "ماركة أخرى",
    brands: {
      "Custom Make": ["Custom Model"]
    }
  }
};

export const BODY_TYPES = [
  { id: 'SUV / 4x4', labelEn: 'SUV / 4x4', labelAr: 'دفع رباعي / SUV', icon: '🚙' },
  { id: 'Sedan', labelEn: 'Sedan (سيدان)', labelAr: 'سيدان', icon: '🚗' },
  { id: 'Coupe / Sport', labelEn: 'Coupe / Sport', labelAr: 'كوبيه / رياضي', icon: '🏎️' },
  { id: 'Hatchback', labelEn: 'Hatchback', labelAr: 'هاتشباك', icon: '🚘' },
  { id: 'Pickup / Van', labelEn: 'Pickup / Van', labelAr: 'بيك آب / فان', icon: '🛻' },
];

export const TOUCH_ZONES: TouchZoneDetail[] = [
  {
    key: 'HOOD',
    code: 'Zone A',
    en: 'Front Hood & Fenders (الكبوت والمقدمة)',
    ar: 'الكبوت والمقدمة',
    scopeEn: 'Aero Profile & Clear-Coat Correction',
    scopeAr: 'تصحيح عيوب الكبوت والمقدمة بالكامل',
    icon: '✨'
  },
  {
    key: 'DOORS',
    code: 'Zone B',
    en: 'Doors & Panels (الأبواب والجوانب)',
    ar: 'الأبواب والجوانب',
    scopeEn: 'Side Profile & Scuff Surgery',
    scopeAr: 'معالجة خدوش الأبواب والجوانب بالمايكرون',
    icon: '✨'
  },
  {
    key: 'BUMPERS',
    code: 'Zone C',
    en: 'Bumpers & Corners (الصدامات والأركان)',
    ar: 'الصدامات والأركان',
    scopeEn: 'Corner Rub & Scuff Leveling',
    scopeAr: 'تسوية حكات الصدامات والأركان بأمان',
    icon: '✨'
  },
  {
    key: 'FULL_BODY',
    code: 'Zone D',
    en: 'Full Car Rejuvenation (كامل البودي)',
    ar: 'كامل بودي السيارة',
    scopeEn: 'Master Concours Paint Rebirth',
    scopeAr: 'استعادة كاملة للمعة المعارض الأصلية',
    icon: '👑'
  }
];

export const DEFECT_SEVERITIES: DefectSeverity[] = [
  {
    id: 'sev1',
    value: 'Swirl Marks & Oxidation — دوائر غسيل وبهتان',
    titleEn: 'Swirls / Dullness (دوائر غسيل وبهتان)',
    titleAr: 'دوائر غسيل وبهتان',
    subEn: 'Surface haze & spiderwebs',
    subAr: 'تطفية باللمعة وخربشة غسيل'
  },
  {
    id: 'sev2',
    value: 'Clear Coat Scratch — خدش سطحي بالورنيش',
    titleEn: 'Surface Scratch (خدش سطحي بالورنيش)',
    titleAr: 'خدش سطحي بالورنيش',
    subEn: 'Clear-coat level defect',
    subAr: 'خدش بطبقة الكلير كوت'
  },
  {
    id: 'sev3',
    value: 'Deep Scratch / Bumper Scuff — خدش عميق أو حكة',
    titleEn: 'Deep Scuff (خدش عميق أو حكة)',
    titleAr: 'خدش عميق أو حكة',
    subEn: 'Key scratch or panel rub',
    subAr: 'خدش مفتاح أو حكة إكصدام'
  }
];

export const PRESET_COLORS = [
  { hex: '#08080A', name: 'Obsidian Black — أسود' },
  { hex: '#F4F5F7', name: 'Pearl White — أبيض لؤلؤي' },
  { hex: '#7A8088', name: 'Selenite Grey — رمادي' },
  { hex: '#C0C5CE', name: 'Iridium Silver — فضي' },
  { hex: '#10284E', name: 'Sapphire Blue — أزرق' },
  { hex: '#8F141B', name: 'Crimson Red — أحمر' },
  { hex: '#113826', name: 'Emerald Green — أخضر' },
  { hex: '#C2A878', name: 'Champagne Gold — شامبين' }
];

export const CAIRO_ZONES = [
  {
    value: 'Main Centre — Port Said (المركز الرئيسي — بورسعيد)',
    labelEn: 'Main Centre — Port Said (المركز الرئيسي — بورسعيد)',
    labelAr: 'المركز الرئيسي — بورسعيد (احجز لاستلام الموقع مباشرة)'
  },
  {
    value: 'Nasr City Branch — Cairo (فرع مدينة نصر — القاهرة)',
    labelEn: 'Nasr City Branch — Cairo (فرع مدينة نصر — القاهرة)',
    labelAr: 'فرع مدينة نصر — القاهرة (احجز لاستلام الموقع مباشرة)'
  },
  {
    value: 'VIP Doorstep Delivery — At Your Location (خدمة VIP متنقلة حتى موقعك)',
    labelEn: 'VIP Doorstep Delivery — At Your Location (For VIP Orders)',
    labelAr: 'خدمة VIP متنقلة حتى موقعك (متاحة لطلبات VIP)'
  }
];

export const WASH_PACKAGES: WashPackageTier[] = [
  {
    id: 'pkgCard1',
    name: '1. Signature Exterior Care',
    tierBadgeEn: 'TIER I • ESSENTIAL ATELIER',
    tierBadgeAr: 'الفئة الأولى • عناية الأتيليه الأساسية',
    titleEn: '1. Signature Exterior Care',
    titleAr: '1. باقة العناية الخارجية الأساسية',
    descEn: 'Bespoke maintenance for luxury vehicles preserving factory reflection.',
    descAr: 'برنامج صيانة دورية فاخر يحافظ على بريق وانعكاس دهان الفابريكا بدون مياه.',
    bulletsEn: [
      '✓ Safe Nano-Polymer waterless dust encapsulation',
      '✓ Virgin high-GSM edgeless microfiber wipe-down',
      '✓ Exterior glass & mirrors crystal optical cleaning',
      '✓ Synthetic hydrophobic gloss booster seal'
    ],
    bulletsAr: [
      '✓ تغليف وإزالة الأتربة بتقنية النانو بوليمر بأمان فائق بدون مياه',
      '✓ تنظيف بفوط مايكروفايبر جديدة عالية الكثافة مخصصة لكل جزء',
      '✓ تنظيف كريستالي بصري فائق للزجاج والمرايات',
      '✓ طبقة بوليمر معززة للمعة وطاردة للغبار'
    ],
    selectLabelEn: 'Select Tier 1 Atelier',
    selectLabelAr: 'اختيار الباقة الأولى',
    isVip: false
  },
  {
    id: 'pkgCard2',
    name: '2. Concours Exterior + Rims & Tires',
    tierBadgeEn: 'TIER II • CONCOURS & DEEP GLOSS',
    tierBadgeAr: 'الفئة الثانية • كونكور وتشميع عميق',
    badgeEn: '+ Rims & Deep Gloss',
    badgeAr: '+ الجنوط وتشميع عميق',
    titleEn: '2. Concours + Rims Detail',
    titleAr: '2. باقة الكونكور والعناية بالجنوط',
    descEn: 'Deep alloy decontamination paired with Meguiar\'s Carnauba paint enrichment.',
    descAr: 'تطهير عميق للجنوط وإزالة غبار الفرامل مع تشميع وتغذية عمق اللون بمركبات Meguiar\'s.',
    bulletsEn: [
      '✓ Everything included in Signature Exterior Tier',
      '✓ Deep alloy rim brake-dust removal & barrel decontamination',
      '✓ Non-sling satin UV tire conditioning dressing',
      '✓ Door jambs & seals detailed microfiber wipe-down',
      '✓ Meguiar\'s® Liquid Wax hand application for warm paint depth'
    ],
    bulletsAr: [
      '✓ تشمل كافة مميزات باقة Signature الأساسية',
      '✓ إزالة غبار الفرامل وتطهير عميق لبراميل وجنوط السيارة الرياضية',
      '✓ ترطيب وحماية الإطارات بطبقة ساتان مطاطية غير لاصقة',
      '✓ تنظيف دقيق لقوائم الأبواب والكاوتشوك الداخلي',
      '✓ تطبيق يدوي دقيق لشمع Meguiar\'s® السائل لعمق لوني استثنائي'
    ],
    selectLabelEn: 'Select Tier 2 Concours',
    selectLabelAr: 'اختيار باقة الكونكور',
    isVip: false
  },
  {
    id: 'pkgCard3',
    name: '3. Royal Atelier VIP Full Protection',
    tierBadgeEn: 'TIER III • ROYAL FLAGSHIP CERAMIC',
    tierBadgeAr: 'الفئة الثالثة • الحماية الملكية الفاخرة',
    badgeEn: 'VIP FLAGSHIP',
    badgeAr: 'أتيليه ملكي VIP',
    titleEn: '3. Royal Atelier VIP Protection',
    titleAr: '3. باقة الأتيليه الملكية الفاخرة VIP',
    descEn: 'Complete show-car transformation with multi-week ceramic polymer shield.',
    descAr: 'برنامج صالونات العرض المتكامل مع درع حماية سيراميك بوليمر طارد للأتربة لأسابيع.',
    bulletsEn: [
      '✓ Everything included in Concours + Rims Tier',
      '✓ VIP Privilege: Direct doorstep delivery to your location (available for VIP bookings)',
      '✓ Meguiar\'s® Hybrid Ceramic / Polymer paint sealant application',
      '✓ Hydrophobic crystal glass rain-repellent windscreen coating',
      '✓ Exterior black trim, rubbers & moldings UV restoration',
      '✓ Chrome exhaust tips, badges & emblems precision hand polishing'
    ],
    bulletsAr: [
      '✓ تشمل كافة مميزات باقة Concours + Rims بالكامل',
      '✓ ميزة VIP الحصرية: إمكانية تقديم وتنفيذ الخدمة في موقعك الخاص لطلبات VIP',
      '✓ تطبيق طبقة حماية Meguiar\'s® Hybrid Ceramic Sealant الفائقة',
      '✓ معالجة زجاج السيارة الأمامي بطبقة هيدروفوبيك طاردة للأمطار',
      '✓ تغذية وحماية الفيبر والربل الخارجي ومقاومة أشعة الشمس فوق البنفسجية',
      '✓ تلميع يدوي ناعم لشعارات السيارة ومخارج العادم والنيكل والكروم'
    ],
    selectLabelEn: 'Select Royal Atelier VIP',
    selectLabelAr: 'اختيار الباقة الملكية VIP',
    isVip: true
  }
];

export const TIME_SLOTS = [
  {
    dayEn: 'Friday Only (الجمعة فقط • 3:00 PM - 9:00 PM)',
    dayAr: 'الجمعة أسبوعياً فقط (من ٣:٠٠ عصراً حتى ٩:٠٠ مساءً)',
    options: [
      {
        val: 'Friday | Slot 1: 03:00 PM - 05:00 PM',
        labelEn: 'Friday — Slot 1 (03:00 PM - 05:00 PM)',
        labelAr: 'الجمعة — الفترة الأولى (٠٣:٠٠ م - ٠٥:٠٠ م)'
      },
      {
        val: 'Friday | Slot 2: 05:00 PM - 07:00 PM',
        labelEn: 'Friday — Slot 2 (05:00 PM - 07:00 PM)',
        labelAr: 'الجمعة — الفترة الثانية (٠٥:٠٠ م - ٠٧:٠٠ م)'
      },
      {
        val: 'Friday | Slot 3: 07:00 PM - 09:00 PM',
        labelEn: 'Friday — Slot 3 (07:00 PM - 09:00 PM)',
        labelAr: 'الجمعة — الفترة الثالثة (٠٧:٠٠ م - ٠٩:٠٠ م)'
      },
      {
        val: 'Friday | VIP Dedicated Session (03:00 PM - 09:00 PM)',
        labelEn: 'Friday — VIP Dedicated Session (03:00 PM - 09:00 PM)',
        labelAr: 'الجمعة — حجز جلسة VIP مخصصة (٠٣:٠٠ م - ٠٩:٠٠ م)'
      }
    ]
  }
];

export const CAR_PARTS_CATALOG: import('../types').CarPartItem[] = [
  // Front Section
  {
    id: 'hood',
    category: 'front',
    nameEn: 'Front Hood (Bonnet)',
    nameAr: 'الكبوت (غطاء المحرك)',
    icon: '🚙',
    zoneKey: 'HOOD',
    typicalIssueEn: 'Stone chips, wiper swirl hazing, bird drop etchings',
    typicalIssueAr: 'نقرات حصى، دوائر غسيل، بهتان شمس، فضلات طيور'
  },
  {
    id: 'front_bumper',
    category: 'front',
    nameEn: 'Front Bumper & Lip',
    nameAr: 'الصدام الأمامي والزوائد',
    icon: '🛡️',
    zoneKey: 'BUMPERS',
    typicalIssueEn: 'Parking curb scrapes, lower scuffs, bug splatter marks',
    typicalIssueAr: 'حكات رصيف وركنة، تجريح بالزوايا، بهتان السفليات'
  },
  {
    id: 'fender_fl',
    category: 'front',
    nameEn: 'Front Left Fender',
    nameAr: 'الرفرف الأمامي يسار',
    icon: '✨',
    zoneKey: 'HOOD',
    typicalIssueEn: 'Tight parking rub, clear-coat scuff, scratch lines',
    typicalIssueAr: 'حكة ركنة جانبية، خدوش سطحية وعميقة بالورنيش'
  },
  {
    id: 'fender_fr',
    category: 'front',
    nameEn: 'Front Right Fender',
    nameAr: 'الرفرف الأمامي يمين',
    icon: '✨',
    zoneKey: 'HOOD',
    typicalIssueEn: 'Tight parking rub, clear-coat scuff, scratch lines',
    typicalIssueAr: 'حكة ركنة جانبية، خدوش سطحية وعميقة بالورنيش'
  },
  // Sides & Doors
  {
    id: 'door_fl',
    category: 'sides',
    nameEn: 'Driver Front Door',
    nameAr: 'باب السائق الأمامي (يسار)',
    icon: '🚪',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Key scratches, fingernail door handle cups, side panel swipes',
    typicalIssueAr: 'خدوش مفاتيح، خربشة مقبض الباب، حكات أعمدة الجراج'
  },
  {
    id: 'door_fr',
    category: 'sides',
    nameEn: 'Passenger Front Door',
    nameAr: 'باب الراكب الأمامي (يمين)',
    icon: '🚪',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Door ding rubs, parking garage pillar scuffs, key scratches',
    typicalIssueAr: 'حكة ركنة، حكات أعمدة الجراج، خدوش عميقة'
  },
  {
    id: 'door_rl',
    category: 'sides',
    nameEn: 'Rear Left Passenger Door',
    nameAr: 'الباب الخلفي يسار',
    icon: '🚪',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Opening dings, horizontal shopping cart scuff lines',
    typicalIssueAr: 'حكات فتح أبواب مجاورة، خطوط تجريح طولية'
  },
  {
    id: 'door_rr',
    category: 'sides',
    nameEn: 'Rear Right Passenger Door',
    nameAr: 'الباب الخلفي يمين',
    icon: '🚪',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Opening dings, horizontal shopping cart scuff lines',
    typicalIssueAr: 'حكات فتح أبواب مجاورة، خطوط تجريح طولية'
  },
  {
    id: 'mirrors',
    category: 'sides',
    nameEn: 'Side Mirrors (Pair)',
    nameAr: 'المرايات الجانبية (الزوج)',
    icon: '🔍',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Narrow street motorcycle scrapes, curb swipe lines',
    typicalIssueAr: 'احتكاك سيارات وموتوسيكلات، حكات مرايات'
  },
  // Rear Section
  {
    id: 'rear_bumper',
    category: 'rear',
    nameEn: 'Rear Bumper & Diffuser',
    nameAr: 'الصدام الخلفي والأركان',
    icon: '🛡️',
    zoneKey: 'BUMPERS',
    typicalIssueEn: 'Reverse parking scrapes, loading luggage scuffs, tap marks',
    typicalIssueAr: 'حكات ركنة للخلف، تجريح تحميل الشنط، خربشة زوايا'
  },
  {
    id: 'trunk',
    category: 'rear',
    nameEn: 'Trunk / Tailgate',
    nameAr: 'الشنطة / الباب الخلفي',
    icon: '📦',
    zoneKey: 'FULL_BODY',
    typicalIssueEn: 'Dust dry-wipe micro-scratches, luggage scrapes, cat paw marks',
    typicalIssueAr: 'خربشة فوط جافة، تجريح حافة الشنطة، بهتان ورنيش'
  },
  {
    id: 'quarter_rl',
    category: 'rear',
    nameEn: 'Rear Left Quarter Panel',
    nameAr: 'الرفرف الخلفي يسار',
    icon: '✨',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Tight corner turns, wall graze marks, deep key scratches',
    typicalIssueAr: 'حكة زاوية دوران، خربشة حائط، خدوش عميقة'
  },
  {
    id: 'quarter_rr',
    category: 'rear',
    nameEn: 'Rear Right Quarter Panel',
    nameAr: 'الرفرف الخلفي يمين',
    icon: '✨',
    zoneKey: 'DOORS',
    typicalIssueEn: 'Tight corner turns, fuel area scuffs, wall graze marks',
    typicalIssueAr: 'حكة زاوية دوران، خربشة حائط، خدوش عميقة'
  },
  // Roof & Full Body
  {
    id: 'roof',
    category: 'roof',
    nameEn: 'Roof Panel & Pillars',
    nameAr: 'السقف والقوائم الجانبية',
    icon: '☀️',
    zoneKey: 'FULL_BODY',
    typicalIssueEn: 'Sun clear-coat oxidation, bird droppings, acid tree sap etchings',
    typicalIssueAr: 'بهتان الشمس وأكسدة الورنيش، فضلات الطيور، صمغ الأشجار'
  },
  {
    id: 'full_body',
    category: 'all',
    nameEn: 'Full Car Complete Treatment',
    nameAr: 'معالجة شاملة لكامل بودي السيارة (فابريكا بالكامل)',
    icon: '👑',
    zoneKey: 'FULL_BODY',
    typicalIssueEn: 'Comprehensive 100% factory paint restoration, swirl removal & ceramic gloss',
    typicalIssueAr: 'إحياء ولمعان كامل المعارض، إزالة دوائر الغسيل وحماية ١٠٠٪'
  }
];

export const FAQ_ITEMS: import('../types').FaqItem[] = [
  {
    id: 'faq-who',
    qEn: 'Who We Are?',
    qAr: 'من نحن؟ (Who We Are)',
    aEn: 'Dr. Care is a specialized paint restoration centre with 8+ years of dedicated craftsmanship. We have successfully serviced more than 200 clients with diverse car conditions and complex clear-coat damage—restoring 100% factory paint without repainting.',
    aAr: 'دكتور كير هو مركز متخصص في استعادة وتجديد دهان السيارات بخبرة تمتد لأكثر من ٨ سنوات، قمنا خلالها بخدمة أكثر من ٢٠٠ عميل في مختلف الحالات وحوادث الخدوش المعقدة — دون أي رش أو دهان، مع الحفاظ التام على دهان الفابريكا الأصلي وقيمته السوقية بنسبة ١٠٠٪.',
    icon: '🏆'
  },
  {
    id: 'faq-price',
    qEn: 'Prices & Quotation Guide?',
    qAr: 'الأسعار وتكلفة معالجة الخدوش؟',
    aEn: 'Pricing is always determined by how the damage affected your car’s clear coat. For typical deep scratches, restoring a selected car part costs around 1,500 to 2,000 L.E. We provide transparent upfront estimates based on the parts you select, confirmed upon optical inspection at Dr. Care Centre.',
    aAr: 'التكلفة تعتمد دائماً على مدى عمق الضرر وطبقة الورنيش المتأثرة في سيارتك. بشكل عام، فإن معالجة الخدش العميق للقطعة الواحدة التي تختارها من السيارة تتراوح تكلفتها من ١٥٠٠ إلى ٢٠٠٠ جنيه مصري. وتضمن لك هذه المعالجة توفير آلاف الجنيهات مقارنة بخسارة قيمة الفابريكا عند الرش في ورش الدوكو.',
    icon: '💰'
  },
  {
    id: 'faq-time',
    qEn: 'Timing, Full Booking & Cancellation Policy?',
    qAr: 'المواعيد وسياسة الحجز بكامل المبلغ والإلغاء؟',
    aEn: 'Our Dry Nano Care sessions are held exclusively every Friday from 3:00 PM to 9:00 PM. All reservations require full-amount upfront payment to secure your dedicated studio bay. We provide a transparent 24-hour cancellation policy with 100% full refund if you cancel at least 24 hours prior to your slot.',
    aAr: 'تُقام جلسات النانو دراي (Dry Nano) أسبوعياً كل يوم جمعة فقط من الساعة ٣:٠٠ عصراً حتى ٩:٠٠ مساءً. يتطلب تأكيد الحجز سداد كامل المبلغ مسبقاً لحجز وتجهيز الباية المخصصة لسيارتك. ونوفر سياسة إلغاء مرنة مع استرداد كامل المبلغ بنسبة ١٠٠٪ في حال الإلغاء قبل الموعد بـ ٢٤ ساعة على الأقل.',
    icon: '⏱️'
  },
  {
    id: 'faq-location',
    qEn: 'Where are your centres located? Do you deliver to my location?',
    qAr: 'أين تقع مراكز دكتور كير؟ وهل تتوفر خدمة التوصيل لموقعي؟',
    aEn: 'Our services are available at our Main Centre in Port Said and our branch in Nasr City (Cairo). Once you submit your reservation, you immediately receive the exact Google Maps GPS pin and directions to reach us easily. For VIP orders, our certified specialists can deliver full services directly to your private location / villa / garage.',
    aAr: 'تتوفر خدماتنا في المركز الرئيسي ببورسعيد بالإضافة إلى فرع مدينة نصر بالقاهرة — وبمجرد إتمام الحجز ستتلقى تفاصيل الموقع الدقيقة ورابط GPS المباشر للوصول بكل سهولة. كما نوفر لطلبات الفئات الملكية VIP ميزة الانتقال وتقديم الخدمة مباشرة في موقع سيارتك الخاص.',
    icon: '📍'
  },
  {
    id: 'faq-repainting',
    qEn: 'Why choose Dr. Care over traditional body-shop repainting?',
    qAr: 'لماذا أختار معالجة دكتور كير بدلاً من رش وإعادة دهان القطعة؟',
    aEn: 'Traditional body shops respray the panel, which permanently ruins your car’s factory original status (فابريكا), reduces resale appraisal by 10%–20%, and often causes visible color mismatches. Dr. Care uses Italian RUPES® BigFoot orbital polishers and American Meguiar’s® micro-abrasives to eliminate scratches safely without stripping your factory paint.',
    aAr: 'ورش الدوكو تقوم برش وإعادة دهان القطعة، مما يُفقد السيارة فوراً ميزة "الفابريكا بالكامل" ويخفض من قيمتها السوقية بنسبة ١٠٪ إلى ٢٠٪، بالإضافة لخطر عدم تطابق اللون. في دكتور كير نقوم بتسوية ميكرونات الورنيش الشفاف بأجهزة RUPES الإيطالية ومركبات Meguiar\'s الأمريكية، لنزيل الخدش تماماً وتبقى السيارة فابريكا ١٠٠٪.',
    icon: '🛡️'
  }
];

