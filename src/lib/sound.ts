/**
 * Retro 8-bit / 16-bit Sound Synthesizer for PokéPWA
 * 
 * Powered by native Web Audio API (zero external assets, completely offline).
 * Provides authentic GameBoy/GBA style audio feedback.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

// Load persisted preference
try {
  const saved = localStorage.getItem('pokepwa_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch {}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    localStorage.setItem('pokepwa_sound_enabled', String(enabled));
  } catch {}
}

export function toggleSound(): boolean {
  const next = !soundEnabled;
  setSoundEnabled(next);
  if (next) {
    playMenuClick();
  }
  return next;
}

/**
 * Plays a quick frequency sweep / tone
 */
function playTone(
  freqStart: number,
  freqEnd: number,
  durationSec: number,
  type: OscillatorType = 'square',
  gainStart: number = 0.15,
  gainEnd: number = 0.001
) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), ctx.currentTime + durationSec);

    gain.gain.setValueAtTime(gainStart, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainEnd, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {}
}

/**
 * Noise burst for explosions, hits, and faints
 */
function playNoise(durationSec: number, gainLevel: number = 0.2) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(150, ctx.currentTime + durationSec);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {}
}

export function playMenuClick() {
  playTone(850, 950, 0.05, 'square', 0.1);
}

export function playHit(effectiveness: 'super' | 'not_very' | 'normal' | 'crit') {
  if (!soundEnabled) return;

  if (effectiveness === 'crit') {
    // Sharp crack + impact
    playTone(1200, 200, 0.15, 'sawtooth', 0.25);
    setTimeout(() => playNoise(0.18, 0.3), 30);
  } else if (effectiveness === 'super') {
    // High-impact resonant boom
    playTone(550, 90, 0.22, 'square', 0.28);
    playNoise(0.2, 0.35);
  } else if (effectiveness === 'not_very') {
    // Dull thud
    playTone(180, 70, 0.12, 'triangle', 0.2);
  } else {
    // Normal attack hit
    playTone(380, 110, 0.12, 'square', 0.2);
    playNoise(0.08, 0.18);
  }
}

export function playFaint() {
  if (!soundEnabled) return;
  // Falling tone sliding down into noise
  playTone(450, 60, 0.6, 'sawtooth', 0.22);
  setTimeout(() => playNoise(0.4, 0.25), 250);
}

export function playLevelUp() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Classic victorious rising arpeggio: C5 -> E5 -> G5 -> C6
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, freq, 0.12, 'square', 0.18);
    }, idx * 110);
  });
}

export function playCatchSuccess() {
  if (!soundEnabled) return;
  // Triumphant 4-note catch fanfare
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, freq * 1.02, 0.15, 'square', 0.2);
    }, idx * 120);
  });
}

export function playCatchShake() {
  playTone(280, 320, 0.07, 'triangle', 0.15);
}

export function playProtect() {
  if (!soundEnabled) return;
  // Shimmering green/blue protective barrier
  playTone(300, 900, 0.18, 'sine', 0.2);
  setTimeout(() => playTone(900, 1400, 0.22, 'triangle', 0.22), 80);
}

export function playCharge() {
  if (!soundEnabled) return;
  // Rising power charge hum
  playTone(150, 700, 0.5, 'sawtooth', 0.18);
}

export function playEscape() {
  playTone(200, 900, 0.2, 'square', 0.15);
}
