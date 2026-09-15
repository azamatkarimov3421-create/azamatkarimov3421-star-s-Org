// =====================================================
// NUR SHAXMAT 100 — Shaxmat Soati va Taymeri (Chess Clock)
// =====================================================

import React, { useEffect } from 'react';
import { TimeControl, useGame } from '../store/gameStore';
import { Color } from '../engine/types';

interface ChessClockProps {
  color: Color;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ChessClock({ color }: ChessClockProps) {
  const { state, dispatch } = useGame();
  const { game, timeControl, whiteTime, blackTime } = state;
  const { currentTurn, status } = game;

  const isMyTurn = currentTurn === color && (status === 'playing' || status === 'check');
  const time = color === 'white' ? whiteTime : blackTime;
  const isLowTime = timeControl > 0 && time <= 30;

  // Har soniyada vaqtni kamaytirish
  useEffect(() => {
    if (timeControl === 0 || !isMyTurn) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeControl, isMyTurn, dispatch]);

  if (timeControl === 0) return null;

  return (
    <div
      className={`px-3 py-1.5 rounded-xl font-mono text-sm font-black border transition-all duration-200 shadow-md ${
        isMyTurn
          ? isLowTime
            ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]'
            : 'bg-amber-400 text-slate-950 border-yellow-300 ring-2 ring-amber-300/60'
          : 'bg-slate-950/80 text-slate-400 border-slate-800'
      }`}
      title={`${color === 'white' ? 'Oq' : 'Qora'} donalar qolgan vaqti`}
    >
      ⏱️ {formatTime(time)}
    </div>
  );
}

export function TimeControlSelector() {
  const { state, dispatch } = useGame();
  const { timeControl } = state;

  const options: Array<{ seconds: TimeControl; label: string }> = [
    { seconds: 0, label: '⏱️ Cheksiz' },
    { seconds: 180, label: '⚡ 3 daq (Blitz)' },
    { seconds: 300, label: '🔥 5 daq (Rapid)' },
    { seconds: 600, label: '⏳ 10 daq' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80 w-full">
      {options.map((opt) => (
        <button
          key={opt.seconds}
          onClick={() => dispatch({ type: 'SET_TIME_CONTROL', seconds: opt.seconds })}
          className={`flex-1 py-1 px-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
            timeControl === opt.seconds
              ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
