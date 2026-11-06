// =====================================================
// NUR SHAXMAT 100 — Mustaqil Shaxmat Soati (Standalone Chess Clock)
// Jonli (fizik) doskada o'ynayotgan 2 kishi uchun professional taymer
// Yuqori va pastki tomonlar, Fischer inkrementi, tebranish va tovush bilan
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, RotateCcwIcon, SettingsIcon } from './Icons';

interface StandaloneChessClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClockPreset {
  id: string;
  name: string;
  category: string;
  minutes: number;
  increment: number;
  badge: string;
}

const PRESETS: ClockPreset[] = [
  { id: 'bullet_1_1', name: 'Bullet 1+1', category: 'Bullet', minutes: 1, increment: 1, badge: '1|1' },
  { id: 'blitz_3_2', name: 'Blits 3+2', category: 'Blits', minutes: 3, increment: 2, badge: '3|2' },
  { id: 'blitz_5_3', name: 'Blits 5+3', category: 'Blits', minutes: 5, increment: 3, badge: '5|3' },
  { id: 'rapid_10_5', name: 'Rapid 10+5', category: 'Rapid', minutes: 10, increment: 5, badge: '10|5' },
  { id: 'rapid_15_10', name: 'Rapid 15+10', category: 'Rapid', minutes: 15, increment: 10, badge: '15|10' },
  { id: 'classic_30_10', name: 'Klassik 30+10', category: 'Klassik', minutes: 30, increment: 10, badge: '30|10' },
  { id: 'classic_60_30', name: 'Turnir 60+30', category: 'Klassik', minutes: 60, increment: 30, badge: '60|30' },
];

export default function StandaloneChessClockModal({
  isOpen,
  onClose,
}: StandaloneChessClockModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<ClockPreset>(PRESETS[2]); // Default 5+3
  const [whiteTime, setWhiteTime] = useState<number>(5 * 60);
  const [blackTime, setBlackTime] = useState<number>(5 * 60);
  const [activePlayer, setActivePlayer] = useState<'white' | 'black' | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [whiteMoves, setWhiteMoves] = useState<number>(0);
  const [blackMoves, setBlackMoves] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio Context for crisp mechanical click sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}

    // Haptic vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  };

  // Timer loop
  useEffect(() => {
    if (!isRunning || !activePlayer) return;

    const interval = setInterval(() => {
      if (activePlayer === 'white') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, activePlayer]);

  if (!isOpen) return null;

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Switch turn
  const handleTap = (player: 'white' | 'black') => {
    if (!isRunning && activePlayer === null) {
      // First tap starts the clock
      playClickSound();
      if (player === 'white') {
        // White tapped first -> it becomes Black's turn
        setActivePlayer('black');
        setWhiteMoves((m) => m + 1);
        setWhiteTime((t) => t + selectedPreset.increment);
      } else {
        // Black tapped first -> it becomes White's turn
        setActivePlayer('white');
        setBlackMoves((m) => m + 1);
        setBlackTime((t) => t + selectedPreset.increment);
      }
      setIsRunning(true);
      return;
    }

    // Only current active player can pass their turn
    if (activePlayer !== player || !isRunning) return;

    playClickSound();
    if (player === 'white') {
      setWhiteTime((t) => t + selectedPreset.increment);
      setWhiteMoves((m) => m + 1);
      setActivePlayer('black');
    } else {
      setBlackTime((t) => t + selectedPreset.increment);
      setBlackMoves((m) => m + 1);
      setActivePlayer('white');
    }
  };

  const handleTogglePlayPause = () => {
    if (!activePlayer) {
      setActivePlayer('white');
      setIsRunning(true);
    } else {
      setIsRunning((r) => !r);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setActivePlayer(null);
    setWhiteTime(selectedPreset.minutes * 60);
    setBlackTime(selectedPreset.minutes * 60);
    setWhiteMoves(0);
    setBlackMoves(0);
  };

  const handleSelectPreset = (p: ClockPreset) => {
    setSelectedPreset(p);
    setIsRunning(false);
    setActivePlayer(null);
    setWhiteTime(p.minutes * 60);
    setBlackTime(p.minutes * 60);
    setWhiteMoves(0);
    setBlackMoves(0);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between select-none touch-none overflow-hidden animate-fadeIn">
      {/* ── 1. YUQORI O'YINCHI (QORA / OPPONENT) — 180 gradus teskari, raqibga to'g'ri ko'rinadi ── */}
      <div
        onClick={() => handleTap('black')}
        className={`flex-1 w-full flex flex-col justify-center items-center p-6 rotate-180 transition-all cursor-pointer relative ${
          activePlayer === 'black'
            ? blackTime <= 10
              ? 'bg-red-950/90 text-red-200 ring-4 ring-red-500 animate-pulse'
              : 'bg-emerald-950/85 text-emerald-200 ring-4 ring-emerald-500'
            : 'bg-[#181a19] text-zinc-400 opacity-90'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/50" />
          <span className="text-xs uppercase font-black tracking-widest text-zinc-300">
            Qoralar • {blackMoves}-yurish
          </span>
          {activePlayer === 'black' && isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          )}
        </div>

        <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tight drop-shadow-md">
          {formatTime(blackTime)}
        </div>

        {selectedPreset.increment > 0 && (
          <div className="text-xs font-mono text-zinc-400 mt-1 font-bold">
            +{selectedPreset.increment}s inkrement
          </div>
        )}

        {blackTime === 0 && (
          <div className="absolute inset-0 bg-red-900/95 flex items-center justify-center text-2xl font-black text-white tracking-widest">
            VAQT TUGADI! (BAYROQ YIQILDI)
          </div>
        )}
      </div>

      {/* ── 2. O'RTADAGI BOSHQARUV PANELI (CENTRAL CONTROL BAR) ── */}
      <div className="h-16 w-full bg-[#111413] border-y border-zinc-800 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
        {/* Chiqish */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-sm transition-all active:scale-95 cursor-pointer"
          title="Yopish / Chiqish"
        >
          ✕
        </button>

        {/* Vaqt sozlamasi va rejimi */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-black text-amber-400 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <SettingsIcon size={16} />
          <span>{selectedPreset.name}</span>
        </button>

        {/* O'yinni to'xtatish / davom ettirish */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlayPause}
            className={`w-12 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
            }`}
            title={isRunning ? "Pauza" : "Boshlash"}
          >
            {isRunning ? '⏸' : <PlayIcon size={18} className="fill-white" />}
          </button>

          {/* Qayta o'rnatish (Reset) */}
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Qayta o'rnatish"
          >
            <RotateCcwIcon size={18} />
          </button>
        </div>
      </div>

      {/* ── 3. QUYI O'YINCHI (OQ / YOU) ── */}
      <div
        onClick={() => handleTap('white')}
        className={`flex-1 w-full flex flex-col justify-center items-center p-6 transition-all cursor-pointer relative ${
          activePlayer === 'white'
            ? whiteTime <= 10
              ? 'bg-red-950/90 text-red-200 ring-4 ring-red-500 animate-pulse'
              : 'bg-emerald-950/85 text-emerald-200 ring-4 ring-emerald-500'
            : 'bg-[#181a19] text-zinc-400 opacity-90'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          <span className="text-xs uppercase font-black tracking-widest text-zinc-300">
            Oqlar • {whiteMoves}-yurish
          </span>
          {activePlayer === 'white' && isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          )}
        </div>

        <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tight drop-shadow-md">
          {formatTime(whiteTime)}
        </div>

        {selectedPreset.increment > 0 && (
          <div className="text-xs font-mono text-zinc-400 mt-1 font-bold">
            +{selectedPreset.increment}s inkrement
          </div>
        )}

        {whiteTime === 0 && (
          <div className="absolute inset-0 bg-red-900/95 flex items-center justify-center text-2xl font-black text-white tracking-widest">
            VAQT TUGADI! (BAYROQ YIQILDI)
          </div>
        )}
      </div>

      {/* ── 4. VAQT VA SOAT SOZLAMALARI MODALI ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181c19] border border-[#2b3d30] rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-3.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#2b3d30]">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <h3 className="text-base font-black text-white">Shaxmat Soati Reglamenti</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              O'zingizga mos vaqt nazoratini tanlang:
            </p>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {PRESETS.map((p) => {
                const isSel = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                        : 'bg-[#141b17] border-[#27372d] text-zinc-300 hover:bg-[#19241d]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-white">{p.name}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">
                        {p.minutes} daqiqa {p.increment > 0 ? `+ ${p.increment} soniya har yurishga` : ''}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-400">
                      {p.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ovoz sozlamasi */}
            <div className="pt-2 border-t border-[#2b3d30] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Bosish ovozi (Taqqillash)</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  soundEnabled ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {soundEnabled ? 'YOQILGAN' : 'OʻCHIRILGAN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
