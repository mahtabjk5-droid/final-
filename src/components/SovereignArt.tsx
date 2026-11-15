import React, { useId, useState } from 'react';
import type { MukasaEdge } from '../types/sovereign';

export const ChromaticKashiRule: React.FC = () => (
  <div className="ajrak-mosaic-band" aria-hidden="true" />
);

export const AjrakBlockBorder: React.FC = () => (
  <div
    aria-hidden="true"
    className="h-2 w-full bg-gradient-to-r from-[#9B1C2E] via-[#F59E0B] to-[#0F766E]"
  />
);

export const AjrakClothPattern: React.FC<{
  accentHex?: string;
  secondaryHex?: string;
  opacityClass?: string;
  blendClass?: string;
}> = ({
  accentHex = '#F59E0B',
  secondaryHex = '#14B8A6',
  opacityClass = 'opacity-[0.085]',
  blendClass = 'mix-blend-screen',
}) => {
  const uid = useId().replace(/:/g, '');
  const patId = `ajrak-cloth-${uid}`;
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${blendClass} ${opacityClass} [mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_98%)]`}
    >
      <defs>
        <pattern id={patId} width="64" height="64" patternUnits="userSpaceOnUse">
          <path
            d="M32 3 L61 32 L32 61 L3 32 Z"
            fill="none"
            stroke={accentHex}
            strokeWidth="0.9"
            strokeOpacity="0.8"
          />
          <path
            d="M32 13 L37.5 26.5 L51 32 L37.5 37.5 L32 51 L26.5 37.5 L13 32 L26.5 26.5 Z"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="0.75"
            strokeOpacity="0.7"
          />
          <circle cx="32" cy="32" r="2.6" fill={accentHex} fillOpacity="0.7" />
          <circle cx="0" cy="0" r="2" fill={secondaryHex} fillOpacity="0.65" />
          <circle cx="64" cy="0" r="2" fill={secondaryHex} fillOpacity="0.65" />
          <circle cx="0" cy="64" r="2" fill={secondaryHex} fillOpacity="0.65" />
          <circle cx="64" cy="64" r="2" fill={secondaryHex} fillOpacity="0.65" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patId})`} />
    </svg>
  );
};

export const AjrakLoomDivider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center gap-3 py-1 select-none" aria-hidden={!label}>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9B1C2E]/70 to-[#F59E0B]/60" />
    <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#FDE68A]/80">
      <svg viewBox="0 0 28 28" className="w-5 h-5 shrink-0" aria-hidden="true">
        <polygon points="14,2 26,14 14,26 2,14" fill="#9B1C2E" fillOpacity="0.45" stroke="#F59E0B" strokeWidth="1.4" />
        <polygon points="14,7 21,14 14,21 7,14" fill="none" stroke="#5EEAD4" strokeWidth="1.2" />
        <circle cx="14" cy="14" r="2" fill="#FDE68A" />
      </svg>
      {label && <span className="font-mono-tabular uppercase tracking-widest text-[10px]">{label}</span>}
    </div>
    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#0F766E]/75 to-[#F59E0B]/60" />
  </div>
);

export const HalaKashiCornerOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 40 40"
    className={`w-7 h-7 pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <path d="M2 38 L2 2 L38 2" fill="none" stroke="#F59E0B" strokeWidth="2.2" />
    <path d="M8 28 L8 8 L28 8" fill="none" stroke="#14B8A6" strokeWidth="1.5" />
    <polygon points="14,14 22,14 14,22" fill="#9B1C2E" />
  </svg>
);

export const BolMizanLogo: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  return (
    <div
      className={`${dim} rounded-xl border border-[#F59E0B]/50 bg-gradient-to-br from-[#0D2327] via-[#133840] to-[#3B0B18] flex items-center justify-center shrink-0 shadow-md`}
    >
      <svg viewBox="0 0 64 64" className="w-4/5 h-4/5" aria-hidden="true">
        <polygon points="32,6 58,32 32,58 6,32" fill="none" stroke="#14B8A6" strokeWidth="2.5" />
        <line x1="32" y1="14" x2="32" y2="48" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <line x1="16" y1="24" x2="48" y2="24" stroke="#FDE68A" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="17" cy="34" r="5" fill="#9B1C2E" stroke="#F59E0B" strokeWidth="1.5" />
        <circle cx="47" cy="34" r="5" fill="#0F766E" stroke="#F59E0B" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export const LivingMizanScale: React.FC<{ tiltDeg?: number; frozen?: boolean }> = ({
  tiltDeg = 0,
  frozen = false,
}) => {
  const clamped = Math.max(-14, Math.min(14, tiltDeg));
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#071417]/90 px-3 py-1.5">
      <svg viewBox="0 0 52 36" className="w-10 h-7" aria-hidden="true">
        <line x1="26" y1="6" x2="26" y2="31" stroke="#F59E0B" strokeWidth="2.2" />
        <line x1="18" y1="31" x2="34" y2="31" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
        <g transform={`rotate(${clamped} 26 11)`}>
          <line x1="8" y1="11" x2="44" y2="11" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="10" cy="20" r="4.5" fill={frozen ? '#9B1C2E' : '#14B8A6'} stroke="#F59E0B" strokeWidth="1.2" />
          <circle cx="42" cy="20" r="4.5" fill={frozen ? '#9B1C2E' : '#F59E0B'} stroke="#FDE68A" strokeWidth="1.2" />
        </g>
      </svg>
      <div className="text-[11px] leading-tight">
        <div className="font-semibold text-[#FDE68A]">Mizan Scale</div>
        <div className="font-mono-tabular text-[10px] text-[#5EEAD4]">
          {frozen ? 'LOCKED' : '0% RIBA'}
        </div>
      </div>
    </div>
  );
};

export const ResilientImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0D2327] via-[#133840] to-[#2B0C14] flex items-center justify-center text-xs text-[#FDE68A]/70 ${className}`}
      >
        {alt}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const MukasaLoopDiagram: React.FC<{ edges: MukasaEdge[] }> = ({ edges }) => {
  const uniqueNodes = Array.from(
    new Set(edges.flatMap((e) => [e.from, e.to])),
  ).slice(0, 6);

  const cx = 140;
  const cy = 115;
  const r = 78;
  const coords = new Map<string, { x: number; y: number }>();
  uniqueNodes.forEach((node, idx) => {
    const angle = (idx / Math.max(1, uniqueNodes.length)) * Math.PI * 2 - Math.PI / 2;
    coords.set(node, {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  });

  return (
    <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-3">
      <div className="flex items-center justify-between text-[11px] text-[#5EEAD4] mb-1">
        <span>Directed Debt Graph</span>
        <span className="font-mono-tabular">{edges.filter((e) => !e.cleared).length} Open Edges</span>
      </div>
      <svg viewBox="0 0 280 230" className="w-full h-52">
        <defs>
          <marker id="mukasa-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
          </marker>
          <marker id="mukasa-arrow-cleared" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
          </marker>
        </defs>
        {edges.map((edge, idx) => {
          const a = coords.get(edge.from);
          const b = coords.get(edge.to);
          if (!a || !b) return null;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const ux = dx / dist;
          const uy = dy / dist;
          const sx = a.x + ux * 16;
          const sy = a.y + uy * 16;
          const ex = b.x - ux * 18;
          const ey = b.y - uy * 18;
          return (
            <line
              key={edge.id || idx}
              x1={sx}
              y1={sy}
              x2={ex}
              y2={ey}
              stroke={edge.cleared ? '#10B981' : '#F59E0B'}
              strokeWidth={edge.cleared ? 1.6 : 2}
              strokeDasharray={edge.cleared ? '4 3' : undefined}
              markerEnd={edge.cleared ? 'url(#mukasa-arrow-cleared)' : 'url(#mukasa-arrow)'}
              opacity={edge.cleared ? 0.5 : 0.9}
            />
          );
        })}
        {uniqueNodes.map((node) => {
          const p = coords.get(node)!;
          return (
            <g key={node}>
              <circle cx={p.x} cy={p.y} r="13" fill="#0D2327" stroke="#14B8A6" strokeWidth="2" />
              <text
                x={p.x}
                y={p.y + 24}
                textAnchor="middle"
                fill="#F8F7F3"
                fontSize="8.5"
                fontWeight="600"
              >
                {node.length > 18 ? `${node.slice(0, 16)}…` : node}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
