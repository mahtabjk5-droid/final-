import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ShieldCheck, ShieldAlert } from 'lucide-react';
import heroKashiImg from '../assets/images/sakrand_kashi_command_1794637623349.jpg';
import type { AudienceMode, SovereignSystemState } from '../types/sovereign';
import {
  AjrakBlockBorder,
  BolMizanLogo,
  HalaKashiCornerOrnament,
  HalaKashiFrieze,
  LivingMizanScale,
  ResilientImage,
} from './SovereignArt';

interface AjrakLivingStageProps {
  state: SovereignSystemState;
  mode: AudienceMode;
  onModeChange: (mode: AudienceMode) => void;
  mizanTilt: number;
  onReplayWelcome?: () => void;
}

export const AjrakLivingStage: React.FC<AjrakLivingStageProps> = ({
  state,
  mode,
  onModeChange,
  mizanTilt,
  onReplayWelcome,
}) => {
  const [welcomeKey, setWelcomeKey] = useState(0);
  const [welcomeStep, setWelcomeStep] = useState<'unfurling' | 'settled'>('unfurling');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isSabziMode = mode === 'sabzi-wala';

  useEffect(() => {
    setWelcomeStep('unfurling');
    const timer = window.setTimeout(() => setWelcomeStep('settled'), 2400);
    return () => window.clearTimeout(timer);
  }, [welcomeKey]);

  // Throttled 24fps Sakrand -> Khairpur -> Dubai -> Riyadh Trade Corridor Canvas (Zero Lag)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let t = 0;
    let lastFrameTime = 0;

    const nodes = [
      { label: 'Sakrand HQ', rx: 0.13, ry: 0.65, color: '#F59E0B' },
      { label: 'Khairpur', rx: 0.32, ry: 0.44, color: '#14B8A6' },
      { label: 'Karachi Sea', rx: 0.50, ry: 0.74, color: '#38BDF8' },
      { label: 'Dubai Port', rx: 0.72, ry: 0.48, color: '#F59E0B' },
      { label: 'Riyadh Hub', rx: 0.89, ry: 0.34, color: '#9B1C2E' },
    ];

    const render = (now = 0) => {
      if (!prefersReduced) {
        rafId = window.requestAnimationFrame(render);
      }
      if (now - lastFrameTime < 42) return; // Cap at ~24 FPS to keep CPU/GPU cool
      lastFrameTime = now;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(300, Math.floor(rect.width));
      const h = Math.max(120, Math.floor(rect.height));
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const frozen = state.killSwitch.active;

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.lineWidth = 0.8;
      for (let gx = 40; gx < w; gx += 64) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 32; gy < h; gy += 48) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      ctx.beginPath();
      for (let x = 0; x <= w; x += 14) {
        const y = h * 0.80 + Math.sin(x * 0.02 + t * 0.06) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = frozen ? 'rgba(155, 28, 46, 0.48)' : 'rgba(20, 184, 166, 0.42)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const ax = a.rx * w;
        const ay = a.ry * h;
        const bx = b.rx * w;
        const by = b.ry * h;
        const cx = (ax + bx) / 2;
        const cy = Math.min(ay, by) - 28;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx, cy, bx, by);
        ctx.strokeStyle = frozen ? 'rgba(155, 28, 46, 0.42)' : 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.85;
        ctx.stroke();

        if (!frozen) {
          const baseU = ((t * 0.014 + i * 0.27) % 1 + 1) % 1;
          const headX = (1 - baseU) * (1 - baseU) * ax + 2 * (1 - baseU) * baseU * cx + baseU * baseU * bx;
          const headY = (1 - baseU) * (1 - baseU) * ay + 2 * (1 - baseU) * baseU * cy + baseU * baseU * by;
          ctx.beginPath();
          ctx.arc(headX, headY, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE68A';
          ctx.fill();
        }
      }

      nodes.forEach((n, idx) => {
        const x = n.rx * w;
        const y = n.ry * h;
        const pulseRadius = 7.5 + Math.sin(t * 0.12 + idx) * 2.5;

        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = frozen ? 'rgba(155, 28, 46, 0.6)' : 'rgba(245, 158, 11, 0.55)';
        ctx.lineWidth = 1.25;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 4.4, 0, Math.PI * 2);
        ctx.fillStyle = frozen ? '#9B1C2E' : n.color;
        ctx.fill();

        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(248, 247, 243, 0.94)';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, x, y + 19);
      });

      ctx.restore();
      t += 1;
    };

    render();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [state.killSwitch.active]);

  return (
    <section className="kashi-card rounded-2xl overflow-hidden border border-[#9B1C2E]/30 dark:border-[#F59E0B]/30 bg-gradient-to-br from-[#0D2327] via-[#132F35] to-[#2B0C14] text-[#F8F7F3] shadow-xl">
      <AjrakBlockBorder />

      <div className="relative p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <HalaKashiCornerOrnament className="absolute top-3 left-3 opacity-80" />
        <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-80" />

        {/* Left Column */}
        <div className="lg:col-span-7 relative z-10 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`welcome-${welcomeKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-2.5"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#F59E0B]">
                <span className="font-semibold">Sindhi Ajrak &amp; Hala Kashi Living Command</span>
                <span aria-hidden="true">•</span>
                <span className="text-[#5EEAD4]">Sakrand, Shaheed Benazirabad</span>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setWelcomeKey((k) => k + 1);
                    onReplayWelcome?.();
                  }}
                  className="kashi-btn inline-flex items-center gap-1 text-[#F8F7F3]/90 hover:text-[#F59E0B] underline underline-offset-2 px-1.5 py-0.5 rounded"
                >
                  <RotateCcw className="w-3 h-3" /> Replay Ajrak Welcome
                </button>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span dir="rtl" className="text-lg sm:text-xl font-semibold text-[#F59E0B]">
                  ڀلي ڪري آيا • خوش آمديد
                </span>
                <span className="text-xs text-[#F8F7F3]/75">
                  {welcomeStep === 'unfurling' ? 'Unfurling Ajrak Seal...' : 'Sovereign Core Active'}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <BolMizanLogo size="md" />
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-white text-balance leading-[1.12]">
                  BolMizan VERITAS-SOVEREIGN OS
                </h1>
              </div>

              <p className="text-sm text-[#F8F7F3]/85 max-w-xl leading-relaxed">
                {isSabziMode
                  ? 'Sabzi-Wala Easy Mode: Instant Urdu & Sindhi voice protection against 8171/OTP fraud plus 1-tap payment lock.'
                  : 'Enterprise Cryptographic Mode: Live Shannon entropy, Bayesian scam firewall, 21-rail circuit switchboard, and 100,000,000x zero-capital Sakrand-to-Gulf compounding.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Interactive Audience Switcher + Living Mizan Scale */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div
              role="group"
              aria-label="Audience Mode Switcher"
              className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#F59E0B]/25 bg-[#071417]/90"
            >
              <button
                type="button"
                onClick={() => onModeChange('sabzi-wala')}
                className={`kashi-btn px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] ${
                  isSabziMode
                    ? 'bg-[#9B1C2E] text-white shadow-sm'
                    : 'text-[#F8F7F3]/75 hover:text-white'
                }`}
              >
                Sabzi-Wala Easy Mode
              </button>
              <button
                type="button"
                onClick={() => onModeChange('enterprise')}
                className={`kashi-btn px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] ${
                  !isSabziMode
                    ? 'bg-[#F59E0B] text-[#0D2327] shadow-sm'
                    : 'text-[#F8F7F3]/75 hover:text-white'
                }`}
              >
                Elon Musk / Enterprise Mode
              </button>
            </div>

{state.killSwitch.active ? (

) : (

)}
{state.killSwitch.active ? 'Rails Frozen' : 'Mizan Balanced'}


{state.deals.length} Deals • {state.totals.goldEquivalentGrams}g Au


21 Payment Rails Ready




{/* Right Column: Live Sakrand-to-Riyadh Corridor Canvas */}






Live Indus-to-Gulf Trade Corridor

PKR {(state.totals.activeDealsPkr / 1_000_000).toFixed(2)}M Active




);
};