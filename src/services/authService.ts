// =====================================================
// NUR SHAXMAT 100 — Google Autentifikatsiya Servisi (Auth Service)
// Supabase OAuth va Google hisob orqali profil yaratish/boshqarish
// =====================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getUserProfile,
  linkGoogleAccount,
  unlinkGoogleAccount,
  UserProfile,
} from '../store/userProfileStore';
import { logger } from './loggerService';

export interface GoogleAuthResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

/**
 * Tizim yuklanganda Google sessiyasini tinglash va avtomatik profilni yangilash
 */
export function initAuth(onProfileChange?: (profile: UserProfile) => void): () => void {
  if (!isSupabaseConfigured || !supabase) {
    logger.logWarn('NETWORK', 'Supabase ulanmagan, autentifikatsiya mahalliy rejimda ishlaydi.');
    return () => {};
  }

  // 1. Joriy sessiyani tekshirish
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      logger.logError('NETWORK', 'Sessiyani tekshirishda xatolik', error);
      return;
    }
    if (session?.user) {
      handleSupabaseUser(session.user, onProfileChange);
    }
  });

  // 2. Auth holati o'zgarishini tinglash (Redirectdan qaytganda yoki login bo'lganda)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      logger.logInfo('NETWORK', `Supabase Auth hodisasi: ${event}`);
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        handleSupabaseUser(session.user, onProfileChange);
      } else if (event === 'SIGNED_OUT') {
        const unlinked = unlinkGoogleAccount();
        if (onProfileChange) onProfileChange(unlinked);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Supabase foydalanuvchi ma'lumotlarini Google profiliga o'tkazish
 */
function handleSupabaseUser(user: any, callback?: (profile: UserProfile) => void): UserProfile {
  const metadata = user.user_metadata || {};
  const fullName =
    metadata.full_name ||
    metadata.name ||
    user.email?.split('@')[0] ||
    'Google Foydalanuvchisi';
  const avatarUrl = metadata.avatar_url || metadata.picture || undefined;
  const email = user.email || '';

  const updated = linkGoogleAccount({
    id: user.id,
    name: fullName,
    email,
    avatarUrl,
    googleId: metadata.sub || user.id,
  });

  logger.logInfo('NETWORK', `Google hisobi muvaffaqiyatli ulandi: ${fullName} (${email})`);
  if (callback) callback(updated);
  return updated;
}

/**
 * Rasmiy Google OAuth orqali kirish (Supabase orqali)
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase konfiguratsiyasi topilmadi.',
    };
  }

  try {
    logger.logInfo('NETWORK', "Google OAuth orqali kirish boshlandi...");
    
    // Redirect URL joriy domenga mos bo'ladi (Vercel yoki Localhost)
    const redirectTo = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      logger.logError('NETWORK', `Google bilan kirishda xatolik: ${error.message}`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    logger.logError('NETWORK', 'Google OAuth kutilmagan nosozlik', e);
    return { success: false, error: e?.message || 'Nomaʼlum xatolik yuz berdi' };
  }
}

/**
 * Tezkor Google hisob ma'lumotlari bilan profil yaratish / ulash
 * (Supabase Dashboardda Google provayderi hali to'liq ulanmagan bo'lsa yoki tezkor kirish uchun)
 */
export function signInWithGoogleDirect(
  name: string,
  email: string,
  avatarUrl?: string
): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const profile = linkGoogleAccount({
    id: `google_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    googleId: `gid_${Date.now()}`,
  });

  logger.logInfo('UI', `Google hisobi ulandi (Direct): ${cleanName} (${cleanEmail})`);
  return profile;
}

/**
 * Google hisobidan chiqish (Logout)
 */
export async function signOutGoogle(): Promise<void> {
  try {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  } catch (e) {
    logger.logWarn('NETWORK', 'Supabase signOut xatolik, ammo mahalliy profil tozalanadi.');
  } finally {
    unlinkGoogleAccount();
    logger.logInfo('UI', "Google hisobidan muvaffaqiyatli chiqildi.");
  }
}
