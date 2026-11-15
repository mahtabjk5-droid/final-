export type SovereignHapticPattern =
  | 'authenticate'
  | 'signOut'
  | 'tap'
  | 'error'
  | 'sync_steady'
  | 'security_violation'
  | 'agi_agent_lockdown'
  | 'agi_agent_heartbeat'
  | 'truth_tamper'
  | 'seal_minted';

export type ApexHapticUrgency = 'nominal' | 'elevated' | 'critical';

export interface ApexHapticProfile {
  label: string;
  urgency: ApexHapticUrgency;
  description: string;
  pattern: number[];
}

export interface ApexHapticEvent {
  id: string;
  patternKey: SovereignHapticPattern;
  label: string;
  urgency: ApexHapticUrgency;
  msPattern: number[];
  source: string;
  hardwareVibrated: boolean;
  timestamp: string;
}

export const APEX_HAPTIC_PROFILES: Record<SovereignHapticPattern, ApexHapticProfile> = {
  sync_steady: {
    label: 'Successful Sync (Long Steady)',
    urgency: 'nominal',
    description: 'Long steady vibration confirming WebSocket & AGI ledger synchronization.',
    pattern: [240],
  },
  security_violation: {
    label: 'Security Violation (Rapid Pulses)',
    urgency: 'critical',
    description: 'Rapid staccato pulses on scam, coercion, or rogue AGI intent detection.',
    pattern: [45, 35, 45, 35, 45, 35, 95, 40, 45, 35, 45],
  },
  agi_agent_lockdown: {
    label: 'AGI / Autonomous Agent Lockdown',
    urgency: 'critical',
    description: 'Heavy triple-cadence lockdown alert when AI agent tokens are revoked.',
    pattern: [120, 45, 120, 45, 220],
  },
  truth_tamper: {
    label: 'Forensic Riba / Tamper Alert',
    urgency: 'elevated',
    description: 'Asymmetric warning pulses for hidden Riba clauses or math tampering.',
    pattern: [55, 30, 55, 30, 115],
  },
  agi_agent_heartbeat: {
    label: 'Autonomous Agent Heartbeat',
    urgency: 'nominal',
    description: 'Subtle dual-pulse cadence for healthy autonomous agent guardrail sync.',
    pattern: [18, 46, 22],
  },
  seal_minted: {
    label: 'SHA-256 Intent Seal Minted',
    urgency: 'nominal',
    description: 'Crisp ceremonial confirmation pulse for verified human intent.',
    pattern: [20, 30, 36],
  },
  authenticate: {
    label: 'Sovereign Auth Seal',
    urgency: 'nominal',
    description: 'Ceremonial dual-pulse seal for sovereign command authorization.',
    pattern: [18, 32, 26],
  },
  signOut: {
    label: 'Session Lock',
    urgency: 'elevated',
    description: 'Firm descending lock pulse when locking sovereign command.',
    pattern: [24, 22, 12],
  },
  tap: {
    label: 'Tactile Detent',
    urgency: 'nominal',
    description: 'Crisp 8ms tactile tick for controls and PIN keypad.',
    pattern: [8],
  },
  error: {
    label: 'Validation Rejection',
    urgency: 'elevated',
    description: 'Distinct alert pulses for invalid PIN or rejected payload.',
    pattern: [30, 35, 30],
  },
};

const STORAGE_KEY = 'bolmizan_apex_haptics_enabled';
const SOUND_FX_STORAGE_KEY = 'bolmizan_sindhi_sound_fx_enabled';
const listeners = new Set<(event: ApexHapticEvent) => void>();

let fxAudioCtx: AudioContext | null = null;

function playSindhiAcousticFeedback(patternKey: SovereignHapticPattern): void {
  if (typeof window === 'undefined' || !isSindhiSoundFxEnabled()) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!fxAudioCtx) {
      fxAudioCtx = new AudioCtx();
    }
    if (fxAudioCtx.state === 'suspended') {
      void fxAudioCtx.resume();
    }
    const ctx = fxAudioCtx;
    const now = ctx.currentTime;

    const triggerTone = (
      freqStart: number,
      freqEnd: number,
      durationSec: number,
      delaySec: number,
      type: OscillatorType,
      peakGain: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now + delaySec);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + delaySec + durationSec);
      gain.gain.setValueAtTime(0.0001, now + delaySec);
      gain.gain.linearRampToValueAtTime(peakGain, now + delaySec + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delaySec + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delaySec);
      osc.stop(now + delaySec + durationSec + 0.02);
    };

    if (patternKey === 'tap' || patternKey === 'agi_agent_heartbeat') {
      // Acacia woodblock Ajrak stamp click + subtle Ektara pluck
      triggerTone(210, 95, 0.05, 0, 'triangle', 0.045);
      triggerTone(587.33, 587.33, 0.07, 0.01, 'sine', 0.02);
    } else if (patternKey === 'seal_minted' || patternKey === 'authenticate') {
      // Warm Sindhi Bhairavi Sitar harmonic fifth (D4 -> A4 -> F#5)
      triggerTone(293.66, 293.66, 0.18, 0, 'triangle', 0.04);
      triggerTone(440.0, 440.0, 0.22, 0.07, 'sine', 0.045);
      triggerTone(587.33, 587.33, 0.28, 0.14, 'sine', 0.04);
    } else if (patternKey === 'sync_steady') {
      // Hala copper bowl chime
      triggerTone(392.0, 392.0, 0.32, 0, 'sine', 0.04);
      triggerTone(587.33, 587.33, 0.35, 0.05, 'sine', 0.025);
    } else if (patternKey === 'signOut') {
      // Calm descending cadence
      triggerTone(440, 293.66, 0.22, 0, 'triangle', 0.04);
    } else {
      // Resonant bronze alert bell (scam, bot, tamper, lockdown)
      triggerTone(261.63, 196.0, 0.14, 0, 'triangle', 0.045);
      triggerTone(196.0, 146.83, 0.2, 0.12, 'sine', 0.045);
    }
  } catch {
    // Ignore autoplay lock before first direct click
  }
}

export function isVibrationApiSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function isSindhiSoundFxEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(SOUND_FX_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function setSindhiSoundFxEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_FX_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage errors
  }
}

export function isApexHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function setApexHapticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage quota / private-mode restrictions
  }
}

export function subscribeApexHaptic(listener: (event: ApexHapticEvent) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function triggerApexHaptic(
  patternKey: SovereignHapticPattern,
  source = 'BolMizan Sovereign OS',
): boolean {
  const profile = APEX_HAPTIC_PROFILES[patternKey] ?? APEX_HAPTIC_PROFILES.tap;
  const enabled = isApexHapticsEnabled();
  let hardwareVibrated = false;

  if (enabled) {
    playSindhiAcousticFeedback(patternKey);
  }

  if (enabled && isVibrationApiSupported()) {
    try {
      if (profile.urgency === 'critical') {
        navigator.vibrate(0);
      }
      hardwareVibrated = navigator.vibrate(profile.pattern);
    } catch {
      hardwareVibrated = false;
    }
  }

  const evt: ApexHapticEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    patternKey,
    label: profile.label,
    urgency: profile.urgency,
    msPattern: profile.pattern,
    source,
    hardwareVibrated,
    timestamp: new Date().toISOString(),
  };

  if (enabled) {
    listeners.forEach((cb) => {
      try {
        cb(evt);
      } catch {
        // Isolate subscriber errors
      }
    });
  }

  return hardwareVibrated;
}

export function triggerSovereignHaptic(pattern: SovereignHapticPattern): boolean {
  return triggerApexHaptic(pattern);
}
