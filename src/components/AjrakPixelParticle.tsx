import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

interface AjrakPixelParticleProps {
  activeAct: number;
  paused?: boolean;
  frozen?: boolean;
  theaterMode?: boolean;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  shapeIndex: number;
  colorIndex: number;
  depth: number;
}

// Precompiled SVG Path2D geometry (normalized -1..1 space) — zero per-frame allocation
const AJRAK_SVG_PATHS: Path2D[] =
  typeof Path2D !== 'undefined'
    ? [
        // 0: Chamkli 8-pointed Sindhi Ajrak star
        new Path2D(
          'M0 -1 L0.24 -0.24 L1 0 L0.24 0.24 L0 1 L-0.24 0.24 L-1 0 L-0.24 -0.24 Z',
        ),
        // 1: Kashi pixel diamond
        new Path2D('M0 -1 L0.68 0 L0 1 L-0.68 0 Z'),
        // 2: Ajrak pixel cross-tile
        new Path2D(
          'M-0.28 -1 L0.28 -1 L0.28 -0.28 L1 -0.28 L1 0.28 L0.28 0.28 L0.28 1 L-0.28 1 L-0.28 0.28 L-1 0.28 L-1 -0.28 L-0.28 -0.28 Z',
        ),
        // 3: Desert pixel square
        new Path2D('M-0.65 -0.65 L0.65 -0.65 L0.65 0.65 L-0.65 0.65 Z'),
      ]
    : [];

const ACT_PALETTES: Record<number, readonly string[]> = {
  0: ['#5EEAD4', '#F59E0B', '#FDE68A', '#FB7185'], // Act I: Shield Indigo-Teal + Gold + Crimson
  1: ['#F59E0B', '#FDE68A', '#34D399', '#5EEAD4'], // Act II: Trade Amber + Emerald
  2: ['#FBBF24', '#FDE68A', '#2DD4BF', '#F8F7F3'], // Act III: 24K Gold + Turquoise
};

const FROZEN_PALETTE: readonly string[] = ['#FB7185', '#F43F5E', '#F59E0B', '#FDA4AF'];

export const AjrakPixelParticle: React.FC<AjrakPixelParticleProps> = ({
  activeAct,
  paused = false,
  frozen = false,
  theaterMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = useReducedMotion();

  // Keep dynamic props in refs so rAF loop runs seamlessly without teardown/re-init
  const configRef = useRef({ activeAct, paused, frozen, theaterMode });
  configRef.current = { activeAct, paused, frozen, theaterMode };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = canvas.clientWidth || 960;
    let height = canvas.clientHeight || 300;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const maxParticles = theaterMode ? 56 : 40;
    const pool: DustParticle[] = [];

    const seedParticle = (p: Partial<DustParticle>, spawnAtEdge = false): DustParticle => {
      const depth = 0.4 + Math.random() * 0.9;
      return {
        x: spawnAtEdge ? -12 : Math.random() * width,
        y: Math.random() * height,
        vx: (12 + Math.random() * 26) * depth,
        vy: (-6 + Math.random() * 12) * depth,
        size: (1.8 + Math.random() * 3.1) * depth,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.1,
        alpha: 0.22 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.4 + Math.random() * 2.2,
        shapeIndex: Math.floor(Math.random() * Math.max(1, AJRAK_SVG_PATHS.length)),
        colorIndex: Math.floor(Math.random() * 4),
        depth,
        ...p,
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      pool.push(seedParticle({}));
    }

    const syncSize = () => {
      const nextW = canvas.clientWidth || 960;
      const nextH = canvas.clientHeight || 300;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nextW === width && nextH === height && canvas.width === Math.round(nextW * dpr)) {
        return;
      }
      width = nextW;
      height = nextH;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    };

    syncSize();

    // Pointer turbulence in canvas space (ref-only, zero React renders)
    const pointer = { x: -9999, y: -9999, active: false };
    const parentEl = canvas.parentElement;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    parentEl?.addEventListener('pointermove', handlePointerMove, { passive: true });
    parentEl?.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        syncSize();
        if (prefersReduced) drawFrame(0, 0);
      });
      resizeObserver.observe(canvas);
    }

    let inViewport = true;
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          inViewport = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(canvas);
    }

    const drawFrame = (dt: number, elapsed: number) => {
      const { activeAct: act, paused: isPaused, frozen: isFrozen } = configRef.current;
      const palette = isFrozen ? FROZEN_PALETTE : ACT_PALETTES[act % 3] || ACT_PALETTES[0];
      const speedFactor = isPaused ? 0.25 : isFrozen ? 0.55 : 1.0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];

        if (!prefersReduced) {
          // Subtle desert thermal breeze + sinusoidal harmonic drift
          const windWave = Math.sin(elapsed * 0.7 + p.twinklePhase) * 6.5 * p.depth;
          p.x += p.vx * speedFactor * dt;
          p.y += (p.vy + windWave) * speedFactor * dt;
          p.rotation += p.rotSpeed * speedFactor * dt;
          p.twinklePhase += p.twinkleSpeed * dt;

          // Gentle pointer breeze deflection when cursor glides over the stage
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 4 && distSq < 9200) {
              const dist = Math.sqrt(distSq);
              const force = ((96 - dist) / 96) * 42 * dt;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          // Wrap seamlessly across stage borders
          if (p.x > width + 14) {
            p.x = -12;
            p.y = Math.random() * height;
          } else if (p.x < -16) {
            p.x = width + 12;
          }
          if (p.y > height + 14) {
            p.y = -10;
          } else if (p.y < -14) {
            p.y = height + 10;
          }
        }

        const twinkle = 0.56 + 0.44 * Math.sin(p.twinklePhase);
        const alpha = p.alpha * twinkle;
        const color = palette[p.colorIndex % palette.length];
        const path = AJRAK_SVG_PATHS[p.shapeIndex];
        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        const tx = p.x * dpr;
        const ty = p.y * dpr;

        ctx.fillStyle = color;

        if (path) {
          // Soft GPU-free atmospheric halo pass (zero shadowBlur or save/restore overhead)
          const sh = p.size * 2.05 * dpr;
          ctx.globalAlpha = alpha * 0.22;
          ctx.setTransform(sh * cos, sh * sin, -sh * sin, sh * cos, tx, ty);
          ctx.fill(path);

          // Pixel-crisp SVG geometry core
          const sc = p.size * dpr;
          ctx.globalAlpha = alpha * 0.85;
          ctx.setTransform(sc * cos, sc * sin, -sc * sin, sc * cos, tx, ty);
          ctx.fill(path);
        } else {
          ctx.globalAlpha = alpha * 0.85;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    if (prefersReduced) {
      drawFrame(0, 0);
      return () => {
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        parentEl?.removeEventListener('pointermove', handlePointerMove);
        parentEl?.removeEventListener('pointerleave', handlePointerLeave);
      };
    }

    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (inViewport && document.visibilityState !== 'hidden') {
        elapsed += dt;
        drawFrame(dt, elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      lastTs = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', handleVisibility);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      parentEl?.removeEventListener('pointermove', handlePointerMove);
      parentEl?.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [prefersReduced, theaterMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full z-[12]"
    />
  );
};
