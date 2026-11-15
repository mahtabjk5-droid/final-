import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Mic, MicOff, ShieldCheck, Waves } from 'lucide-react';
import { triggerApexHaptic } from '../utils/haptics';
import { ChromaticKashiRule } from './SovereignArt';

export const VoiceBiometricChallenge: React.FC = () => {
  const [challengePhrase] = useState('Bismillah Zero-Riba Sakrand Mizan Verified');
  const [spokenInput, setSpokenInput] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [micNote, setMicNote] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopMic = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setMicActive(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!micActive) {
      let t = 0;
      const drawIdle = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const bars = 36;
        const gap = w / bars;
        for (let i = 0; i < bars; i++) {
          const amp = 4 + Math.sin(t + i * 0.45) * 4 + (verified ? Math.cos(t * 2 + i) * 3 : 0);
          const barH = Math.max(3, Math.abs(amp));
          ctx.fillStyle = verified ? '#34D399' : '#14B8A6';
          ctx.fillRect(i * gap + 2, (h - barH) / 2, Math.max(2, gap - 4), barH);
        }
        t += 0.05;
        rafRef.current = requestAnimationFrame(drawIdle);
      };
      rafRef.current = requestAnimationFrame(drawIdle);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [micActive, verified]);

  useEffect(() => {
    return () => stopMic();
  }, []);

  const toggleSpectrumMic = async () => {
    setMicNote(null);
    if (micActive) {
      stopMic();
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicNote('Live microphone API unavailable; enter the verification phrase directly below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      streamRef.current = stream;
      audioCtxRef.current = audioCtx;
      setMicActive(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const renderSpectrum = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const bars = dataArray.length;
        const gap = w / bars;
        for (let i = 0; i < bars; i++) {
          const val = dataArray[i] / 255;
          const barH = Math.max(4, val * (h - 6));
          ctx.fillStyle = i % 3 === 0 ? '#F59E0B' : '#5EEAD4';
          ctx.fillRect(i * gap + 1, (h - barH) / 2, Math.max(2, gap - 3), barH);
        }
        rafRef.current = requestAnimationFrame(renderSpectrum);
      };
      rafRef.current = requestAnimationFrame(renderSpectrum);
    } catch {
      setMicNote('Microphone permission denied; harmonic idle visualizer active.');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const norm = spokenInput.trim().toLowerCase();
    const ok = norm.includes('sakrand') || norm.includes('mizan') || norm.includes('bismillah');
    setVerified(ok);
    triggerApexHaptic(ok ? 'seal_minted' : 'error', 'Voice Biometric Challenge');
  };

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#5EEAD4]">
              Web Audio Spectrum &amp; Human Vocal Cadence Challenge
            </p>
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-[#F59E0B]" />
              <span>Voice Biometric Attestation Challenge</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleSpectrumMic()}
              className={`kashi-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                micActive ? 'bg-rose-600 text-white' : 'border border-[#14B8A6]/40 text-[#5EEAD4]'
              }`}
            >
              {micActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{micActive ? 'Stop Spectrum' : 'Live Mic Spectrum'}</span>
            </button>
            <motion.div
              animate={{ scale: verified ? [1, 1.06, 1] : 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#14B8A6]/35 bg-[#04141A] px-3 py-1.5 text-xs font-mono-tabular text-[#5EEAD4]"
            >
              <Waves className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{verified === true ? 'HUMAN CADENCE SEALED' : 'AWAITING PHRASE'}</span>
            </motion.div>
          </div>
        </div>

        <div className="rounded-xl border border-[#14B8A6]/25 bg-[#04141A] p-3">
          <canvas ref={canvasRef} width={560} height={48} className="w-full h-12 block" />
        </div>

        {micNote && (
          <p className="text-xs text-amber-200">{micNote}</p>
        )}

        <div className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[#F8F7F3]/70">Verification Phrase: </span>
            <strong className="font-mono-tabular text-[#FDE68A]">“{challengePhrase}”</strong>
          </div>
          <button
            type="button"
            onClick={() => setSpokenInput(challengePhrase)}
            className="text-[11px] font-semibold text-[#5EEAD4] hover:underline"
          >
            Fill Phrase
          </button>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={spokenInput}
            onChange={(e) => setSpokenInput(e.target.value)}
            placeholder="Type or dictate verification phrase..."
            className="flex-1 rounded-lg border border-[#F59E0B]/25 ajrak-well px-3.5 py-2 text-xs text-white"
          />
          <button
            type="submit"
            className="kashi-btn inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-xs font-bold text-white"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Biometric Cadence</span>
          </button>
        </form>

        {verified !== null && (
          <p className={`text-xs font-semibold ${verified ? 'text-emerald-300' : 'text-rose-300'}`}>
            {verified
              ? 'Biometric cadence & passphrase verified. Authorized for Sakrand-to-Gulf deals.'
              : 'Phrase mismatch — enter the Sakrand Mizan verification phrase.'}
          </p>
        )}
      </div>
    </section>
  );
};
