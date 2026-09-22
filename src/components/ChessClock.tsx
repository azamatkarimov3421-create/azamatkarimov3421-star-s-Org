// =====================================================
// NUR SHAXMAT 100 — Shaxmat Soati va Taymeri (Chess Clock)
// Chess.com uslubidagi zamonaviy vaqt nazorati
// =====================================================

import React, { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore';
import { Color } from '../engine/types';
import {
  TIME_CONTROL_PRESETS,
  TimeControlOption,
  TimeCategory,
  formatTimeDisplay,
  findTimeOption
} from '../engine/timeControls';

interface ChessClockProps {
  color: Color;
}

export function ChessClock({ color }: ChessClockProps) {
  const { state } = useGame();
  const { game, timeControl, whiteTime, blackTime, timeIncrement } = state;
  const { currentTurn, status } = game;

  const isMyTurn = currentTurn === color && (status === 'playing' || status === 'check');
  const time = color === 'white' ? whiteTime : blackTime;
  const isLowTime = timeControl > 0 && time <= 30;

  if (timeControl === 0) return null;

  return (
    <div
      className={`px-3 py-1.5 rounded-xl font-mono text-sm font-black border transition-all duration-200 shadow-md flex items-center gap-1.5 ${
        isMyTurn
          ? isLowTime
            ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]'
            : 'bg-amber-400 text-slate-950 border-yellow-300 ring-2 ring-amber-300/60'
          : 'bg-slate-950/80 text-slate-400 border-slate-800'
      }`}
      title={`${color === 'white' ? 'Oq' : 'Qora'} donalar qolgan vaqti (${timeIncrement > 0 ? `+${timeIncrement}s` : ''})`}
    >
      <span className="text-xs">{isMyTurn ? '⏳' : '⏱️'}</span>
      <span>{formatTimeDisplay(time)}</span>
      {timeIncrement > 0 && (
        <span className="text-[10px] font-sans font-semibold opacity-75">
          +{timeIncrement}s
        </span>
      )}
    </div>
  );
}

export function TimeControlSelector() {
  const { state, dispatch } = useGame();
  const { timeControl, timeIncrement } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TimeCategory>('blitz');

  const currentOption = findTimeOption(timeControl, timeIncrement) || {
    id: 'custom',
    category: timeControl === 0 ? 'unlimited' : 'blitz',
    seconds: timeControl,
    increment: timeIncrement,
    label: timeControl === 0 ? 'Cheksiz' : `${Math.floor(timeControl / 60)} daq`,
    badge: timeControl === 0 ? '∞' : `${Math.floor(timeControl / 60)} | ${timeIncrement}`,
    description: ''
  };

  const handleSelect = (opt: TimeControlOption) => {
    dispatch({
      type: 'SET_TIME_CONTROL',
      seconds: opt.seconds,
      increment: opt.increment
    });
    setIsOpen(false);
  };

  const filteredPresets = TIME_CONTROL_PRESETS.filter(p => p.category === activeTab);

  return (
    <div className="relative w-full">
      {/* Asosiy Selector Tugmasi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-slate-200 font-bold text-xs transition-all shadow-sm group"
        title="Vaqt nazoratini tanlash"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-amber-400 text-sm">
            {currentOption.category === 'blitz' ? '⚡' : currentOption.category === 'rapid' ? '🔥' : currentOption.category === 'classic' ? '🏆' : '♾️'}
          </span>
          <div className="text-left">
            <span className="font-extrabold text-amber-300 mr-1.5">{currentOption.badge}</span>
            <span className="text-slate-300 font-medium text-[11px]">{currentOption.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {currentOption.isOfficial && (
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
              Rasmiy
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-slate-200'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Modal / Popup (Chess.com uslubi) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/90 rounded-2xl p-4 w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <div>
                  <h3 className="text-sm font-black text-slate-100">Vaqt Nazorati Reglamenti</h3>
                  <p className="text-[11px] text-slate-400">NurChess 100 & Chess.com standartlari</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl my-3 border border-slate-800">
              <button
                onClick={() => setActiveTab('blitz')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'blitz'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Blits
              </button>
              <button
                onClick={() => setActiveTab('rapid')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'rapid'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 Rapid
              </button>
              <button
                onClick={() => setActiveTab('classic')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'classic'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏆 Klassik
              </button>
              <button
                onClick={() => setActiveTab('unlimited')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'unlimited'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ♾️ Cheksiz
              </button>
            </div>

            {/* Options Grid */}
            <div className="overflow-y-auto space-y-1.5 pr-1 my-1 max-h-60 scrollbar-thin">
              {filteredPresets.map((opt) => {
                const isSelected = timeControl === opt.seconds && timeIncrement === opt.increment;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 text-amber-200 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-xs border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-yellow-300'
                          : 'bg-slate-950 text-amber-400 border-slate-800'
                      }`}>
                        {opt.increment > 0 ? `+${opt.increment}` : opt.seconds === 0 ? '∞' : `${Math.floor(opt.seconds / 60)}'`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-100">{opt.label}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.2 bg-slate-950/60 rounded text-slate-400">
                            {opt.badge}
                          </span>
                          {opt.isOfficial && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-sm">
                              ★ Rasmiy NurChess
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{opt.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-amber-400 font-bold text-sm">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Official Regulations Brief Card */}
            <div className="mt-3 pt-3 border-t border-slate-800/90 text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <span>📜</span> Rasmiy Reglament:
              </div>
              <ul className="space-y-0.5 list-disc list-inside text-[10.5px]">
                <li><strong className="text-amber-300">Blits:</strong> 5 daqiqa + har yurishga 3 sek</li>
                <li><strong className="text-amber-300">Rapid:</strong> 25 daqiqa + har yurishga 10 sek</li>
                <li><strong className="text-amber-300">Klassik:</strong> 90 daqiqa + har yurishga 30 sek</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
