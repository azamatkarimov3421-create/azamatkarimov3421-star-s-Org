// =====================================================
// NUR SHAXMAT 100 — Onlayn Xona Modali (P2P Realtime Multiplayer)
// 1. Tezkor Raqib Qidirish (Random Matchmaking)
// 2. Do'stlar Bilan (Xona ochish & Kod bilan kirish)
// =====================================================

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../store/gameStore';
import { onlineManager, OnlineStatus, LobbyPresenceCounts } from '../services/onlineService';
import { getUserProfile } from '../store/userProfileStore';
import { useTranslation } from '../i18n/translations';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
  initialRoomCode?: string;
}

export default function OnlineRoomModal({
  isOpen,
  onClose,
  onStartGame,
  initialRoomCode,
}: OnlineRoomModalProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const { roomCode, onlinePlayerColor } = state;

  const [activeTab, setActiveTab] = useState<'quick' | 'friends'>('quick');
  const [inputCode, setInputCode] = useState(initialRoomCode || '');
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>(onlineManager.status);
  const [statusText, setStatusText] = useState<string>(onlineManager.statusMessage);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchDuration, setSearchDuration] = useState<number>(0);

  const [presenceCounts, setPresenceCounts] = useState<LobbyPresenceCounts>({
    total: 49,
    byTime: { 600: 24, 300: 16, 180: 9 },
  });

  const TIME_OPTIONS = [
    { label: '10 daq + 5s', sub: '★ Turnir Rapid', seconds: 600, increment: 5 },
    { label: '5 daq + 3s', sub: 'Turnir Blits', seconds: 300, increment: 3 },
    { label: '3 daq + 2s', sub: 'Tezkor Oʻyin', seconds: 180, increment: 2 },
  ];
  const [selectedTimeIdx, setSelectedTimeIdx] = useState<number>(0);

  const hasTransitionedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onStartGameRef = useRef(onStartGame);
  onCloseRef.current = onClose;
  onStartGameRef.current = onStartGame;

  // Jonli lobby onlayn o'yinchilar sonini kuzatish
  useEffect(() => {
    if (!isOpen) return;
    const unsub = onlineManager.subscribeLobbyPresence((counts) => {
      setPresenceCounts(counts);
    });
    return unsub;
  }, [isOpen]);

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

  // URL dan kod kelganda avtomatik 'friends' tabiga o'tib maydonga yozish
  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode);
      setActiveTab('friends');
    }
  }, [initialRoomCode]);

  // Matchmaking qidiruv hisoblagichi
  useEffect(() => {
    let interval: any = null;
    if (onlineStatus === 'searching') {
      interval = setInterval(() => {
        setSearchDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onlineStatus]);

  if (!isOpen) return null;

  // 1. Tezkor Raqib Qidirishni Boshlash
  const handleStartMatchmaking = async () => {
    try {
      hasTransitionedRef.current = false;
      const sel = TIME_OPTIONS[selectedTimeIdx];
      dispatch({
        type: 'SET_TIME_CONTROL',
        seconds: sel.seconds,
        increment: sel.increment,
      });
      const profile = getUserProfile();
      await onlineManager.startMatchmaking(profile.name, profile.rating, sel.seconds, sel.increment);
    } catch (err: any) {
      console.error('Matchmaking xatosi:', err);
    }
  };

  // Qidiruvni to'xtatish
  const handleCancelMatchmaking = () => {
    onlineManager.stopMatchmaking();
    setSearchDuration(0);
  };

  // 2. Yangi xona yaratish (Oq donalar - Do'st uchun)
  const handleCreateRoom = async () => {
    try {
      hasTransitionedRef.current = false;
      const sel = TIME_OPTIONS[selectedTimeIdx];
      dispatch({
        type: 'SET_TIME_CONTROL',
        seconds: sel.seconds,
        increment: sel.increment,
      });
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

  // 3. Mavjud xonaga ulanish (Qora donalar)
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
    const shareText = `${t('share_room_text')}: ${activeCode}\n${t('share_room_sub')}`;
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
    if (onlineStatus === 'searching') {
      onlineManager.stopMatchmaking();
    } else {
      onlineManager.disconnect();
      dispatch({ type: 'SET_ONLINE_ROOM', roomCode: null, myColor: null });
      dispatch({ type: 'SET_GAME_MODE', mode: 'vsAI' });
    }
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-700/80">
        <button
          onClick={handleLeaveRoom}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Sarlavha */}
        <div className="flex items-center justify-between mb-4 pr-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🌐
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">{t('online_modal_title')}</h3>
              <p className="text-slate-400 text-xs">{t('online_modal_subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{presenceCounts.total} onlayn</span>
          </div>
        </div>

        {/* 2 Ta Asosiy Rejim Tablari (Faqat xona faol bo'lmaganda) */}
        {!activeCode && (
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-4">
            <button
              onClick={() => {
                if (onlineStatus === 'searching') handleCancelMatchmaking();
                setActiveTab('quick');
              }}
              className={`flex-1 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t('tab_quick_match')}</span>
            </button>
            <button
              onClick={() => {
                if (onlineStatus === 'searching') handleCancelMatchmaking();
                setActiveTab('friends');
              }}
              className={`flex-1 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t('tab_friends_room')}</span>
            </button>
          </div>
        )}

        {/* Agar xona allaqachon faol bo'lsa (yoki ulanayotgan bo'lsa) */}
        {activeCode ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-5 bg-slate-950/90 rounded-2xl border border-amber-500/40 space-y-3">
              <div className="text-xs text-slate-400">{t('room_code_label')}</div>
              <div className="text-4xl font-black tracking-widest text-amber-400 font-mono select-all">
                {activeCode}
              </div>

              {/* Rang ko'rsatkichi */}
              <div className="text-xs font-semibold py-1 px-3 rounded-xl bg-slate-900 inline-block border border-slate-800">
                {t('your_pieces')}{' '}
                <span className="font-bold text-amber-300">
                  {activeColor === 'white' ? t('white_host') : t('black_guest')}
                </span>
              </div>

              {/* Holat signali */}
              <div className="pt-2">
                {onlineStatus === 'connected' ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    {t('opponent_connected')}
                  </div>
                ) : onlineStatus === 'waiting' ? (
                  <div className="flex flex-col items-center gap-2 text-amber-400 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      {t('waiting_opponent')}
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      {t('send_code_or_link')}
                    </p>
                  </div>
                ) : onlineStatus === 'connecting' ? (
                  <div className="flex items-center justify-center gap-2 text-sky-400 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    {t('connecting_to_room')}
                  </div>
                ) : onlineStatus === 'disconnected' ? (
                  <div className="text-red-400 text-xs font-bold">
                    ⚠️ {statusText || t('opponent_disconnected')}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Nusxalash tugmalari */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {copiedLink ? t('link_copied') : t('copy_link_btn')}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedCode ? t('code_copied') : t('copy_code_btn')}
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
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t('go_to_board_btn')}
                  </button>
                )}
                <button
                  onClick={handleLeaveRoom}
                  className="py-2 px-4 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold rounded-xl text-xs border border-red-800/60 transition-colors cursor-pointer"
                >
                  {t('leave_room_btn')}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'quick' ? (
          /* ── TAB 1: TEZKOR RAQIB QIDIRISH (MATCHMAKING) ── */
          <div className="space-y-4 pt-1">
            {onlineStatus === 'searching' ? (
              /* Qidiruv radari va hisoblagich */
              <div className="p-6 bg-slate-950/90 rounded-2xl border border-amber-500/40 flex flex-col items-center text-center space-y-4">
                <div className="relative flex items-center justify-center my-2">
                  <span className="absolute w-20 h-20 rounded-full bg-amber-500/20 animate-ping pointer-events-none" />
                  <span className="absolute w-14 h-14 rounded-full bg-amber-500/30 animate-pulse pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-2xl shadow-lg relative z-10 font-bold">
                    ♟️
                  </div>
                </div>

                <div>
                  <div className="text-sm font-black text-amber-300 animate-pulse">
                    {TIME_OPTIONS[selectedTimeIdx].label} ({TIME_OPTIONS[selectedTimeIdx].sub})
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {formatTime(searchDuration)}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Ushbu vaqt toifasida {presenceCounts.byTime[TIME_OPTIONS[selectedTimeIdx].seconds] || 15} ta oʻyinchi onlayn</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 max-w-xs">
                    {t('searching_desc')}
                  </p>
                </div>

                <button
                  onClick={handleCancelMatchmaking}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  {t('cancel_search_btn')}
                </button>
              </div>
            ) : (
              /* Qidiruvni boshlash kartasi */
              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl mb-1">⚡</span>
                  <h4 className="font-black text-base text-white">
                    {t('quick_match_heading')}
                  </h4>
                  <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                    {t('quick_match_sub')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{t('feat_quick_pair')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{t('feat_10x10_board')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{t('feat_rating_calc')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{t('feat_random_color')}</span>
                  </div>
                </div>

                {/* Turnir Vaqti Tanlovi (Fischer Increment bilan) */}
                <div className="flex flex-col gap-1.5 text-left bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>Turnir Reglamenti:</span>
                    </span>
                    <span className="text-amber-400 font-mono text-[10px]">Tez yursangiz vaqt yutasiz!</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIME_OPTIONS.map((opt, idx) => {
                      const count = presenceCounts.byTime[opt.seconds] || 10;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setSelectedTimeIdx(idx)}
                          className={`py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-between ${
                            selectedTimeIdx === idx
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-mono font-black text-xs">{opt.label}</div>
                          <div className="text-[9px] opacity-80 leading-tight mt-0.5">{opt.sub}</div>
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{count} onlayn</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleStartMatchmaking}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔍</span>
                  <span>{t('start_search_btn')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── TAB 2: DO'STLAR BILAN (XONA OCHISH / KOD BILAN KIRISH) ── */
          <div className="space-y-4 pt-1">
            {/* 1. Yangi Xona Ochish */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-3">
              <div>
                <h4 className="font-bold text-sm text-slate-200 mb-1 flex items-center gap-2">
                  <span>{t('create_room_title')}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {t('badge_white_pieces')}
                  </span>
                </h4>
                <p className="text-slate-400 text-xs">
                  {t('create_room_desc')}
                </p>
              </div>

              {/* Do'stlar uchun ham turnir vaqti tanlovi */}
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_OPTIONS.map((opt, idx) => {
                  const count = presenceCounts.byTime[opt.seconds] || 10;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedTimeIdx(idx)}
                      className={`py-1.5 px-1.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-between ${
                        selectedTimeIdx === idx
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-mono font-bold text-[11px]">{opt.label}</div>
                      <div className="text-[8px] opacity-80 leading-tight mt-0.5">{opt.sub}</div>
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{count} onlayn</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={onlineStatus === 'creating'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {onlineStatus === 'creating' ? t('creating_room_status') : t('create_room_btn')}
              </button>
            </div>

            {/* 2. Mavjud Xonaga Ulanish */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-200 mb-1 flex items-center gap-2">
                <span>{t('join_room_title')}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {t('badge_black_pieces')}
                </span>
              </h4>
              <p className="text-slate-400 text-xs mb-3">
                {t('join_room_desc')}
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
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {onlineStatus === 'connecting' ? '...' : t('join_room_btn')}
                </button>
              </div>

              {onlineStatus === 'error' && (
                <p className="text-red-400 text-[11px] font-semibold mt-2">
                  ❌ {statusText || t('join_room_error')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
