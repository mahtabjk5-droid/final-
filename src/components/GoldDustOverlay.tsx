import React, { useEffect, useRef } from 'react';

interface GoldParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  kind: 'dust' | 'diamond' | 'ring';
  color: string;
  maxRadius?: number;
}

const GOLD_PALETTE = ['#F59E0B', '#FBBF24', '#FDE68A', '#D97706', '#FEF3C7'];
const AJRAK_ACCENTS = ['#F59E0B', '#FBBF24', '#14B8A6', '#9B1C2E'];

function findInteractiveTarget(el: EventTarget | null): {
  node: HTMLElement;
  type: 'button' | 'card';
} | null {
  if (!(el instanceof HTMLElement)) return null;

  const btn = el.closest('button, a[href], [role="button"]') as HTMLElement | null;
  if (btn && !btn.hasAttribute('disabled')) {
    return { node: btn, type: 'button' };
  }

  const card = el.closest('.kashi-card, section, article, [data-gold-dust]') as HTMLElement | null;
  if (card) {
    return { node: card, type: 'card' };
  }

  return null;
}

/**
 * Global GPU-accelerated Canvas Gold-Dust (#F59E0B) Particle System.
 * Emits fine brass-gold bullion particles along button edges, card bevels,
 * and click points across the entire OS to celebrate Hard-Asset sovereignty.
 */
export const GoldDustOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const particles: GoldParticle[] = [];
    let rafId = 0;
    let isRunning = false;
    let activeTarget: { node: HTMLElement; type: 'button' | 'card' } | null = null;
    let lastEmitAt = 0;
    let ambientTick = 0;

    const syncCanvasSize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      return { w, h, dpr };
    };

    const pushParticle = (p: GoldParticle) => {
      if (particles.length >= 280) {
        particles.shift();
      }
      particles.push(p);
      ensureLoop();
    };

    const spawnPerimeterSpark = (rect: DOMRect, count: number, type: 'button' | 'card') => {
      for (let i = 0; i < count; i++) {
        // Pick a random edge point around the hovered button or card perimeter
        const edge = Math.floor(Math.random() * 4);
        let x = rect.left;
        let y = rect.top;
        let vx = (Math.random() - 0.5) * 0.85;
        let vy = -0.5 - Math.random() * 1.1;

        if (edge === 0) {
          // Top edge
          x = rect.left + Math.random() * rect.width;
          y = rect.top + (Math.random() - 0.5) * 3;
          vy = -0.6 - Math.random() * 1.25;
        } else if (edge === 1) {
          // Right edge
          x = rect.right + (Math.random() - 0.5) * 3;
          y = rect.top + Math.random() * rect.height;
          vx = 0.35 + Math.random() * 0.85;
        } else if (edge === 2) {
          // Bottom edge
          x = rect.left + Math.random() * rect.width;
          y = rect.bottom + (Math.random() - 0.5) * 3;
          vy = -0.25 - Math.random() * 0.85;
        } else {
          // Left edge
          x = rect.left + (Math.random() - 0.5) * 3;
          y = rect.top + Math.random() * rect.height;
          vx = -0.35 - Math.random() * 0.85;
        }

        const isDiamond = Math.random() < (type === 'button' ? 0.34 : 0.24);
        pushParticle({
          x,
          y,
          vx,
          vy,
          size: isDiamond ? 2.6 + Math.random() * 2.8 : 1.3 + Math.random() * 2.2,
          alpha: type === 'button' ? 0.92 : 0.72,
          decay: 0.014 + Math.random() * 0.014,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.09,
          kind: isDiamond ? 'diamond' : 'dust',
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        });
      }
    };

    const spawnCursorDust = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 1.35;
        const isDiamond = Math.random() < 0.28;
        pushParticle({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed * 0.75,
          vy: Math.sin(angle) * speed * 0.5 - 0.75,
          size: isDiamond ? 2.8 + Math.random() * 2.6 : 1.4 + Math.random() * 2.1,
          alpha: 0.95,
          decay: 0.017 + Math.random() * 0.015,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.12,
          kind: isDiamond ? 'diamond' : 'dust',
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        });
      }
    };

    const spawnClickBurst = (x: number, y: number, isButton: boolean) => {
      const count = isButton ? 24 : 14;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const speed = (isButton ? 1.4 : 0.9) + Math.random() * 2.6;
        const isDiamond = i % 3 === 0;
        pushParticle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.55,
          size: isDiamond ? 3.2 + Math.random() * 2.8 : 1.6 + Math.random() * 2.4,
          alpha: 1,
          decay: 0.018 + Math.random() * 0.012,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.15,
          kind: isDiamond ? 'diamond' : 'dust',
          color: i % 7 === 0
            ? AJRAK_ACCENTS[Math.floor(Math.random() * AJRAK_ACCENTS.length)]
            : GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        });
      }

      // Expanding 24K bullion minting shockwave ring
      pushParticle({
        x,
        y,
        vx: 0,
        vy: 0,
        size: 6,
        maxRadius: isButton ? 54 : 38,
        alpha: 0.72,
        decay: 0.032,
        rotation: 0,
        vRot: 0,
        kind: 'ring',
        color: '#F59E0B',
      });
    };

    const drawFourPointStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      rot: number,
    ) => {
      context.save();
      context.translate(cx, cy);
      context.rotate(rot);
      context.beginPath();
      const inner = radius * 0.32;
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? radius : inner;
        const a = (i * Math.PI) / 4;
        if (i === 0) context.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      context.closePath();
      context.fill();
      context.restore();
    };

    const renderFrame = () => {
      const { w, h, dpr } = syncCanvasSize();
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Gentle perimeter shimmer while resting on a button or card
      ambientTick += 1;
      if (activeTarget && activeTarget.node.isConnected && ambientTick % 5 === 0) {
        const rect = activeTarget.node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          spawnPerimeterSpark(rect, activeTarget.type === 'button' ? 2 : 1, activeTarget.type);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= p.decay;
        if (p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        if (p.kind === 'ring') {
          const targetR = p.maxRadius || 48;
          p.size += (targetR - p.size) * 0.16;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();
          continue;
        }

        // Organic air drag + sinusoidal brass buoyancy
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 - 0.025;
        p.x += p.vx + Math.sin(ambientTick * 0.08 + i) * 0.14;
        p.y += p.vy;
        p.rotation += p.vRot;

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.kind === 'diamond') {
          // Soft brass halo
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = p.color;
          drawFourPointStar(ctx, p.x, p.y, p.size, p.rotation);
        } else {
          // Luminous halo + crisp 24K dust core
          ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      if (particles.length > 0 || activeTarget) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        isRunning = false;
      }
    };

    const ensureLoop = () => {
      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const clearHoverCardGlow = (el: HTMLElement | null) => {
      if (el && el.classList.contains('kashi-card')) {
        el.style.setProperty('--glow-opacity', '0');
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      const hit = findInteractiveTarget(e.target);
      if (activeTarget && activeTarget.node !== hit?.node) {
        clearHoverCardGlow(activeTarget.node);
      }
      activeTarget = hit;

      if (hit) {
        const rect = hit.node.getBoundingClientRect();
        spawnPerimeterSpark(rect, hit.type === 'button' ? 6 : 3, hit.type);
        if (hit.type === 'card' || hit.node.classList.contains('kashi-card')) {
          hit.node.style.setProperty('--glow-opacity', '1');
        }
        ensureLoop();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const hit = findInteractiveTarget(e.target);
      if (activeTarget && activeTarget.node !== hit?.node) {
        clearHoverCardGlow(activeTarget.node);
      }
      activeTarget = hit;
      if (!hit) return;

      // Update specular brass halo coordinates on hovered .kashi-card
      const cardEl = hit.node.closest('.kashi-card') as HTMLElement | null;
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        const rx = ((e.clientX - cardRect.left) / Math.max(1, cardRect.width)) * 100;
        const ry = ((e.clientY - cardRect.top) / Math.max(1, cardRect.height)) * 100;
        cardEl.style.setProperty('--mx', `${rx.toFixed(1)}%`);
        cardEl.style.setProperty('--my', `${ry.toFixed(1)}%`);
        cardEl.style.setProperty('--glow-opacity', '1');
      }

      const now = performance.now();
      const throttleMs = hit.type === 'button' ? 28 : 55;
      if (now - lastEmitAt < throttleMs) return;
      lastEmitAt = now;

      spawnCursorDust(e.clientX, e.clientY, hit.type === 'button' ? 3 : 2);
      if (hit.type === 'button') {
        spawnPerimeterSpark(hit.node.getBoundingClientRect(), 2, 'button');
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const hit = findInteractiveTarget(e.target);
      spawnClickBurst(e.clientX, e.clientY, hit?.type === 'button');
    };

    const handlePointerLeaveWindow = () => {
      if (activeTarget) {
        clearHoverCardGlow(activeTarget.node);
      }
      activeTarget = null;
    };

    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeaveWindow, { passive: true });
    window.addEventListener('resize', syncCanvasSize, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mouseleave', handlePointerLeaveWindow);
      window.removeEventListener('resize', syncCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 w-full h-full z-40"
    />
  );
};
