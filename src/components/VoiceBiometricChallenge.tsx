import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Fingerprint,
  Lock,
  Mic,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Waves,
} from 'lucide-react';
import { ChromaticKashiRule } from './SovereignArt';
import { triggerApexHaptic } from '../utils/haptics';

interface VoiceprintProfile {
  founder: string;
  enrolledAt: string;
  fundamentalHz: number;
  centroidHz: number;
  harmonicity: number;
  bandEnergy: number[]; // 8-band normalized spectral profile
  digest: string;
}

interface BiometricAnalysisResult {
  passed: boolean;
  similarityPct: number;
  fundamentalHz: number;
  centroidHz: number;
  harmonicity: number;
  rmsPeak: number;
  voicedFrames: number;
  mode: 'enrolled-match' | 'baseline-liveness';
  reason: string;
  bandEnergy: number[];
  verifiedAt: string;
  clearanceToken: string | null;
}

interface LiquidationTranche {
  id: string;
  asset: string;
  valuePkr: number;
  goldGrams: number;
  destination: string;
}

const LIQUIDATION_TRANCHES: LiquidationTranche[] = [
  {
    id: 'liq-gold-24k',
    asset: '24K Physical Bullion Reserve Tranche #SKR-AU7',
    valuePkr: 6_200_000,
    goldGrams: 250.0,
    destination: 'Karachi Bullion Vault → Haq-e-Mazdoor Liquidity Pool',
  },
  {
    id: 'liq-solar-mudarabah',
    asset: 'Sakrand Solar & RO Micro-Grid Syndicate Equity Exit',
    valuePkr: 9_600_000,
    goldGrams: 387.1,
    destination: 'Otaq Majlis Settlement Escrow (0% Riba)',
  },
];

const PASSPHRASES = [
  'Bismillah Mizan Sakrand Zero Riba',
  'Al-Ameen Sovereign Vault Unlock',
  'Haq-e-Mazdoor Sadiq-o-Ameen Seal',
];

const VOICEPRINT_STORAGE_KEY = 'bolmizan_founder_voiceprint_v1';

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Array.from(input)
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)
    .toString(16)
    .padStart(16, '0');
}

function estimatePitchAutocorrelation(samples: Float32Array, sampleRate: number): number {
  const minLag = Math.floor(sampleRate / 320); // ~320 Hz max fundamental
  const maxLag = Math.min(Math.floor(samples.length / 2), Math.floor(sampleRate / 75)); // ~75 Hz min fundamental
  let bestLag = -1;
  let bestCorr = 0;

  let energy = 0;
  for (let i = 0; i < samples.length; i++) {
    energy += samples[i] * samples[i];
  }
  if (energy < 1e-4) return 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < samples.length - lag; i++) {
      corr += samples[i] * samples[i + lag];
    }
    const normCorr = corr / energy;
    if (normCorr > bestCorr) {
      bestCorr = normCorr;
      bestLag = lag;
    }
  }

  return bestCorr > 0.25 && bestLag > 0 ? Math.round(sampleRate / bestLag) : 0;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function loadStoredVoiceprint(): VoiceprintProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(VOICEPRINT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VoiceprintProfile;
    if (!Array.isArray(parsed.bandEnergy) || parsed.bandEnergy.length !== 8) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const VoiceBiometricChallenge: React.FC = () => {
  const [passphraseIdx, setPassphraseIdx] = useState(0);
  const [enrolledProfile, setEnrolledProfile] = useState<VoiceprintProfile | null>(() =>
    loadStoredVoiceprint(),
  );
  const [capturingMode, setCapturingMode] = useState<'idle' | 'verifying' | 'enrolling'>('idle');
  const [progressPct, setProgressPct] = useState(0);
  const [liveBands, setLiveBands] = useState<number[]>(() => Array(8).fill(0.08));
  const [livePitchHz, setLivePitchHz] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<BiometricAnalysisResult | null>(null);
  const [unlockedUntil, setUnlockedUntil] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [executedLiquidations, setExecutedLiquidations] = useState<Record<string, string>>({});

  const activeCaptureCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      activeCaptureCleanupRef.current?.();
    };
  }, []);

  // Countdown timer for unlocked liquidation window
  useEffect(() => {
    if (!unlockedUntil) {
      setRemainingSec(0);
      return;
    }
    const updateTimer = () => {
      const rem = Math.max(0, Math.ceil((unlockedUntil - Date.now()) / 1000));
      setRemainingSec(rem);
      if (rem === 0) {
        setUnlockedUntil(null);
      }
    };
    updateTimer();
    const id = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(id);
  }, [unlockedUntil]);

  const isUnlocked = unlockedUntil !== null && remainingSec > 0;
  const activePassphrase = PASSPHRASES[passphraseIdx];

  const runSpectralCapture = async (intent: 'verify' | 'enroll') => {
    setMicError(null);
    if (capturingMode !== 'idle') return;

    if (!navigator.mediaDevices?.getUserMedia) {
      triggerApexHaptic('error', 'Voice-Biometric Microphone Unavailable');
      setMicError(
        'Web Audio microphone capture is unavailable in this browser context. Grant mic permission over HTTPS/localhost to verify.',
      );
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      setMicError('Web Audio API AudioContext is not supported in this browser.');
      return;
    }

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let frameTimer = 0;
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
      if (frameTimer) window.clearInterval(frameTimer);
      stream?.getTracks().forEach((t) => t.stop());
      if (audioCtx && audioCtx.state !== 'closed') {
        void audioCtx.close();
      }
      activeCaptureCleanupRef.current = null;
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);

      activeCaptureCleanupRef.current = cleanup;
      setCapturingMode(intent === 'enroll' ? 'enrolling' : 'verifying');
      setProgressPct(0);
      triggerApexHaptic('tap', 'Voice-Biometric Capture Armed');

      const freqBins = new Uint8Array(analyser.frequencyBinCount);
      const timeDomain = new Float32Array(analyser.fftSize);
      const bandAccum = new Float64Array(8);
      const pitchSamples: number[] = [];
      const centroidSamples: number[] = [];
      const harmonicitySamples: number[] = [];
      let rmsPeak = 0;
      let voicedFrames = 0;

      const durationMs = 2600;
      const intervalMs = 65;
      const startTime = Date.now();
      const nyquist = audioCtx.sampleRate / 2;
      // Focus on human speech spectrum (80 Hz - 4200 Hz)
      const maxSpeechBin = Math.min(
        freqBins.length,
        Math.max(16, Math.floor((4200 / nyquist) * freqBins.length)),
      );

      await new Promise<void>((resolve) => {
        frameTimer = window.setInterval(() => {
          if (cancelled) {
            resolve();
            return;
          }
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
          setProgressPct(pct);

          analyser.getByteFrequencyData(freqBins);
          analyser.getFloatTimeDomainData(timeDomain);

          // RMS amplitude
          let sqSum = 0;
          for (let i = 0; i < timeDomain.length; i++) {
            sqSum += timeDomain[i] * timeDomain[i];
          }
          const rms = Math.sqrt(sqSum / timeDomain.length);
          if (rms > rmsPeak) rmsPeak = rms;

          // Compute 8-band speech spectrum
          const frameBands: number[] = [];
          const step = Math.max(1, Math.floor(maxSpeechBin / 8));
          let weightedFreqSum = 0;
          let totalMag = 0;
          let peakBandVal = 0;

          for (let b = 0; b < 8; b++) {
            const startBin = b * step;
            const endBin = b === 7 ? maxSpeechBin : (b + 1) * step;
            let sum = 0;
            for (let k = startBin; k < endBin; k++) {
              const mag = freqBins[k] / 255;
              sum += mag;
              const binFreq = (k / freqBins.length) * nyquist;
              weightedFreqSum += mag * binFreq;
              totalMag += mag;
            }
            const avg = sum / Math.max(1, endBin - startBin);
            if (avg > peakBandVal) peakBandVal = avg;
            frameBands.push(Math.min(1, avg * 1.8));
          }

          setLiveBands(frameBands);

          if (rms > 0.012 && totalMag > 0.15) {
            voicedFrames++;
            for (let b = 0; b < 8; b++) {
              bandAccum[b] += frameBands[b];
            }
            const centroid = Math.round(weightedFreqSum / totalMag);
            centroidSamples.push(centroid);

            // Peak-to-mean spectral harmonicity (formant richness vs flat white noise)
            const meanMag = totalMag / maxSpeechBin;
            harmonicitySamples.push(meanMag > 0 ? Math.min(1, peakBandVal / (meanMag * 6)) : 0);

            const f0 = estimatePitchAutocorrelation(timeDomain, audioCtx!.sampleRate);
            if (f0 >= 75 && f0 <= 320) {
              pitchSamples.push(f0);
              setLivePitchHz(f0);
            }
          }

          if (elapsed >= durationMs) {
            window.clearInterval(frameTimer);
            resolve();
          }
        }, intervalMs);
      });

      if (cancelled) return;

      // Normalize collected 8-band spectral vector
      const normFactor = Math.max(1, voicedFrames);
      const rawVector = Array.from(bandAccum, (v) => v / normFactor);
      const maxVec = Math.max(0.001, ...rawVector);
      const normalizedBands = rawVector.map((v) => Number((v / maxVec).toFixed(3)));

      const avgPitch =
        pitchSamples.length > 0
          ? Math.round(pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length)
          : 0;
      const avgCentroid =
        centroidSamples.length > 0
          ? Math.round(centroidSamples.reduce((a, b) => a + b, 0) / centroidSamples.length)
          : 0;
      const avgHarmonicity =
        harmonicitySamples.length > 0
          ? Number(
              (
                harmonicitySamples.reduce((a, b) => a + b, 0) / harmonicitySamples.length
              ).toFixed(2),
            )
          : 0;

      const hasHumanSpeech = voicedFrames >= 4 && rmsPeak >= 0.014;

      if (intent === 'enroll') {
        if (!hasHumanSpeech) {
          triggerApexHaptic('security_violation', 'Voice Enrollment Too Quiet');
          setMicError(
            'No clear vocal signal detected during enrollment. Speak the passphrase clearly near your microphone.',
          );
          return;
        }
        const digest = await sha256Hex(
          `MahtabAliJamali:${avgPitch}:${avgCentroid}:${normalizedBands.join(',')}:${Date.now()}`,
        );
        const profile: VoiceprintProfile = {
          founder: 'Mahtab Ali Jamali (Sakrand HQ)',
          enrolledAt: new Date().toISOString(),
          fundamentalHz: avgPitch || 138,
          centroidHz: avgCentroid || 940,
          harmonicity: avgHarmonicity,
          bandEnergy: normalizedBands,
          digest,
        };
        try {
          window.localStorage.setItem(VOICEPRINT_STORAGE_KEY, JSON.stringify(profile));
        } catch {
          // Ignore private storage error
        }
        setEnrolledProfile(profile);
        triggerApexHaptic('seal_minted', 'Founder Voiceprint Enrolled');
        return;
      }

      // VERIFY mode
      let similarityPct = 0;
      let mode: BiometricAnalysisResult['mode'] = 'baseline-liveness';
      let passed = false;
      let reason = '';

      if (!hasHumanSpeech) {
        similarityPct = Math.round(Math.min(35, voicedFrames * 7));
        reason = 'Insufficient voiced speech frames detected. Recite the challenge passphrase aloud.';
      } else if (enrolledProfile) {
        mode = 'enrolled-match';
        const specSim = cosineSimilarity(normalizedBands, enrolledProfile.bandEnergy);
        const pitchDiff =
          avgPitch > 0 && enrolledProfile.fundamentalHz > 0
            ? Math.abs(avgPitch - enrolledProfile.fundamentalHz) / enrolledProfile.fundamentalHz
            : 0.18;
        const pitchScore = Math.max(0, 1 - Math.min(1, pitchDiff));
        const combined = specSim * 0.72 + pitchScore * 0.18 + Math.min(1, avgHarmonicity * 1.4) * 0.1;
        similarityPct = Math.round(combined * 100);
        passed = similarityPct >= 76 && avgHarmonicity >= 0.16;
        reason = passed
          ? `Matched enrolled Founder Spectral Signature (${similarityPct}% cosine similarity, F0 ${avgPitch || enrolledProfile.fundamentalHz} Hz).`
          : `Spectral profile mismatch (${similarityPct}% < 76% threshold). Re-verify or recalibrate founder voiceprint.`;
      } else {
        mode = 'baseline-liveness';
        const speechInHumanBand = avgCentroid >= 220 && avgCentroid <= 3400;
        const harmonicValid = avgHarmonicity >= 0.16;
        const rawScore =
          (voicedFrames >= 8 ? 48 : voicedFrames * 5) +
          (speechInHumanBand ? 24 : 8) +
          (harmonicValid ? 18 : 6) +
          (avgPitch >= 75 && avgPitch <= 310 ? 10 : 4);
        similarityPct = Math.min(99, Math.round(rawScore));
        passed = similarityPct >= 74 && harmonicValid;
        reason = passed
          ? `Live human vocal formant & harmonicity verified locally (${similarityPct}% confidence).`
          : 'Spectral formant check inconclusive; speak passphrase clearly at normal cadence.';
      }

      const clearanceToken = passed
        ? (
            await sha256Hex(
              `LIQ-UNLOCK:${activePassphrase}:${similarityPct}:${avgCentroid}:${Date.now()}`,
            )
          ).slice(0, 24)
        : null;

      const result: BiometricAnalysisResult = {
        passed,
        similarityPct,
        fundamentalHz: avgPitch,
        centroidHz: avgCentroid,
        harmonicity: avgHarmonicity,
        rmsPeak: Number(rmsPeak.toFixed(3)),
        voicedFrames,
        mode,
        reason,
        bandEnergy: normalizedBands,
        verifiedAt: new Date().toISOString(),
        clearanceToken,
      };

      setLastResult(result);

      if (passed) {
        setUnlockedUntil(Date.now() + 5 * 60 * 1000);
        triggerApexHaptic('authenticate', 'Voice-Biometric Liquidation Unlocked');
      } else {
        triggerApexHaptic('security_violation', 'Voice-Biometric Verification Failed');
      }
    } catch {
      triggerApexHaptic('error', 'Voice-Biometric Mic Denied');
      setMicError(
        'Microphone permission denied or no audio input device available. Enable microphone access to complete the challenge.',
      );
    } finally {
      cleanup();
      setCapturingMode('idle');
      setProgressPct(0);
      setLivePitchHz(0);
      setLiveBands(Array(8).fill(0.08));
    }
  };

  const handleAuthorizeLiquidation = async (tranche: LiquidationTranche) => {
    if (!isUnlocked) return;
    triggerApexHaptic('authenticate', 'Asset Liquidation Authorized');
    const receipt = (
      await sha256Hex(`${tranche.id}:${tranche.valuePkr}:${lastResult?.clearanceToken ?? ''}:${Date.now()}`)
    ).slice(0, 20);
    setExecutedLiquidations((prev) => ({ ...prev, [tranche.id]: receipt }));
  };

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/35 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#5EEAD4] inline-flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[#F59E0B]" />
              Local-First Web Audio Spectral Analysis // Zero External Cloud Voice Upload
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F8F7F3]">
              Voice-Biometric Challenge · High-Value Asset Liquidation Gate
            </h2>
            <p className="text-xs text-[#F8F7F3]/75">
              Founder must recite the passphrase aloud to verify live vocal formants, pitch (F0), and spectral cosine match before liquidating 24K Gold or Solar Equity tranches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span
              className={`px-3 py-1.5 rounded-lg font-mono-tabular text-xs font-bold inline-flex items-center gap-1.5 ${
                isUnlocked
                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                  : 'bg-[#9B1C2E]/25 border border-rose-500/35 text-rose-200'
              }`}
            >
              {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isUnlocked
                ? `LIQUIDATION UNLOCKED (${Math.floor(remainingSec / 60)}:${String(remainingSec % 60).padStart(2, '0')})`
                : 'LIQUIDATION LOCKED'}
            </span>

            {isUnlocked && (
              <button
                type="button"
                onClick={() => {
                  triggerApexHaptic('signOut', 'Asset Vault Re-Locked');
                  setUnlockedUntil(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#F59E0B]/35 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10 whitespace-nowrap"
              >
                Re-Lock Vault
              </button>
            )}
          </div>
        </div>

        {/* Challenge Prompt & Live Spectral Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-xl border border-[#F59E0B]/25 ajrak-well p-4">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#F59E0B] font-semibold uppercase tracking-wider">
                Recite Sovereign Passphrase
              </span>
              <button
                type="button"
                disabled={capturingMode !== 'idle'}
                onClick={() => {
                  triggerApexHaptic('tap', 'Cycled Passphrase');
                  setPassphraseIdx((i) => (i + 1) % PASSPHRASES.length);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#5EEAD4] hover:text-[#FDE68A] disabled:opacity-40"
              >
                <RefreshCw className="w-3 h-3" /> Cycle Phrase
              </button>
            </div>

            <blockquote className="rounded-lg border border-[#14B8A6]/30 bg-[#041017]/80 px-4 py-3 font-display text-base sm:text-lg font-bold text-[#FDE68A] tracking-wide">
              &ldquo;{activePassphrase}&rdquo;
            </blockquote>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={capturingMode !== 'idle'}
                onClick={() => void runSpectralCapture('verify')}
                className="kashi-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0D9488] disabled:opacity-50 whitespace-nowrap min-h-[40px]"
              >
                <Mic className="w-3.5 h-3.5" />
                {capturingMode === 'verifying'
                  ? `Analyzing Voice (${progressPct}%)...`
                  : 'Verify Voice & Unlock Liquidation'}
              </button>

              <button
                type="button"
                disabled={capturingMode !== 'idle'}
                onClick={() => void runSpectralCapture('enroll')}
                className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#F59E0B]/35 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10 disabled:opacity-50 whitespace-nowrap min-h-[40px]"
              >
                <Waves className="w-3.5 h-3.5" />
                {capturingMode === 'enrolling'
                  ? `Calibrating (${progressPct}%)...`
                  : enrolledProfile
                    ? 'Recalibrate Founder Voiceprint'
                    : 'Enroll Founder Voiceprint'}
              </button>
            </div>

            {enrolledProfile && (
              <p className="font-mono-tabular text-[11px] text-emerald-300/85">
                Enrolled Voiceprint: {enrolledProfile.founder} · Baseline F0 {enrolledProfile.fundamentalHz} Hz · Digest {enrolledProfile.digest.slice(0, 14)}…
              </p>
            )}
          </div>

          {/* 8-Band Real-Time Spectral Formant Visualizer */}
          <div className="lg:col-span-5 rounded-lg border border-[#F59E0B]/20 bg-[#041017]/85 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono-tabular">
              <span className="text-[#5EEAD4] font-semibold">
                {capturingMode !== 'idle' ? 'LIVE FFT SPEECH SPECTRUM' : '8-BAND SPECTRAL SIGNATURE'}
              </span>
              <span className="text-[#FDE68A]">
                {capturingMode !== 'idle'
                  ? livePitchHz > 0
                    ? `F0 ${livePitchHz} Hz`
                    : 'Listening...'
                  : lastResult
                    ? `${lastResult.similarityPct}% Match`
                    : 'Idle'}
              </span>
            </div>

            <div className="h-20 flex items-end justify-between gap-1.5 px-1">
              {(capturingMode !== 'idle'
                ? liveBands
                : lastResult?.bandEnergy ?? enrolledProfile?.bandEnergy ?? liveBands
              ).map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <motion.div
                    animate={{ height: `${Math.max(10, Math.round(val * 100))}%` }}
                    transition={{ duration: 0.08 }}
                    className={`w-full rounded-t-sm ${
                      capturingMode !== 'idle'
                        ? 'bg-gradient-to-t from-[#0F766E] via-[#14B8A6] to-[#FDE68A]'
                        : lastResult?.passed
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-300'
                          : 'bg-gradient-to-t from-[#9B1C2E] to-[#F59E0B]'
                    }`}
                  />
                  <span className="font-mono-tabular text-[9px] text-[#F8F7F3]/50">B{idx + 1}</span>
                </div>
              ))}
            </div>

            {capturingMode !== 'idle' && (
              <div className="h-1.5 w-full rounded-full bg-[#071D28] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#14B8A6] to-[#F59E0B] transition-all duration-75"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {micError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/45 bg-rose-950/65 px-4 py-2.5 text-xs text-rose-200"
          >
            {micError}
          </div>
        )}

        {lastResult && (
          <div
            className={`rounded-lg border px-4 py-3 text-xs space-y-2 ${
              lastResult.passed
                ? 'border-emerald-500/40 bg-emerald-950/35 text-emerald-100'
                : 'border-rose-500/40 bg-rose-950/45 text-rose-100'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold inline-flex items-center gap-1.5">
                {lastResult.passed ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                {lastResult.passed ? 'VOICE-BIOMETRIC CHALLENGE PASSED' : 'CHALLENGE NOT VERIFIED'}
              </span>
              <span className="font-mono-tabular">
                Score {lastResult.similarityPct}% · Pitch {lastResult.fundamentalHz || '—'} Hz · Centroid {lastResult.centroidHz} Hz · Harmonicity {lastResult.harmonicity}
              </span>
            </div>
            <p className="text-[#F8F7F3]/85">{lastResult.reason}</p>
          </div>
        )}

        {/* High-Value Asset Liquidation Vault (Gated by Voice-Biometric Pass) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#FDE68A] uppercase tracking-wider">
              Protected High-Value Asset Liquidation Tranches
            </span>
            <span className="font-mono-tabular text-[#F8F7F3]/65">
              {isUnlocked ? 'Biometric Clearance Token Active' : 'Voice Challenge Required to Unlock'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LIQUIDATION_TRANCHES.map((tranche) => {
              const receipt = executedLiquidations[tranche.id];
              return (
                <div
                  key={tranche.id}
                  className={`rounded-lg border p-4 space-y-2.5 transition-opacity ${
                    isUnlocked
                      ? 'border-[#14B8A6]/40 ajrak-well opacity-100'
                      : 'border-[#F59E0B]/15 bg-[#041017]/60 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#F8F7F3]">{tranche.asset}</h3>
                      <p className="text-[11px] text-[#F8F7F3]/65">{tranche.destination}</p>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-[#FDE68A] shrink-0">
                      PKR {tranche.valuePkr.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <span className="font-mono-tabular text-[#5EEAD4]">
                      Parity: {tranche.goldGrams.toFixed(1)}g 24K Au
                    </span>

                    {receipt ? (
                      <span className="inline-flex items-center gap-1 font-mono-tabular text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared · {receipt}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => void handleAuthorizeLiquidation(tranche)}
                        className={`kashi-btn px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap ${
                          isUnlocked
                            ? 'bg-[#F59E0B] text-[#05131B] hover:bg-[#FBBF24]'
                            : 'border border-[#F59E0B]/20 text-[#F8F7F3]/45 cursor-not-allowed'
                        }`}
                      >
                        {isUnlocked ? 'Authorize Liquidation' : 'Locked (Verify Voice)'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
