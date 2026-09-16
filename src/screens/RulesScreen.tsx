// =====================================================
// NUR CHESS 100 — 7. Qoidalar Ekrani (Rules Screen)
// =====================================================

import React, { useState } from 'react';

interface RulesScreenProps {
  onBack: () => void;
}

export default function RulesScreen({ onBack }: RulesScreenProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'pieces' | 'special'>('basic');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    goal: true,
    setup: false,
    moves: false,
    win: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen w-full bg-[#070b12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,20,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none pb-12 max-w-md mx-auto sm:max-w-xl">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-4 py-3.5 flex items-center gap-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center text-lg font-bold transition-all active:scale-95"
          title="Orqaga"
        >
          ←
        </button>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-100">
            Qoidalar
          </h2>
          <p className="text-xs text-slate-400">100 kvadratlik Oʻzbek shaxmati qoʻllanmasi</p>
        </div>
      </header>

      {/* Tablar (Asosiy, Figuralar, Maxsus) */}
      <div className="px-4 pt-4">
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 gap-1">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'basic'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Asosiy
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'pieces'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Figuralar
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'special'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Maxsus
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Tab 1: Asosiy */}
        {activeTab === 'basic' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Hero Card: 10x10 Shaxmat Qoidalari (Mockup #7 kabi) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-3">
              <div className="w-full h-36 rounded-2xl bg-gradient-to-tr from-amber-950/40 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <span className="text-5xl">♟️</span>
                  <div className="text-xs font-black text-amber-300 mt-1">10×10 Dosqa (100 Kvadrat)</div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-amber-300">
                  10×10 Shaxmat Qoidalari
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong>Nur Chess 100</strong> — bu klassik shaxmatning kengaytirilgan milliy versiyasi boʻlib, 10×10 doskada oʻynaladi. Har bir tomon 20 ta figuraga ega boʻlib, oʻyinga maxsus <strong>Nur (Nr)</strong> donasi qoʻshilgan.
                </p>
              </div>
            </div>

            {/* Akkordeonlar (Mockup #7 kabi) */}
            <div className="space-y-2.5">
              {/* 1. O'yin maqsadi */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-md">
                <button
                  onClick={() => toggleAccordion('goal')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span>👑</span>
                    <span>Oʻyinning maqsadi</span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">
                    {openAccordions.goal ? '▲' : '▼'}
                  </span>
                </button>
                {openAccordions.goal && (
                  <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-800/60 pt-3 leading-relaxed">
                    Asosiy maqsad — raqib Shohiga mot qoʻyish (shohmat). Shoh tahdid ostida boʻlganda va hech qanday qonuniy himoya yoʻli qolmaganda oʻyin gʻalaba bilan tugaydi.
                  </div>
                )}
              </div>

              {/* 2. Boshlang'ich joylashuv */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-md">
                <button
                  onClick={() => toggleAccordion('setup')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span>🏆</span>
                    <span>Boshlangʻich joylashuv</span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">
                    {openAccordions.setup ? '▲' : '▼'}
                  </span>
                </button>
                {openAccordions.setup && (
                  <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-800/60 pt-3 leading-relaxed space-y-1.5">
                    <p>Oqlar 1- va 2-qatorda, Qoralar 9- va 10-qatorda joylashadi:</p>
                    <p className="font-mono text-[11px] text-amber-200">
                      1-qator: Tura, Ot, Fil, Vazir, Shoh, Nur, Fil, Ot, Tura, Tura
                    </p>
                    <p>2-qator: 10 ta piyoda toʻliq saf tortadi.</p>
                  </div>
                )}
              </div>

              {/* 3. Figuralar harakati */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-md">
                <button
                  onClick={() => toggleAccordion('moves')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span>♟</span>
                    <span>Figuralar harakati</span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">
                    {openAccordions.moves ? '▲' : '▼'}
                  </span>
                </button>
                {openAccordions.moves && (
                  <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-800/60 pt-3 leading-relaxed space-y-1.5">
                    <p><strong>Shoh</strong>: har tomonlama 1 kvadrat.</p>
                    <p><strong>Vazir</strong>: toʻgʻri va diagonal boʻylab xohlagancha.</p>
                    <p><strong>Nur</strong>: vertikal va gorizontal 1, 2 yoki 3 kvadrat <strong>sakrab</strong> harakatlanadi!</p>
                    <p><strong>Tura, Fil, Ot</strong>: klassik shaxmatdagi kabi.</p>
                  </div>
                )}
              </div>

              {/* 4. G'alaba shartlari */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-md">
                <button
                  onClick={() => toggleAccordion('win')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span>⭐</span>
                    <span>Gʻalaba shartlari</span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">
                    {openAccordions.win ? '▲' : '▼'}
                  </span>
                </button>
                {openAccordions.win && (
                  <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-800/60 pt-3 leading-relaxed space-y-1">
                    <p>• <strong>Shohmat</strong>: raqib shohi mot qilindi.</p>
                    <p>• <strong>Taslim boʻlish</strong>: raqib taslim boʻldi.</p>
                    <p>• <strong>Vaqt boʻyicha</strong>: raqib vaqti tugadi.</p>
                    <p>• <strong>Pat</strong>: yurish imkoni yoʻq (durang).</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Figuralar (Nur va boshqalar) */}
        {activeTab === 'pieces' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Nur Donasi Maxsus */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">☀️</span>
                <div>
                  <h3 className="font-black text-amber-300 text-base">Nur (Nr) — 7 Ball</h3>
                  <p className="text-xs text-slate-400">Yangi Oʻzbek donasi</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                <li>Har qanday 4 ta toʻgʻri yoʻnalishda (↑, ↓, ←, →) 1, 2 yoki 3 kvadrat harakatlanadi.</li>
                <li>Oʻz va raqib donalari ustidan <strong>sakrab oʻta oladi</strong>!</li>
                <li>Sakrab oʻtib qoʻngan kvadratdagi raqib donasini yeydi.</li>
              </ul>
            </div>

            {/* Piyoda o'ziga xosligi */}
            <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-2">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>♟️</span> Piyoda qoidalari
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Boshlangʻich oʻrnidan 1, 2 yoki 3 kvadrat oldinga siljishi mumkin. Raqib hududiga kirgach 1 kvadratdan harakatlanadi. 10-qatorda Vazir, Nur, Tura, Fil yoki Otga aylanadi.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Maxsus (3 xil rokirovka) */}
        {activeTab === 'special' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-2">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span>🏰</span> 3 Xil Rokirovka Tizimi
              </h4>
              <div className="space-y-2 text-xs text-slate-300 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <strong className="text-amber-300">0-0 (Qisqa):</strong> Shoh E dan C ga, Tura A dan N ga oʻtadi.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <strong className="text-amber-300">-0-0- (Oʻrta):</strong> Shoh E dan M ga, Tura H dan D ga oʻtadi.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <strong className="text-amber-300">0-0-0 (Uzun):</strong> Shoh E dan G ga, Tura H dan F ga oʻtadi.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
