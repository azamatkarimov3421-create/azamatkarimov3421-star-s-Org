// =====================================================
// NUR SHAXMAT 100 — Ma'lumotlar Bazasi Servisi (DB Service)
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

/**
 * O'yin natijasini saqlash (Supabase yoki LocalStorage)
 */
export async function saveGameResult(record: Omit<GameRecord, 'id' | 'created_at'>): Promise<boolean> {
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
    const history: GameRecord[] = existingStr ? JSON.parse(existingStr) : [];
    history.unshift(newRecord);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Natijalar va Peshqadamlar ro'yxatini olish
 */
export async function getGameHistory(): Promise<GameRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        return data as GameRecord[];
      }
    } catch {
      // Fallback pastga o'tadi
    }
  }

  // LocalStorage zahira bazasi
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch {
    return [];
  }
}
