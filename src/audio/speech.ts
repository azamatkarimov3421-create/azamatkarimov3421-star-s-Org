// =====================================================
// NUR SHAXMAT 100 — O'zbekcha Ovozli E'lonlar va Vibratsiya (TTS)
// =====================================================

let speechEnabled = true;

export function setSpeechEnabled(enabled: boolean) {
  speechEnabled = enabled;
}

export function isSpeechEnabled() {
  return speechEnabled;
}

/**
 * O'zbek tilida ovozli matn o'qish (Web Speech Synthesis)
 */
export function speakUzbek(text: string) {
  if (!speechEnabled || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Avvalgi gapni to'xtatish
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Uz voice topish yoki eng mosini ishlatish
    const voices = window.speechSynthesis.getVoices();
    const uzVoice = voices.find(v => v.lang.includes('uz') || v.lang.includes('tr'));
    if (uzVoice) utterance.voice = uzVoice;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Agar ovoz qo'llab-quvvatlanmasa, jimgina o'tib ketiladi
  }
}

/**
 * Mobil qurilmalarda tebranish (Haptic Vibration)
 */
export function vibrateTouch(pattern: number | number[] = 40) {
  if ('navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore
    }
  }
}
