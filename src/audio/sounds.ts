// =====================================================
// NUR SHAXMAT 100 — Ovoz effektlari (Web Audio API)
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

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  delay: number = 0
): void {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch {
    // Ovoz ishlamasa, davom etamiz
  }
}

/** Oddiy harakat ovozi */
export function playMoveSound(): void {
  playTone(440, 0.08, 'square', 0.15);
}

/** Yeyish ovozi */
export function playCaptureSound(): void {
  playTone(280, 0.12, 'sawtooth', 0.2);
  playTone(200, 0.15, 'square', 0.1, 0.05);
}

/** Shoh ovozi */
export function playCheckSound(): void {
  playTone(660, 0.1, 'sine', 0.25);
  playTone(880, 0.1, 'sine', 0.2, 0.15);
}

/** Rokirovka ovozi */
export function playCastlingSound(): void {
  playTone(350, 0.08, 'sine', 0.2);
  playTone(500, 0.08, 'sine', 0.2, 0.1);
}

/** O'yin tugadi ovozi */
export function playGameOverSound(): void {
  const notes = [523, 440, 349, 262]; // C5, A4, F4, C4
  notes.forEach((freq, i) => {
    playTone(freq, 0.25, 'sine', 0.3, i * 0.2);
  });
}

/** G'alaba ovozi */
export function playVictorySound(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, 'sine', 0.3, i * 0.15);
  });
}

/** Aylantirish ovozi */
export function playPromotionSound(): void {
  playTone(784, 0.1, 'sine', 0.25);
  playTone(988, 0.1, 'sine', 0.25, 0.12);
  playTone(1175, 0.2, 'sine', 0.25, 0.24);
}

/** Nur sakrash ovozi (maxsus) */
export function playNurLeapSound(): void {
  playTone(600, 0.06, 'sine', 0.2);
  playTone(800, 0.06, 'sine', 0.15, 0.07);
}
