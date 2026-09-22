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
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }, 600);
        }
      } else if (event === 'SIGNED_OUT') {
        const unlinked = unlinkGoogleAccount();
        if (onProfileChange) onProfileChange(unlinked);
      }
    }
  );

  // 3. Android Intent / Deep Link orqali qaytgan tokenni qabul qilish
  if (typeof window !== 'undefined') {
    (window as any).__handleAuthRedirect = async (urlStr: string) => {
      try {
        if (!urlStr) return;
        const hashIdx = urlStr.indexOf('#');
        if (hashIdx !== -1) {
          const hash = urlStr.substring(hashIdx + 1);
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token && supabase) {
            const { data } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (data?.user) {
              handleSupabaseUser(data.user, onProfileChange);
            }
          }
        }
      } catch (e) {
        logger.logError('NETWORK', 'Deep link auth xatosi', e);
      }
    };

    (window as any).__onNativeGoogleAccountPicked = (email: string) => {
      try {
        if (!email) return;
        const cleanEmail = email.trim();
        const raw = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
        const name = raw ? (raw.charAt(0).toUpperCase() + raw.slice(1)) : 'Google Foydalanuvchisi';
        const updated = signInWithGoogleDirect(name, cleanEmail);
        logger.logInfo('UI', `Nativ Android Google hisobi tanlandi: ${name} (${cleanEmail})`);
        if (onProfileChange) onProfileChange(updated);
      } catch (e) {
        logger.logError('UI', 'Native Google account handling error', e);
      }
    };
  }

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
    logger.logInfo('NETWORK', `Google OAuth orqali kirish boshlandi (Client ID: ${GOOGLE_CLIENT_ID})...`);
    
    // Redirect URL: Android app va web (nurchess100.uz) uchun
    const isAndroid = typeof window !== 'undefined' && Boolean((window as any).AndroidBridge || window.location.origin.includes('androidplatform.net'));
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nurchess100.uz';
    const redirectTo = isAndroid
      ? 'https://nurchess100.uz/'
      : (origin.includes('localhost') ? origin : 'https://nurchess100.uz/');

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

    if (data?.url) {
      if (isAndroid && (window as any).AndroidBridge?.openExternalUrl) {
        (window as any).AndroidBridge.openExternalUrl(data.url);
      } else if (typeof window !== 'undefined') {
        window.location.href = data.url;
      }
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
    avatarUrl: avatarUrl || undefined,
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
/**
 * Google Identity Services (GIS) mijoz tizimi (faqat mos keladigan veb muhitlarida)
 */
export function initGoogleIdentityServices(onSuccess: (profile: UserProfile) => void) {
  if (typeof window === 'undefined') return;

  // Android WebView ichida GIS chaqirilmaydi (Google 401 invalid_client xatolik bermasligi uchun)
  if ((window as any).AndroidBridge || window.location.origin.includes('androidplatform.net')) {
    return;
  }

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

  const google = (window as any).google;
  if (google?.accounts?.id) {
    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (e) {
      logger.logWarn('NETWORK', 'GIS initsializatsiya ogohlantirish', e);
    }
  }
}

/**
 * Qurilmadagi Google hisoblarini xavfsiz va xatosiz chiqarish (Android Nativ)
 */
export function triggerAutoGooglePick(onSuccess: (profile: UserProfile) => void): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Android Nativ APK ilova muhitida (AndroidBridge orqali 100% xatosiz va tezkor)
  if ((window as any).AndroidBridge?.pickGoogleAccount) {
    (window as any).__onNativeGoogleAccountPicked = (email: string) => {
      if (!email) return;
      const cleanEmail = email.trim();
      const raw = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
      const name = raw ? (raw.charAt(0).toUpperCase() + raw.slice(1)) : 'Google Foydalanuvchisi';
      const profile = signInWithGoogleDirect(name, cleanEmail);
      logger.logInfo('UI', `Nativ Android Google hisobi tanlandi: ${name} (${cleanEmail})`);
      onSuccess(profile);
    };
    try {
      (window as any).AndroidBridge.pickGoogleAccount();
      return true;
    } catch (e) {
      logger.logWarn('UI', 'AndroidBridge.pickGoogleAccount chaqiruvida xatolik', e);
    }
  }

  return false;
}

/**
 * Google rasmiy tugmasini HTML element ichiga joylash (xavfsiz rejim)
 */
export function renderGoogleSignInButton(container: HTMLElement, onSuccess: (profile: UserProfile) => void) {
  // Android WebView yoki ro'yxatdan o'tmagan domenlarda GIS tugmasi 401 bermasligi uchun bekor qilinadi
  if (typeof window === 'undefined') return;
  if ((window as any).AndroidBridge || window.location.origin.includes('androidplatform.net')) return;

  const google = (window as any).google;
  if (google?.accounts?.id && container) {
    try {
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
    } catch (e) {
      logger.logWarn('NETWORK', 'GIS renderButton error', e);
    }
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


