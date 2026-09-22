/**
 * Retro 8-bit / 16-bit Sound Synthesizer for PokéPWA
 * 
 * Powered by native Web Audio API (zero external assets, completely offline).
 * Provides authentic GameBoy/GBA style audio feedback.
 */

import { SUPER_EFFECTIVE_B64, NOT_VERY_EFFECTIVE_B64 } from '../assets/audioData';

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

export function getAssetUrl(relativePath: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  return cleanBase + cleanPath;
}

export function getAbsoluteAssetUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let pathname = window.location.pathname;
  if (pathname.endsWith('.html')) {
    const parts = pathname.split('/');
    parts.pop();
    pathname = parts.join('/') + '/';
  }
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }
  
  let cleanUrl = url;
  if (cleanUrl.startsWith('./')) {
    cleanUrl = cleanUrl.substring(2);
  } else if (cleanUrl.startsWith('/')) {
    cleanUrl = cleanUrl.substring(1);
  }
  
  const origin = window.location.origin;
  return `${origin}${pathname}${cleanUrl}`;
}

let audioUnlocked = false;
const audioBuffersCache = new Map<string, AudioBuffer>();
const audioElementsCache = new Map<string, HTMLAudioElement>();

if (typeof window !== 'undefined') {
  setTimeout(() => {
    loadAndDecodeAudio(SUPER_EFFECTIVE_B64).catch(() => {});
    loadAndDecodeAudio(NOT_VERY_EFFECTIVE_B64).catch(() => {});
  }, 100);
}

export async function loadAndDecodeAudio(url: string): Promise<AudioBuffer | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;
  
  const absoluteUrl = getAbsoluteAssetUrl(url);
  if (audioBuffersCache.has(absoluteUrl)) return audioBuffersCache.get(absoluteUrl)!;

  try {
    const response = await fetch(absoluteUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBuffersCache.set(absoluteUrl, audioBuffer);
    return audioBuffer;
  } catch {
    return null;
  }
}

export function playAudioBuffer(buffer: AudioBuffer, volume = 0.9): boolean {
  if (!soundEnabled) return false;
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
    return true;
  } catch {
    return false;
  }
}

export function unlockAudio() {
  if (audioUnlocked) return;
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      audioUnlocked = true;
    }).catch(() => {});
  } else if (ctx) {
    audioUnlocked = true;
  }

  // Pre-load and unlock audio elements & Web Audio buffers on touch gesture
  if (typeof window !== 'undefined') {
    const defaultAssets = [SUPER_EFFECTIVE_B64, NOT_VERY_EFFECTIVE_B64];
    defaultAssets.forEach(url => {
      // Pre-fetch & decode into Web Audio API buffer (works on mobile & GitHub Pages)
      loadAndDecodeAudio(url).catch(() => {});

      try {
        let audio = audioElementsCache.get(url);
        if (!audio) {
          audio = new Audio(url);
          audio.preload = 'auto';
          audioElementsCache.set(url, audio);
        }
        audio.volume = 0.001;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.then(() => {
            audio?.pause();
            audio!.currentTime = 0;
            audio!.volume = 0.9;
          }).catch(() => {});
        }
      } catch {}
    });
  }
}

if (typeof window !== 'undefined') {
  const handleUserUnlock = () => {
    unlockAudio();
    window.removeEventListener('touchstart', handleUserUnlock);
    window.removeEventListener('click', handleUserUnlock);
  };
  window.addEventListener('touchstart', handleUserUnlock, { passive: true });
  window.addEventListener('click', handleUserUnlock, { passive: true });
}

function playAudioUrl(urlOrBase64: string, volume: number = 0.9): boolean {
  if (!soundEnabled) return false;
  unlockAudio();
  const absoluteUrl = getAbsoluteAssetUrl(urlOrBase64);
  try {
    let audio = audioElementsCache.get(absoluteUrl);
    if (!audio) {
      audio = new Audio(absoluteUrl);
      audioElementsCache.set(absoluteUrl, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback for mobile if cached instance failed
        const freshAudio = new Audio(absoluteUrl);
        freshAudio.volume = volume;
        freshAudio.play().catch(() => {});
      });
    }
    return true;
  } catch {
    return false;
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    localStorage.setItem('pokepwa_sound_enabled', String(enabled));
  } catch {}

  if (!enabled) {
    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio = null;
      currentBgmType = null;
    }
    audioElementsCache.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    }
  }
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
    return playAudioUrl(customDataUrl, 0.9);
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
  let targetWav: string | null = null;
  if (effectiveness === 'super') {
    targetWav = SUPER_EFFECTIVE_B64;
  } else if (effectiveness === 'not_very') {
    targetWav = NOT_VERY_EFFECTIVE_B64;
  }

  if (targetWav) {
    // Priority 2A: Play via decoded Web Audio API buffer (immune to mobile async delays)
    const buffer = audioBuffersCache.get(targetWav);
    if (buffer) {
      playAudioBuffer(buffer, 0.9);
      return;
    }

    // Priority 2B: Fallback to HTMLAudioElement
    playAudioUrl(targetWav, 0.9);

    // Trigger async load for next time if buffer wasn't ready
    loadAndDecodeAudio(targetWav).catch(() => {});
  }

  // Normal hits and all synthesized fallback tones are completely silenced per user request
}

export function playPokemonCry(pokemonId: number): void {
  if (!soundEnabled || !pokemonId) return;
  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
  const success = playAudioUrl(cryUrl, 0.4);
  if (!success) {
    const legacyUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${pokemonId}.ogg`;
    playAudioUrl(legacyUrl, 0.4);
  }
}

// BGM Music Player Engine
let currentBgmAudio: HTMLAudioElement | null = null;
let currentBgmType: 'overworld' | 'battle' | null = null;

export function getCustomBgm(type: 'overworld' | 'battle'): string | null {
  try {
    return localStorage.getItem(`pokepwa_custom_bgm_${type}`);
  } catch {
    return null;
  }
}

export function setCustomBgm(type: 'overworld' | 'battle', base64Audio: string | null): void {
  try {
    if (base64Audio) {
      localStorage.setItem(`pokepwa_custom_bgm_${type}`, base64Audio);
    } else {
      localStorage.removeItem(`pokepwa_custom_bgm_${type}`);
    }
    // Update active BGM if playing
    if (currentBgmType === type) {
      playBgm(type, true);
    }
  } catch {}
}

export function playBgm(type: 'overworld' | 'battle' | 'stop', forceReload = false): void {
  if (type === 'stop' || !soundEnabled) {
    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio = null;
    }
    currentBgmType = null;
    return;
  }

  if (currentBgmType === type && !forceReload && currentBgmAudio) {
    if (currentBgmAudio.paused) {
      currentBgmAudio.play().catch(() => {});
    }
    return;
  }

  if (currentBgmAudio) {
    currentBgmAudio.pause();
    currentBgmAudio = null;
  }

  const bgmUrl = getCustomBgm(type);
  if (!bgmUrl) {
    currentBgmType = null;
    return;
  }

  try {
    currentBgmAudio = new Audio(bgmUrl);
    currentBgmAudio.loop = true;
    currentBgmAudio.volume = 0.5;
    currentBgmType = type;
    currentBgmAudio.play().catch(() => {});
  } catch {
    currentBgmAudio = null;
    currentBgmType = null;
  }
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
