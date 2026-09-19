// =====================================================
// NUR SHAXMAT 100 — Peshqadamlar va Natijalar Modali
// =====================================================

import React, { useEffect, useState } from 'react';
import { GameRecord, getGameHistory } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useTranslation } from '../i18n/translations';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getGameHistory().then((data) => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative max-w-xl w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-700/80">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Sarlavha */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-100">{t('lb_title')}</h3>
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <span>{t('lb_status_label')}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isSupabaseConfigured ? t('lb_supabase') : t('lb_local')}
              </span>
            </p>
          </div>
        </div>

        {/* Natijalar Jadvali */}
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 font-sans">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full inline-block animate-spin mr-2" />
              {t('lb_loading')}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <div className="text-3xl mb-2">📜</div>
              {t('lb_empty')}
            </div>
          ) : (
            history.map((item, idx) => {
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-500 w-5 text-center">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {item.white_player} vs {item.black_player}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{t('lb_mode_label')} {item.game_mode}</span>
                        <span>•</span>
                        <span>{item.total_moves} {t('lb_moves_suffix')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.winner === 'Oq'
                          ? 'bg-amber-100 text-amber-950 font-black'
                          : item.winner === 'Qora'
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-blue-900/60 text-blue-200'
                      }`}
                    >
                      {item.winner === 'Durang' ? t('draw_title') : `${item.winner} ${t('lb_winner_suffix')}`}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{dateStr}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pastki eslatma */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-500 text-[11px]">
          <span>{t('lb_total_games')} {history.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {t('close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
