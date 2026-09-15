// =====================================================
// NUR SHAXMAT 100 — O'zbekcha Ovozli E'lonlar va Vibratsiya (TTS)
// =====================================================

let speechEnabled = false; // Xavfsizlik uchun default o'chirilgan

export function setSpeechEnabled(enabled: boolean) {
  speechEnabled = enabled;
}

export function isSpeechEnabled() {
  return speechEnabled;
}

/**
 * O'zbek tilida ovozli matn o'qish (Asinxron va UI ni to'sib qo'ymaydi)
 */
export function speakUzbek(text: string) {
  if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  setTimeout(() => {
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'uz-UZ';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore errors safely
    }
  }, 10);
}

/**
 * Mobil qurilmalarda tebranish (Haptic Vibration)
 */
export function vibrateTouch(pattern: number | number[] = 40) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore
    }
  }
}
