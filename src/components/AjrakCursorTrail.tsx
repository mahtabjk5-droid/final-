import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';

type AjrakMotifKind = 'chamkli' | 'diamond' | 'kashi';

interface AjrakParticle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  kind: AjrakMotifKind;
  color: string;
  accent: string;
}

const MAX_PARTICLES = 18;
const MIN_EMIT_INTERVAL_MS = 40;
const MIN_EMIT_DISTANCE_PX = 18;

const MOTIF_KINDS: AjrakMotifKind[] = ['chamkli', 'diamond', 'kashi'];

const PALETTE_NORMAL = [
  { color: '#F59E0B', accent: '#FDE68A' },
  { color: '#14B8A6', accent: '#5EEAD4' },
  { color: '#9B1C2E', accent: '#FBBF24' },
  { color: '#FBBF24', accent: '#F8F7F3' },
];

const PALETTE_CRIMSON = [
  { color: '#F59E0B', accent: '#FDE68A' },
  { color: '#E11D48', accent: '#FDE68A' },
  { color: '#9B1C2E', accent: '#5EEAD4' },
  { color: '#FBBF24', accent: '#F8F7F3' },
];

const PALETTE_FROZEN = [
  { color: '#E11D48', accent: '#FECDD3' },
  { color: '#9B1C2E', accent: '#F59E0B' },
  { color: '#FB7185', accent: '#F8F7F3' },
];

const AjrakParticleSvg: React.FC<{
  kind: AjrakMotifKind;
  color: string;
  accent: string;
  size: number;
}> = React.memo(({ kind, color, accent, size }) => {
  if (kind === 'chamkli') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="11.5" fill={color} fillOpacity="0.18" />
        <circle cx="12" cy="12" r="7.2" fill={accent} fillOpacity="0.24" />
        <polygon
          points="12,2 14.3,9.7 22,12 14.3,14.3 12,22 9.7,14.3 2,12 9.7,9.7"
          fill={color}
          fillOpacity="0.95"
          stroke={accent}
          strokeWidth="0.95"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.2" fill={accent} />
      </svg>
    );
  }

  if (kind === 'diamond') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="11.2" fill={color} fillOpacity="0.18" />
        <circle cx="12" cy="12" r="6.8" fill={accent} fillOpacity="0.2" />
        <path
          d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z"
          fill={color}
          fillOpacity="0.34"
          stroke={color}
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M12 6.8 L17.2 12 L12 17.2 L6.8 12 Z"
          fill={accent}
          fillOpacity="0.92"
        />
        <circle cx="12" cy="12" r="1.7" fill="#05131B" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11.5" fill={color} fillOpacity="0.16" />
      <circle cx="12" cy="12" r="6.8" fill={accent} fillOpacity="0.2" />
      <circle cx="12" cy="12" r="7.5" stroke={color} strokeOpacity="0.78" strokeWidth="1" strokeDasharray="2 2" />
      <path
        d="M12 4.5 C13.8 8.5 15.5 10.2 19.5 12 C15.5 13.8 13.8 15.5 12 19.5 C10.2 15.5 8.5 13.8 4.5 12 C8.5 10.2 10.2 8.5 12 4.5 Z"
        fill={color}
        fillOpacity="0.88"
        stroke={accent}
        strokeWidth="0.85"
      />
      <circle cx="12" cy="12" r="1.9" fill={accent} />
    </svg>
  );
});

AjrakParticleSvg.displayName = 'AjrakParticleSvg';

export const AjrakCursorTrail: React.FC<{
  crimsonMode?: boolean;
  frozen?: boolean;
}> = ({ crimsonMode = false, frozen = false }) => {
  const prefersReduced = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [particles, setParticles] = useState<AjrakParticle[]>([]);

  const cursorX = useMotionValue(-120);
  const cursorY = useMotionValue(-120);
  const springX = useSpring(cursorX, { stiffness: 460, damping: 32, mass: 0.35 });
  const springY = useSpring(cursorY, { stiffness: 460, damping: 32, mass: 0.35 });

  const nextIdRef = useRef(1);
  const lastEmitTimeRef = useRef(0);
  const lastEmitPosRef = useRef({ x: -9999, y: -9999 });
  const cursorVisibleRef = useRef(false);
  const modeRef = useRef({ crimsonMode, frozen });
  modeRef.current = { crimsonMode, frozen };

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => {
      if (!prev.some((p) => p.id === id)) return prev;
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  useEffect(() => {
    if (prefersReduced || !finePointer) {
      cursorVisibleRef.current = false;
      setCursorVisible(false);
      setParticles([]);
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (document.hidden) return;

      const x = e.clientX;
      const y = e.clientY;
      cursorX.set(x);
      cursorY.set(y);
      if (!cursorVisibleRef.current) {
        cursorVisibleRef.current = true;
        setCursorVisible(true);
      }

      const now = performance.now();
      const dxMove = x - lastEmitPosRef.current.x;
      const dyMove = y - lastEmitPosRef.current.y;
      const dist = Math.hypot(dxMove, dyMove);

      if (now - lastEmitTimeRef.current < MIN_EMIT_INTERVAL_MS || dist < MIN_EMIT_DISTANCE_PX) {
        return;
      }

      lastEmitTimeRef.current = now;
      lastEmitPosRef.current = { x, y };

      const { crimsonMode: isCrimson, frozen: isFrozen } = modeRef.current;
      const palette = isFrozen ? PALETTE_FROZEN : isCrimson ? PALETTE_CRIMSON : PALETTE_NORMAL;
      const id = nextIdRef.current++;
      const swatch = palette[id % palette.length];
      const kind = MOTIF_KINDS[id % MOTIF_KINDS.length];

      // Subtle trailing drift opposite cursor momentum + upward warm desert shimmer
      const norm = Math.max(1, dist);
      const driftX = -(dxMove / norm) * (8 + (id % 9)) + ((id % 5) - 2) * 3.5;
      const driftY = -(dyMove / norm) * (7 + (id % 7)) - 10 - (id % 6);

      const nextParticle: AjrakParticle = {
        id,
        x,
        y,
        dx: driftX,
        dy: driftY,
        size: 13 + (id % 4) * 2.5,
        rotateStart: (id * 29) % 360,
        rotateEnd: ((id * 29) % 360) + (id % 2 === 0 ? 52 : -52),
        duration: 0.68 + (id % 3) * 0.09,
        kind,
        color: swatch.color,
        accent: swatch.accent,
      };

      setParticles((prev) => {
        const sliced = prev.length >= MAX_PARTICLES ? prev.slice(prev.length - MAX_PARTICLES + 1) : prev;
        return [...sliced, nextParticle];
      });
    };

    const handlePointerLeave = () => {
      if (cursorVisibleRef.current) {
        cursorVisibleRef.current = false;
        setCursorVisible(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [prefersReduced, finePointer, cursorX, cursorY]);

  if (prefersReduced || !finePointer) {
    return null;
  }

  const reticleStroke = frozen ? '#E11D48' : crimsonMode ? '#F59E0B' : '#F59E0B';
  const reticleGlow = frozen
    ? 'rgba(225, 29, 72, 0.28)'
    : crimsonMode
      ? 'rgba(225, 29, 72, 0.22)'
      : 'rgba(20, 184, 166, 0.22)';

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* Smooth spring-coupled Ajrak brass reticle following the cursor */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          willChange: 'transform, opacity',
        }}
        animate={{ opacity: cursorVisible ? 1 : 0, scale: cursorVisible ? 1 : 0.6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${reticleGlow} 0%, ${reticleGlow.replace('0.28', '0.09').replace('0.22', '0.08')} 46%, transparent 74%)`,
          }}
        />
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="relative">
          <circle
            cx="13"
            cy="13"
            r="10.5"
            stroke={reticleStroke}
            strokeOpacity="0.42"
            strokeWidth="0.9"
            strokeDasharray="2.5 2.5"
          />
          <path
            d="M13 5.5 L15 11 L20.5 13 L15 15 L13 20.5 L11 15 L5.5 13 L11 11 Z"
            stroke={reticleStroke}
            strokeOpacity="0.6"
            strokeWidth="0.85"
            fill={reticleStroke}
            fillOpacity="0.08"
          />
          <circle cx="13" cy="13" r="1.4" fill="#FDE68A" fillOpacity="0.85" />
        </svg>
      </motion.div>

      {/* Emitted glowing Ajrak-patterned SVG particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x - p.size / 2,
              y: p.y - p.size / 2,
              scale: 0.55,
              rotate: p.rotateStart,
              opacity: 0.95,
            }}
            animate={{
              x: p.x - p.size / 2 + p.dx,
              y: p.y - p.size / 2 + p.dy,
              scale: [0.55, 1.15, 0.35],
              rotate: p.rotateEnd,
              opacity: [0.95, 0.82, 0],
            }}
            exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.1 } }}
            transition={{
              duration: p.duration,
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => removeParticle(p.id)}
            style={{
              width: p.size,
              height: p.size,
              willChange: 'transform, opacity',
            }}
            className="fixed top-0 left-0 flex items-center justify-center"
          >
            <AjrakParticleSvg
              kind={p.kind}
              color={p.color}
              accent={p.accent}
              size={p.size}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
