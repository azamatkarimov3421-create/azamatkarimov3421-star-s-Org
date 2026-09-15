// =====================================================
// NUR SHAXMAT 100 — Harakatlar Tarixi va Qoidalar Paneli
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';

export default function MoveHistory() {
  const { state, dispatch } = useGame();
  const { game, useNumericNotation } = state;
  const { moveHistory } = game;
  const listRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'history' | 'rules'>('history');
  const [copied, setCopied] = useState(false);

  // Avtomatik pastga aylantirish
  useEffect(() => {
    if (listRef.current && activeTab === 'history') {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moveHistory.length, activeTab]);

  const movePairs: Array<[typeof moveHistory[0]?, typeof moveHistory[0]?]> = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  // Notatsiyadan nusxa olish
  const handleCopyHistory = () => {
    if (moveHistory.length === 0) return;
    const text = movePairs
      .map(([w, b], idx) => `${idx + 1}. ${w?.notation || ''} ${b?.notation || ''}`.trim())
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden w-full lg:w-[280px] h-[520px] transition-all">
      {/* Tablar boshqaruvi */}
      <div className="flex bg-slate-950/70 p-1.5 border-b border-slate-800/80 gap-1">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>📜</span>
          <span>Tarix</span>
          {moveHistory.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'history' ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {moveHistory.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>⭐</span>
          <span>Qoidalar</span>
        </button>
      </div>

      {/* Tab 1: Harakatlar Tarixi */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Qo'shimcha tugmalar paneli */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border-b border-slate-800/60 text-xs">
            <span className="text-slate-400 font-medium">Notatsiya turi:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_NOTATION' })}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors shadow-sm"
                title="Harf (A-H) yoki Raqamli (1-100) notatsiya"
              >
                {useNumericNotation ? '1–100' : 'A–H'}
              </button>

              <button
                onClick={handleCopyHistory}
                disabled={moveHistory.length === 0}
                className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700 transition-colors"
                title="Harakatlarni nusxalash"
              >
                {copied ? '✓ Nusxalandi' : '📋 Nusxa'}
              </button>
            </div>
          </div>

          {/* Harakatlar ro'yxati */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2.5 space-y-1 font-mono text-xs">
            {movePairs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <div className="text-4xl mb-2 opacity-30">♟</div>
                <div className="font-sans font-medium text-xs">O'yin hali boshlanmadi</div>
                <div className="font-sans text-[11px] text-slate-600 mt-1 text-center">
                  Donani tanlang va katakka bosing
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-800/80">
                    <th className="text-left pb-1.5 w-9 pl-1">#</th>
                    <th className="text-left pb-1.5 pl-2">Oq</th>
                    <th className="text-left pb-1.5 pl-2">Qora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {movePairs.map(([whiteMove, blackMove], idx) => {
                    const isLastPair = idx === movePairs.length - 1;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors rounded-lg ${
                          isLastPair ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-1.5 text-slate-500 text-right pr-2 pl-1 font-sans text-[11px]">
                          {idx + 1}.
                        </td>
                        <td className="py-1.5 pl-2 text-amber-200 font-semibold">
                          <span
                            className={
                              isLastPair && !blackMove
                                ? 'bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold'
                                : ''
                            }
                          >
                            {whiteMove?.notation || ''}
                          </span>
                        </td>
                        <td className="py-1.5 pl-2 text-sky-200 font-semibold">
                          <span
                            className={
                              isLastPair && blackMove
                                ? 'bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold'
                                : ''
                            }
                          >
                            {blackMove?.notation || ''}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pastki qism */}
          <div className="bg-slate-950/70 px-4 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Jami harakatlar:</span>
            <span className="font-bold text-slate-200">{moveHistory.length} ta</span>
          </div>
        </div>
      )}

      {/* Tab 2: Qoidalar & Nur Donasi */}
      {activeTab === 'rules' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
          {/* Nur Donasi */}
          <div className="bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent border border-amber-500/30 rounded-xl p-3 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⭐</span>
              <h4 className="font-bold text-amber-300 text-sm">Nur (Nr) — Yangi Dona</h4>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-amber-200">Qiymati:</strong> 7 ball.
              </li>
              <li>
                <strong className="text-amber-200">Harakati:</strong> To'rt to'g'ri yo'nalishda (↑, ↓, ←, →) 1, 2 yoki 3 kvadrat.
              </li>
              <li>
                <strong className="text-amber-200">Maxsus kuchi:</strong> Donalar (o'z va raqib) ustidan <strong>sakrab o'ta oladi</strong>!
              </li>
              <li>
                <strong className="text-amber-200">Yeyish:</strong> Sakrab o'tib, qo'ngan kvadratdagi raqib donasini urib oladi.
              </li>
            </ul>
          </div>

          {/* Piyoda Qoidalari */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
            <h4 className="font-bold text-slate-200 text-xs mb-1.5 flex items-center gap-1.5">
              <span>♟️</span> Piyoda o'ziga xosligi
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              <li>Boshlang'ich joyidan 1, 2 yoki 3 kvadrat oldinga siljishi mumkin.</li>
              <li>Raqib hududiga kirgach faqat 1 kvadrat harakatlanadi.</li>
              <li>Oxirgi qatorda Vazir, Nur, Tura, Fil yoki Otga aylanadi.</li>
            </ul>
          </div>

          {/* 3 Xil Rokirovka */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
            <h4 className="font-bold text-slate-200 text-xs mb-1.5 flex items-center gap-1.5">
              <span>🏰</span> Uch xil rokirovka
            </h4>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="font-bold text-amber-400">0-0 (Qisqa):</span> Shoh E→C, Tura A→N
              </div>
              <div>
                <span className="font-bold text-amber-400">-0-0- (O'rta):</span> Shoh E→M, Tura H→D
              </div>
              <div>
                <span className="font-bold text-amber-400">0-0-0 (Uzun):</span> Shoh E→G, Tura H→F
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
