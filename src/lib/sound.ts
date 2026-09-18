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

export function getCustomSound(type: 'super' | 'not_very' | 'normal'): string | null {
  try {
    return localStorage.getItem(`pokepwa_custom_sound_${type}`);
  } catch {
    return null;
  }
}

export function setCustomSound(type: 'super' | 'not_very' | 'normal', base64Audio: string | null): void {
  try {
    if (base64Audio) {
      localStorage.setItem(`pokepwa_custom_sound_${type}`, base64Audio);
    } else {
      localStorage.removeItem(`pokepwa_custom_sound_${type}`);
    }
  } catch {}
}

export function playCustomSound(type: 'super' | 'not_very' | 'normal' | 'crit'): boolean {
  if (!soundEnabled) return false;
  const targetKey = type === 'crit' ? 'super' : type;
  const customDataUrl = getCustomSound(targetKey);
  if (customDataUrl) {
    try {
      const audio = new Audio(customDataUrl);
      audio.volume = 0.9;
      audio.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function playHit(effectiveness: 'super' | 'not_very' | 'normal' | 'crit') {
  if (!soundEnabled) return;

  // Priority 1: User uploaded custom audio file in settings
  if (playCustomSound(effectiveness)) {
    return;
  }

  // Priority 2: Built-in project WAV audio files in public/audio/
  let audioUrl: string | null = null;
  if (effectiveness === 'super' || effectiveness === 'crit') {
    audioUrl = '/audio/super_effective.wav';
  } else if (effectiveness === 'not_very') {
    audioUrl = '/audio/not_very_effective.wav';
  }

  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 0.9;
      audio.play().catch(() => {});
    } catch {}
  }

  // Normal hits and all synthesized fallback tones are completely silenced per user request
}

export function playFaint() {
  if (!soundEnabled) return;
  playTone(360, 50, 0.4, 'triangle', 0.12);
}

export function playLevelUp() {
  if (!soundEnabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, freq, 0.12, 'square', 0.15);
    }, idx * 110);
  });
}

export function playCatchSuccess() {
  if (!soundEnabled) return;
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, freq * 1.02, 0.15, 'square', 0.18);
    }, idx * 120);
  });
}

export function playCatchShake() {
  if (!soundEnabled) return;
  playTone(280, 320, 0.07, 'triangle', 0.12);
}

export function playProtect() {
  // Silenced
}

export function playCharge() {
  // Silenced
}

export function playEscape() {
  if (!soundEnabled) return;
  playTone(200, 800, 0.2, 'square', 0.12);
}
