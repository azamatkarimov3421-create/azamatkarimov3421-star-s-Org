// =====================================================
// NUR SHAXMAT 100 — Haqiqiy Yog'och Shaxmat Ovoz Effektlari
// Web Audio API yordamida haqiqiy yog'och taxta va donalar ovozi
// =====================================================

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Haqiqiy yog'och dona urilishi ovozini sintezlash (Acoustic Wood Impact)
 */
function playAcousticWoodTap(options: {
  volume?: number;
  pitch?: number;        // Asosiy tovush chastotasi (Hz)
  decay?: number;        // So'nish vaqti (sekund)
  clickIntensity?: number; // Taxtaga urilish tirqishi kuchi
  delay?: number;        // Kechikish (sekund)
} = {}): void {
  if (!soundEnabled) return;

  const {
    volume = 0.5,
    pitch = 280,
    decay = 0.08,
    clickIntensity = 0.4,
    delay = 0,
  } = options;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime + delay;

    // 1. Shovqinli zargarona urilish zarbasi (Acoustic transient / click)
    // Yog'och yuzalari bir-biriga tekkandagi dastlabki "chertilish" tovushi
    const bufferSize = Math.floor(ctx.sampleRate * 0.025); // 25ms shovqin
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Yog'och uchun bandpass filtri (taxminan 1600 - 2400 Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1800, now);
    bandpass.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * clickIntensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // 2. Yog'och dona tanasining rezonansi (Wood piece resonance - 250Hz -> 120Hz)
    const oscBody = ctx.createOscillator();
    const gainBody = ctx.createGain();

    oscBody.type = 'triangle';
    oscBody.frequency.setValueAtTime(pitch, now);
    oscBody.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + decay);

    gainBody.gain.setValueAtTime(volume * 0.7, now);
    gainBody.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    oscBody.connect(gainBody);
    gainBody.connect(ctx.destination);

    oscBody.start(now);
    oscBody.stop(now + decay);

    // 3. Doska kamerasining tub rezonansi (Hollow board cavity thud - 110Hz)
    const oscThud = ctx.createOscillator();
    const gainThud = ctx.createGain();

    oscThud.type = 'sine';
    oscThud.frequency.setValueAtTime(125, now);
    oscThud.frequency.exponentialRampToValueAtTime(55, now + decay * 1.3);

    gainThud.gain.setValueAtTime(volume * 0.5, now);
    gainThud.gain.exponentialRampToValueAtTime(0.0001, now + decay * 1.3);

    oscThud.connect(gainThud);
    gainThud.connect(ctx.destination);

    oscThud.start(now);
    oscThud.stop(now + decay * 1.3);
  } catch {
    // Xatolik bo'lsa o'tkazib yuborish
  }
}

/**
 * ♟️ Oddiy harakat ovozi:
 * Yog'och donani taxtaga qo'yishdagi toza va yoqimli "TOQ" tovushi
 */
export function playMoveSound(): void {
  playAcousticWoodTap({
    volume: 0.5,
    pitch: 290,
    decay: 0.08,
    clickIntensity: 0.45,
  });
}

/**
 * ⚔️ Yeyish ovozi:
 * Ikki yog'och donaning to'qnashishi va taxtaga qo'yilishi (Double-tap "TUK-TAK")
 */
export function playCaptureSound(): void {
  // Birinchi dona urilishi
  playAcousticWoodTap({
    volume: 0.55,
    pitch: 380,
    decay: 0.06,
    clickIntensity: 0.6,
    delay: 0,
  });
  // Ikkinchi zarba: yangi dona joylashishi (25ms keyin)
  playAcousticWoodTap({
    volume: 0.65,
    pitch: 260,
    decay: 0.09,
    clickIntensity: 0.5,
    delay: 0.025,
  });
}

/**
 * 🏰 Rokirovka ovozi:
 * Shoh va Tura birin-ketin taxtaga qo'yilishidagi ikki dona qadami
 */
export function playCastlingSound(): void {
  playAcousticWoodTap({
    volume: 0.5,
    pitch: 300,
    decay: 0.07,
    clickIntensity: 0.4,
    delay: 0,
  });
  playAcousticWoodTap({
    volume: 0.55,
    pitch: 260,
    decay: 0.08,
    clickIntensity: 0.45,
    delay: 0.12,
  });
}

/**
 * ⚠️ Shoh ovozi:
 * Qattiqroq, e'tibor tortuvchi yog'och rezonansi va ogohlantiruvchi qisqa aks-sado
 */
export function playCheckSound(): void {
  playAcousticWoodTap({
    volume: 0.7,
    pitch: 360,
    decay: 0.12,
    clickIntensity: 0.65,
  });
  // Yoqimli yog'och akkord aks-sadosi
  playMarimbaNote(520, 0.12, 0.25, 0.04);
}

/**
 * ⭐ Nur donasi sakrash ovozi:
 * Rezonansli yog'och chertilishi va jozibador nur aks-sadosi
 */
export function playNurLeapSound(): void {
  playAcousticWoodTap({
    volume: 0.6,
    pitch: 340,
    decay: 0.09,
    clickIntensity: 0.55,
  });
  playMarimbaNote(660, 0.15, 0.25, 0.03);
}

/**
 * 👑 Piyoda aylantirish ovozi:
 * Nafis yog'och ksilofon (marimba) akkordi
 */
export function playPromotionSound(): void {
  playAcousticWoodTap({ volume: 0.6, pitch: 300, decay: 0.08 });
  playMarimbaNote(523, 0.18, 0.3, 0.05); // C5
  playMarimbaNote(659, 0.18, 0.3, 0.12); // E5
  playMarimbaNote(784, 0.25, 0.35, 0.20); // G5
}

/**
 * 🏆 G'alaba ovozi:
 * Shoxona yog'och marimba g'alaba akkordi
 */
export function playVictorySound(): void {
  playMarimbaNote(523, 0.2, 0.3, 0.0);   // C5
  playMarimbaNote(659, 0.2, 0.3, 0.12);  // E5
  playMarimbaNote(784, 0.2, 0.35, 0.24); // G5
  playMarimbaNote(1046, 0.35, 0.4, 0.36); // C6
}

/**
 * 🏁 O'yin tugash ovozi:
 * Pastroq vazmin yog'och ohangi
 */
export function playGameOverSound(): void {
  playMarimbaNote(659, 0.2, 0.25, 0.0);
  playMarimbaNote(523, 0.2, 0.25, 0.12);
  playMarimbaNote(440, 0.2, 0.25, 0.24);
  playMarimbaNote(349, 0.3, 0.3, 0.36);
}

/**
 * Marimba / Yog'och ksilofon notasi (chiroyli akustik nota)
 */
function playMarimbaNote(freq: number, duration: number, volume: number, delay: number): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Ksilofon zarbasi (zarb va tez so'nish)
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore
  }
}
