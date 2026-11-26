// =====================================================
// NUR SHAXMAT 100 — Onlayn Shaxmat Modali
// 1. Tezkor Raqib Qidirish (Matchmaking & Vaqt toifalari bo'yicha onlayn soni)
// 2. Do'stlar Bo'limi (Maksimal 10 ta do'st, do'stlar reytingi saralanishi, onlayn holati, taklif yuborish)
// 3. Xona Kodi Bilan O'ynash (Xona ochish & kod kiritish)
// =====================================================

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../store/gameStore';
import {
  onlineManager,
  OnlineStatus,
  LobbyPresenceCounts,
  OnlineUserPresence,
  GameInvitePayload,
} from '../services/onlineService';
import { getUserProfile, UserProfile } from '../store/userProfileStore';
import {
  getFriends,
  addFriend,
  removeFriend,
  getRankedFriendsList,
  MAX_FRIENDS_LIMIT,
  FriendItem,
  RankedFriend,
} from '../store/friendsStore';
import { signInWithGoogle } from '../services/authService';
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
  const isLight =
    state.appTheme === 'light' || (state.appTheme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { roomCode, onlinePlayerColor } = state;

  const [activeTab, setActiveTab] = useState<'quick' | 'friends' | 'code'>('quick');
  const [inputCode, setInputCode] = useState(initialRoomCode || '');
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>(onlineManager.status);
  const [statusText, setStatusText] = useState<string>(onlineManager.statusMessage);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchDuration, setSearchDuration] = useState<number>(0);

  // Profil va do'stlar holati
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPresence[]>([]);
  const [rankedFriends, setRankedFriends] = useState<RankedFriend[]>([]);

  // Do'st qo'shish formasi holatlari
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendInput, setNewFriendInput] = useState('');
  const [friendFeedback, setFriendFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Taklif yuborish holati
  const [invitingFriend, setInvitingFriend] = useState<RankedFriend | null>(null);
  const [inviteTimeoutLeft, setInviteTimeoutLeft] = useState(30);

  // Jonli lobby va onlayn soni
  const [presenceCounts, setPresenceCounts] = useState<LobbyPresenceCounts>({
    total: 1,
    byTime: { 300: 1, 900: 0, 1800: 0 },
  });

  const TIME_OPTIONS = [
    { label: '5 daq + 5s', sub: 'Blits', seconds: 300, increment: 5 },
    { label: '15 daq + 10s', sub: '★ Rapid', seconds: 900, increment: 10 },
    { label: '30 daq + 10s', sub: 'Klassik', seconds: 1800, increment: 10 },
  ];
  const [selectedTimeIdx, setSelectedTimeIdx] = useState<number>(0);

  const hasTransitionedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onStartGameRef = useRef(onStartGame);
  onCloseRef.current = onClose;
  onStartGameRef.current = onStartGame;

  // Profilni yangilab turish
  useEffect(() => {
    if (isOpen) {
      const p = getUserProfile();
      setProfile(p);
      const f = getFriends(p.email);
      setFriends(f);
      onlineManager.initSocialPresence();
    }
  }, [isOpen]);

  // Jonli onlayn foydalanuvchilar va presence tinglovchisi
  useEffect(() => {
    if (!isOpen) return;

    const unsubPresence = onlineManager.subscribeLobbyPresence((counts) => {
      setPresenceCounts(counts);
    });

    const unsubUsers = onlineManager.subscribeOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return () => {
      unsubPresence();
      unsubUsers();
    };
  }, [isOpen]);

  // Do'stlar reytingini avtomatik qayta hisoblash va saralash
  useEffect(() => {
    const list = getRankedFriendsList(profile, onlineUsers);
    setRankedFriends(list);
  }, [profile, friends, onlineUsers]);

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

      if (status === 'connected' && !hasTransitionedRef.current) {
        hasTransitionedRef.current = true;
        setInvitingFriend(null);
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

    // Taklifga javob tinglovchisi
    const unsubInviteResp = onlineManager.addInviteResponseListener((res) => {
      if (res.accepted) {
        // Do'st taklifni qabul qildi, o'yin boshlanadi
        setInvitingFriend(null);
      } else {
        // Do'st taklifni rad etdi
        setInvitingFriend(null);
        setFriendFeedback({
          type: 'error',
          text: `${res.fromName || 'Doʻstingiz'} oʻyin taklifini rad etdi.`,
        });
      }
    });

    return () => {
      unsub();
      unsubInviteResp();
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, dispatch]);

  // URL dan kod kelganda avtomatik 'code' tabiga o'tish
  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode);
      setActiveTab('code');
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

  // Taklif kutish taymeri
  useEffect(() => {
    let interval: any = null;
    if (invitingFriend) {
      setInviteTimeoutLeft(30);
      interval = setInterval(() => {
        setInviteTimeoutLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setInvitingFriend(null);
            setFriendFeedback({
              type: 'error',
              text: 'Taklifga belgilangan vaqtda javob berilmadi.',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [invitingFriend]);

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
      await onlineManager.startMatchmaking(profile.name, profile.rating, sel.seconds, sel.increment);
    } catch (err: any) {
      console.error('Matchmaking xatosi:', err);
    }
  };

  const handleCancelMatchmaking = () => {
    onlineManager.stopMatchmaking();
    setSearchDuration(0);
  };

  const handleSelectTime = (idx: number) => {
    setSelectedTimeIdx(idx);
    onlineManager.updateLobbyTimeControl(TIME_OPTIONS[idx].seconds);
  };

  // 2. Yangi xona yaratish (Oq donalar)
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

  // Do'stga o'yin taklifi yuborish
  const handleSendInvite = async (friend: RankedFriend) => {
    try {
      setFriendFeedback(null);
      setInvitingFriend(friend);
      const sel = TIME_OPTIONS[selectedTimeIdx];
      dispatch({
        type: 'SET_TIME_CONTROL',
        seconds: sel.seconds,
        increment: sel.increment,
      });

      const { roomCode } = await onlineManager.sendGameInvite(
        { id: friend.id, email: friend.email, name: friend.name },
        sel.seconds,
        sel.increment
      );

      dispatch({
        type: 'SET_ONLINE_ROOM',
        roomCode,
        myColor: 'white',
      });
    } catch (e: any) {
      setInvitingFriend(null);
      setFriendFeedback({
        type: 'error',
        text: 'Taklif yuborishda xatolik yuz berdi.',
      });
    }
  };

  // Yangi do'st qo'shish
  const handleAddFriendSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFriendInput.trim()) return;

    const res = addFriend({ name: newFriendInput.trim() }, profile.email);
    if (res.success) {
      setFriendFeedback({ type: 'success', text: res.message });
      setFriends(res.friends);
      setNewFriendInput('');
      setShowAddFriend(false);
    } else {
      setFriendFeedback({ type: 'error', text: res.message });
    }
  };

  // Onlayn ro'yxatdan to'g'ridan-to'g'ri do'st qo'shish
  const handleAddOnlineUserAsFriend = (u: OnlineUserPresence) => {
    const res = addFriend(
      { id: u.id, name: u.name, email: u.email, rating: u.rating, avatarUrl: u.avatarUrl },
      profile.email
    );
    if (res.success) {
      setFriendFeedback({ type: 'success', text: res.message });
      setFriends(res.friends);
    } else {
      setFriendFeedback({ type: 'error', text: res.message });
    }
  };

  // Do'stni o'chirish
  const handleRemoveFriend = (friendId: string, friendName: string) => {
    if (window.confirm(`“${friendName}”ni doʻstlaringiz roʻyxatidan oʻchirmoqchimisiz?`)) {
      const updated = removeFriend(friendId, profile.email);
      setFriends(updated);
      setFriendFeedback({ type: 'success', text: `“${friendName}” roʻyxatdan oʻchirildi.` });
    }
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
    setInvitingFriend(null);
    onClose();
  };

  const handleCopyLink = () => {
    const activeCode = onlineManager.roomCode || roomCode;
    if (!activeCode) return;
    const shareText = `${t('share_room_text')}: ${activeCode}\n${t('share_room_sub')}`;
    if (navigator.share) {
      navigator.share({ title: 'Nur Shaxmat 100', text: shareText }).catch(() => {
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

  const handleCopyCode = () => {
    const activeCode = onlineManager.roomCode || roomCode;
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
      className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn font-sans select-none"
    >
      <div className={`relative max-w-lg landscape:max-w-2xl w-full nur-glass-modal rounded-3xl p-4 sm:p-6 landscape:p-2.5 max-h-[96dvh] flex flex-col overflow-hidden ${isLight ? 'text-stone-900' : 'text-white'}`}>
        {/* Yopish tugmasi */}
        <button
          onClick={handleLeaveRoom}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer z-10 ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-stone-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
        >
          ✕
        </button>

        {/* ── 1. MODAL YUQORI QISMI VA UMUMIY ONLAYN STATISTIKA ── */}
        <div className="flex items-center justify-between mb-3.5 landscape:mb-1 pr-7 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl bg-amber-500/20 border flex items-center justify-center text-xl shadow-inner shrink-0 ${isLight ? 'border-amber-600/25' : 'border-amber-500/40'}`}>
              🌐
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-black leading-tight ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>
                {t('online_modal_title')}
              </h3>
              <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                {t('online_modal_subtitle')}
              </p>
            </div>
          </div>

          {/* JAMI ONLAYN O'YINCHILAR NISHONI (Har doim ko'rinadi) */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black shrink-0 shadow-sm animate-fadeIn ${isLight ? 'bg-emerald-500/15 border-emerald-600/25 text-emerald-700' : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>{presenceCounts.total} onlayn</span>
          </div>
        </div>

        {/* ── 2. ASOSIY 3 TA TAB (Tezkor Raqib, Do'stlar, Xona Kodi) ── */}
        {!activeCode && (
          <div className={`flex p-1 rounded-2xl border mb-3.5 landscape:mb-1.5 shrink-0 gap-1 ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-950/90 border-slate-800'}`}>
            {/* Tab 1: Tezkor Raqib */}
            <button
              onClick={() => {
                if (onlineStatus === 'searching') handleCancelMatchmaking();
                setActiveTab('quick');
              }}
              className={`flex-1 py-2 landscape:py-1 px-1 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isLight ? 'text-stone-600 hover:text-stone-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <span>⚡</span>
              <span>Tezkor Raqib</span>
            </button>

            {/* Tab 2: Do'stlar */}
            <button
              onClick={() => {
                if (onlineStatus === 'searching') handleCancelMatchmaking();
                setActiveTab('friends');
              }}
              className={`flex-1 py-2 px-1 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isLight ? 'text-stone-600 hover:text-stone-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <span>👥</span>
              <span>Doʻstlar ({friends.length}/10)</span>
            </button>

            {/* Tab 3: Xona Kodi */}
            <button
              onClick={() => {
                if (onlineStatus === 'searching') handleCancelMatchmaking();
                setActiveTab('code');
              }}
              className={`flex-1 py-2 px-1 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : (isLight ? 'text-stone-600 hover:text-stone-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <span>🔑</span>
              <span>Xona Kodi</span>
            </button>
          </div>
        )}

        {/* Xabarnomalar (Xatolik yoki muvaffaqiyat) */}
        {friendFeedback && (
          <div
            className={`mb-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between shrink-0 animate-fadeIn ${
              friendFeedback.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border border-red-500/50 text-red-300'
            }`}
          >
            <span>{friendFeedback.text}</span>
            <button
              onClick={() => setFriendFeedback(null)}
              className={`text-xs px-1.5 cursor-pointer ${isLight ? 'hover:text-stone-900' : 'hover:text-white'}`}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── 3. ASOSIY KONTENT SOHASI ── */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {/* Agar xona faol bo'lsa (do'st taklifini kutish yoki xonada bo'lish) */}
          {activeCode ? (
            <div className="space-y-4 text-center py-2">
              <div className={`p-5 rounded-2xl border space-y-3 ${isLight ? 'bg-white/75 border-amber-600/25' : 'bg-slate-950/90 border-amber-500/40'}`}>
                <div className={`text-xs ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                  {invitingFriend ? `Doʻstingiz “${invitingFriend.name}” taklifi kutilmoqda` : t('room_code_label')}
                </div>
                <div className={`text-4xl font-black tracking-widest font-mono select-all ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                  {activeCode}
                </div>

                <div className={`text-xs font-semibold py-1 px-3 rounded-xl inline-block border ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-900 border-slate-800'}`}>
                  {t('your_pieces')}{' '}
                  <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                    {activeColor === 'white' ? t('white_host') : t('black_guest')}
                  </span>
                </div>

                {/* Holat */}
                <div className="pt-2">
                  {onlineStatus === 'connected' ? (
                    <div className={`flex items-center justify-center gap-2 font-extrabold text-sm animate-pulse ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                      <span>Raqib ulandi! Oʻyin ochilmoqda...</span>
                    </div>
                  ) : invitingFriend ? (
                    <div className={`flex flex-col items-center gap-2 text-xs ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Doʻstingiz “{invitingFriend.name}” javobi kutilmoqda ({inviteTimeoutLeft}s)...</span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                        Doʻstingiz oʻyinga kirishi bilan match avtomatik boshlanadi.
                      </p>
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center gap-2 text-xs ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>{t('waiting_opponent')}</span>
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                        {t('send_code_or_link')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tugmalar */}
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
                    className={`flex-1 py-2 font-bold rounded-xl text-xs border transition-colors cursor-pointer ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-stone-900 border-black/[0.09]' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}`}
                  >
                    {copiedCode ? t('code_copied') : t('copy_code_btn')}
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className={`py-2 px-4 font-bold rounded-xl text-xs border transition-colors cursor-pointer ${isLight ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/25' : 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border-red-800/60'}`}
                  >
                    {t('leave_room_btn')}
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'quick' ? (
            /* ══════════════════════════════════════════════════
               TAB 1: TEZKOR RAQIB (VAQT BO'YICHA ONLAYN SONI)
               ══════════════════════════════════════════════════ */
            <div className="space-y-4 pt-1">
              {onlineStatus === 'searching' ? (
                <div className={`p-6 rounded-2xl border flex flex-col items-center text-center space-y-4 ${isLight ? 'bg-white/75 border-amber-600/25' : 'bg-slate-950/90 border-amber-500/40'}`}>
                  <div className="relative flex items-center justify-center my-2">
                    <span className="absolute w-20 h-20 rounded-full bg-amber-500/20 animate-ping pointer-events-none" />
                    <span className="absolute w-14 h-14 rounded-full bg-amber-500/30 animate-pulse pointer-events-none" />
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-2xl shadow-lg relative z-10 font-bold">
                      ♟️
                    </div>
                  </div>

                  <div>
                    <div className={`text-sm font-black animate-pulse ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                      {TIME_OPTIONS[selectedTimeIdx].label} ({TIME_OPTIONS[selectedTimeIdx].sub})
                    </div>
                    <div className={`text-2xl font-black font-mono mt-1 ${isLight ? 'text-stone-900' : 'text-white'}`}>
                      {formatTime(searchDuration)}
                    </div>
                    <div className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border animate-fadeIn ${isLight ? 'text-emerald-700 bg-emerald-500/15 border-emerald-600/25' : 'text-emerald-400 bg-emerald-950/70 border-emerald-500/30'}`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ushbu toifada {presenceCounts.byTime[TIME_OPTIONS[selectedTimeIdx].seconds] ?? 1} oʻyinchi onlayn</span>
                    </div>
                    <p className={`text-[11px] mt-2 max-w-xs ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                      {t('searching_desc')}
                    </p>
                  </div>

                  <button
                    onClick={handleCancelMatchmaking}
                    className={`w-full py-2.5 font-bold rounded-xl text-xs border transition-colors cursor-pointer ${isLight ? 'bg-black/[0.06] hover:bg-black/10 text-stone-900 border-black/[0.09]' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}`}
                  >
                    {t('cancel_search_btn')}
                  </button>
                </div>
              ) : (
                <div className={`p-4 sm:p-5 landscape:p-2 rounded-2xl border space-y-3 landscape:space-y-1.5 text-center ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-950/70 border-slate-800/80'}`}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-3xl mb-1 landscape:hidden">⚡</span>
                    <h4 className={`font-black text-base landscape:text-xs ${isLight ? 'text-stone-900' : 'text-white'}`}>
                      {t('quick_match_heading')}
                    </h4>
                    <p className={`text-xs landscape:hidden max-w-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                      {t('quick_match_sub')}
                    </p>
                  </div>

                  {/* ── VAQT TOIFALARI VA ULARDA NECHTA KISHI ONLAYN (100% ANIQLIKDA KO'RINADI) ── */}
                  <div className={`flex flex-col gap-2 landscape:gap-1 text-left p-3 landscape:p-1.5 rounded-2xl border ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-900/90 border-slate-800'}`}>
                    <div className={`text-[11px] font-bold flex items-center justify-between ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                      <span className="flex items-center gap-1.5">
                        <span>⏱️</span>
                        <span className={`font-black ${isLight ? 'text-stone-900' : 'text-white'}`}>Vaqt Toifalari & Onlayn Soni:</span>
                      </span>
                      <span className={`font-mono text-[10px] ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>Turnir reglamenti</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {TIME_OPTIONS.map((opt, idx) => {
                        const count = presenceCounts.byTime[opt.seconds] ?? 0;
                        const isSelected = selectedTimeIdx === idx;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectTime(idx)}
                            className={`py-2 landscape:py-0.5 px-2 landscape:px-1 rounded-2xl landscape:rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 landscape:gap-0.5 ${
                              isSelected
                                ? (isLight ? 'bg-amber-50/95 border-amber-500 text-amber-800 shadow-sm ring-1 ring-amber-500' : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400') : (isLight ? 'bg-white/75 border-black/[0.08] text-stone-600 hover:border-black/20 hover:text-stone-900' : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200')
                            }`}
                          >
                            <div className={`font-mono font-black text-xs ${isLight ? 'text-stone-900' : 'text-white'}`}>{opt.label}</div>
                            <div className={`text-[9px] font-medium ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>{opt.sub}</div>

                            {/* Qaysi birida nechta kishi onlaynligi (HAR DOIM KO'RINIB TURADI) */}
                            <div className={`w-full py-0.5 px-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 border ${
                              count > 0
                                ? (isLight ? 'bg-emerald-500/15 border-emerald-600/25 text-emerald-700' : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300') : (isLight ? 'bg-black/[0.04] border-black/[0.08] text-stone-500' : 'bg-slate-900 border-slate-800 text-slate-400')
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-emerald-400 animate-pulse' : (isLight ? 'bg-stone-400' : 'bg-slate-500')}`} />
                              <span>{count} onlayn</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleStartMatchmaking}
                    className="w-full py-3 landscape:py-1.5 landscape:text-xs landscape:rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🔍</span>
                    <span>{t('start_search_btn')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'friends' ? (
            /* ══════════════════════════════════════════════════
               TAB 2: DO'STLAR BO'LIMI (JADVAL, REYTING, ONLAYN, TAKLIF)
               ══════════════════════════════════════════════════ */
            <div className="space-y-3 pt-1">
              {/* Agar foydalanuvchi mehmon bo'lsa (Google orqali kirmagan) */}
              {!profile.isGoogleLinked || !profile.email ? (
                <div className={`p-6 rounded-2xl border text-center space-y-3.5 ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-950/80 border-slate-800'}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-amber-500/10 border flex items-center justify-center text-3xl mx-auto shadow-inner ${isLight ? 'border-amber-600/25' : 'border-amber-500/30'}`}>
                    🔒
                  </div>
                  <div>
                    <h4 className={`text-base font-black ${isLight ? 'text-stone-900' : 'text-white'}`}>Mehmonlar uchun cheklangan</h4>
                    <p className={`text-xs mt-1 max-w-xs mx-auto leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                      Doʻstlar orttirish (10 tagacha), ularning onlayn holatini kuzatish, oʻyinga taklif qilish va doʻstlar reytingida bellashish uchun Google hisobingiz orqali kiring.
                    </p>
                  </div>
                  <button
                    onClick={() => signInWithGoogle()}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>🌐</span>
                    <span>Google bilan profil ochish</span>
                  </button>
                </div>
              ) : (
                /* Agar Google bilan kirgan bo'lsa */
                <>
                  {/* Do'stlar sarlavhasi va qo'shish tugmasi */}
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <div className={`text-xs font-black flex items-center gap-1.5 ${isLight ? 'text-stone-900' : 'text-white'}`}>
                        <span>Doʻstlarim Jadvali</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isLight ? 'bg-black/[0.06] text-amber-700 border-black/[0.09]' : 'bg-slate-800 text-amber-300 border-slate-700'}`}>
                          {friends.length}/{MAX_FRIENDS_LIMIT} ta doʻst
                        </span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                        Reyting boʻyicha saralangan • Onlayn doʻstlar bilan oʻynang
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddFriend((prev) => !prev)}
                      disabled={friends.length >= MAX_FRIENDS_LIMIT}
                      className={`px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border font-bold text-xs flex items-center gap-1 transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${isLight ? 'border-amber-600/25 text-amber-700' : 'border-amber-500/40 text-amber-300'}`}
                    >
                      <span>{showAddFriend ? '✕ Yopish' : '+ Doʻst qoʻshish'}</span>
                    </button>
                  </div>

                  {/* Do'st qo'shish formasi */}
                  {showAddFriend && (
                    <div className={`p-3.5 rounded-2xl border space-y-3 animate-fadeIn ${isLight ? 'bg-white/75 border-amber-600/25' : 'bg-slate-950 border-amber-500/40'}`}>
                      <div className={`text-xs font-bold flex items-center justify-between ${isLight ? 'text-stone-900' : 'text-white'}`}>
                        <span>Yangi doʻst qoʻshish (Maksimal 10 ta):</span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                          Qolgan joy: {MAX_FRIENDS_LIMIT - friends.length} ta
                        </span>
                      </div>

                      <form onSubmit={handleAddFriendSubmit} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Doʻstning ismi yoki elektron pochtasi..."
                          value={newFriendInput}
                          onChange={(e) => setNewFriendInput(e.target.value)}
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 ${isLight ? 'bg-white/75 border-black/[0.09] text-stone-900 placeholder-stone-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'}`}
                        />
                        <button
                          type="submit"
                          disabled={!newFriendInput.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          + Qoʻshish
                        </button>
                      </form>

                      {/* Hozirda ilovada onlayn bo'lgan boshqa o'yinchilar tavsiyasi */}
                      {onlineUsers.filter((u) => u.name && u.name !== profile.name && !friends.some((f) => f.name === u.name)).length > 0 && (
                        <div className={`pt-2 border-t ${isLight ? 'border-black/[0.09]' : 'border-slate-800'}`}>
                          <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                            🟢 Hozir onlayn boshqa oʻyinchilar:
                          </div>
                          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            {onlineUsers
                              .filter((u) => u.name && u.name !== profile.name && !friends.some((f) => f.name === u.name))
                              .slice(0, 5)
                              .map((u) => (
                                <div
                                  key={u.id}
                                  className={`p-2 rounded-xl border flex items-center justify-between text-xs ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-900/90 border-slate-800'}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                    <span className={`font-bold truncate ${isLight ? 'text-stone-900' : 'text-white'}`}>{u.name}</span>
                                    <span className={`text-[10px] font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>⭐ {u.rating}</span>
                                  </div>
                                  <button
                                    onClick={() => handleAddOnlineUserAsFriend(u)}
                                    className={`px-2.5 py-1 rounded-lg hover:bg-emerald-600 font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${isLight ? 'bg-black/[0.06] hover:text-stone-900 text-stone-700' : 'bg-slate-800 hover:text-white text-slate-300'}`}
                                  >
                                    + Qoʻshish
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── DO'STLAR VA O'Z REYTINGI JADVALI (SARALANGAN) ── */}
                  <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-950/80 border-slate-800'}`}>
                    <div className={`grid grid-cols-12 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-b ${isLight ? 'bg-white/75 text-stone-500 border-black/[0.09]' : 'bg-slate-900/90 text-slate-400 border-slate-800'}`}>
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-6">Oʻyinchi</div>
                      <div className="col-span-2 text-center">Reyting</div>
                      <div className="col-span-3 text-right">Amal</div>
                    </div>

                    <div className={`divide-y max-h-[42vh] overflow-y-auto custom-scrollbar ${isLight ? 'divide-black/[0.07]' : 'divide-slate-800/60'}`}>
                      {rankedFriends.map((item) => {
                        const isOnline = item.onlineStatus === 'online';
                        const isInGame = item.onlineStatus === 'in_game';

                        return (
                          <div
                            key={item.id}
                            className={`grid grid-cols-12 px-3.5 py-2.5 items-center transition-colors ${
                              item.isMe
                                ? 'bg-amber-500/10 border-l-2 border-amber-500' : (isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-slate-900/50')
                            }`}
                          >
                            {/* O'rin (Rank) */}
                            <div className="col-span-1 text-center font-black text-xs font-mono">
                              {item.rank === 1 ? (
                                <span className={`${isLight ? 'text-amber-700' : 'text-amber-400'}`}>🥇</span>
                              ) : item.rank === 2 ? (
                                <span className={`${isLight ? 'text-stone-700' : 'text-slate-300'}`}>🥈</span>
                              ) : item.rank === 3 ? (
                                <span className="text-amber-600">🥉</span>
                              ) : (
                                <span className={`${isLight ? 'text-stone-500' : 'text-slate-500'}`}>#{item.rank}</span>
                              )}
                            </div>

                            {/* O'yinchi nomi va rasmi */}
                            <div className="col-span-6 flex items-center gap-2 min-w-0 pr-1">
                              <div className="relative shrink-0">
                                {item.avatarUrl ? (
                                  <img
                                    src={item.avatarUrl}
                                    alt=""
                                    className={`w-7 h-7 rounded-lg object-cover border ${isLight ? 'border-black/[0.09]' : 'border-slate-700'}`}
                                  />
                                ) : (
                                  <div className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center ${isLight ? 'bg-black/[0.06] border-black/[0.09] text-stone-900' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
                                    {item.avatarLetter}
                                  </div>
                                )}
                                {/* Onlayn status nuqtasi */}
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                                    isOnline
                                      ? 'bg-emerald-400 animate-pulse'
                                      : isInGame
                                      ? 'bg-red-400'
                                      : (isLight ? 'bg-stone-400' : 'bg-slate-500')
                                  }`}
                                  title={isOnline ? 'Onlayn' : isInGame ? 'Oʻyinda' : 'Oflayn'}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-black text-xs truncate ${item.isMe ? (isLight ? 'text-amber-700' : 'text-amber-300') : (isLight ? 'text-stone-900' : 'text-white')}`}>
                                    {item.name}
                                  </span>
                                  {item.isMe && (
                                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400/20 border shrink-0 ${isLight ? 'text-amber-700 border-amber-600/25' : 'text-amber-300 border-amber-400/30'}`}>
                                      Siz
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[9.5px] flex items-center gap-1 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                                  {isOnline ? (
                                    <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>🟢 Onlayn</span>
                                  ) : isInGame ? (
                                    <span className={`font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>🔴 Oʻyinda</span>
                                  ) : (
                                    <span className={`${isLight ? 'text-stone-500' : 'text-slate-500'}`}>⚪ Oflayn</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reyting */}
                            <div className={`col-span-2 text-center font-mono font-black text-xs ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                              ⭐ {item.rating}
                            </div>

                            {/* Harakat / Amal tugmasi */}
                            <div className="col-span-3 text-right flex items-center justify-end gap-1.5">
                              {item.isMe ? (
                                <span className={`text-[10px] font-bold italic pr-1 ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                                  Oʻrningiz
                                </span>
                              ) : isOnline ? (
                                <button
                                  onClick={() => handleSendInvite(item)}
                                  disabled={Boolean(invitingFriend)}
                                  className={`py-1 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-[10px] shadow transition-all active:scale-95 cursor-pointer disabled:opacity-40 ${isLight ? 'text-stone-900' : 'text-white'}`}
                                  title="Oʻyinga taklif qilish"
                                >
                                  ⚔️ Taklif
                                </button>
                              ) : (
                                <span className={`text-[10px] font-bold pr-1 ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                                  {isInGame ? 'Band' : 'Oflayn'}
                                </span>
                              )}

                              {!item.isMe && (
                                <button
                                  onClick={() => handleRemoveFriend(item.id, item.name)}
                                  className={`w-6 h-6 rounded-md hover:text-red-400 flex items-center justify-center text-xs transition-colors cursor-pointer ${isLight ? 'bg-white/75 hover:bg-red-500/20 text-stone-500' : 'bg-slate-900 hover:bg-red-950/80 text-slate-500'}`}
                                  title="Doʻstni oʻchirish"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {friends.length === 0 && (
                        <div className={`py-8 px-4 text-center text-xs space-y-2 ${isLight ? 'text-stone-500 bg-white/75' : 'text-slate-400 bg-slate-900/40'}`}>
                          <div className="text-3xl">👥</div>
                          <div className={`font-bold text-xs ${isLight ? 'text-stone-900' : 'text-white'}`}>Hozircha doʻstlar qoʻshilmagan</div>
                          <p className={`text-[11px] max-w-xs mx-auto ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                            Yuqoridagi «+ Doʻst qoʻshish» tugmasi orqali doʻstlaringizni qoʻshing (maksimal 10 ta).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ══════════════════════════════════════════════════
               TAB 3: XONA KODI BILAN O'YNASH
               ══════════════════════════════════════════════════ */
            <div className="space-y-4 pt-1">
              {/* Yangi xona yaratish */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-950/70 border-slate-800/80'}`}>
                <div>
                  <h4 className={`font-bold text-sm mb-1 flex items-center gap-2 ${isLight ? 'text-stone-900' : 'text-slate-200'}`}>
                    <span>{t('create_room_title')}</span>
                    <span className={`text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border ${isLight ? 'text-amber-700 border-amber-600/25' : 'text-amber-300 border-amber-500/30'}`}>
                      {t('badge_white_pieces')}
                    </span>
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                    {t('create_room_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_OPTIONS.map((opt, idx) => {
                    const count = presenceCounts.byTime[opt.seconds] ?? 0;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSelectTime(idx)}
                        className={`py-1.5 px-1.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-between ${
                          selectedTimeIdx === idx
                            ? (isLight ? 'bg-amber-50/95 border-amber-500 text-amber-800 shadow-sm' : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]') : (isLight ? 'bg-white/75 border-black/[0.08] text-stone-600 hover:text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200')
                        }`}
                      >
                        <div className="font-mono font-bold text-[11px]">{opt.label}</div>
                        <div className="text-[8px] opacity-80 leading-tight mt-0.5">{opt.sub}</div>
                        <div className={`mt-1 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isLight ? 'text-emerald-700 bg-emerald-500/15 border-emerald-600/25' : 'text-emerald-400 bg-emerald-950/50 border-emerald-500/20'}`}>
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

              {/* Mavjud xonaga kod bilan ulanish */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white/75 border-black/[0.09]' : 'bg-slate-950/70 border-slate-800/80'}`}>
                <h4 className={`font-bold text-sm mb-1 flex items-center gap-2 ${isLight ? 'text-stone-900' : 'text-slate-200'}`}>
                  <span>{t('join_room_title')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isLight ? 'bg-black/[0.06] text-stone-700 border-black/[0.09]' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {t('badge_black_pieces')}
                  </span>
                </h4>
                <p className={`text-xs mb-3 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                  {t('join_room_desc')}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masalan: 48921"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    className={`flex-1 border rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 tracking-wider ${isLight ? 'bg-white/75 border-black/[0.09] text-amber-700 placeholder-stone-400' : 'bg-slate-900 border-slate-700 text-amber-300 placeholder-slate-600'}`}
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
                  <p className={`text-[11px] font-semibold mt-2 ${isLight ? 'text-red-600' : 'text-red-400'}`}>
                    ❌ {statusText || t('join_room_error')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
