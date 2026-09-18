// =====================================================
// NUR SHAXMAT 100 — Onlayn Xona Modali (P2P Realtime Multiplayer)
// =====================================================

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../store/gameStore';
import { onlineManager, OnlineStatus } from '../services/onlineService';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
  initialRoomCode?: string;
}

export default function OnlineRoomModal({ isOpen, onClose, onStartGame, initialRoomCode }: OnlineRoomModalProps) {
  const { state, dispatch } = useGame();
  const { roomCode, onlinePlayerColor } = state;

  const [inputCode, setInputCode] = useState(initialRoomCode || '');
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>(onlineManager.status);
  const [statusText, setStatusText] = useState<string>(onlineManager.statusMessage);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const hasTransitionedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onStartGameRef = useRef(onStartGame);
  onCloseRef.current = onClose;
  onStartGameRef.current = onStartGame;

  // Status tinglovchisi
  useEffect(() => {
    if (!isOpen) {
      hasTransitionedRef.current = false;
      return;
    }

    let timer: any = null;
    const unsub = onlineManager.addStatusListener((status, msg) => {
      setOnlineStatus(status);
      setStatusText(msg || '');

      // Faqat BIR MARTA ulanish hodisasini boshqarish
      if (status === 'connected' && !hasTransitionedRef.current) {
        hasTransitionedRef.current = true;
        if (onlineManager.roomCode && onlineManager.myColor) {
          dispatch({
            type: 'SET_ONLINE_ROOM',
            roomCode: onlineManager.roomCode,
            myColor: onlineManager.myColor,
          });
        }
        timer = setTimeout(() => {
          onCloseRef.current();
          onStartGameRef.current?.();
        }, 800);
      }
    });

    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, dispatch]);

  // URL dan kod kelganda maydonga yozish
  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  if (!isOpen) return null;

  // 1. Yangi xona yaratish (Oq donalar)
  const handleCreateRoom = async () => {
    try {
      hasTransitionedRef.current = false;
      const code = await onlineManager.createRoom();
      dispatch({
        type: 'SET_ONLINE_ROOM',
        roomCode: code,
        myColor: 'white',
      });
    } catch (err: any) {
      console.error('Xona yaratishda xato:', err);
    }
  };

  // 2. Mavjud xonaga ulanish (Qora donalar)
  const handleJoinRoom = async () => {
    const clean = inputCode.trim();
    if (!clean) return;
    try {
      hasTransitionedRef.current = false;
      await onlineManager.joinRoom(clean);
    } catch (err: any) {
      console.error('Xonaga ulanishda xato:', err);
    }
  };

  // Xona kodini do'stga yuborish / nusxalash
  const handleCopyLink = () => {
    const activeCode = onlineManager.roomCode || roomCode;
    if (!activeCode) return;
    const shareText = `Nur Shaxmat 100 onlayn xona kodi: ${activeCode}\nIlovada "Onlayn" boʻlimiga kirib, ushbu kodni kiriting!`;
    if (navigator.share) {
      navigator.share({
        title: 'Nur Shaxmat 100',
        text: shareText,
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Kodni nusxalash
  const handleCopyCode = () => {
    const activeCode = onlineManager.roomCode || roomCode;
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Xonadan chiqish / Aloqani uzish
  const handleLeaveRoom = () => {
    onlineManager.disconnect();
    dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
    dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' });
    onClose();
  };

  const activeCode = onlineManager.roomCode || roomCode;
  const activeColor = onlineManager.myColor || onlinePlayerColor;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleLeaveRoom();
      }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
    >
      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80">
        <button
          onClick={handleLeaveRoom}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ✕
        </button>

        {/* Sarlavha */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            🌐
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-100">Onlayn Shaxmat</h3>
            <p className="text-slate-400 text-xs">P2P Realtime (WebRTC orqali bevosita aloqa)</p>
          </div>
        </div>

        {/* Agar xona allaqachon faol bo'lsa (yoki yaratilayotgan bo'lsa) */}
        {activeCode ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-5 bg-slate-950/90 rounded-2xl border border-amber-500/40 space-y-3">
              <div className="text-xs text-slate-400">Xona Kodingiz:</div>
              <div className="text-4xl font-black tracking-widest text-amber-400 font-mono select-all">
                {activeCode}
              </div>

              {/* Rang ko'rsatkichi */}
              <div className="text-xs font-semibold py-1 px-3 rounded-xl bg-slate-900 inline-block border border-slate-800">
                Sizning donalaringiz: <span className="font-bold text-amber-300">{activeColor === 'white' ? '⬜ Oq (Host)' : '⬛ Qora (Mehmon)'}</span>
              </div>

              {/* Holat signali */}
              <div className="pt-2">
                {onlineStatus === 'connected' ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    Raqib ulandi! Oʻyin boshlandi 🚀
                  </div>
                ) : onlineStatus === 'waiting' ? (
                  <div className="flex flex-col items-center gap-2 text-amber-400 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Raqib ulanishi kutilmoqda...
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Doʻstingizga xona kodini yoki quyidagi havolani yuboring:
                    </p>
                  </div>
                ) : onlineStatus === 'connecting' ? (
                  <div className="flex items-center justify-center gap-2 text-sky-400 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    Xonaga ulanmoqda...
                  </div>
                ) : onlineStatus === 'disconnected' ? (
                  <div className="text-red-400 text-xs font-bold">
                    ⚠️ {statusText || 'Raqib aloqadan uzildi'}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Nusxalash tugmalari */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95"
              >
                {copiedLink ? '✓ Havola nusxalandi!' : '🔗 Oʻyin havolasini nusxalash (Doʻstga yuborish)'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
                >
                  {copiedCode ? '✓ Nusxalandi' : '📋 Kodni nusxalash'}
                </button>
                {onlineStatus === 'connected' && (
                  <button
                    onClick={() => {
                      hasTransitionedRef.current = true;
                      if (onlineManager.roomCode && onlineManager.myColor) {
                        dispatch({
                          type: 'SET_ONLINE_ROOM',
                          roomCode: onlineManager.roomCode,
                          myColor: onlineManager.myColor,
                        });
                      }
                      onClose();
                      onStartGame?.();
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
                  >
                    Doskaga oʻtish ♟️
                  </button>
                )}
                <button
                  onClick={handleLeaveRoom}
                  className="py-2 px-4 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold rounded-xl text-xs border border-red-800/60 transition-colors"
                >
                  Tark etish
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Xona hali ochilmagan: Yangi xona yoki Ulanish */
          <div className="space-y-5 pt-1">
            {/* 1. Yangi Xona Ochish */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-200 mb-1 flex items-center gap-2">
                <span>1. Yangi Xona Ochish</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Oq donalar
                </span>
              </h4>
              <p className="text-slate-400 text-xs mb-3">
                Xona yaratib, kod yoki taklif havolasini do'stingizga yuborasiz.
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={onlineStatus === 'creating'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {onlineStatus === 'creating' ? '⏳ Xona ochilmoqda...' : '✨ Yangi Xona Ochish'}
              </button>
            </div>

            {/* 2. Mavjud Xonaga Ulanish */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-200 mb-1 flex items-center gap-2">
                <span>2. Mavjud Xonaga Kirish</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  Qora donalar
                </span>
              </h4>
              <p className="text-slate-400 text-xs mb-3">
                Doʻstingiz bergan xona kodini kiriting.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masalan: 48921"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 tracking-wider"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!inputCode.trim() || onlineStatus === 'connecting'}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {onlineStatus === 'connecting' ? '...' : 'Kirish'}
                </button>
              </div>

              {onlineStatus === 'error' && (
                <p className="text-red-400 text-[11px] font-semibold mt-2">
                  ❌ {statusText || 'Ulanib boʻlmadi. Kodni tekshiring.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

