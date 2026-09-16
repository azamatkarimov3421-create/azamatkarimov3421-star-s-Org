// =====================================================
// NUR CHESS 100 — 7. Qoidalar Ekrani (Rules Screen)
// Muallif Nurfullo Nurmatovning rasmiy metodik qo'llanmasi asosida
// =====================================================

import React, { useState } from 'react';
import NurLogo from '../components/NurLogo';
import PieceIcon from '../components/PieceIcon';
import { PieceType } from '../engine/types';

interface RulesScreenProps {
  onBack: () => void;
}

type TabKey = 'basic' | 'pieces' | 'special' | 'openings';

export default function RulesScreen({ onBack }: RulesScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    goal: true,
    setup: true,
    notation: false,
    win: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const PIECE_INFO: Array<{
    type: PieceType;
    name: string;
    symbol: string;
    value: string;
    points: number;
    desc: string;
  }> = [
    {
      type: 'King',
      name: 'Shoh (King)',
      symbol: 'Kp / K',
      value: 'Cheksiz (Bosh figura)',
      points: 99,
      desc: 'Har qanday 8 yoʻnalishda 1 katakka yuradi va himoyasiz raqib figurasini urib oladi. Shah ostidagi katakka yura olmaydi. Oq Shoh E1, Qora Shoh E10 katagida joylashadi.',
    },
    {
      type: 'Queen',
      name: 'Farzin / Vazir (Queen)',
      symbol: 'Ф / Q',
      value: '9 ball',
      points: 9,
      desc: 'Toʻgʻri (vertikal, gorizontal) va diagonal boʻyicha istalgan masofaga boʻsh kataklar boʻylab yuradi. Oq Farzin D1 (oʻz rangida), Qora Farzin D10 katagida joylashadi.',
    },
    {
      type: 'Nur',
      name: 'NUR (Light) — Noyob Oʻzbek Donasi',
      symbol: 'Nr',
      value: '7 ball',
      points: 7,
      desc: 'Muallif ixtirosi! Minora/mayak koʻrinishidagi figura. 4 ta toʻgʻri yoʻnalishda (↑, ↓, ←, →) 1, 2 yoki 3 katakka harakatlanadi. Yoʻlidagi oʻz va raqib donalari ustidan SAKRAB oʻta oladi! Raqib donasini urib oladi. Doskada 2 ta: N1 va M1 kataklarida joylashadi.',
    },
    {
      type: 'Rook',
      name: 'Rux / Toʻra (Rook)',
      symbol: 'Л / R',
      value: '5 ball',
      points: 5,
      desc: 'Gorizontal va vertikal boʻyicha 9 katakkacha toʻgʻri chiziq boʻylab harakatlanadi. Oqlar A1 va H1, Qoralar A10 va H10 burchaklarida joylashadi. 3 xil rokirovkada qatnashadi.',
    },
    {
      type: 'Bishop',
      name: 'Fil (Bishop)',
      symbol: 'С / B',
      value: '3 ball',
      points: 3,
      desc: 'Faqat oʻzi turgan rangdagi diagonallar boʻylab harakatlanadi (oq va qora katak fillari). Oqlar C1 va F1, Qoralar C10 va F10 kataklarida joylashadi.',
    },
    {
      type: 'Knight',
      name: 'Ot (Knight)',
      symbol: 'К / N',
      value: '3 ball',
      points: 3,
      desc: '«G» harfi shaklida (2 katak toʻgʻri va 1 katak yoniga) sakraydi. Donalar ustidan sakrab oʻtish qobiliyatiga ega. Oqlar B1 va G1, Qoralar B10 va G10 kataklarida joylashadi.',
    },
    {
      type: 'Pawn',
      name: 'Piyoda (Pawn)',
      symbol: 'p / P',
      value: '1 ball',
      points: 1,
      desc: 'Oʻz hududida (2–5 qator) xohishiga koʻra 1, 2 yoki 3 katak oldinga yura oladi! Raqib hududida (6–10 qator) 1 katakdan yuradi. Diagonal boʻyicha 1 katakdagi raqibni uradi. 10-qatorga yetganda Farzin, Nur, Rux, Fil yoki Otga aylanadi.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-14 max-w-md mx-auto sm:max-w-xl">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 py-3.5 flex items-center gap-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg font-bold transition-all active:scale-95 shadow-inner"
          title="Orqaga"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-2">
            <span>NUR CHESS 100</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Qoidalar
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">100 katakli Oʻzbek shaxmatining rasmiy qoʻllanmasi</p>
        </div>
        <NurLogo size={34} showGlow={false} />
      </header>

      {/* 4 Ta Segmentli Tablar */}
      <div className="px-4 pt-3.5">
        <div className="grid grid-cols-4 bg-slate-950/90 p-1 rounded-2xl border border-slate-800/90 gap-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'basic'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Asosiy
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'pieces'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Donalar
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'special'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rokirovka
          </button>
          <button
            onClick={() => setActiveTab('openings')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'openings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Debyutlar
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 space-y-3.5">
        {/* ── 1. ASOSIY QOIDALAR (TAB 1) ─────────────────────────────────── */}
        {activeTab === 'basic' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Hero Card: 100 Katakli Shaxmat */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-3">
              <div className="w-full py-4 rounded-2xl bg-gradient-to-tr from-amber-950/30 via-slate-950 to-slate-900 border border-slate-800 flex items-center justify-center gap-4">
                <NurLogo size={70} showGlow={true} />
                <div>
                  <div className="text-xs font-black uppercase text-amber-400">10×10 Dosqa</div>
                  <div className="text-base font-black text-slate-100">100 Kvadratlik Arena</div>
                  <div className="text-[10px] text-slate-400">20 tadan jami 40 dona</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>NUR CHESS 100</strong> — 1970-yillardan boshlab ixtirochi <span className="text-amber-300 font-bold">Nurfullo Nurmatov</span> tomonidan ishlab chiqilgan va UzAvtor davlat patenti (№ 000-002-853) bilan tasdiqlangan yangi Oʻzbek milliy shaxmatidir. Oʻyin FIDE xalqaro qoidalariga toʻliq mos keladi.
              </p>
            </div>

            {/* Akkordeonlar */}
            <div className="space-y-2">
              {/* O'yin maqsadi */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleAccordion('goal')}
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">👑</span>
                    <span>Oʻyin Maqsadi va Shohmat</span>
                  </div>
                  <span className="text-slate-500 font-mono text-xs">{openAccordions.goal ? '▲' : '▼'}</span>
                </button>
                {openAccordions.goal && (
                  <div className="px-4 pb-3.5 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5 leading-relaxed space-y-1">
                    <p>Har ikki oʻyinchining maqsadi — oʻz shohini himoyalagan holda, raqib shohiga zarba berib <strong className="text-amber-300">mot</strong> qilishdir.</p>
                    <p>Agar shoh shah ostida boʻlib, boshqa katakka qocha olmasa, hujum qilayotgan donani urib ololmasa va boshqa figura bilan yoʻlni toʻsa olmasa — shohmat hisoblanadi va oʻyin gʻalaba bilan tugaydi.</p>
                  </div>
                )}
              </div>

              {/* Boshlang'ich joylashuv */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleAccordion('setup')}
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">♟️</span>
                    <span>Donalarning Boshlangʻich Safi (1-qator)</span>
                  </div>
                  <span className="text-slate-500 font-mono text-xs">{openAccordions.setup ? '▲' : '▼'}</span>
                </button>
                {openAccordions.setup && (
                  <div className="px-4 pb-3.5 text-xs text-slate-300 border-t border-slate-800/60 pt-2.5 leading-relaxed space-y-2">
                    <p className="text-slate-400">Gorizontal ustunlar harflari: <strong className="text-amber-400 font-mono">A, B, C, N, E, D, M, F, G, H</strong></p>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1">
                      <div>• A1: Rux (Toʻra) | B1: Ot | C1: Fil</div>
                      <div>• <strong className="text-yellow-400">N1: NUR</strong> (Shoh yonidagi nur)</div>
                      <div>• E1: Shoh (Qora katakda) | D1: Farzin (Oq katakda)</div>
                      <div>• <strong className="text-yellow-400">M1: NUR</strong> (Farzin yonidagi nur)</div>
                      <div>• F1: Fil | G1: Ot | H1: Rux (Toʻra)</div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      2-qatorda 10 ta oq piyoda saf tortadi. Qoralar xuddi shu tartibda 9- va 10-qatorlarda joylashadi.
                    </p>
                    <div className="text-[10px] text-amber-400/90 font-semibold">
                      ✦ Qoʻllanma 13-bet: H1 kvadrat katagida «NUR CHESS 100» rasmiy logotipi joylashtiriladi.
                    </div>
                  </div>
                )}
              </div>

              {/* 1-100 Raqamli notatsiya */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleAccordion('notation')}
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔢</span>
                    <span>1–100 Raqamli Notatsiya Tizimi</span>
                  </div>
                  <span className="text-slate-500 font-mono text-xs">{openAccordions.notation ? '▲' : '▼'}</span>
                </button>
                {openAccordions.notation && (
                  <div className="px-4 pb-3.5 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5 leading-relaxed space-y-1.5">
                    <p>Kitobning 10–13 betlarida koʻrsatilganidek, harakatlarni tez va oson yozib borish uchun har bir katak 1 dan 100 gacha raqamlangan:</p>
                    <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      a1=1, b1=2, c1=3, n1=4, e1=5, d1=6, m1=7, f1=8, g1=9, h1=10 ... h10=100
                    </div>
                    <p>Oʻyinchilar harflar bilan birga raqamli notatsiyadan ham erkin foydalanishlari mumkin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. DONALAR VA QIYMATLARI (TAB 2) ─────────────────────────── */}
        {activeTab === 'pieces' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Rasmiy ballar jadvali bloki */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 block mb-1">Qoʻllanma 55-bet: Donalarning Rasmiy Qiymati:</strong>
              «Piyoda 1 qiymatli kuchda, Ot 3 qiymatli kuchda, Fil 3 qiymatli kuchga, Rux 5 qiymatli kuchga, <strong className="text-amber-300">NUR 7 qiymatli kuchga</strong>, Farzin 9 qiymatli kuchga egadir.»
            </div>

            {/* Barcha 7 ta figura ro'yxati */}
            <div className="space-y-2.5">
              {PIECE_INFO.map((item) => (
                <div
                  key={item.type}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center">
                    <PieceIcon type={item.type} color="white" size={40} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-100 text-xs sm:text-sm">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.value}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Belgisi: {item.symbol}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. 3 XIL ROKIROVKA VA MAXSUS QOIDALAR (TAB 3) ─────────────── */}
        {activeTab === 'special' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* 3 xil rokirovka kartasi (Kitob 27-30 betlar) */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <span className="text-xl">🏰</span>
                <div>
                  <h3 className="text-sm font-black text-amber-300">
                    3 Xil Rokirovka Tizimi
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kitob 27–30-betlar: Qisqa, Oʻrta va Uzun rokirovka
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                100 katakli shaxmatda har bir tomon bir partiyada bir marta oʻz xohishi bilan Shoh va Ruxni birgalikda surish orqali rokirovka qilishi mumkin:
              </p>

              <div className="space-y-2 pt-1 text-xs">
                {/* 1. Qisqa rokirovka */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-400 font-bold">1. Qisqa Rokirovka (0-0)</strong>
                    <span className="text-[10px] font-mono text-slate-400">Chap qanotga</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Shoh <strong>E1</strong> (E10) dan <strong>C1</strong> (C10) ga oʻtadi, Rux esa <strong>A1</strong> (A10) dan <strong>N1</strong> (N10) ga oʻtadi.
                  </p>
                </div>

                {/* 2. O'rta rokirovka */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-300 font-bold">2. Oʻrta Rokirovka (-0-0-)</strong>
                    <span className="text-[10px] font-mono text-amber-400/90">Maxsus Oʻzbekcha</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Shoh <strong>E1</strong> (E10) dan <strong>M1</strong> (M10) ga oʻtadi, Rux esa <strong>H1</strong> (H10) dan <strong>D1</strong> (D10) ga oʻtadi.
                  </p>
                </div>

                {/* 3. Uzun rokirovka */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-400 font-bold">3. Uzun Rokirovka (0-0-0)</strong>
                    <span className="text-[10px] font-mono text-slate-400">Oʻng qanotga</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Shoh <strong>E1</strong> (E10) dan <strong>G1</strong> (G10) ga oʻtadi, Rux esa <strong>H1</strong> (H10) dan <strong>F1</strong> (F10) ga oʻtadi.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 space-y-0.5">
                <div>• Shoh va Rux oʻrtasidagi kataklar boʻsh boʻlishi shart.</div>
                <div>• Shoh shah ostida boʻlmasligi va bosib oʻtadigan kataklar raqib hujumi ostida boʻlmasligi kerak.</div>
                <div>• Shoh va rokirovka qiluvchi Rux oldin surilmagan boʻlishi lozim.</div>
              </div>
            </div>

            {/* Piyoda o'tishda urishi va aylanishi */}
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

        {/* ── 4. DEBYUTLAR VA MUALLIFLIK (TAB 4) ────────────────────────── */}
        {activeTab === 'openings' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* O'zbekcha Himoya */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-amber-300 text-sm">
                  «Oʻzbekcha Himoya» Debyuti
                </h4>
                <span className="text-[10px] text-amber-400/90 font-mono">Qoʻllanma 51-bet</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Muallif Nurfullo Nurmatov tomonidan ishlab chiqilgan va tavsiya etilgan maxsus strategik debyut:
              </p>
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/30 font-mono text-xs text-amber-300 space-y-1">
                <div>1. m5 m6</div>
                <div>2. n5 n6</div>
                <div>3. Кf3 Кf8</div>
                <div>4. Кc3 Кc8</div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ushbu himoya holatida surilgan markaziy piyodalar ikki yoqlama — yaʼni <strong>Fil</strong> va <strong>Ot</strong> tomonidan mustahkam himoyalangan boʻladi.
              </p>
            </div>

            {/* Bolalarcha 3 yurishda mot */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-100 text-sm">
                  Bolalarcha 3 Yurishda Mot
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Qoʻllanma 55-bet</span>
              </div>
              <p className="text-xs text-slate-300">
                Nur donasining sakrab oʻtish kuchi hisobiga tezkor shohmat kombinatsiyasi:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                <div>1. Nr n4  Kf8</div>
                <div>2. Nre4  e8</div>
                <div>3. Nr:e7X (Qoralar mot boʻldi)</div>
              </div>
            </div>

            {/* 3 yurishda xatolik bilan farzinni yutib olish */}
            <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-100 text-sm">
                  Farzinni Yutib Olish Kombinatsiyasi
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Qoʻllanma 55-bet</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-400 space-y-1">
                <div>1. Nr m4  Kc8</div>
                <div>2. Nrd4  d8</div>
                <div>3. Nr d7  Ф d7</div>
                <div>4. N:d7 (Farzin yutib olinadi)</div>
              </div>
            </div>

            {/* Mualliflik va Patent guvohnomasi qisqacha */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="text-slate-200 font-bold">NUR CHESS 100 — Oʻzbek Shaxmati</div>
              <div>Mualliflik guvohnomasi: <strong>UzAvtor № 000-002-853</strong> (09.12.2025).</div>
              <div>Muallif: <strong>Nurfullo Nurmatov</strong> · «Texno Print Navoiy», 2026 y.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
