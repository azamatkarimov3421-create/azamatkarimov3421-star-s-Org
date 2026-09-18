// =====================================================
// NUR SHAXMAT 100 - Avto-yangilanish Xizmati (Auto-Updater)
// Supabase va jonli to'liq loyiha yuklash (Live OTA Hot-Update)
// =====================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppUpdateInfo {
  id?: number;
  version_code: number;
  version_name: string;
  title: string;
  release_notes: string;
  bundle_url?: string; // ZIP bundle fayli (ichki tezkor yangilash uchun)
  apk_url: string;      // To'liq APK fayli
  is_mandatory: boolean;
  created_at?: string;
}

export const CURRENT_VERSION_NAME = '1.0.5';
export const CURRENT_VERSION_CODE = 6;

// Oxirgi loyihaning to'liq jonli to'plami (Web Bundle ZIP)
export const DIRECT_BUNDLE_URL = 'https://files.catbox.moe/qwwi7e.zip';

// To'liq APK fayli havolasi (GitHub-siz to'g'ridan-to'g'ri yuklash)
export const DIRECT_APK_DOWNLOAD_URL = 'https://files.catbox.moe/p0o37r.apk';

export const LATEST_RELEASE: AppUpdateInfo = {
  version_code: 6,
  version_name: '1.0.5',
  title: 'Yangi Versiya Chiqdi! (v1.0.5)',
  release_notes:
    '• Standart holatda 3D Fazoviy yogʻoch doska va tik donalar koʻrinishi darhol faollashtirildi\n• Bosh sahifa va oʻyin tepasida aniq 🎲 3D va 📐 2D almashtirgich tugmalari joylashtirildi\n• Kitobdagidek haqiqiy 3D yogʻoch relyef va soya effektlari kuchaytirildi',
  bundle_url: DIRECT_BUNDLE_URL,
  apk_url: DIRECT_APK_DOWNLOAD_URL,
  is_mandatory: false,
};

export function getInstalledVersionCode(): number {
  try {
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.getAppVersionCode === 'function') {
      const code = bridge.getAppVersionCode();
      if (code && code > 0) return code;
    }
  } catch {}
  return CURRENT_VERSION_CODE;
}

export function getInstalledVersionName(): string {
  try {
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.getAppVersionName === 'function') {
      const name = bridge.getAppVersionName();
      if (name) return name;
    }
  } catch {}
  return CURRENT_VERSION_NAME;
}

export async function checkForAppUpdate(): Promise<{
  hasUpdate: boolean;
  updateInfo: AppUpdateInfo | null;
  error?: string;
}> {
  const currentCode = getInstalledVersionCode();

  // 1. Agar Supabase bazasi sozlangan bo'lsa, avval Supabase'dan tekshirish
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_updates')
        .select('*')
        .eq('is_active', true)
        .order('version_code', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const latest = data[0] as AppUpdateInfo;
        if (latest.version_code > currentCode) {
          return {
            hasUpdate: true,
            updateInfo: {
              ...latest,
              bundle_url: latest.bundle_url || DIRECT_BUNDLE_URL,
              apk_url: latest.apk_url || DIRECT_APK_DOWNLOAD_URL,
            },
          };
        }
        return { hasUpdate: false, updateInfo: null };
      }
    } catch (e) {
      console.warn('Supabase tekshiruvida xato:', e);
    }
  }

  // 2. Agar bazada jadval bo'lmasa ham, eng so'nggi versiyani taqdim etish
  if (LATEST_RELEASE.version_code > currentCode) {
    return {
      hasUpdate: true,
      updateInfo: LATEST_RELEASE,
    };
  }

  return { hasUpdate: false, updateInfo: null };
}

/**
 * Yangilanishni qo'llash:
 * Agar ilova Android'da bo'lsa, loyiha faylini (bundle.zip) to'liq yuklab olib,
 * APK qayta o'rnatmasdan turib bir zumda ilovani yangi versiyaga o'tkazadi!
 */
export function downloadAndInstallUpdate(targetOrUrl?: AppUpdateInfo | string | null): void {
  let bundleUrl = DIRECT_BUNDLE_URL;
  let apkUrl = DIRECT_APK_DOWNLOAD_URL;
  let versionName = '1.0.2';
  let versionCode = 3;

  if (typeof targetOrUrl === 'object' && targetOrUrl !== null) {
    bundleUrl = targetOrUrl.bundle_url || DIRECT_BUNDLE_URL;
    apkUrl = targetOrUrl.apk_url || DIRECT_APK_DOWNLOAD_URL;
    versionName = targetOrUrl.version_name || '1.0.2';
    versionCode = targetOrUrl.version_code || 3;
  } else if (typeof targetOrUrl === 'string') {
    apkUrl = targetOrUrl;
  }

  try {
    const bridge = (window as any).AndroidBridge;

    // 1-usul: Jonli avtomatik yangilanish (Live OTA Update)
    if (bridge && typeof bridge.downloadAndApplyLiveUpdate === 'function') {
      bridge.downloadAndApplyLiveUpdate(bundleUrl, versionName, versionCode);
      return;
    }

    // 2-usul: Agar Live update bo'lmasa, to'liq APK yuklab berish
    if (bridge && typeof bridge.downloadAndInstallApk === 'function') {
      bridge.downloadAndInstallApk(apkUrl);
      return;
    }
  } catch (e) {
    console.warn('AndroidBridge xatosi:', e);
  }

  window.open(apkUrl, '_blank');
}
