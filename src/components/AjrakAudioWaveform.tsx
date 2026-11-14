import React, { useEffect, useId, useRef, useState } from 'react';
import { AudioLines, Radio } from 'lucide-react';

interface AjrakAudioWaveformProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

const BAND_COUNT = 24;
const SVG_W = 480;
const SVG_H = 120;
const CENTER_Y = SVG_H / 2;

function getBandPaletteColor(idx: number): string {
  const mod = idx % 3;
  if (mod === 0) return '#F59E0B';
  if (mod === 1) return '#14B8A6';
  return '#E11D48';
}

export const AjrakAudioWaveform: React.FC<AjrakAudioWaveformProps> = ({
  stream,
  isRecording,
}) => {
  const uid = useId().replace(/:/g, '');
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState<{ peakHz: number; levelPct: number } | null>(null);

  const upperPathRef = useRef<SVGPathElement | null>(null);
  const lowerPathRef = useRef<SVGPathElement | null>(null);
  const ribbonFillRef = useRef<SVGPathElement | null>(null);
  const centerStarRef = useRef<SVGGElement | null>(null);
  const pillarRefs = useRef<(SVGLineElement | null)[]>([]);
  const topDiamondRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const botDiamondRefs = useRef<(SVGPolygonElement | null)[]>([]);

  const activeStream = stream ?? previewStream;
  const isActive = Boolean(activeStream);

  // Stop local preview stream automatically if parent starts recording or unmounts
  useEffect(() => {
    if (stream && previewStream) {
      previewStream.getTracks().forEach((t) => t.stop());
      setPreviewStream(null);
    }
  }, [stream, previewStream]);

  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [previewStream]);

  const togglePreviewMonitor = async () => {
    setMicError(null);
    if (previewStream) {
      previewStream.getTracks().forEach((t) => t.stop());
      setPreviewStream(null);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone API unavailable in this browser context.');
      return;
    }
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPreviewStream(mic);
    } catch {
      setMicError('Microphone permission denied for live spectrum preview.');
    }
  };

  useEffect(() => {
    const resetRestingPattern = () => {
      const stepX = (SVG_W - 48) / (BAND_COUNT - 1);
      const upperPts: string[] = [];
      const lowerPts: string[] = [];

      for (let i = 0; i < BAND_COUNT; i++) {
        const x = 24 + i * stepX;
        const restingAmp = 6 + Math.sin((i / (BAND_COUNT - 1)) * Math.PI) * 7;
        const yTop = CENTER_Y - restingAmp;
        const yBot = CENTER_Y + restingAmp;

        pillarRefs.current[i]?.setAttribute('y1', yTop.toFixed(1));
        pillarRefs.current[i]?.setAttribute('y2', yBot.toFixed(1));
        pillarRefs.current[i]?.setAttribute('stroke-opacity', '0.4');

        topDiamondRefs.current[i]?.setAttribute(
          'points',
          `${x.toFixed(1)},${(yTop - 3).toFixed(1)} ${(x + 2.8).toFixed(1)},${yTop.toFixed(1)} ${x.toFixed(1)},${(yTop + 3).toFixed(1)} ${(x - 2.8).toFixed(1)},${yTop.toFixed(1)}`,
        );
        botDiamondRefs.current[i]?.setAttribute(
          'points',
          `${x.toFixed(1)},${(yBot - 3).toFixed(1)} ${(x + 2.8).toFixed(1)},${yBot.toFixed(1)} ${x.toFixed(1)},${(yBot + 3).toFixed(1)} ${(x - 2.8).toFixed(1)},${yBot.toFixed(1)}`,
        );

        upperPts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yTop.toFixed(1)}`);
        lowerPts.push(`${x.toFixed(1)} ${yBot.toFixed(1)}`);
      }

      const upperD = upperPts.join(' ');
      const lowerD = `M ${lowerPts.join(' L ')}`;
      upperPathRef.current?.setAttribute('d', upperD);
      lowerPathRef.current?.setAttribute('d', lowerD);
      ribbonFillRef.current?.setAttribute(
        'd',
        `${upperD} L ${lowerPts.slice().reverse().join(' L ')} Z`,
      );
      centerStarRef.current?.setAttribute('transform', `translate(240, ${CENTER_Y}) scale(1) rotate(0)`);
      setLiveStats(null);
    };

    if (!activeStream) {
      resetRestingPattern();
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      resetRestingPattern();
      return;
    }

    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.78;

    const source = audioCtx.createMediaStreamSource(activeStream);
    source.connect(analyser);

    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }

    const bins = new Uint8Array(analyser.frequencyBinCount);
    const smoothed = new Float32Array(BAND_COUNT);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastStatTick = 0;
    let starAngle = 0;

    const renderFrame = (now: number) => {
      analyser.getByteFrequencyData(bins);
      const stepX = (SVG_W - 48) / (BAND_COUNT - 1);
      const upperPts: string[] = [];
      const lowerPts: string[] = [];

      let maxVal = 0;
      let maxBinIdx = 0;
      let energySum = 0;

      // Focus on voice-rich spectrum range (lower ~75% of FFT bins)
      const usableBins = Math.max(BAND_COUNT, Math.floor(bins.length * 0.78));

      for (let i = 0; i < BAND_COUNT; i++) {
        const binStart = Math.floor((i / BAND_COUNT) * usableBins);
        const binEnd = Math.max(binStart + 1, Math.floor(((i + 1) / BAND_COUNT) * usableBins));
        let bandSum = 0;
        for (let b = binStart; b < binEnd; b++) {
          const val = bins[b] || 0;
          bandSum += val;
          if (val > maxVal) {
            maxVal = val;
            maxBinIdx = b;
          }
        }
        const rawAvg = bandSum / (binEnd - binStart);
        energySum += rawAvg;

        // Smooth attack / gentle release
        const prev = smoothed[i];
        smoothed[i] = rawAvg > prev ? prev * 0.45 + rawAvg * 0.55 : prev * 0.82 + rawAvg * 0.18;
        const norm = smoothed[i] / 255;

        // Symmetric Ajrak mandala envelope (tapered subtly at outer edges)
        const envelope = 0.7 + Math.sin((i / (BAND_COUNT - 1)) * Math.PI) * 0.3;
        const amp = 5 + norm * 45 * envelope;
        const x = 24 + i * stepX;
        const yTop = CENTER_Y - amp;
        const yBot = CENTER_Y + amp;
        const dSize = 2.6 + norm * 3.4;

        const pillar = pillarRefs.current[i];
        if (pillar) {
          pillar.setAttribute('y1', yTop.toFixed(1));
          pillar.setAttribute('y2', yBot.toFixed(1));
          pillar.setAttribute('stroke-opacity', (0.42 + norm * 0.58).toFixed(2));
        }

        topDiamondRefs.current[i]?.setAttribute(
          'points',
          `${x.toFixed(1)},${(yTop - dSize).toFixed(1)} ${(x + dSize * 0.85).toFixed(1)},${yTop.toFixed(1)} ${x.toFixed(1)},${(yTop + dSize).toFixed(1)} ${(x - dSize * 0.85).toFixed(1)},${yTop.toFixed(1)}`,
        );
        botDiamondRefs.current[i]?.setAttribute(
          'points',
          `${x.toFixed(1)},${(yBot - dSize).toFixed(1)} ${(x + dSize * 0.85).toFixed(1)},${yBot.toFixed(1)} ${x.toFixed(1)},${(yBot + dSize).toFixed(1)} ${(x - dSize * 0.85).toFixed(1)},${yBot.toFixed(1)}`,
        );

        upperPts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yTop.toFixed(1)}`);
        lowerPts.push(`${x.toFixed(1)} ${yBot.toFixed(1)}`);
      }

      const upperD = upperPts.join(' ');
      const lowerD = `M ${lowerPts.join(' L ')}`;
      upperPathRef.current?.setAttribute('d', upperD);
      lowerPathRef.current?.setAttribute('d', lowerD);
      ribbonFillRef.current?.setAttribute(
        'd',
        `${upperD} L ${lowerPts.slice().reverse().join(' L ')} Z`,
      );

      const avgNorm = energySum / (BAND_COUNT * 255);
      if (!prefersReduced) {
        starAngle = (starAngle + 0.4 + avgNorm * 2.2) % 360;
      }
      const starScale = 1 + avgNorm * 0.85;
      centerStarRef.current?.setAttribute(
        'transform',
        `translate(240, ${CENTER_Y}) scale(${starScale.toFixed(2)}) rotate(${starAngle.toFixed(1)})`,
      );

      if (now - lastStatTick > 140) {
        lastStatTick = now;
        const nyquist = audioCtx.sampleRate / 2;
        const peakHz = maxVal > 8 ? Math.round((maxBinIdx / bins.length) * nyquist) : 0;
        const levelPct = Math.min(100, Math.round(avgNorm * 140));
        setLiveStats({ peakHz, levelPct });
      }

      if (!prefersReduced) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      try {
        source.disconnect();
        analyser.disconnect();
        if (audioCtx.state !== 'closed') {
          void audioCtx.close();
        }
      } catch {
        // Safe audio teardown
      }
      resetRestingPattern();
    };
  }, [activeStream]);

  const stepX = (SVG_W - 48) / (BAND_COUNT - 1);

  return (
    <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            {isActive && (
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRecording ? 'bg-rose-400' : 'bg-[#14B8A6]'
                }`}
              />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRecording ? 'bg-rose-500' : isActive ? 'bg-[#14B8A6]' : 'bg-[#F59E0B]/70'
              }`}
            />
          </span>
          <AudioLines className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="font-semibold text-[#F8F7F3]">
            Ajrak Audio Frequency Pattern
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono-tabular text-[11px] text-[#5EEAD4]">
            {isActive && liveStats
              ? `${liveStats.levelPct}% Gain · ${liveStats.peakHz > 0 ? `${liveStats.peakHz} Hz` : 'Ambient'}`
              : 'Standby Lattice'}
          </span>

          {!isRecording && (
            <button
              type="button"
              onClick={() => void togglePreviewMonitor()}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                previewStream
                  ? 'border-rose-400/50 bg-[#9B1C2E]/80 text-white'
                  : 'border-[#F59E0B]/35 bg-[#05131B]/80 text-[#FDE68A] hover:border-[#F59E0B]'
              }`}
            >
              <Radio className="w-3 h-3" />
              {previewStream ? 'Stop Mic Preview' : 'Live Mic Preview'}
            </button>
          )}
        </div>
      </div>

      {micError && (
        <p className="text-[11px] text-rose-300">{micError}</p>
      )}

      <div className="rounded-lg border border-[#F59E0B]/15 bg-[#030D13] overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-28 block"
          role="img"
          aria-label="Live Ajrak Audio Frequency Pattern Visualizer"
        >
          <defs>
            <pattern id={`ajrak-grid-${uid}`} width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M16 2 L30 16 L16 30 L2 16 Z"
                fill="none"
                stroke="#F59E0B"
                strokeOpacity="0.09"
                strokeWidth="0.9"
              />
              <circle cx="16" cy="16" r="1.4" fill="#14B8A6" fillOpacity="0.16" />
            </pattern>
            <linearGradient id={`ajrak-ribbon-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9B1C2E" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.32" />
            </linearGradient>
            <linearGradient id={`ajrak-stroke-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#5EEAD4" />
            </linearGradient>
          </defs>

          {/* Ajrak Hand-Block Lattice Backdrop */}
          <rect width={SVG_W} height={SVG_H} fill={`url(#ajrak-grid-${uid})`} />
          <line
            x1="16"
            y1={CENTER_Y}
            x2={SVG_W - 16}
            y2={CENTER_Y}
            stroke="#F59E0B"
            strokeOpacity="0.22"
            strokeDasharray="3 4"
          />

          {/* Mirrored Frequency Silk Fill */}
          <path ref={ribbonFillRef} d="" fill={`url(#ajrak-ribbon-${uid})`} />

          {/* 24 Ajrak Frequency Pillars & Diamond Tips */}
          {Array.from({ length: BAND_COUNT }, (_, i) => {
            const x = 24 + i * stepX;
            const color = getBandPaletteColor(i);
            return (
              <g key={i}>
                <line
                  ref={(el) => {
                    pillarRefs.current[i] = el;
                  }}
                  x1={x}
                  y1={CENTER_Y - 8}
                  x2={x}
                  y2={CENTER_Y + 8}
                  stroke={color}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeOpacity="0.45"
                />
                <polygon
                  ref={(el) => {
                    topDiamondRefs.current[i] = el;
                  }}
                  points={`${x},${CENTER_Y - 11} ${x + 3},${CENTER_Y - 8} ${x},${CENTER_Y - 5} ${x - 3},${CENTER_Y - 8}`}
                  fill={color}
                  fillOpacity="0.9"
                  stroke="#FDE68A"
                  strokeOpacity="0.55"
                  strokeWidth="0.6"
                />
                <polygon
                  ref={(el) => {
                    botDiamondRefs.current[i] = el;
                  }}
                  points={`${x},${CENTER_Y + 5} ${x + 3},${CENTER_Y + 8} ${x},${CENTER_Y + 11} ${x - 3},${CENTER_Y + 8}`}
                  fill={color}
                  fillOpacity="0.9"
                  stroke="#FDE68A"
                  strokeOpacity="0.55"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}

          {/* Upper & Lower Glowing Harmonic Contours */}
          <path
            ref={upperPathRef}
            d=""
            fill="none"
            stroke={`url(#ajrak-stroke-${uid})`}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            ref={lowerPathRef}
            d=""
            fill="none"
            stroke={`url(#ajrak-stroke-${uid})`}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Central 8-Point Ajrak Chamkli Star */}
          <g ref={centerStarRef} transform={`translate(240, ${CENTER_Y})`}>
            <circle r="11" fill="#05131B" fillOpacity="0.86" stroke="#F59E0B" strokeWidth="1.2" />
            <polygon
              points="0,-9 2.2,-2.2 9,0 2.2,2.2 0,9 -2.2,2.2 -9,0 -2.2,-2.2"
              fill="#F59E0B"
              fillOpacity="0.9"
              stroke="#FDE68A"
              strokeWidth="0.6"
            />
            <circle r="2" fill="#14B8A6" />
          </g>
        </svg>
      </div>
    </div>
  );
};
