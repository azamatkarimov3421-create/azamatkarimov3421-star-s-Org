// =====================================================
// NUR SHAXMAT 100 — Supabase Klient va Ulanish Moduli
// =====================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vercel Integratsiyasi turli prefikslarni qo'llashi mumkin (VITE_, NEXT_PUBLIC_, h.k.)
const env = import.meta.env as Record<string, string | undefined>;

const DEFAULT_SUPABASE_URL = 'https://wxurybelmkfdcxdcmkgd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_WbL1mIYUGwB_kSJFixaowA_F5tkwcHG';

export const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  env.VITE_PUBLIC_SUPABASE_URL ||
  env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
