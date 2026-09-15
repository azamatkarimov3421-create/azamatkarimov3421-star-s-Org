// =====================================================
// NUR SHAXMAT 100 — Onlayn Xona Modali (Realtime Multiplayer)
// =====================================================

import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnlineRoomModal({ isOpen, onClose }: OnlineRoomModalProps) {
  const { state, dispatch } = useGame();
  const { roomCode, onlinePlayerColor } = state;

  const [inputCode, setInputCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  // Xona yaratish
  const handleCreateRoom = () => {
    const code = `NUR-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedCode(code);
    dispatch({ type: 'SET_ONLINE_ROOM', roomCode: code, myColor: 'white' });
  };

  // Xonaga kirish
  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    const cleanCode = inputCode.trim().toUpperCase();
    dispatch({ type: 'SET_ONLINE_ROOM', roomCode: cleanCode, myColor: 'black' });
    onClose();
  };

  // Kodni nusxalash
  const handleCopyCode = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Xonani tark etish
  const handleLeaveRoom = () => {
    dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
    setCreatedCode(null);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            🌐
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-100">Onlayn Multiplayer</h3>
            <p className="text-slate-400 text-xs">Do'stingiz bilan masofadan turib o'ynang</p>
          </div>
        </div>

        {/* Hozir xonadami? */}
        {roomCode ? (
          <div className="space-y-4 text-center py-4">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/40">
              <div className="text-xs text-slate-400 mb-1">Sizning Xona Kodingiz:</div>
              <div className="text-3xl font-black tracking-widest text-amber-400 font-mono">
                {roomCode}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Sizning donalaringiz: {onlinePlayerColor === 'white' ? '⬜ Oq' : '⬛ Qora'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md"
              >
                {copySuccess ? '✓ Kodi nusxalandi!' : '📋 Xona kodini nusxalash'}
              </button>
              <button
                onClick={handleLeaveRoom}
                className="py-2.5 px-4 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold rounded-xl text-xs border border-red-800/60 transition-colors"
              >
                Tark etish
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Xona Yaratish */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-200 mb-1">1. Yangi Xona Yaratish</h4>
              <p className="text-slate-400 text-xs mb-3">
                Xona kodini do'stingizga yuborasiz, siz Oq donalarda o'ynaysiz.
              </p>
              <button
                onClick={handleCreateRoom}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                ✨ Yangi Xona Kodini Yaratish
              </button>
            </div>

            {/* Xonaga Kirish */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-200 mb-1">2. Mavjud Xonaga Kirish</h4>
              <p className="text-slate-400 text-xs mb-3">
                Do'stingiz yuborgan xona kodini kiritib kiring.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masalan: NUR-7842"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                />
                <button
                  onClick={handleJoinRoom}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Kirish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
