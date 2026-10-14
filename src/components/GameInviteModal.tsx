// =====================================================
// NUR SHAXMAT 100 — Do'stdan O'yin Taklifi Ekrani (Game Invite Modal)
// Realtime WebSockets orqali do'st taklifini qabul qilish yoki rad etish
// =====================================================

import React, { useEffect, useState } from 'react';
import { GameInvitePayload } from '../services/onlineService';

interface GameInviteModalProps {
  invite: GameInvitePayload | null;
  onAccept: (invite: GameInvitePayload) => void;
  onDecline: (invite: GameInvitePayload) => void;
}

export default function GameInviteModal({
  invite,
  onAccept,
  onDecline,
}: GameInviteModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!invite) return;
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline(invite);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [invite]);

  if (!invite) return null;

  const timeLabel =
    invite.timeSeconds === 1800
      ? '30 daq + 10s (Klassik)'
      : invite.timeSeconds === 900
      ? '15 daq + 10s (Rapid)'
      : '5 daq + 5s (Blits)';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn font-sans select-none">
      <div className="relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 shadow-2xl border border-amber-500/50 text-center text-white">
        {/* Yuqori animatsiyali nishon */}
        <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <span className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-lg border border-amber-400 relative z-10">
            ⚔️
          </div>
        </div>

        {/* Sarlavha */}
        <h3 className="text-xl font-black text-white">Oʻyin Taklifi!</h3>
        <p className="text-xs text-amber-300 font-bold mt-1">
          Doʻstingiz siz bilan shaxmat oʻynamoqchi
        </p>

        {/* Taklif qiluvchi o'yinchi kartochkasi */}
        <div className="my-4 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3 text-left">
          {invite.fromAvatar ? (
            <img
              src={invite.fromAvatar}
              alt=""
              className="w-11 h-11 rounded-xl object-cover border border-amber-400/60 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-lg flex items-center justify-center shrink-0">
              {(invite.fromName || 'D').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-black text-sm text-white truncate">
              {invite.fromName}
            </div>
            <div className="text-[11px] font-mono text-amber-400 font-bold">
              ⭐ {invite.fromRating} reyting
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              ⏱️ {timeLabel}
            </div>
          </div>
        </div>

        {/* Qolgan vaqt hisoblagichi */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1 px-1">
            <span>Avto-rad etish:</span>
            <span className="text-amber-400 font-bold">{timeLeft} soniya</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Tugmalar */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onAccept(invite)}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>✓</span>
            <span>Qabul qilish</span>
          </button>
          <button
            onClick={() => onDecline(invite)}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>✕</span>
            <span>Rad etish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
