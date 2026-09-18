// =====================================================
// NUR CHESS 100 — 7. Qoidalar va Darslik Ekrani (Rules & Tutorials)
// Muallif Nurfullo Nurmatovning rasmiy metodik qo'llanmasi asosida
// TO'LIQ RASMLAR VA KO'RGAZMALI DOSKALAR BILAN
// =====================================================

import React, { useState } from 'react';
import NurLogo from '../components/NurLogo';
import PieceIcon from '../components/PieceIcon';
import BoardDiagram, {
  DiagramPiece,
  DiagramHighlight,
  DiagramArrow,
} from '../components/BoardDiagram';
import { PieceType, FILES } from '../engine/types';
import { ArrowLeftIcon } from '../components/Icons';

interface RulesScreenProps {
  onBack: () => void;
}

type TabKey = 'basic' | 'pieces' | 'special' | 'openings';

export default function RulesScreen({ onBack }: RulesScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number>(0);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    setup: true,
    goal: true,
    notation: false,
    win: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── 1. Boshlang'ich 10x10 doska figuralari ──────────────────────────────────
  const initialSetupPieces: DiagramPiece[] = [
    // 1-qator: Oq asosiy figuralar
    { file: 0, rank: 0, type: 'Rook', color: 'white' },
    { file: 1, rank: 0, type: 'Knight', color: 'white' },
    { file: 2, rank: 0, type: 'Bishop', color: 'white' },
    { file: 3, rank: 0, type: 'Nur', color: 'white' }, // N1
    { file: 4, rank: 0, type: 'King', color: 'white' }, // E1
    { file: 5, rank: 0, type: 'Queen', color: 'white' }, // D1
    { file: 6, rank: 0, type: 'Nur', color: 'white' }, // M1
    { file: 7, rank: 0, type: 'Bishop', color: 'white' },
    { file: 8, rank: 0, type: 'Knight', color: 'white' },
    { file: 9, rank: 0, type: 'Rook', color: 'white' },

    // 2-qator: 10 ta oq piyoda
    ...Array.from({ length: 10 }, (_, i) => ({
      file: i,
      rank: 1,
      type: 'Pawn' as PieceType,
      color: 'white' as const,
    })),

    // 9-qator: 10 ta qora piyoda
    ...Array.from({ length: 10 }, (_, i) => ({
      file: i,
      rank: 8,
      type: 'Pawn' as PieceType,
      color: 'black' as const,
    })),

    // 10-qator: Qora asosiy figuralar
    { file: 0, rank: 9, type: 'Rook', color: 'black' },
    { file: 1, rank: 9, type: 'Knight', color: 'black' },
    { file: 2, rank: 9, type: 'Bishop', color: 'black' },
    { file: 3, rank: 9, type: 'Nur', color: 'black' }, // N10
    { file: 4, rank: 9, type: 'King', color: 'black' }, // E10
    { file: 5, rank: 9, type: 'Queen', color: 'black' }, // D10
    { file: 6, rank: 9, type: 'Nur', color: 'black' }, // M10
    { file: 7, rank: 9, type: 'Bishop', color: 'black' },
    { file: 8, rank: 9, type: 'Knight', color: 'black' },
    { file: 9, rank: 9, type: 'Rook', color: 'black' },
  ];

  const initialSetupHighlights: DiagramHighlight[] = [
    { file: 3, rank: 0, type: 'jump', badge: 'NUR' },
    { file: 6, rank: 0, type: 'jump', badge: 'NUR' },
    { file: 4, rank: 0, type: 'from', badge: 'Shoh' },
    { file: 5, rank: 0, type: 'from', badge: 'Farzin' },
    { file: 3, rank: 9, type: 'jump', badge: 'NUR' },
    { file: 6, rank: 9, type: 'jump', badge: 'NUR' },
  ];

  // ── 2. DONALARNING RASMLI HARAKAT DIAGRAMMALARI ─────────────────────────
  const PIECE_LESSONS: Array<{
    type: PieceType;
    name: string;
    symbol: string;
    value: string;
    points: number;
    desc: string;
    diagramProps: {
      cols: number;
      rows: number;
      fileLabels?: string[];
      rankLabels?: (number | string)[];
      pieces: DiagramPiece[];
      highlights: DiagramHighlight[];
      arrows?: DiagramArrow[];
      caption: string;
      subCaption: string;
    };
  }> = [
    {
      type: 'Nur',
      name: 'NUR (Light) — Noyob Oʻzbek Donasi',
      symbol: 'Nr',
      value: '7 ball',
      points: 7,
      desc: 'Muallif Nurfullo Nurmatov ixtirosi! Minora/mayak koʻrinishidagi dona. 4 ta toʻgʻri yoʻnalishda (↑, ↓, ←, →) 1, 2 yoki 3 katakka harakatlanadi. Eng muhimi: Yoʻlidagi oʻz va raqib donalari ustidan SAKRAB oʻta oladi va 3 katakkacha masofadagi raqib figurasini uradi!',
      diagramProps: {
        cols: 7,
        rows: 7,
        fileLabels: ['C', 'N', 'E', 'D', 'M', 'F', 'G'],
        rankLabels: [7, 6, 5, 4, 3, 2, 1],
        pieces: [
          { file: 3, rank: 3, type: 'Nur', color: 'white' }, // Markazda Nur (D4)
          { file: 2, rank: 3, type: 'Pawn', color: 'white' }, // Chapdagi to'siq o'z piyodasi (E4)
          { file: 0, rank: 3, type: 'Bishop', color: 'black' }, // Raqib fili (C4)
        ],
        highlights: [
          // Yuqoriga 1, 2, 3
          { file: 3, rank: 4, type: 'move' },
          { file: 3, rank: 5, type: 'move' },
          { file: 3, rank: 6, type: 'move' },
          // Pastga 1, 2, 3
          { file: 3, rank: 2, type: 'move' },
          { file: 3, rank: 1, type: 'move' },
          { file: 3, rank: 0, type: 'move' },
          // O'ngga 1, 2, 3
          { file: 4, rank: 3, type: 'move' },
          { file: 5, rank: 3, type: 'move' },
          { file: 6, rank: 3, type: 'move' },
          // Chapga sakrash: to'siq orqali sakrab o'tadi
          { file: 1, rank: 3, type: 'jump', badge: 'Sakrash' },
          { file: 0, rank: 3, type: 'capture', badge: 'Zarba' },
        ],
        arrows: [
          {
            from: { file: 3, rank: 3 },
            to: { file: 0, rank: 3 },
            color: '#f5b041',
            curve: true,
            label: '⚡ Piyoda ustidan sakrash',
          },
        ],
        caption: 'NUR Harakati: 4 yoʻnalishda 1-3 katak va donalar ustidan SAKRASH',
        subCaption: 'Oʻrtadagi piyodadan sakrab oʻtib, C4 dagi qora filni urib olmoqda!',
      },
    },
    {
      type: 'King',
      name: 'Shoh (King)',
      symbol: 'Kp / K',
      value: 'Cheksiz (Bosh figura)',
      points: 99,
      desc: 'Har qanday 8 yoʻnalishda 1 katakka yuradi va himoyasiz raqib figurasini urib oladi. Shah ostidagi katakka yura olmaydi. Oq Shoh E1, Qora Shoh E10 katagida joylashadi.',
      diagramProps: {
        cols: 5,
        rows: 5,
        fileLabels: ['C', 'N', 'E', 'D', 'M'],
        rankLabels: [6, 5, 4, 3, 2],
        pieces: [
          { file: 2, rank: 2, type: 'King', color: 'white' },
          { file: 3, rank: 3, type: 'Pawn', color: 'black' },
        ],
        highlights: [
          { file: 1, rank: 2, type: 'move' },
          { file: 3, rank: 2, type: 'move' },
          { file: 2, rank: 3, type: 'move' },
          { file: 2, rank: 1, type: 'move' },
          { file: 1, rank: 3, type: 'move' },
          { file: 1, rank: 1, type: 'move' },
          { file: 3, rank: 1, type: 'move' },
          { file: 3, rank: 3, type: 'capture', badge: 'Uradi' },
        ],
        caption: 'Shoh Harakati: Har qanday 8 yoʻnalishda 1 katak',
        subCaption: 'Himoyasiz donani urib oladi, shah ostiga yura olmaydi.',
      },
    },
    {
      type: 'Queen',
      name: 'Farzin / Vazir (Queen)',
      symbol: 'Ф / Q',
      value: '9 ball',
      points: 9,
      desc: 'Toʻgʻri (vertikal, gorizontal) va diagonal boʻyicha istalgan masofaga boʻsh kataklar boʻylab yuradi. Oq Farzin D1 (oʻz rangida), Qora Farzin D10 katagida joylashadi.',
      diagramProps: {
        cols: 7,
        rows: 7,
        fileLabels: ['C', 'N', 'E', 'D', 'M', 'F', 'G'],
        rankLabels: [7, 6, 5, 4, 3, 2, 1],
        pieces: [
          { file: 3, rank: 3, type: 'Queen', color: 'white' },
          { file: 6, rank: 6, type: 'Rook', color: 'black' },
        ],
        highlights: [
          { file: 3, rank: 6, type: 'move' },
          { file: 3, rank: 5, type: 'move' },
          { file: 3, rank: 4, type: 'move' },
          { file: 3, rank: 2, type: 'move' },
          { file: 3, rank: 1, type: 'move' },
          { file: 3, rank: 0, type: 'move' },
          { file: 0, rank: 3, type: 'move' },
          { file: 1, rank: 3, type: 'move' },
          { file: 2, rank: 3, type: 'move' },
          { file: 4, rank: 3, type: 'move' },
          { file: 5, rank: 3, type: 'move' },
          { file: 6, rank: 3, type: 'move' },
          { file: 0, rank: 0, type: 'move' },
          { file: 1, rank: 1, type: 'move' },
          { file: 2, rank: 2, type: 'move' },
          { file: 4, rank: 4, type: 'move' },
          { file: 5, rank: 5, type: 'move' },
          { file: 6, rank: 6, type: 'capture', badge: 'Zarba' },
          { file: 0, rank: 6, type: 'move' },
          { file: 1, rank: 5, type: 'move' },
          { file: 2, rank: 4, type: 'move' },
          { file: 4, rank: 2, type: 'move' },
          { file: 5, rank: 1, type: 'move' },
          { file: 6, rank: 0, type: 'move' },
        ],
        caption: 'Farzin Harakati: Barcha 8 yoʻnalishda toʻliq nurlar',
        subCaption: 'Doskadagi eng qudratli dona: toʻgʻri va diagonal yuradi.',
      },
    },
    {
      type: 'Rook',
      name: 'Rux / Toʻra (Rook)',
      symbol: 'Л / R',
      value: '5 ball',
      points: 5,
      desc: 'Gorizontal va vertikal boʻyicha 9 katakkacha toʻgʻri chiziq boʻylab harakatlanadi. Oqlar A1 va H1, Qoralar A10 va H10 burchaklarida joylashadi. 3 xil rokirovkada qatnashadi.',
      diagramProps: {
        cols: 7,
        rows: 7,
        fileLabels: ['A', 'B', 'C', 'N', 'E', 'D', 'M'],
        rankLabels: [7, 6, 5, 4, 3, 2, 1],
        pieces: [
          { file: 3, rank: 3, type: 'Rook', color: 'white' },
          { file: 3, rank: 6, type: 'Knight', color: 'black' },
        ],
        highlights: [
          { file: 3, rank: 6, type: 'capture', badge: 'Zarba' },
          { file: 3, rank: 5, type: 'move' },
          { file: 3, rank: 4, type: 'move' },
          { file: 3, rank: 2, type: 'move' },
          { file: 3, rank: 1, type: 'move' },
          { file: 3, rank: 0, type: 'move' },
          { file: 0, rank: 3, type: 'move' },
          { file: 1, rank: 3, type: 'move' },
          { file: 2, rank: 3, type: 'move' },
          { file: 4, rank: 3, type: 'move' },
          { file: 5, rank: 3, type: 'move' },
          { file: 6, rank: 3, type: 'move' },
        ],
        caption: 'Rux Harakati: Gorizontal va vertikal toʻgʻri chiziqlar',
        subCaption: 'Burchaklarda joylashadi va 3 xil rokirovkada faol qatnashadi.',
      },
    },
    {
      type: 'Bishop',
      name: 'Fil (Bishop)',
      symbol: 'С / B',
      value: '3 ball',
      points: 3,
      desc: 'Faqat oʻzi turgan rangdagi diagonallar boʻylab harakatlanadi (oq va qora katak fillari). Oqlar C1 va F1, Qoralar C10 va F10 kataklarida joylashadi.',
      diagramProps: {
        cols: 7,
        rows: 7,
        fileLabels: ['A', 'B', 'C', 'N', 'E', 'D', 'M'],
        rankLabels: [7, 6, 5, 4, 3, 2, 1],
        pieces: [
          { file: 3, rank: 3, type: 'Bishop', color: 'white' },
          { file: 6, rank: 6, type: 'Pawn', color: 'black' },
        ],
        highlights: [
          { file: 0, rank: 0, type: 'move' },
          { file: 1, rank: 1, type: 'move' },
          { file: 2, rank: 2, type: 'move' },
          { file: 4, rank: 4, type: 'move' },
          { file: 5, rank: 5, type: 'move' },
          { file: 6, rank: 6, type: 'capture', badge: 'Zarba' },
          { file: 0, rank: 6, type: 'move' },
          { file: 1, rank: 5, type: 'move' },
          { file: 2, rank: 4, type: 'move' },
          { file: 4, rank: 2, type: 'move' },
          { file: 5, rank: 1, type: 'move' },
          { file: 6, rank: 0, type: 'move' },
        ],
        caption: 'Fil Harakati: Oʻz rangidagi diagonallar boʻylab',
        subCaption: 'Hech qachon oʻz katagi rangini oʻzgartirmaydi.',
      },
    },
    {
      type: 'Knight',
      name: 'Ot (Knight)',
      symbol: 'К / N',
      value: '3 ball',
      points: 3,
      desc: '«G» harfi shaklida (2 katak toʻgʻri va 1 katak yoniga) sakraydi. Donalar ustidan sakrab oʻtish qobiliyatiga ega. Oqlar B1 va G1, Qoralar B10 va G10 kataklarida joylashadi.',
      diagramProps: {
        cols: 7,
        rows: 7,
        fileLabels: ['A', 'B', 'C', 'N', 'E', 'D', 'M'],
        rankLabels: [7, 6, 5, 4, 3, 2, 1],
        pieces: [
          { file: 3, rank: 3, type: 'Knight', color: 'white' },
          // Atrofdagi to'siqlar (ot ularni ustidan bemalol sakraydi)
          { file: 3, rank: 4, type: 'Pawn', color: 'white' },
          { file: 2, rank: 3, type: 'Pawn', color: 'white' },
          { file: 4, rank: 3, type: 'Pawn', color: 'white' },
          { file: 5, rank: 4, type: 'Pawn', color: 'black' },
        ],
        highlights: [
          { file: 1, rank: 4, type: 'move' },
          { file: 1, rank: 2, type: 'move' },
          { file: 5, rank: 4, type: 'capture', badge: 'Zarba' },
          { file: 5, rank: 2, type: 'move' },
          { file: 2, rank: 5, type: 'move' },
          { file: 4, rank: 5, type: 'move' },
          { file: 2, rank: 1, type: 'move' },
          { file: 4, rank: 1, type: 'move' },
        ],
        arrows: [
          {
            from: { file: 3, rank: 3 },
            to: { file: 5, rank: 4 },
            color: '#81b64c',
            curve: true,
            label: '«G» sakrashi',
          },
        ],
        caption: 'Ot Harakati: «G» shaklida donalar ustidan sakrash',
        subCaption: 'Oldidagi toʻsiq piyodalariga qaramasdan sakrab oʻtadi.',
      },
    },
    {
      type: 'Pawn',
      name: 'Piyoda (Pawn)',
      symbol: 'p / P',
      value: '1 ball',
      points: 1,
      desc: '100 katakli oʻzbek shaxmatining asosiy qoidasi: Oʻz hududida (2–5 qatorlar) xohishiga koʻra 1, 2 yoki 3 katak oldinga sakray oladi! Raqib hududida (6–10 qator) 1 katakdan yuradi. Diagonal boʻyicha 1 katakdagi raqibni uradi. 10-qatorga yetganda Farzin, Nur, Rux, Fil yoki Otga aylanadi.',
      diagramProps: {
        cols: 6,
        rows: 6,
        fileLabels: ['B', 'C', 'N', 'E', 'D', 'M'],
        rankLabels: [6, 5, 4, 3, 2, 1],
        pieces: [
          { file: 2, rank: 1, type: 'Pawn', color: 'white' }, // 2-qatordagi Oq piyoda (N2)
          { file: 1, rank: 2, type: 'Pawn', color: 'black' }, // Raqib piyodasi (C3)
          { file: 3, rank: 2, type: 'Knight', color: 'black' }, // Raqib oti (E3)
        ],
        highlights: [
          // 1, 2, 3 katak oldinga yurish
          { file: 2, rank: 2, type: 'move', badge: '1' },
          { file: 2, rank: 3, type: 'move', badge: '2' },
          { file: 2, rank: 4, type: 'move', badge: '3' },
          // Diagonal bo'yicha urish
          { file: 1, rank: 2, type: 'capture', badge: 'Uradi' },
          { file: 3, rank: 2, type: 'capture', badge: 'Uradi' },
        ],
        arrows: [
          {
            from: { file: 2, rank: 1 },
            to: { file: 2, rank: 4 },
            color: '#81b64c',
            label: '3 katak sakrash!',
          },
        ],
        caption: 'Piyoda Harakati: Oʻz hududida 1, 2 yoki 3 katak oldinga',
        subCaption: 'Oldinga toʻgʻri yuradi, lekin diagonal boʻyicha urib oladi.',
      },
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#262421] text-[#f1f1f1] flex flex-col font-sans select-none pb-14 max-w-md mx-auto sm:max-w-2xl lg:max-w-5xl">
      {/* ── YUQORI SIKLLIK HEADER ── */}
      <header className="sticky top-0 z-30 bg-[#21201d]/95 backdrop-blur-md border-b border-[#383531] px-4 py-3 flex items-center gap-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_0_#21201d]"
          title="Orqaga"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>NUR CHESS 100</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30">
              Qoidalar & Darslik
            </span>
          </h2>
          <p className="text-[11px] text-[#9b9893]">
            Rasmiy metodik qoʻllanma va koʻrgazmali rasmlar
          </p>
        </div>
        <NurLogo size={34} showGlow={false} />
      </header>

      {/* ── 4 TA SEGMENTLI TABLAR ── */}
      <div className="px-4 pt-3.5">
        <div className="grid grid-cols-4 bg-[#21201d] p-1 rounded-xl border border-[#383531] gap-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'basic'
                ? 'bg-[#81b64c] text-white shadow-sm font-black'
                : 'text-[#9b9893] hover:text-white'
            }`}
          >
            Asosiy
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'pieces'
                ? 'bg-[#81b64c] text-white shadow-sm font-black'
                : 'text-[#9b9893] hover:text-white'
            }`}
          >
            Donalar
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'special'
                ? 'bg-[#81b64c] text-white shadow-sm font-black'
                : 'text-[#9b9893] hover:text-white'
            }`}
          >
            Rokirovka
          </button>
          <button
            onClick={() => setActiveTab('openings')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'openings'
                ? 'bg-[#81b64c] text-white shadow-sm font-black'
                : 'text-[#9b9893] hover:text-white'
            }`}
          >
            Debyutlar
          </button>
        </div>
      </div>

      {/* ── ASOSIY MAZMUN QISMI ── */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* ══════════════════════════════════════════════════════════════
            1. ASOSIY QOIDALAR (TAB 1) — 10x10 RASMLI DOSKA
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'basic' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Hero Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-3">
              <div className="w-full py-3 rounded-2xl bg-gradient-to-tr from-amber-950/30 via-slate-950 to-slate-900 border border-slate-800 flex items-center justify-center gap-4">
                <NurLogo size={60} showGlow={true} />
                <div>
                  <div className="text-xs font-black uppercase text-amber-400">10×10 Dosqa</div>
                  <div className="text-base font-black text-slate-100">100 Kvadratlik Arena</div>
                  <div className="text-[10px] text-slate-400">20 tadan jami 40 dona</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>NUR CHESS 100</strong> — 1970-yillardan boshlab ixtirochi{' '}
                <span className="text-amber-300 font-bold">Nurfullo Nurmatov</span> tomonidan ishlab
                chiqilgan va UzAvtor davlat patenti (№ 000-002-853) bilan tasdiqlangan yangi Oʻzbek
                milliy shaxmatidir.
              </p>
            </div>

            {/* RASM 1: 10x10 Boshlang'ich joylashuv ko'rgazmali doskasi */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <span>♟️</span>
                  <span>10x10 Dosqa va Donalarning Boshlangʻich Safi</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  40 Dona
                </span>
              </div>

              {/* Ko'rgazmali doska rasmi */}
              <BoardDiagram
                cols={10}
                rows={10}
                pieces={initialSetupPieces}
                highlights={initialSetupHighlights}
                caption="1-Rasm: Boshlangʻich terilish holati (10x10 doska)"
                subCaption="N1 va M1 kataklarida oʻzgacha «NUR» donalari, D1 da Farzin, E1 da Shoh joylashgan."
              />

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1 mt-2">
                <div>• Gorizontal ustunlar: A, B, C, N, E, D, M, F, G, H</div>
                <div>• N1: Shoh yonidagi NUR | M1: Farzin yonidagi NUR</div>
                <div>• Oq Shoh E1 (qora katakda), Oq Farzin D1 (oq katakda)</div>
              </div>
            </div>

            {/* RASM 2: 1-100 Raqamli Notatsiya Diagrammasi */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('notation')}
                className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🔢</span>
                  <span>1–100 Raqamli Notatsiya Xaritasi (Rasm)</span>
                </div>
                <span className="text-slate-500 font-mono text-xs">
                  {openAccordions.notation ? '▲' : '▼'}
                </span>
              </button>

              {openAccordions.notation && (
                <div className="px-4 pb-4 text-xs text-slate-300 border-t border-slate-800/60 pt-3 space-y-3">
                  <p className="text-slate-400 leading-relaxed">
                    Har bir harakatni aniq va qulay yozib borish uchun har bir katak 1 dan 100 gacha raqamlangan:
                  </p>

                  <BoardDiagram
                    cols={10}
                    rows={10}
                    pieces={[]}
                    showNumbers={true}
                    caption="2-Rasm: 1 dan 100 gacha raqamli kataklar xaritasi"
                    subCaption="A1=1, B1=2, C1=3 ... H1=10, A2=11 ... H10=100"
                  />
                </div>
              )}
            </div>

            {/* O'yin Maqsadi va Shohmat */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-sm space-y-2">
              <h3 className="text-xs font-black text-amber-300 flex items-center gap-2">
                <span>👑</span>
                <span>Oʻyin Maqsadi va Shohmat</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Asosiy maqsad — raqib Shohiga zarba berib <strong className="text-amber-300">mot</strong> qilishdir.
                Agar Shoh hujum ostida boʻlib, qochishga boʻsh katak boʻlmasa, hujum qilgan donani urib olish imkoni boʻlmasa va zarbani boshqa figura bilan toʻsib boʻlmasa — bu Shohmat boʻlib, oʻyin gʻalaba bilan yakunlanadi.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. DONALARNING HARAKATI (TAB 2) — HAR BIRIGA RASMLI DIAGRAMMA
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'pieces' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Rasmiy ballar jadvali bloki */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 block mb-1">
                Qoʻllanma 55-bet: Donalarning Rasmiy Qiymati:
              </strong>
              «Piyoda 1 qiymatli, Ot 3 qiymatli, Fil 3 qiymatli, Rux 5 qiymatli,{' '}
              <strong className="text-amber-300">NUR 7 qiymatli kuchga</strong>, Farzin 9 qiymatli
              kuchga egadir.»
            </div>

            {/* Donalarni tanlash uchun gorizontal filtr tugmalari */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PIECE_LESSONS.map((p, idx) => (
                <button
                  key={p.type}
                  onClick={() => setSelectedPieceIndex(idx)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                    selectedPieceIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <PieceIcon type={p.type} color="white" size={18} />
                  <span>{p.type === 'Nur' ? 'NUR' : p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Tanlangan figura uchun Katta Ko'rgazmali Rasm Kartasi */}
            {(() => {
              const currentPiece = PIECE_LESSONS[selectedPieceIndex];
              return (
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1">
                        <PieceIcon type={currentPiece.type} color="white" size={32} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{currentPiece.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          Belgisi: {currentPiece.symbol}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {currentPiece.value}
                    </span>
                  </div>

                  {/* Ko'rgazmali rasm-diagramma */}
                  <div className="py-1">
                    <BoardDiagram {...currentPiece.diagramProps} />
                  </div>

                  {/* Tavsif */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {currentPiece.desc}
                  </div>
                </div>
              );
            })()}

            {/* Boshqa barcha figuralarning tezkor ro'yxati */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Barcha 7 ta figura koʻrinishi:
              </h4>
              {PIECE_LESSONS.map((item, idx) => (
                <div
                  key={item.type}
                  onClick={() => setSelectedPieceIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPieceIndex === idx
                      ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1">
                      <PieceIcon type={item.type} color="white" size={28} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.symbol} · {item.value}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">Rasmini koʻrish →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            3. ROKIROVKA VA MAXSUS QOIDALAR (TAB 3) — 3 XIL ROKIROVKA RASMI
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'special' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <span className="text-2xl">🏰</span>
                <div>
                  <h3 className="text-sm font-black text-amber-300">
                    3 Xil Rokirovka Tizimi (Rasmli)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kitob 27–30-betlar: Qisqa, Oʻrta va Uzun rokirovka
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                100 katakli shaxmatda har bir tomon bir partiyada bir marta Shoh va Ruxni birgalikda surish orqali rokirovka qilishi mumkin:
              </p>
            </div>

            {/* 1. QISQA ROKIROVKA RASMI (0-0) */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-400 text-xs sm:text-sm">
                  1. Qisqa Rokirovka (0-0) — Chap qanotga
                </h4>
                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                  Shoh C1, Rux N1
                </span>
              </div>

              <BoardDiagram
                cols={10}
                rows={2}
                rankLabels={[2, 1]}
                startRowIndex={0}
                pieces={[
                  { file: 4, rank: 0, type: 'King', color: 'white', isGhost: true }, // E1 oldingi
                  { file: 0, rank: 0, type: 'Rook', color: 'white', isGhost: true }, // A1 oldingi
                  { file: 2, rank: 0, type: 'King', color: 'white' }, // C1 yangi Shoh
                  { file: 3, rank: 0, type: 'Rook', color: 'white' }, // N1 yangi Rux
                ]}
                arrows={[
                  {
                    from: { file: 4, rank: 0 },
                    to: { file: 2, rank: 0 },
                    color: '#81b64c',
                    curve: true,
                    label: 'Shoh C1 ga',
                  },
                  {
                    from: { file: 0, rank: 0 },
                    to: { file: 3, rank: 0 },
                    color: '#f5b041',
                    curve: true,
                    label: 'Rux N1 ga',
                  },
                ]}
                caption="10-Rasm: Qisqa Rokirovka (0-0)"
                subCaption="Shoh E1 dan C1 ga (2 katak chapga), Rux A1 dan N1 ga oʻtadi."
              />
            </div>

            {/* 2. O'RTA ROKIROVKA RASMI (-0-0-) */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                  2. Oʻrta Rokirovka (-0-0-) — Maxsus Oʻzbekcha
                </h4>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  Shoh M1, Rux D1
                </span>
              </div>

              <BoardDiagram
                cols={10}
                rows={2}
                rankLabels={[2, 1]}
                startRowIndex={0}
                pieces={[
                  { file: 4, rank: 0, type: 'King', color: 'white', isGhost: true }, // E1
                  { file: 9, rank: 0, type: 'Rook', color: 'white', isGhost: true }, // H1
                  { file: 6, rank: 0, type: 'King', color: 'white' }, // M1 Shoh
                  { file: 5, rank: 0, type: 'Rook', color: 'white' }, // D1 Rux
                ]}
                arrows={[
                  {
                    from: { file: 4, rank: 0 },
                    to: { file: 6, rank: 0 },
                    color: '#81b64c',
                    curve: true,
                    label: 'Shoh M1 ga',
                  },
                  {
                    from: { file: 9, rank: 0 },
                    to: { file: 5, rank: 0 },
                    color: '#f5b041',
                    curve: true,
                    label: 'Rux D1 ga',
                  },
                ]}
                caption="11-Rasm: Oʻrta Rokirovka (-0-0-)"
                subCaption="Shoh E1 dan M1 ga (Farzin yoniga), Rux H1 dan D1 ga oʻtadi."
              />
            </div>

            {/* 3. UZUN ROKIROVKA RASMI (0-0-0) */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-400 text-xs sm:text-sm">
                  3. Uzun Rokirovka (0-0-0) — Oʻng qanotga
                </h4>
                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                  Shoh G1, Rux F1
                </span>
              </div>

              <BoardDiagram
                cols={10}
                rows={2}
                rankLabels={[2, 1]}
                startRowIndex={0}
                pieces={[
                  { file: 4, rank: 0, type: 'King', color: 'white', isGhost: true }, // E1
                  { file: 9, rank: 0, type: 'Rook', color: 'white', isGhost: true }, // H1
                  { file: 8, rank: 0, type: 'King', color: 'white' }, // G1 Shoh
                  { file: 7, rank: 0, type: 'Rook', color: 'white' }, // F1 Rux
                ]}
                arrows={[
                  {
                    from: { file: 4, rank: 0 },
                    to: { file: 8, rank: 0 },
                    color: '#81b64c',
                    curve: true,
                    label: 'Shoh G1 ga',
                  },
                  {
                    from: { file: 9, rank: 0 },
                    to: { file: 7, rank: 0 },
                    color: '#f5b041',
                    curve: true,
                    label: 'Rux F1 ga',
                  },
                ]}
                caption="12-Rasm: Uzun Rokirovka (0-0-0)"
                subCaption="Shoh E1 dan G1 ga, Rux esa H1 dan F1 ga oʻtadi."
              />
            </div>

            {/* EN PASSANT VA AYLONISH */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-sm space-y-2 text-xs">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <span>⚡</span> En Passant (Oʻtishda Urish) & Aylanish
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Piyoda 2 yoki 3 katak sakrab raqib piyodasining yonidan oʻtsa, raqib keyingi yurishida uni diagonal boʻyicha oʻtishda urib olish huquqiga ega.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Oq piyoda 10-qatorga, qora piyoda 1-qatorga chiqqanda oʻyinchining tanloviga koʻra Farzin, Nur, Rux, Fil yoki Otga aylanadi.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            4. DARSLIK VA DEBYUTLAR (TAB 4) — TO'LIQ RASMLI DARSLAR
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'openings' && (
          <div className="space-y-4 animate-fadeIn">
            {/* 1. O'ZBEKCHA HIMOYA DEBYUTI */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h4 className="font-black text-amber-300 text-sm">
                  «Oʻzbekcha Himoya» Debyuti
                </h4>
                <span className="text-[10px] text-amber-400 font-mono">Qoʻllanma 51-bet</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Muallif Nurfullo Nurmatov tomonidan tavsiya etilgan maxsus strategik himoya:
              </p>

              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 font-mono text-xs text-amber-300 space-y-0.5">
                <div>1. m5 m6</div>
                <div>2. n5 n6</div>
                <div>3. Кf3 Кf8</div>
                <div>4. Кc3 Кc8</div>
              </div>

              {/* Rasmli doska diagrammasi */}
              <BoardDiagram
                cols={10}
                rows={10}
                pieces={[
                  // Oqlar pozitsiyasi
                  { file: 6, rank: 4, type: 'Pawn', color: 'white' }, // m5
                  { file: 3, rank: 4, type: 'Pawn', color: 'white' }, // n5
                  { file: 7, rank: 2, type: 'Knight', color: 'white' }, // Kf3
                  { file: 2, rank: 2, type: 'Knight', color: 'white' }, // Kc3
                  { file: 2, rank: 0, type: 'Bishop', color: 'white' }, // C1 fil
                  { file: 7, rank: 0, type: 'Bishop', color: 'white' }, // F1 fil
                  { file: 4, rank: 0, type: 'King', color: 'white' },
                  { file: 5, rank: 0, type: 'Queen', color: 'white' },

                  // Qoralar pozitsiyasi
                  { file: 6, rank: 5, type: 'Pawn', color: 'black' }, // m6
                  { file: 3, rank: 5, type: 'Pawn', color: 'black' }, // n6
                  { file: 7, rank: 7, type: 'Knight', color: 'black' }, // Kf8
                  { file: 2, rank: 7, type: 'Knight', color: 'black' }, // Kc8
                  { file: 4, rank: 9, type: 'King', color: 'black' },
                  { file: 5, rank: 9, type: 'Queen', color: 'black' },
                ]}
                highlights={[
                  { file: 6, rank: 4, type: 'jump', badge: 'm5' },
                  { file: 3, rank: 4, type: 'jump', badge: 'n5' },
                ]}
                arrows={[
                  {
                    from: { file: 2, rank: 2 },
                    to: { file: 3, rank: 4 },
                    color: '#81b64c',
                    label: 'Himoya',
                  },
                  {
                    from: { file: 7, rank: 2 },
                    to: { file: 6, rank: 4 },
                    color: '#81b64c',
                    label: 'Himoya',
                  },
                ]}
                caption="13-Rasm: «Oʻzbekcha Himoya» — Markaziy mustahkam istehkom"
                subCaption="Surilgan markaziy m5 va n5 piyodalari Fil va Ot tomonidan mustahkam himoyalangan."
              />
            </div>

            {/* 2. BOLALARCHA 3 YURISHDA MOT RASMI */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h4 className="font-black text-slate-100 text-sm">
                  Bolalarcha 3 Yurishda Mot (Tezkor Mat)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Qoʻllanma 55-bet</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 space-y-0.5">
                <div>1. Nr n4  Kf8</div>
                <div>2. Nre4  e8</div>
                <div>3. Nr:e7X (Qoralar mot boʻldi!)</div>
              </div>

              <BoardDiagram
                cols={8}
                rows={8}
                fileLabels={['B', 'C', 'N', 'E', 'D', 'M', 'F', 'G']}
                rankLabels={[10, 9, 8, 7, 6, 5, 4, 3]}
                startColIndex={1}
                startRowIndex={2}
                pieces={[
                  { file: 4, rank: 9, type: 'King', color: 'black' }, // E10 shoh
                  { file: 3, rank: 8, type: 'Pawn', color: 'black' }, // N9
                  { file: 5, rank: 8, type: 'Pawn', color: 'black' }, // D9
                  { file: 4, rank: 6, type: 'Nur', color: 'white' }, // E7 da Nur
                ]}
                highlights={[
                  { file: 4, rank: 9, type: 'check', badge: 'MAT!' },
                  { file: 4, rank: 6, type: 'jump', badge: 'Zarba' },
                ]}
                arrows={[
                  {
                    from: { file: 4, rank: 6 },
                    to: { file: 4, rank: 9 },
                    color: '#ef4444',
                    label: '⚡ Shah va Mot!',
                  },
                ]}
                caption="14-Rasm: Bolalarcha 3 yurishda mot (Nr:e7X)"
                subCaption="Nur donasi oʻzining sakrab oʻtish kuchi hisobiga qora shohga toʻgʻridan-toʻgʻri mot qoʻydi!"
              />
            </div>

            {/* 3. FARZINNI YUTIB OLISH KOMBINATSIYASI RASMI */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h4 className="font-black text-slate-100 text-sm">
                  Farzinni Yutib Olish Kombinatsiyasi
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Qoʻllanma 55-bet</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-400 space-y-0.5">
                <div>1. Nr m4  Kc8</div>
                <div>2. Nrd4  d8</div>
                <div>3. Nr d7  Ф d7</div>
                <div>4. N:d7 (Farzin yutib olinadi)</div>
              </div>

              <BoardDiagram
                cols={8}
                rows={8}
                fileLabels={['B', 'C', 'N', 'E', 'D', 'M', 'F', 'G']}
                rankLabels={[10, 9, 8, 7, 6, 5, 4, 3]}
                startColIndex={1}
                startRowIndex={2}
                pieces={[
                  { file: 5, rank: 6, type: 'Queen', color: 'black' }, // D7
                  { file: 3, rank: 6, type: 'Nur', color: 'white' }, // N7
                ]}
                highlights={[
                  { file: 5, rank: 6, type: 'capture', badge: 'Farzin' },
                  { file: 3, rank: 6, type: 'jump', badge: 'NUR' },
                ]}
                arrows={[
                  {
                    from: { file: 3, rank: 6 },
                    to: { file: 5, rank: 6 },
                    color: '#f5b041',
                    label: 'Farzinga zarba',
                  },
                ]}
                caption="15-Rasm: Nur donasi bilan Farzinni tuzoqqa tushirish"
                subCaption="Nur donasining kutilmagan sakrash zarbasi bilan qoralar farzini yutib olinadi."
              />
            </div>

            {/* Mualliflik va Patent guvohnomasi */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="text-slate-200 font-bold">NUR CHESS 100 — Oʻzbek Shaxmati</div>
              <div>
                Mualliflik guvohnomasi: <strong>UzAvtor № 000-002-853</strong> (09.12.2025).
              </div>
              <div>
                Muallif: <strong>Nurfullo Nurmatov</strong> · «Texno Print Navoiy», 2026 y.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
