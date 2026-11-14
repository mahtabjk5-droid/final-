import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AjrakBlockBorder, BolMizanLogo } from './SovereignArt';

/**
 * Full-viewport cursor-reactive living canvas: drifting 24K brass particles and
 * slow-breathing Hala Kashi geometric constellations across the entire app.
 */
export const AmbientAjrakCanvas: React.FC<{ crimsonMode?: boolean; frozen: boolean }> = ({
  crimsonMode = false,
  frozen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const handleMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const handleLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerleave', handleLeave, { passive: true });

    const particles = Array.from({ length: 48 }, (_, i) => ({
      x: ((i * 97) % 100) / 100,
      y: ((i * 53) % 100) / 100,
      vx: (((i % 7) - 3) * 0.00012) || 0.0001,
      vy: (((i % 5) - 2) * 0.00011) || -0.00009,
      r: 1.6 + (i % 3) * 1.0,
      hue: i % 3 === 0 ? 'crimson' : i % 3 === 1 ? 'gold' : 'teal',
    }));

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;

        const px = p.x * w;
        const py = p.y * h;

        const distCursor = pointer.active ? Math.hypot(px - pointer.x, py - pointer.y) : 9999;
        const nearCursor = distCursor < 190;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = (p.x - q.x) * w;
          const dy = (p.y - q.y) * h;
          const dist = Math.hypot(dx, dy);
          if (dist < 165) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(q.x * w, q.y * h);
            ctx.strokeStyle = frozen
              ? `rgba(225, 29, 72, ${(1 - dist / 165) * 0.24})`
              : nearCursor
                ? `rgba(245, 158, 11, ${(1 - dist / 165) * 0.34})`
                : crimsonMode
                  ? `rgba(225, 29, 72, ${(1 - dist / 165) * 0.16})`
                  : `rgba(20, 184, 166, ${(1 - dist / 165) * 0.15})`;
            ctx.lineWidth = nearCursor ? 1.15 : 0.85;
            ctx.stroke();
          }
        }

        if (nearCursor && !frozen) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${(1 - distCursor / 190) * 0.26})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, py, nearCursor ? p.r * 1.45 : p.r, 0, Math.PI * 2);
        if (frozen) {
          ctx.fillStyle = 'rgba(225, 29, 72, 0.48)';
        } else if (nearCursor || p.hue === 'gold') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.56)';
        } else if (p.hue === 'teal') {
          ctx.fillStyle = 'rgba(20, 184, 166, 0.48)';
        } else {
          ctx.fillStyle = 'rgba(225, 29, 72, 0.42)';
        }
        ctx.fill();
      }

      ctx.restore();
      if (!prefersReduced) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, [crimsonMode, frozen]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 w-full h-full z-0"
    />
  );
};

/**
 * Ceremonial Sindhi Ajrak Block-Print Welcome Curtain.
 * Features hand-crafted Ajrak tessellated silk panels and a dual counter-rotating
 * 12-petal Khatam mandala forged in Brass Gold, Ajrak Crimson, and Hala Turquoise.
 */
export const AjrakWelcomeCurtain: React.FC<{
  visible: boolean;
  onDismiss: () => void;
}> = ({ visible, onDismiss }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        onClick={onDismiss}
        className="no-print fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer bg-[#071518]"
        role="region"
        aria-label="Sindhi Ajrak Welcome Sequence"
      >
        {/* Top & Bottom Woven Ajrak Cultural Framing */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <AjrakBlockBorder />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <AjrakBlockBorder />
        </div>

        {/* Left & Right Ajrak Geometric Silk Panels parting smoothly */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '-10%' }}
          exit={{ x: '-100%' }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#9B1C2E] via-[#65101D] to-[#0D2327] opacity-90 border-r-2 border-[#F59E0B]/55 overflow-hidden"
        >
          <svg className="w-full h-full opacity-20" aria-hidden="true">
            <defs>
              <pattern id="ajrak-silk-l" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 2 L54 28 L28 54 L2 28 Z" fill="none" stroke="#F8F7F3" strokeWidth="1" />
                <path d="M28 12 L44 28 L28 44 L12 28 Z" fill="none" stroke="#F59E0B" strokeWidth="1.2" />
                <circle cx="28" cy="28" r="3" fill="#F59E0B" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ajrak-silk-l)" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '10%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-[#0F766E] via-[#0D2327] to-[#2B0C14] opacity-90 border-l-2 border-[#F59E0B]/55 overflow-hidden"
        >
          <svg className="w-full h-full opacity-20" aria-hidden="true">
            <defs>
              <pattern id="ajrak-silk-r" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 2 L54 28 L28 54 L2 28 Z" fill="none" stroke="#5EEAD4" strokeWidth="1" />
                <path d="M28 12 L44 28 L28 44 L12 28 Z" fill="none" stroke="#F59E0B" strokeWidth="1.2" />
                <circle cx="28" cy="28" r="3" fill="#F8F7F3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ajrak-silk-r)" />
          </svg>
        </motion.div>

        {/* Central Dual-Ring Sindhi Ajrak & Hala Kashi Astrolabe Mandala */}
        <motion.div
          initial={{ scale: 0.58, rotate: -28, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 1.22, opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl"
        >
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-5 flex items-center justify-center">
            <motion.svg
              viewBox="0 0 240 240"
              className="w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 36, ease: 'linear' }}
            >
              <g transform="translate(120,120)" fill="none">
                <circle r="110" stroke="#F59E0B" strokeWidth="1.6" strokeDasharray="6 4" />
                <circle r="88" stroke="#5EEAD4" strokeWidth="1.4" />
                {[0, 30, 60, 90, 120, 150].map((deg) => (
                  <g key={deg} transform={`rotate(${deg})`}>
                    <rect x="-56" y="-56" width="112" height="112" stroke="#F59E0B" strokeOpacity="0.65" strokeWidth="1" />
                    <polygon
                      points="0,-102 14,-24 102,0 14,24 0,102 -14,24 -102,0 -14,-24"
                      fill="#9B1C2E"
                      fillOpacity="0.26"
                      stroke="#F8F7F3"
                      strokeOpacity="0.72"
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </g>
            </motion.svg>

            <motion.svg
              viewBox="0 0 140 140"
              className="absolute w-24 h-24 sm:w-28 sm:h-28"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            >
              <g transform="translate(70,70)" fill="none">
                <circle r="52" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 5" />
                <polygon points="0,-44 11,-11 44,0 11,11 0,44 -11,11 -44,0 -11,-11" fill="#F59E0B" fillOpacity="0.28" stroke="#FDE68A" strokeWidth="1.2" />
              </g>
            </motion.svg>
            <div className="relative z-10">
              <BolMizanLogo size="md" />
            </div>
          </div>

          <p dir="rtl" className="text-2xl sm:text-3xl font-bold text-[#F59E0B] mb-2">
            ڀلي ڪري آيا · خوش آمدید
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
            BolMizan VERITAS-SOVEREIGN
          </h2>
          <p className="text-xs sm:text-sm text-[#5EEAD4] mt-2">
            Sakrand, Sindh · Zero-Riba Hard-Asset Sovereignty & AI Shields
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="kashi-btn mt-6 px-6 py-2.5 rounded-lg bg-[#F59E0B] text-[#0D2327] text-xs font-bold hover:bg-[#FBBF24] whitespace-nowrap shrink-0"
          >
            Enter Sovereign Command
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
