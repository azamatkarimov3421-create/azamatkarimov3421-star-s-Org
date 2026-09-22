// =====================================================
// NUR SHAXMAT 100 — O'yin Yakuni Ekrani (Game Over Modal)
// =====================================================

import React, { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore';
import { saveGameResult } from '../services/dbService';

import { recordGameFinished, saveRecentGame, getRecentGames, RecentGame } from '../store/userProfileStore';
import { onlineManager } from '../services/onlineService';
import { useTranslation } from '../i18n/translations';

export default function GameOverModal() {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const { game, gameMode, aiColor, aiDepth, aiWhiteDepth, aiBlackDepth, onlinePlayerColor, roomCode } = state;
  const { status, moveHistory } = game;

  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [ratingInfo, setRatingInfo] = useState<{ newRating: number; delta: number } | null>(null);

  useEffect(() => {
    setRecentGames(getRecentGames());
  }, [status]);

  useEffect(() => {
    if (status !== 'playing' && status !== 'check' && !saved) {
      let winnerName = 'Durang';
      if (status === 'checkmate') {
        winnerName = game.currentTurn === 'white' ? 'Qora' : 'Oq';
      } else if (status === 'white_resigned' || status === 'white_left' || status === 'white_timeout') {
        winnerName = 'Qora';
      } else if (status === 'black_resigned' || status === 'black_left' || status === 'black_timeout') {
        winnerName = 'Oq';
      }

      const whiteName = gameMode === 'aiVsAi' ? `Oq Bot (D-${aiWhiteDepth})` : 'Oq O\'yinchi';
      const blackName =
        gameMode === 'aiVsAi'
          ? `Qora Bot (D-${aiBlackDepth})`
          : gameMode === 'vsAI'
          ? `AI (Daraja: ${aiDepth})`
          : 'Qora O\'yinchi';

      saveGameResult({
        white_player: whiteName,
        black_player: blackName,
        winner: winnerName,
        game_mode: gameMode === 'aiVsAi' ? 'Bot vs Bot' : gameMode === 'vsAI' ? 'vs AI' : '2 Kishi',
        total_moves: Math.ceil(moveHistory.length / 2),
        status,
      }).then(() => {
        setSaved(true);
      });

      // Profil statistikasini faqat haqiqiy o'yinchi rejimlarida yangilash
      if (gameMode !== 'aiVsAi') {
        const isPlayerWhite = gameMode === 'online' ? onlinePlayerColor === 'white' : !state.isFlipped;
        let userResult: 'win' | 'loss' | 'draw' = 'draw';
        if (winnerName === 'Durang') {
          userResult = 'draw';
        } else {
          const isWinnerPlayer = (winnerName === 'Oq' && isPlayerWhite) || (winnerName === 'Qora' && !isPlayerWhite);
          userResult = isWinnerPlayer ? 'win' : 'loss';
        }

        const AI_LEVEL_RATINGS = [0, 1000, 1400, 1800, 2200];
        const oppRating = gameMode === 'online'
          ? (onlineManager.opponentRating || 1200)
          : (AI_LEVEL_RATINGS[aiDepth] || 1400);

        const updatedProfile = recordGameFinished(userResult, gameMode === 'online', oppRating);
        setRatingInfo({
          newRating: updatedProfile.rating,
          delta: updatedProfile.deltaRating,
        });

        const opponentTitle = gameMode === 'vsAI'
          ? `AI Bot (${aiDepth}-daraja)`
          : gameMode === 'online'
          ? `${onlineManager.opponentName || 'Raqib'} (${oppRating})`
          : `Doʻst bilan (PVP)`;

        const updated = saveRecentGame({
          result: userResult,
          opponent: opponentTitle,
          gameMode,
          myColor: isPlayerWhite ? 'white' : 'black',
          totalMoves: Math.ceil(moveHistory.length / 2),
          reason: status === 'checkmate' ? 'Mot' : status.includes('left') ? 'Raqib chiqib ketdi' : status.includes('resigned') ? 'Taslim' : status.includes('timeout') ? 'Vaqt' : 'Durang',
        });
        setRecentGames(updated);
      }
    }
  }, [status, saved, game.currentTurn, gameMode, aiDepth, aiWhiteDepth, aiBlackDepth, moveHistory.length, onlinePlayerColor, state.isFlipped, roomCode]);

  // O'yin davom etayotgan bo'lsa yoki modal vaqtincha yopilgan bo'lsa
  if (status === 'playing' || status === 'check' || dismissed) {
    return null;
  }

  let title = "O'yin Yakunlandi";
  let subtitle = '';
  let icon = '🏆';
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  switch (status) {
    case 'checkmate': {
      // Shohmat bo'lganda yurish navbati qaysi tomonda bo'lsa, o'sha yutqazdi
      const winner = game.currentTurn === 'white' ? 'Qora' : 'Oq';
      if (gameMode === 'aiVsAi') {
        title = `${winner} Bot G'alaba Qozondi!`;
        subtitle = `${winner === 'Oq' ? `Oq Bot (D-${aiWhiteDepth})` : `Qora Bot (D-${aiBlackDepth})`} raqib shohini mot qildi!`;
      } else {
        const isWinnerAI = gameMode === 'vsAI' && (
          (winner === 'Qora' && aiColor === 'black') || (winner === 'Oq' && aiColor === 'white')
        );
        title = `${winner} G'alaba Qozondi!`;
        subtitle = isWinnerAI
          ? "Sun'iy Intellekt shohmat qildi!"
          : "Ajoyib shohmat bilan g'alaba qozonildi!";
      }
      icon = '👑';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      break;
    }
    case 'stalemate': {
      title = "PAT — Durang!";
      subtitle = "Shohga hujum yo'q, ammo birorta ham qonuniy yurish qolmadi.";
      icon = '⚖️';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'draw_repetition': {
      title = "Durang!";
      subtitle = "Bir xil pozitsiya uch marta takrorlandi.";
      icon = '🔄';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'draw_mutual': {
      title = "Durang — Kelishuv";
      subtitle = "Har ikki tomon teng natijaga rozi bo'ldi.";
      icon = '🤝';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'draw_50move': {
      title = "Durang — 50 Harakat";
      subtitle = "Piyoda surilmasdan va dona urilmasdan 50 harakat o'tdi.";
      icon = '⏱️';
      badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      break;
    }
    case 'white_resigned': {
      title = gameMode === 'aiVsAi' ? "Qora Bot G'alaba Qozondi!" : "Qora G'alaba Qozondi!";
      subtitle = gameMode === 'aiVsAi' ? "O'yin to'xtatildi." : "Oq donalar taslim bo'ldi.";
      icon = '🏳️';
      break;
    }
    case 'black_resigned': {
      title = gameMode === 'aiVsAi' ? "Oq Bot G'alaba Qozondi!" : "Oq G'alaba Qozondi!";
      subtitle = gameMode === 'aiVsAi' ? "O'yin to'xtatildi." : "Qora donalar taslim bo'ldi.";
      icon = '🏳️';
      break;
    }
    case 'white_timeout': {
      title = "Qora G'alaba Qozondi!";
      subtitle = "Oq donalar vaqti tugadi.";
      icon = '⏱️';
      break;
    }
    case 'black_timeout': {
      title = "Oq G'alaba Qozondi!";
      subtitle = "Qora donalar vaqti tugadi.";
      icon = '⏱️';
      break;
    }
    case 'white_left': {
      const isPlayerWinner = onlinePlayerColor === 'black';
      title = isPlayerWinner ? "Siz G'alaba Qozondingiz! 🏆" : "Qora G'alaba Qozondi!";
      subtitle = "Oq donalar oʻyindan chiqib ketdi. Gʻalaba sizga yozildi!";
      icon = '🏆';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      break;
    }
    case 'black_left': {
      const isPlayerWinner = onlinePlayerColor === 'white';
      title = isPlayerWinner ? "Siz G'alaba Qozondingiz! 🏆" : "Oq G'alaba Qozondi!";
      subtitle = "Qora donalar oʻyindan chiqib ketdi. Gʻalaba sizga yozildi!";
      icon = '🏆';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      break;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-[#21201d] rounded-2xl p-6 sm:p-7 shadow-2xl border border-[#383531] text-center">
        {/* Natija Ikonkasi */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2c2a26] border border-[#383531] text-3xl mb-3 shadow-inner">
          {icon}
        </div>

        {/* Holat nishoni */}
        <div className="mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeColor}`}>
            {t('game_over_title')}
          </span>
        </div>

        {/* Asosiy Sarlavha */}
        <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
          {title}
        </h2>
        <p className="text-[#9b9893] text-xs sm:text-sm mb-4 leading-relaxed">
          {subtitle}
        </p>

        {/* Reyting o'zgarishi indikatori */}
        {ratingInfo && gameMode !== 'aiVsAi' && (
          <div className="flex items-center justify-center mb-4 animate-fadeIn">
            <div className={`px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-2 border shadow-md ${
              ratingInfo.delta > 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : ratingInfo.delta < 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-700/40 text-slate-300 border-slate-600/40'
            }`}>
              <span className="text-sm font-black">
                {ratingInfo.delta > 0 ? `+${ratingInfo.delta}` : `${ratingInfo.delta}`}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-300">{t('rating_label')}</span>
              <span className="text-slate-500">→</span>
              <span className="text-white font-extrabold flex items-center gap-1 text-sm">
                <span>⭐</span> {ratingInfo.newRating}
              </span>
            </div>
          </div>
        )}

        {/* Statistika qutisi */}
        <div className="grid grid-cols-2 gap-2.5 p-3 bg-[#181715] rounded-xl border border-[#383531] mb-4 text-xs">
          <div>
            <div className="text-[#9b9893] font-medium">{t('total_moves_label')}</div>
            <div className="text-white font-bold text-sm mt-0.5 font-mono">
              {Math.ceil(moveHistory.length / 2)} ta
            </div>
          </div>
          <div>
            <div className="text-[#9b9893] font-medium">{t('captured_pieces_label')}</div>
            <div className="text-white font-bold text-sm mt-0.5 font-mono">
              {game.capturedByWhite.length + game.capturedByBlack.length} ta
            </div>
          </div>
        </div>

        {/* Oxirgi 5 ta o'yin natijalari */}
        {recentGames.length > 0 && (
          <div className="mb-4 p-2.5 bg-[#181715] rounded-xl border border-[#383531]">
            <div className="text-[10px] text-[#9b9893] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between px-1">
              <span>{t('recent_games_label')}</span>
              <span className="text-white font-mono">{Math.min(5, recentGames.length)} ta</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {recentGames.slice(0, 5).map((g, idx) => (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg flex items-center justify-center font-black text-[11px] border ${
                    g.result === 'win'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : g.result === 'draw'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                  title={`${g.opponent}: ${g.result === 'win' ? "G'alaba" : g.result === 'draw' ? 'Durang' : "Mag'lubiyat"}`}
                >
                  {g.result === 'win' ? t('result_win') : g.result === 'draw' ? t('result_draw') : t('result_loss')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tugmalar */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              setDismissed(false);
              setRatingInfo(null);
              dispatch({ type: 'NEW_GAME' });
            }}
            className="w-full py-3 px-4 bg-[#81b64c] hover:bg-[#92c35a] text-white font-black text-sm rounded-xl shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-[0_0_0_#537a2e] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('btn_new_game')}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2.5 px-4 bg-[#383531] hover:bg-[#45423c] text-[#c3c2be] hover:text-white font-bold text-xs rounded-xl border border-[#383531] shadow-[0_2px_0_#21201d] active:translate-y-0.5 transition-all"
          >
            {t('btn_review_board')}
          </button>
        </div>
      </div>
    </div>
  );
}
