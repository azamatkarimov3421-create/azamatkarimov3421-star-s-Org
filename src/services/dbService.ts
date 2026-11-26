// =====================================================
// NUR SHAXMAT 100 — Ma'lumotlar Bazasi Servisi (DB Service)
// Bot vs Bot avtomatik partiyalari statistikaga va bazaga yozilmaydi!
// =====================================================

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { GameStatus } from '../engine/types';

export interface GameRecord {
  id?: string;
  created_at?: string;
  white_player: string;
  black_player: string;
  winner: string; // 'Oq' | 'Qora' | 'Durang'
  game_mode: string;
  total_moves: number;
  status: GameStatus;
}

const LOCAL_STORAGE_KEY = 'nur_chess_game_history';

export function isBotVsBotRecord(record: Partial<GameRecord>): boolean {
  if (!record) return true;
  const mode = (record.game_mode || '').toLowerCase();
  if (mode === 'bot vs bot' || mode === 'aivsai') return true;
  const w = record.white_player || '';
  const b = record.black_player || '';
  if (w.includes('Bot (D-') && b.includes('Bot (D-')) return true;
  return false;
}

/**
 * O'yin natijasini saqlash (Supabase yoki LocalStorage)
 * Bot vs Bot o'yinlari hech qachon saqlanmaydi!
 */
export async function saveGameResult(record: Omit<GameRecord, 'id' | 'created_at'>): Promise<boolean> {
  if (isBotVsBotRecord(record)) {
    return false;
  }

  const newRecord: GameRecord = {
    ...record,
    id: `game-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // 1. Supabase bo'lsa bulutga saqlash
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('game_results').insert([record]);
      if (!error) return true;
      console.warn('Supabase saqlashda ogohlantirish:', error.message);
    } catch (e) {
      console.error('Supabase bilan ulanishda xato:', e);
    }
  }

  // 2. LocalStorage saqlash (zahiradagi baza)
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const rawHistory: GameRecord[] = existingStr ? JSON.parse(existingStr) : [];
    const cleanHistory = rawHistory.filter((r) => !isBotVsBotRecord(r));
    cleanHistory.unshift(newRecord);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanHistory.slice(0, 50)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Natijalar va Peshqadamlar ro'yxatini olish (Bot vs Bot yozuvlaridan tozalangan)
 */
export async function getGameHistory(): Promise<GameRecord[]> {
  // Avval LocalStorage ichidagi eski Bot vs Bot yozuvlarini ham tozalab qo'yamiz
  let localClean: GameRecord[] = [];
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existingStr) {
      const parsed: GameRecord[] = JSON.parse(existingStr);
      localClean = parsed.filter((r) => !isBotVsBotRecord(r));
      if (localClean.length !== parsed.length) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localClean));
      }
    }
  } catch {
    localClean = [];
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .neq('game_mode', 'Bot vs Bot')
        .order('created_at', { ascending: false })
        .limit(40);

      if (!error && data) {
        return (data as GameRecord[]).filter((r) => !isBotVsBotRecord(r));
      }
    } catch {
      // Fallback pastga o'tadi
    }
  }

  return localClean;
}
