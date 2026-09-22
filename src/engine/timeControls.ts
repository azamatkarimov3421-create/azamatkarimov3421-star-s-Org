// =====================================================
// NUR CHESS 100 — Vaqt Nazorati Reglamenti va Standartlari
// FIDE va Chess.com xalqaro standartlariga moslashtirilgan
// =====================================================

export type TimeCategory = 'blitz' | 'rapid' | 'classic' | 'unlimited';

export interface TimeControlOption {
  id: string;
  category: TimeCategory;
  seconds: number;
  increment: number;
  label: string;
  badge?: string;
  isOfficial?: boolean;
  description: string;
}

export const TIME_CONTROL_PRESETS: TimeControlOption[] = [
  // ── BLITS (BLITZ) ──────────────────────────────────
  {
    id: 'b_3_0',
    category: 'blitz',
    seconds: 180,
    increment: 0,
    label: '3 daq',
    badge: '3 | 0',
    description: 'Tezkor blits, qo\'shimcha vaqtsiz'
  },
  {
    id: 'b_3_2',
    category: 'blitz',
    seconds: 180,
    increment: 2,
    label: '3 daq + 2s',
    badge: '3 | 2',
    description: 'FIDE Blits formati'
  },
  {
    id: 'b_5_0',
    category: 'blitz',
    seconds: 300,
    increment: 0,
    label: '5 daq',
    badge: '5 | 0',
    description: 'Klassik 5 daqiqali blits'
  },
  {
    id: 'b_5_3',
    category: 'blitz',
    seconds: 300,
    increment: 3,
    label: '5 daq + 3s',
    badge: '5 | 3 ★ Rasmiy',
    isOfficial: true,
    description: 'NurChess100 rasmiy Blits reglamenti'
  },
  {
    id: 'b_5_5',
    category: 'blitz',
    seconds: 300,
    increment: 5,
    label: '5 daq + 5s',
    badge: '5 | 5',
    description: 'Qulay 5 daqiqalik blits (+5s)'
  },
  {
    id: 'b_10_0',
    category: 'blitz',
    seconds: 600,
    increment: 0,
    label: '10 daq',
    badge: '10 | 0',
    description: '10 daqiqalik o\'yin'
  },
  {
    id: 'b_10_5',
    category: 'blitz',
    seconds: 600,
    increment: 5,
    label: '10 daq + 5s',
    badge: '10 | 5',
    description: '10 daqiqa har bir yurishga +5 soniya'
  },

  // ── RAPID (TEZKOR SHAXMAT) ─────────────────────────
  {
    id: 'r_15_5',
    category: 'rapid',
    seconds: 900,
    increment: 5,
    label: '15 daq + 5s',
    badge: '15 | 5',
    description: 'Rapid 15 daqiqa (+5s)'
  },
  {
    id: 'r_15_10',
    category: 'rapid',
    seconds: 900,
    increment: 10,
    label: '15 daq + 10s',
    badge: '15 | 10 (Chess.com)',
    description: 'Chess.com eng mashhur Rapid formati'
  },
  {
    id: 'r_20_0',
    category: 'rapid',
    seconds: 1200,
    increment: 0,
    label: '20 daq',
    badge: '20 | 0',
    description: '20 daqiqalik o\'yin'
  },
  {
    id: 'r_25_5',
    category: 'rapid',
    seconds: 1500,
    increment: 5,
    label: '25 daq + 5s',
    badge: '25 | 5',
    description: '25 daqiqa har bir yurishga +5s'
  },
  {
    id: 'r_25_10',
    category: 'rapid',
    seconds: 1500,
    increment: 10,
    label: '25 daq + 10s',
    badge: '25 | 10 ★ Rasmiy',
    isOfficial: true,
    description: 'NurChess100 rasmiy Rapid reglamenti'
  },

  // ── KLASSIK (CLASSIC) ──────────────────────────────
  {
    id: 'c_30_0',
    category: 'classic',
    seconds: 1800,
    increment: 0,
    label: '30 daq',
    badge: '30 | 0',
    description: 'Yarim soatlik klassik o\'yin'
  },
  {
    id: 'c_30_10',
    category: 'classic',
    seconds: 1800,
    increment: 10,
    label: '30 daq + 10s',
    badge: '30 | 10',
    description: '30 daqiqa har bir yurishga +10 soniya'
  },
  {
    id: 'c_60_0',
    category: 'classic',
    seconds: 3600,
    increment: 0,
    label: '60 daq',
    badge: '60 | 0',
    description: '1 soatlik musobaqa o\'yini'
  },
  {
    id: 'c_90_30',
    category: 'classic',
    seconds: 5400,
    increment: 30,
    label: '90 daq + 30s',
    badge: '90 | 30 ★ Xalqaro',
    isOfficial: true,
    description: 'NurChess100 xalqaro rasmiy Klassik reglamenti'
  },

  // ── CHEKSIZ (UNLIMITED) ───────────────────────────
  {
    id: 'unlimited',
    category: 'unlimited',
    seconds: 0,
    increment: 0,
    label: 'Cheksiz',
    badge: '∞',
    description: 'Vaqt chegarasisiz mashg\'ulot'
  }
];

/**
 * Vaqtni chiroyli ko'rsatish formati (soat:daq:soniya yoki daq:soniya)
 */
export function formatTimeDisplay(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Hozirgi tanlangan vaqt opsiya obyektini topish
 */
export function findTimeOption(seconds: number, increment: number): TimeControlOption | undefined {
  return TIME_CONTROL_PRESETS.find(
    opt => opt.seconds === seconds && opt.increment === increment
  );
}
