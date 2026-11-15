import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { AjrakDyeTheme } from '../types/sovereign';

export const AmbientAjrakCanvas: React.FC<{
  crimson?: boolean;
  dyeTheme?: AjrakDyeTheme;
}> = ({ crimson = false, dyeTheme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resolvedTheme: AjrakDyeTheme = dyeTheme ?? (crimson ? 'crimson' : 'indigo');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let tick = 0;
    let last = 0;

    const draw = (now = 0) => {
      if (!prefersReduced) raf = window.requestAnimationFrame(draw);
      if (now - last < 55) return;
      last = now;

      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      ctx.clearRect(0, 0, w, h);

      const step = 128;
      const offset = (tick * 0.28) % step;

      const primaryStroke =
        resolvedTheme === 'crimson'
          ? 'rgba(245, 158, 11, 0.065)'
          : resolvedTheme === 'kashi'
            ? 'rgba(20, 184, 166, 0.07)'
            : 'rgba(94, 234, 212, 0.05)';
      const starStroke =
        resolvedTheme === 'crimson'
          ? 'rgba(155, 28, 46, 0.09)'
          : resolvedTheme === 'kashi'
            ? 'rgba(253, 230, 138, 0.055)'
            : 'rgba(245, 158, 11, 0.048)';
      const nodeFill =
        resolvedTheme === 'crimson'
          ? 'rgba(253, 230, 138, 0.08)'
          : resolvedTheme === 'kashi'
            ? 'rgba(94, 234, 212, 0.09)'
            : 'rgba(245, 158, 11, 0.07)';

      ctx.lineWidth = 1;

      for (let x = -step; x < w + step; x += step) {
        for (let y = -step; y < h + step; y += step) {
          const cx = x + offset;
          const cy = y + Math.sin(tick * 0.012 + x * 0.01) * 5;

          // Outer Ajrak diamond block outline
          ctx.strokeStyle = primaryStroke;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 34);
          ctx.lineTo(cx + 34, cy);
          ctx.lineTo(cx, cy + 34);
          ctx.lineTo(cx - 34, cy);
          ctx.closePath();
          ctx.stroke();

          // Inner 8-pointed Sindhi Chakri rosette
          ctx.strokeStyle = starStroke;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 20);
          ctx.lineTo(cx + 6, cy - 6);
          ctx.lineTo(cx + 20, cy);
          ctx.lineTo(cx + 6, cy + 6);
          ctx.lineTo(cx, cy + 20);
          ctx.lineTo(cx - 6, cy + 6);
          ctx.lineTo(cx - 20, cy);
          ctx.lineTo(cx - 6, cy - 6);
          ctx.closePath();
          ctx.stroke();

          // Central natural-dye bindu dot
          ctx.fillStyle = nodeFill;
          ctx.beginPath();
          ctx.arc(cx, cy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      tick += 1;
    };

    draw();
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [resolvedTheme]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full opacity-90" />
    </motion.div>
  );
};
