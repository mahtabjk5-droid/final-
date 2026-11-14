import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Clapperboard, Film, Play, Pause, QrCode, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import basmatiImg from '../assets/images/sakrand_basmati_mizan_1794637623859.jpg';
import datesMangoesImg from '../assets/images/khairpur_dates_mangoes_1794637623124.jpg';
import solarWaterImg from '../assets/images/indus_solar_water_1794637624566.jpg';
import { AjrakPixelParticle } from './AjrakPixelParticle';
import { triggerSovereignHaptic } from '../utils/haptics';
import type { SovereignSystemState } from '../types/sovereign';

interface CinematicDirectorStageProps {
  state: SovereignSystemState;
  theaterMode: boolean;
  onToggleTheaterMode: () => void;
  onJumpToTab: (tab: 'shields' | 'treasury' | 'advisor') => void;
  onOpenJudgePassport?: () => void;
}

interface FilmAct {
  actNumber: string;
  title: string;
  subtitle: string;
  narration: string;
  statLabel: string;
  statValue: string;
  image: string;
  targetTab: 'shields' | 'treasury' | 'advisor';
  ctaText: string;
}

export const CinematicDirectorStage: React.FC<CinematicDirectorStageProps> = ({
  state,
  theaterMode,
  onToggleTheaterMode,
  onJumpToTab,
  onOpenJudgePassport,
}) => {
  const [activeAct, setActiveAct] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [sealPulseCount, setSealPulseCount] = useState(0);
  const prefersReduced = useReducedMotion();

  const acts: FilmAct[] = [
    {
      actNumber: 'ACT I // ZERO-TRUST SHIELD',
      title: 'From a Street Vendor in Sakrand to Global Vaults',
      subtitle: '0.1s Cognitive Proof-of-Intent & Master AI Kill-Switch',
      narration:
        'In an era where AI voice clones steal livelihoods in seconds, BolMizan reads human keystroke cadence and Bayesian entropy—blocking fraud before a single rupee leaves the bazaar.',
      statLabel: 'OUTBOUND RAILS PROTECTED',
      statValue: `${state.killSwitch.rails.length} RAILS // ${state.killSwitch.active ? 'LOCKED' : 'ARMED'}`,
      image: basmatiImg,
      targetTab: 'shields',
      ctaText: 'Enter Protocol 1–3 Firewall',
    },
    {
      actNumber: 'ACT II // REAL-WORLD ARBITRAGE',
      title: 'Zero-Capital Indus-to-Gulf Trade Corridor',
      subtitle: 'Quran 2:282 Otaq Witnesses, Mukasa Clearing & ZATCA Phase-2',
      narration:
        'Escaping the SaaS trap: connecting Sakrand Basmati mills and Khairpur date orchards directly to Riyadh and Dubai buyers with live GPS video hashes and zero interest.',
      statLabel: 'ACTIVE ZERO-RIBA PIPELINE',
      statValue: `PKR ${state.totals.activeDealsPkr.toLocaleString('en-US')}`,
      image: datesMangoesImg,
      targetTab: 'treasury',
      ctaText: 'Inspect Live Trade & Mukasa',
    },
    {
      actNumber: 'ACT III // 2076 SOVEREIGNTY',
      title: '24K Physical Gold, Solar Micro-Grids & Perpetual Waqf',
      subtitle: '100,000,000x Exponential Compounding Legacy',
      narration:
        'Halal profits flow out of inflationary paper into off-grid solar plants, clean RO water, Indus farmland, 24K gold reserves, and an autonomous Sadaqah-e-Jariyah endowment.',
      statLabel: '24K GOLD SOVEREIGN RESERVE',
      statValue: `${state.totals.goldEquivalentGrams} GRAMS // +PKR ${state.totals.sadaqahReservePkr.toLocaleString('en-US')} WAQF`,
      image: solarWaterImg,
      targetTab: 'advisor',
      ctaText: 'Launch Mizan AI & Acoustic Modem',
    },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => {
      setActiveAct((prev) => (prev + 1) % acts.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoPlay, acts.length]);

  const playCinematicBassPulse = () => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.9);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      if (ctx.state !== 'closed') {
        void ctx.close();
      }
    };
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
  };

  const current = acts[activeAct];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/35 bg-[#040E15] shadow-2xl">
      {/* Top Anamorphic Letterbox Bar */}
      <div className="flex items-center justify-between bg-black/90 px-4 py-2 border-b border-[#F59E0B]/20 text-[11px] font-mono-tabular tracking-widest text-[#FDE68A]/85">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>IMAX SOVEREIGN REEL // SAKRAND HQ (26.1384° N, 68.2747° E)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenJudgePassport && (
            <motion.button
              type="button"
              whileHover={prefersReduced ? undefined : { scale: 1.03 }}
              whileTap={prefersReduced ? undefined : { scale: 0.95 }}
              onClick={() => {
                triggerSovereignHaptic('tap');
                setSealPulseCount((c) => c + 1);
                onOpenJudgePassport();
              }}
              className="relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#0F766E] border border-[#5EEAD4]/40 text-white font-semibold shadow-[0_0_16px_-4px_rgba(20,184,166,0.55)] whitespace-nowrap"
            >
              {/* Continuous subtle quantum shimmer sweep */}
              {!prefersReduced && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-[#FDE68A]/35 to-transparent"
                  animate={{ x: ['-140%', '260%'] }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 3.2,
                    duration: 1.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              )}
              {/* Instant click quantum burst */}
              {!prefersReduced && sealPulseCount > 0 && (
                <motion.span
                  key={sealPulseCount}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded bg-gradient-to-r from-[#5EEAD4]/60 via-[#FDE68A]/75 to-[#F59E0B]/60"
                  initial={{ opacity: 0.9, scale: 0.85 }}
                  animate={{ opacity: 0, scale: 1.35 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              )}
              <QrCode className="relative z-10 w-3 h-3 text-[#FDE68A]" />
              <span className="relative z-10">Judge Verify Seal</span>
            </motion.button>
          )}
          <button
            type="button"
            onClick={() => {
              playCinematicBassPulse();
              setAutoPlay((p) => !p);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#F59E0B]/30 hover:bg-[#F59E0B]/15 text-[#FDE68A] whitespace-nowrap"
          >
            {autoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoPlay ? 'PAUSE REEL' : 'PLAY REEL'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playCinematicBassPulse();
              onToggleTheaterMode();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#9B1C2E] text-white font-semibold hover:bg-[#7F1524] whitespace-nowrap"
          >
            <Clapperboard className="w-3 h-3" />
            <span>{theaterMode ? 'EXIT THEATER' : 'THEATER MODE'}</span>
          </button>
        </div>
      </div>

      {/* Main Widescreen Viewport */}
      <div className="relative min-h-[270px] sm:min-h-[300px] grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <AjrakPixelParticle
          activeAct={activeAct}
          paused={!autoPlay}
          frozen={state.killSwitch.active}
          theaterMode={theaterMode}
        />
        <div className="cinematic-scan-beam" />

        {/* Left 7 Cols: Dramatic Storyboard Narrative */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10 bg-gradient-to-r from-[#040E15] via-[#040E15]/95 to-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.actNumber}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[11px] font-mono-tabular font-semibold text-[#F59E0B]">
                <Sparkles className="w-3 h-3" />
                <span>{current.actNumber}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                {current.title}
              </h1>

              <p className="text-xs sm:text-sm font-semibold text-[#5EEAD4]">
                {current.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-[#F8F7F3]/80 leading-relaxed max-w-2xl">
                {current.narration}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="pt-5 mt-4 border-t border-[#F59E0B]/15 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono-tabular tracking-widest text-[#F8F7F3]/60">
                {current.statLabel}
              </div>
              <div className="font-mono-tabular text-sm sm:text-base font-bold text-[#FDE68A]">
                {current.statValue}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playCinematicBassPulse}
                title="Play IMAX Acoustic Pulse"
                className="p-2.5 rounded-lg border border-[#F59E0B]/30 text-[#FDE68A] hover:bg-[#F59E0B]/15"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onJumpToTab(current.targetTab)}
                className="kashi-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#05131B] text-xs font-extrabold uppercase tracking-wider"
              >
                <span>{current.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Widescreen Visual Frame with Parallax Zoom */}
        <div className="lg:col-span-5 relative min-h-[200px] overflow-hidden bg-[#061822]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.image}
              src={current.image}
              alt={current.title}
              initial={{ scale: 1.12, opacity: 0.4 }}
              animate={{ scale: 1.0, opacity: 0.88 }}
              exit={{ opacity: 0.2 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#040E15] via-transparent to-[#040E15]/40 lg:bg-gradient-to-r lg:from-[#040E15] lg:via-[#040E15]/30 lg:to-transparent" />
        </div>
      </div>

      <div className="anamorphic-lens-flare" />

      {/* Bottom Anamorphic Act Selector Bar */}
      <div className="bg-black/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {acts.map((act, idx) => (
            <button
              key={act.actNumber}
              type="button"
              onClick={() => {
                setActiveAct(idx);
                setAutoPlay(false);
              }}
              className={`px-3 py-1 rounded text-[11px] font-mono-tabular font-semibold transition-all whitespace-nowrap ${
                activeAct === idx
                  ? 'bg-[#F59E0B] text-[#05131B]'
                  : 'border border-[#F59E0B]/25 text-[#F8F7F3]/75 hover:border-[#F59E0B]'
              }`}
            >
              0{idx + 1}. {act.actNumber.split('//')[0].trim()}
            </button>
          ))}
        </div>
        <span className="font-mono-tabular text-[11px] tracking-wider text-[#5EEAD4]/85">
          QURAN 2:282 // ETO-2002 // 0% RIBA VERIFIED
        </span>
      </div>
    </section>
  );
};