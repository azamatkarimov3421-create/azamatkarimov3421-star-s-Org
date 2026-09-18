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

/**
 * Rasmiy Google Client ID
 */
export const GOOGLE_CLIENT_ID =
  '1001825670321-pnb75kl8fu402cnc1aub2ll7lkd5d1cr.apps.googleusercontent.com';

/**
 * Google JWT ID Tokenini dekodlash (client-side)
 */
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    logger.logError('NETWORK', 'Google JWT dekodlashda xatolik', e);
    return null;
  }
}

/**
 * Google Identity Services (GIS) mijoz tizimini initsializatsiya qilish
 */
export function initGoogleIdentityServices(onSuccess: (profile: UserProfile) => void) {
  if (typeof window === 'undefined') return;

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload) return;

    const name = payload.name || payload.given_name || 'Google Oʻyinchi';
    const email = payload.email || '';
    const avatarUrl = payload.picture || undefined;
    const sub = payload.sub || '';

    const profile = linkGoogleAccount({
      id: sub,
      name,
      email,
      avatarUrl,
      googleId: sub,
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });
      } catch (err) {
        logger.logWarn('NETWORK', 'Supabase IdToken ulanishida ogohlantirish');
      }
    }

    logger.logInfo('UI', `Google hisobi ulandi (GIS): ${name} (${email})`);
    onSuccess(profile);
  };

  const setupGIS = () => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  const google = (window as any).google;
  if (google?.accounts?.id) {
    setupGIS();
  } else {
    const interval = setInterval(() => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        clearInterval(interval);
        setupGIS();
      }
    }, 250);
    setTimeout(() => clearInterval(interval), 6000);
  }
}

/**
 * Google rasmiy tugmasini HTML element ichiga joylash
 */
export function renderGoogleSignInButton(container: HTMLElement, onSuccess: (profile: UserProfile) => void) {
  const tryRender = () => {
    const google = (window as any).google;
    if (google?.accounts?.id && container) {
      initGoogleIdentityServices(onSuccess);
      container.innerHTML = '';
      google.accounts.id.renderButton(container, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 280,
      });
      return true;
    }
    return false;
  };

  if (!tryRender()) {
    const interval = setInterval(() => {
      if (tryRender()) {
        clearInterval(interval);
      }
    }, 250);
    setTimeout(() => clearInterval(interval), 5000);
  }
}

/**
 * Google rasmiy pop-up oynasi orqali to'g'ridan-to'g'ri hisob tanlash va kirish
 */
export function signInWithGooglePopup(onSuccess: (profile: UserProfile) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;

    // 1. Agar Google GIS tayyor bo'lsa, to'g'ridan-to'g'ri token popup ochiladi
    if (google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (response: any) => {
            if (response.error) {
              logger.logError('NETWORK', `Google popup xatosi: ${response.error}`);
              reject(new Error(response.error_description || response.error));
              return;
            }
            if (response.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                });
                const data = await res.json();
                if (data.email) {
                  const profile = linkGoogleAccount({
                    id: data.sub,
                    name: data.name || data.given_name || 'Google Oʻyinchi',
                    email: data.email,
                    avatarUrl: data.picture,
                    googleId: data.sub,
                  });
                  logger.logInfo('UI', `Google popup orqali muvaffaqiyatli ulandi: ${profile.name} (${profile.email})`);
                  onSuccess(profile);
                  resolve();
                  return;
                }
              } catch (err: any) {
                logger.logError('NETWORK', 'Google userinfo olishda xato', err);
              }
            }
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        logger.logWarn('NETWORK', 'Google token popup ishlamadi, Supabase OAuth rejimiga oʻtiladi.');
      }
    }

    // 2. Agar GIS bo'lmasa yoki xato bersa — Supabase OAuth redirectiga o'tadi
    signInWithGoogle().then((res) => {
      if (!res.success) reject(new Error(res.error));
      else resolve();
    });
  });
}


