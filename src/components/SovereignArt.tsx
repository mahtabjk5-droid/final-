import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { MukasaEdge } from '../types/sovereign';

export const ResilientImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}> = ({ src, alt, className = '', fallbackTitle }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0D2327] via-[#14353B] to-[#9B1C2E]/70 text-[#F8F7F3] p-6 text-center ${className}`}
      >
        <svg viewBox="0 0 64 64" className="w-10 h-10 mb-2 text-[#F59E0B]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="32,4 40,22 60,22 44,34 50,54 32,42 14,54 20,34 4,22 24,22" />
        </svg>
        <span className="font-display text-sm font-semibold">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const HalaKashiCornerOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`w-7 h-7 pointer-events-none select-none text-[#F59E0B]/70 ${className}`}
    fill="none"
    aria-hidden="true"
  >
    <path d="M2 24 V6 Q2 2 6 2 H24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 16 V8 Q6 6 8 6 H16" stroke="#14B8A6" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="9" cy="9" r="2" fill="currentColor" />
  </svg>
);

export const BolMizanLogo: React.FC<{
  size?: 'sm' | 'md' | 'xl';
  animated?: boolean;
  className?: string;
}> = ({ size = 'md', animated = false, className = '' }) => {
  const dim =
    size === 'sm' ? 'w-8 h-8' : size === 'xl' ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-14 h-14';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dim} ${className}`}>
      {/* Outer 12-Point Sindhi Ajrak Chamkli Star */}
      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        animate={animated ? { rotate: 360 } : undefined}
        transition={animated ? { repeat: Infinity, duration: 48, ease: 'linear' } : undefined}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ajrak-gold-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <g transform="translate(60,60)">
          <circle r="56" fill="#0D2327" stroke="url(#ajrak-gold-rim)" strokeWidth="2.4" />
          <circle r="48" fill="none" stroke="#14B8A6" strokeOpacity="0.65" strokeWidth="1.2" strokeDasharray="3 3" />
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <polygon
                points="0,-50 8,-13 50,0 8,13 0,50 -8,13 -50,0 -8,-13"
                fill="#9B1C2E"
                fillOpacity="0.45"
                stroke="#F8F7F3"
                strokeOpacity="0.55"
                strokeWidth="0.9"
              />
            </g>
          ))}
          <circle r="27" fill="#08181B" stroke="#F59E0B" strokeWidth="1.8" />
        </g>
      </motion.svg>

      {/* Crisp Fixed Center Mizan Balance Emblem */}
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-0 m-auto w-[46%] h-[46%]"
        aria-label="BolMizan Sindhi Ajrak Crest"
      >
        <line x1="32" y1="12" x2="32" y2="50" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <path d="M21 52 H43 L39 47 H25 Z" fill="#F59E0B" />
        <line x1="13" y1="21" x2="51" y2="21" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13 21 L8 35 H18 Z" fill="#14B8A6" fillOpacity="0.88" />
        <path d="M51 21 L46 35 H56 Z" fill="#F59E0B" fillOpacity="0.92" />
        <circle cx="32" cy="14" r="3.2" fill="#F59E0B" />
      </svg>
    </div>
  );
};

export const AjrakBlockBorder: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
    <svg viewBox="0 0 960 28" className="w-full h-5 block" preserveAspectRatio="none">
      <defs>
        <pattern id="ajrak-handblock" width="56" height="28" patternUnits="userSpaceOnUse">
          <rect width="56" height="28" fill="#0D2327" />
          <path d="M0 14 L14 2 L28 14 L14 26 Z" fill="#9B1C2E" stroke="#F8F7F3" strokeWidth="1.1" />
          <path d="M28 14 L42 2 L56 14 L42 26 Z" fill="#0F766E" stroke="#F8F7F3" strokeWidth="1.1" />
          <polygon points="14,7 17,12 21,14 17,16 14,21 11,16 7,14 11,12" fill="#F59E0B" />
          <circle cx="42" cy="14" r="3.2" fill="#F59E0B" />
          <circle cx="28" cy="2" r="1.8" fill="#F8F7F3" />
          <circle cx="28" cy="26" r="1.8" fill="#F8F7F3" />
          <circle cx="0" cy="14" r="1.8" fill="#F59E0B" />
        </pattern>
      </defs>
      <rect width="960" height="28" fill="url(#ajrak-handblock)" />
    </svg>
  </div>
);

export const HalaKashiFrieze: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
    <svg viewBox="0 0 960 22" className="w-full h-4 text-[#0D2327]/20 dark:text-[#F59E0B]/35" preserveAspectRatio="none">
      <defs>
        <pattern id="kashi-lattice" width="40" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 11 L10 1 L20 11 L10 21 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M20 11 L30 1 L40 11 L30 21 Z" fill="none" stroke="#9B1C2E" strokeOpacity="0.55" strokeWidth="1" />
          <circle cx="10" cy="11" r="1.8" fill="#F59E0B" />
          <circle cx="30" cy="11" r="1.6" fill="#0F766E" />
        </pattern>
      </defs>
      <rect width="960" height="22" fill="url(#kashi-lattice)" />
    </svg>
  </div>
);

export const LivingMizanScale: React.FC<{
  tiltDegrees: number;
  frozen: boolean;
}> = ({ tiltDegrees, frozen }) => {
  const clampedTilt = Math.max(-18, Math.min(18, tiltDegrees));
  return (
    <svg
      viewBox="0 0 180 120"
      className="w-40 h-28 shrink-0"
      role="img"
      aria-label="Mizan Equilibrium Scale"
    >
      <defs>
        <radialGradient id="mizan-aura" cx="50%" cy="22%" r="48%">
          <stop offset="0%" stopColor={frozen ? '#9B1C2E' : '#F59E0B'} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="90" cy="26" r="24" fill="url(#mizan-aura)" />
      {/* Pillar */}
      <line x1="90" y1="20" x2="90" y2="104" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 106 L120 106 L111 97 L69 97 Z" fill="#F59E0B" />
      <circle cx="90" cy="20" r="5.2" fill={frozen ? '#9B1C2E' : '#FBBF24'} stroke="#0D2327" strokeWidth="1" />

      {/* Rotating Beam */}
      <g
        style={{
          transform: `rotate(${clampedTilt}deg)`,
          transformOrigin: '90px 26px',
          transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <line x1="28" y1="26" x2="152" y2="26" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" />
        {/* Left Pan (Trust & Barakah) */}
        <line x1="28" y1="26" x2="16" y2="62" stroke="#FDE68A" strokeOpacity="0.7" strokeWidth="1.2" />
        <line x1="28" y1="26" x2="40" y2="62" stroke="#FDE68A" strokeOpacity="0.7" strokeWidth="1.2" />
        <path d="M12 62 Q28 76 44 62 Z" fill="#10B981" fillOpacity="0.9" />
        {/* Right Pan (Risk & Anomaly) */}
        <line x1="152" y1="26" x2="140" y2="62" stroke="#FDE68A" strokeOpacity="0.7" strokeWidth="1.2" />
        <line x1="152" y1="26" x2="164" y2="62" stroke="#FDE68A" strokeOpacity="0.7" strokeWidth="1.2" />
        <path d="M136 62 Q152 76 168 62 Z" fill={frozen ? '#9B1C2E' : '#F59E0B'} fillOpacity="0.9" />
      </g>
    </svg>
  );
};

export const CadenceOscilloscope: React.FC<{
  intervals: number[];
  posterior: number | null;
}> = ({ intervals, posterior }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riskPct = posterior !== null ? Math.round(posterior * 100) : 8;
  const arcColor = riskPct >= 55 ? '#9B1C2E' : riskPct >= 28 ? '#D97706' : '#059669';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let phase = 0;

    const draw = () => {
      const w = 240;
      const h = 58;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Baseline grid
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const samples = intervals.length >= 2 ? intervals.slice(-24) : [110, 145, 98, 175, 130, 152, 118, 162];
      const maxVal = Math.max(250, ...samples);

      // Secondary brass harmonic wave
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const sampleIdx = Math.floor((x / w) * (samples.length - 1));
        const amp = (samples[sampleIdx] / maxVal) * 14;
        const y = h / 2 - Math.cos(x * 0.065 + phase * 0.7) * (3 + amp * 0.45);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Primary cognitive cadence wave
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const sampleIdx = Math.floor((x / w) * (samples.length - 1));
        const amp = (samples[sampleIdx] / maxVal) * 18;
        const y = h / 2 - Math.sin(x * 0.085 - phase) * (5 + amp * 0.65);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 2.1;
      ctx.stroke();

      // Moving phosphor cursor dot with golden glow
      const cursorX = ((phase * 18) % w + w) % w;
      const cursorIdx = Math.floor((cursorX / w) * (samples.length - 1));
      const cursorAmp = (samples[cursorIdx] / maxVal) * 18;
      const cursorY = h / 2 - Math.sin(cursorX * 0.085 - phase) * (5 + cursorAmp * 0.65);

      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();

      ctx.restore();

      if (!prefersReduced) {
        phase += 0.07;
        rafId = window.requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [intervals, arcColor]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center rounded-lg border border-[#F59E0B]/25 ajrak-well p-3">
      <div className="sm:col-span-2">
        <div className="flex items-center justify-between text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65 mb-1">
          <span>Live Cognitive Cadence Sweep</span>
          <span className="font-mono-tabular">{intervals.length} samples</span>
        </div>
        <canvas ref={canvasRef} className="w-full h-14 block" />
      </div>

      <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-[#0D2327]/10 dark:border-[#F8F7F3]/10 pt-2 sm:pt-0 sm:pl-3">
        <svg viewBox="0 0 80 46" className="w-20 h-11">
          <path d="M 10 40 A 30 30 0 0 1 70 40" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M 10 40 A 30 30 0 0 1 70 40"
            fill="none"
            stroke={arcColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(riskPct / 100) * 94.2} 94.2`}
            style={{ transition: 'stroke-dasharray 300ms ease' }}
          />
          <text x="40" y="38" textAnchor="middle" className="fill-current text-[11px] font-bold font-mono">
            {riskPct}%
          </text>
        </svg>
        <span className="text-[11px] text-[#0D2327]/65 dark:text-[#F8F7F3]/65">Bayesian Scam Risk</span>
      </div>
    </div>
  );
};

export const OrbitalCompoundingRing: React.FC<{ powerLabel: string }> = ({ powerLabel }) => (
  <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
    <motion.svg
      viewBox="0 0 120 120"
      className="w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="54" fill="none" stroke="#F59E0B" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="4 4" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="#9B1C2E" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="7 4" />
      <circle cx="60" cy="6" r="4" fill="#F59E0B" />
      <circle cx="114" cy="60" r="3.2" fill="#9B1C2E" />
      <circle cx="60" cy="114" r="4" fill="#14B8A6" />
      <circle cx="6" cy="60" r="3.2" fill="#FBBF24" />
    </motion.svg>
    <motion.svg
      viewBox="0 0 120 120"
      className="absolute inset-0 w-full h-full"
      animate={{ rotate: -360 }}
      transition={{ repeat: Infinity, duration: 36, ease: 'linear' }}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="36" fill="none" stroke="#14B8A6" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="3 5" />
      <polygon points="60,26 66,54 94,60 66,66 60,94 54,66 26,60 54,54" fill="#F59E0B" fillOpacity="0.1" stroke="#F59E0B" strokeOpacity="0.45" strokeWidth="0.9" />
    </motion.svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
      <span className="font-mono-tabular text-xs font-bold text-[#9B1C2E] dark:text-[#F59E0B]">
        {powerLabel}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
        5 Pillars
      </span>
    </div>
  </div>
);

export const CompoundingTrajectoryChart: React.FC<{
  year1Pkr: number;
  year2Pkr: number;
  year3Pkr: number;
}> = ({ year1Pkr, year2Pkr, year3Pkr }) => {
  const maxVal = Math.max(year3Pkr, 1);
  const y0 = 110;
  const y1 = 110 - (year1Pkr / maxVal) * 86;
  const y2 = 110 - (year2Pkr / maxVal) * 86;
  const y3 = 110 - (year3Pkr / maxVal) * 86;

  const curveD = `M 24 ${y0} C 85 ${y0}, 100 ${y1.toFixed(1)}, 140 ${y1.toFixed(1)} C 185 ${y1.toFixed(1)}, 205 ${y2.toFixed(1)}, 256 ${y2.toFixed(1)} C 305 ${y2.toFixed(1)}, 325 ${y3.toFixed(1)}, 376 ${y3.toFixed(1)}`;
  const areaD = `${curveD} L 376 116 L 24 116 Z`;

  return (
    <div className="rounded-lg border border-[#F59E0B]/25 ajrak-well p-3">
      <div className="flex items-center justify-between text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65 mb-1">
        <span>Sakrand Seed to 50-Year Sovereignty Trajectory</span>
        <span className="font-mono-tabular">PKR Millions</span>
      </div>
      <svg viewBox="0 0 400 134" className="w-full h-32">
        <defs>
          <linearGradient id="comp-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B1C2E" stopOpacity="0.24" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="comp-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9B1C2E" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        {[40, 78, 116].map((gy) => (
          <line key={gy} x1="24" y1={gy} x2="376" y2={gy} stroke="currentColor" strokeOpacity="0.09" strokeDasharray="3 3" />
        ))}
        <path d={areaD} fill="url(#comp-grad)" />
        <path d={curveD} fill="none" stroke="url(#comp-stroke)" strokeWidth="2.8" strokeLinecap="round" />
        {[
          { x: 24, y: y0, label: 'Y0 Seed' },
          { x: 140, y: y1, label: 'Y1 Food' },
          { x: 256, y: y2, label: 'Y2 Solar' },
          { x: 376, y: y3, label: 'Y3 Waqf' },
        ].map((pt) => (
          <g key={pt.label}>
            <circle cx={pt.x} cy={pt.y} r="7.5" fill="#F59E0B" fillOpacity="0.22" />
            <circle cx={pt.x} cy={pt.y} r="4.2" fill="#F59E0B" stroke="#0D2327" strokeWidth="1.5" />
            <text x={pt.x} y="129" textAnchor="middle" className="fill-current text-[10px] opacity-75">
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const MukasaCycleDiagram: React.FC<{ edges: MukasaEdge[] }> = ({ edges }) => {
  const nodes = Array.from(new Set(edges.flatMap((e) => [e.from, e.to]))).slice(0, 5);
  const cx = 160;
  const cy = 82;
  const r = 56;
  const positions = new Map<string, { x: number; y: number }>();

  nodes.forEach((name, i) => {
    const angle = (i / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
    positions.set(name, {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  });

  return (
    <div className="rounded-lg border border-[#F59E0B]/25 ajrak-well p-3">
      <div className="flex items-center justify-between text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65 mb-1">
        <span>Trade Payable Graph Topology</span>
        <span className="font-mono-tabular">{nodes.length} counterparties</span>
      </div>
      <svg viewBox="0 0 320 164" className="w-full h-36">
        <defs>
          <marker id="arrow-mukasa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#F59E0B" />
          </marker>
          <marker id="arrow-cleared" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#059669" />
          </marker>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 4" />
        {edges.map((edge) => {
          const p1 = positions.get(edge.from);
          const p2 = positions.get(edge.to);
          if (!p1 || !p2) return null;
          return (
            <line
              key={edge.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className={edge.cleared ? undefined : 'mukasa-edge-flow'}
              stroke={edge.cleared ? '#059669' : '#F59E0B'}
              strokeOpacity={edge.cleared ? 0.35 : 0.9}
              strokeWidth={edge.cleared ? 1.5 : 2.2}
              strokeDasharray={edge.cleared ? '4 3' : undefined}
              markerEnd={edge.cleared ? 'url(#arrow-cleared)' : 'url(#arrow-mukasa)'}
            />
          );
        })}
        {nodes.map((node) => {
          const pos = positions.get(node)!;
          const short = node.split(' ').slice(0, 2).join(' ');
          return (
            <g key={node}>
              <circle cx={pos.x} cy={pos.y} r="13" fill="#F59E0B" fillOpacity="0.14" />
              <circle cx={pos.x} cy={pos.y} r="9.5" fill="#0D2327" stroke="#F59E0B" strokeWidth="2" />
              <text
                x={pos.x}
                y={pos.y + 21}
                textAnchor="middle"
                className="fill-current text-[9px] font-semibold"
              >
                {short}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const MukasaLoopDiagram = MukasaCycleDiagram;

export const ChromaticKashiRule: React.FC = () => (
  <div
    className="h-[3px] w-full bg-gradient-to-r from-[#9B1C2E] via-[#F59E0B] to-[#0F766E]"
    aria-hidden="true"
  />
);

export const GoldVaultEmblem: React.FC = () => (
  <svg viewBox="0 0 36 36" className="w-7 h-7 shrink-0 text-[#D97706] dark:text-[#F59E0B]" fill="none" aria-hidden="true">
    <polygon points="8,24 13,14 23,14 28,24" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.6" />
    <polygon points="13,14 16,9 20,9 23,14" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="18" cy="20" r="2" fill="currentColor" />
  </svg>
);

export const IndusLandEmblem: React.FC = () => (
  <svg viewBox="0 0 36 36" className="w-7 h-7 shrink-0 text-emerald-700 dark:text-emerald-400" fill="none" aria-hidden="true">
    <path d="M5 24 Q14 18 22 23 T32 20" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 22 V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M18 14 C13 13 12 9 18 8 C24 9 23 13 18 14 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export const WaqfWaterEmblem: React.FC = () => (
  <svg viewBox="0 0 36 36" className="w-7 h-7 shrink-0 text-[#9B1C2E] dark:text-rose-400" fill="none" aria-hidden="true">
    <path d="M18 7 C18 7 10 17 10 22 A8 8 0 0 0 26 22 C26 17 18 7 18 7 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15 22 A3 3 0 0 0 18 25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
