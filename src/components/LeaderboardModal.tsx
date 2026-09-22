// =====================================================
// NUR SHAXMAT 100 — Peshqadamlar Modali (Faqat Yutgan va Yutqazganlar)
// =====================================================

import React, { useEffect, useState, useMemo } from 'react';
import { GameRecord, getGameHistory } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useTranslation } from '../i18n/translations';
import { getUserProfile } from '../store/userProfileStore';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'players' | 'matches'>('players');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getGameHistory().then((data) => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  // Faqat g'alaba va mag'lubiyat bilan yakunlangan o'yinlar (duranglar butunlay chiqarib tashlanadi)
  const wonLostMatches = useMemo(() => {
    return history.filter((item) => item.winner === 'Oq' || item.winner === 'Qora');
  }, [history]);

  // Har bir o'yinchining Yutgan va Yutqazgan hisobi
  const playerRankings = useMemo<PlayerStats[]>(() => {
    const statsMap: Record<string, { wins: number; losses: number }> = {};

    // 1. Bazadagi o'yinlardan yutgan va yutqazganlarni jamlash
    wonLostMatches.forEach((item) => {
      const winnerName = item.winner === 'Oq' ? item.white_player : item.black_player;
      const loserName = item.winner === 'Oq' ? item.black_player : item.white_player;

      if (winnerName) {
        if (!statsMap[winnerName]) statsMap[winnerName] = { wins: 0, losses: 0 };
        statsMap[winnerName].wins += 1;
      }
      if (loserName) {
        if (!statsMap[loserName]) statsMap[loserName] = { wins: 0, losses: 0 };
        statsMap[loserName].losses += 1;
      }
    });

    // 2. Joriy o'yinchi profilini ham kiritish
    const myProfile = getUserProfile();
    if (myProfile.name && (myProfile.wins > 0 || myProfile.losses > 0)) {
      if (!statsMap[myProfile.name]) {
        statsMap[myProfile.name] = { wins: myProfile.wins, losses: myProfile.losses };
      } else {
        // Agar profildagi son kattaroq bo'lsa yangilaymiz
        statsMap[myProfile.name].wins = Math.max(statsMap[myProfile.name].wins, myProfile.wins);
        statsMap[myProfile.name].losses = Math.max(statsMap[myProfile.name].losses, myProfile.losses);
      }
    }

    const list: PlayerStats[] = Object.entries(statsMap).map(([name, s]) => {
      const total = s.wins + s.losses;
      const winRate = total > 0 ? Math.round((s.wins / total) * 100) : 0;
      return {
        name,
        wins: s.wins,
        losses: s.losses,
        total,
        winRate,
      };
    });

    // Yutganlar soni bo'yicha saralash
    return list.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  }, [wonLostMatches]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn font-sans">
      <div className="relative max-w-xl w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-700/80">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Sarlavha */}
        <div className="flex items-center justify-between mb-4 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Peshqadamlar Jadvali</h3>
              <p className="text-slate-400 text-xs">Faqat gʻalaba va magʻlubiyatlar hisobi</p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
              isSupabaseConfigured
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isSupabaseConfigured ? '🟢 Bulutli Baza' : 'Zaxira Baza'}
          </span>
        </div>

        {/* Tablar (Peshqadamlar / O'yinlar) */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'players'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 Peshqadam Oʻyinchilar</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📜 Oʻyinlar Tarixi</span>
          </button>
        </div>

        {/* Asosiy Tarkib */}
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full inline-block animate-spin mr-2" />
              Yuklanmoqda...
            </div>
          ) : activeTab === 'players' ? (
            /* TAB 1: PESHQADAM O'YINCHILAR JADVALI (FAQAT YUTGAN VA YUTQAZGAN) */
            playerRankings.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <div className="text-3xl">♟️</div>
                <div>Hozircha natijalar mavjud emas.</div>
                <p className="text-[11px] text-slate-600">Oʻyin oʻynab, birinchi gʻalabangizni qoʻlga kiriting!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playerRankings.map((player, idx) => {
                  const rankIcon =
                    idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                  const isTop3 = idx < 3;

                  return (
                    <div
                      key={player.name}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                        isTop3
                          ? 'bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border-amber-500/30'
                          : 'bg-slate-950/70 border-slate-800/80'
                      }`}
                    >
                      {/* Chap: O'rin va Ism */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-black text-sm w-7 text-center shrink-0 text-amber-400">
                          {rankIcon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-black text-sm text-white truncate flex items-center gap-1.5">
                            <span>{player.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Jami bahslar: <span className="text-slate-200 font-bold">{player.total} ta</span>
                          </div>
                        </div>
                      </div>

                      {/* O'ng: FAQAT Yutgan va Yutqazgan */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Yutgan */}
                        <div className="flex flex-col items-center px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                          <span className="text-[9px] font-bold uppercase tracking-wider">Yutgan</span>
                          <span className="text-xs font-black font-mono">{player.wins}</span>
                        </div>

                        {/* Yutqazgan */}
                        <div className="flex flex-col items-center px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400">
                          <span className="text-[9px] font-bold uppercase tracking-wider">Yutqazgan</span>
                          <span className="text-xs font-black font-mono">{player.losses}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* TAB 2: O'YINLAR NATIJALARI (FAQAT YUTGAN VA YUTQAZGAN) */
            wonLostMatches.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <div className="text-3xl">📜</div>
                <div>Gʻalaba yoki magʻlubiyat bilan yakunlangan oʻyinlar yoʻq.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {wonLostMatches.map((item, idx) => {
                  const winnerName = item.winner === 'Oq' ? item.white_player : item.black_player;
                  const loserName = item.winner === 'Oq' ? item.black_player : item.white_player;
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Yutgan */}
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1">
                            <span>✓</span>
                            <span>Yutgan: <strong className="text-white">{winnerName}</strong></span>
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                        {/* Yutqazgan */}
                        <div className="flex items-center gap-1 text-red-400">
                          <span>✕</span>
                          <span>Yutqazgan: <strong className="text-slate-300">{loserName}</strong></span>
                        </div>

                        <div className="text-[10px] text-slate-500">
                          {item.game_mode} • {item.total_moves} ta yurish
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Pastki eslatma */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
          <span>
            {activeTab === 'players'
              ? `Jami oʻyinchilar: ${playerRankings.length}`
              : `Gʻalabali oʻyinlar: ${wonLostMatches.length}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
