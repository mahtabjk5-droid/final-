import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AjrakAudioWaveform } from './AjrakAudioWaveform';

export const AmbientAjrakAudio: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    return () => {
      oscsRef.current.forEach((o) => {
        try {
          o.stop();
        } catch {
          // Ignore already stopped
        }
      });
      if (ctxRef.current) {
        void ctxRef.current.close();
      }
    };
  }, []);

  const toggleAudio = async () => {
    if (playing) {
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctxRef.current.currentTime + 0.3);
      }
      setPlaying(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!ctxRef.current) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        master.connect(ctx.destination);

        // Warm Bhairavi / Indus Tanpura harmonic chord (D2, A2, D3, F#3)
        const freqs = [73.42, 110.0, 146.83, 185.0];
        const nodes: OscillatorNode[] = [];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const subGain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          subGain.gain.setValueAtTime(idx === 0 ? 0.045 : 0.018, ctx.currentTime);
          osc.connect(subGain);
          subGain.connect(master);
          osc.start();
          nodes.push(osc);
        });

        ctxRef.current = ctx;
        gainRef.current = master;
        oscsRef.current = nodes;
      }

      if (ctxRef.current.state === 'suspended') {
        await ctxRef.current.resume();
      }
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.exponentialRampToValueAtTime(0.45, ctxRef.current.currentTime + 0.6);
      }
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggleAudio()}
      className={`kashi-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
        playing
          ? 'border-[#F59E0B]/60 bg-[#F59E0B]/15 text-[#FDE68A]'
          : 'border-[#F59E0B]/25 bg-[#041219] text-[#F8F7F3]/80 hover:text-white'
      }`}
      title="Toggle Ambient Sindhi Ajrak Soundscape"
    >
      {playing ? <Volume2 className="w-3.5 h-3.5 text-[#F59E0B]" /> : <VolumeX className="w-3.5 h-3.5 text-[#5EEAD4]" />}
      <span className="hidden sm:inline">Ajrak Sound</span>
      <AjrakAudioWaveform active={playing} />
    </button>
  );
};
