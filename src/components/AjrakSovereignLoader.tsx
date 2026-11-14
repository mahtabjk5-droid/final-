import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AjrakBlockBorder, HalaKashiCornerOrnament } from './SovereignArt';

interface AjrakSovereignLoaderProps {
  title?: string;
  subtitle?: string;
}

export const AjrakSovereignLoader: React.FC<AjrakSovereignLoaderProps> = ({
  title = 'BolMizan VERITAS-SOVEREIGN OS v30.0',
  subtitle = 'Interlocking Sakrand Ajrak & Quran 2:282 Zero-Riba Ledger Sync...',
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Loading Sovereign Ledger"
      className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/35 ajrak-moving-glass shadow-2xl"
    >
      <AjrakBlockBorder />

      <HalaKashiCornerOrnament className="absolute top-7 left-3 opacity-80" />
      <HalaKashiCornerOrnament className="absolute top-7 right-3 rotate-90 opacity-80" />
      <HalaKashiCornerOrnament className="absolute bottom-3 left-3 -rotate-90 opacity-80" />
      <HalaKashiCornerOrnament className="absolute bottom-3 right-3 rotate-180 opacity-80" />

      <div className="relative z-10 px-6 py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-6">
        {/* Intricate Interlocking Sindhi Ajrak Ceremony Emblem */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Outer Rotating 12-Point Chamkli Ring */}
          <motion.svg
            viewBox="0 0 220 220"
            className="absolute inset-0 w-full h-full"
            animate={prefersReduced ? undefined : { rotate: 360 }}
            transition={prefersReduced ? undefined : { repeat: Infinity, duration: 32, ease: 'linear' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ajrak-loader-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <radialGradient id="ajrak-loader-indigo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0F766E" stopOpacity="0.35" />
                <stop offset="65%" stopColor="#081C24" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#041016" stopOpacity="0.98" />
              </radialGradient>
            </defs>

            <circle cx="110" cy="110" r="102" fill="url(#ajrak-loader-indigo)" stroke="url(#ajrak-loader-gold)" strokeWidth="2.2" />
            <circle cx="110" cy="110" r="94" fill="none" stroke="#14B8A6" strokeOpacity="0.55" strokeWidth="1.1" strokeDasharray="4 4" />

            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <g key={deg} transform={`translate(110,110) rotate(${deg})`}>
                <polygon
                  points="0,-90 12,-22 90,0 12,22 0,90 -12,22 -90,0 -12,-22"
                  fill="#9B1C2E"
                  fillOpacity="0.28"
                  stroke="#F8F7F3"
                  strokeOpacity="0.35"
                  strokeWidth="0.9"
                />
                <circle cx="0" cy="-90" r="2.6" fill="#F59E0B" />
              </g>
            ))}
          </motion.svg>

          {/* Counter-Rotating Hala Kashi 8-Fold Khatam Lattice */}
          <motion.svg
            viewBox="0 0 220 220"
            className="absolute inset-0 w-full h-full"
            animate={prefersReduced ? undefined : { rotate: -360 }}
            transition={prefersReduced ? undefined : { repeat: Infinity, duration: 24, ease: 'linear' }}
            aria-hidden="true"
          >
            <g transform="translate(110,110)">
              <motion.rect
                x="-52"
                y="-52"
                width="104"
                height="104"
                rx="4"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.8"
                initial={prefersReduced ? false : { pathLength: 0.2, opacity: 0.5 }}
                animate={prefersReduced ? undefined : { pathLength: [0.2, 1, 0.2], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
              />
              <motion.rect
                x="-52"
                y="-52"
                width="104"
                height="104"
                rx="4"
                transform="rotate(45)"
                fill="#0F766E"
                fillOpacity="0.16"
                stroke="#5EEAD4"
                strokeWidth="1.6"
                initial={prefersReduced ? false : { pathLength: 0.2, opacity: 0.45 }}
                animate={prefersReduced ? undefined : { pathLength: [0.2, 1, 0.2], opacity: [0.45, 0.95, 0.45] }}
                transition={{ repeat: Infinity, duration: 3.6, delay: 0.5, ease: 'easeInOut' }}
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <circle
                  key={deg}
                  cx={Math.cos((deg * Math.PI) / 180) * 66}
                  cy={Math.sin((deg * Math.PI) / 180) * 66}
                  r="3.2"
                  fill={deg % 90 === 0 ? '#F59E0B' : '#9B1C2E'}
                  stroke="#F8F7F3"
                  strokeWidth="0.9"
                />
              ))}
            </g>
          </motion.svg>

          {/* Center Pulsing Mizan Scale Medallion */}
          <motion.svg
            viewBox="0 0 80 80"
            className="relative z-10 w-20 h-20"
            animate={prefersReduced ? undefined : { scale: [0.97, 1.04, 0.97] }}
            transition={prefersReduced ? undefined : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <circle cx="40" cy="40" r="34" fill="#05131B" stroke="#F59E0B" strokeWidth="2.2" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="#9B1C2E" strokeWidth="1.3" strokeDasharray="3 2" />
            <line x1="40" y1="16" x2="40" y2="58" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <path d="M27 60 H53 L48 54 H32 Z" fill="#F59E0B" />
            <line x1="18" y1="26" x2="62" y2="26" stroke="#FDE68A" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M18 26 L12 42 H24 Z" fill="#14B8A6" fillOpacity="0.92" />
            <path d="M62 26 L56 42 H68 Z" fill="#F59E0B" fillOpacity="0.92" />
            <circle cx="40" cy="18" r="3.4" fill="#F59E0B" />
          </motion.svg>
        </div>

        <div className="space-y-2 max-w-xl">
          <p className="font-mono-tabular text-xs font-semibold tracking-widest uppercase text-[#F59E0B]">
            سنڌ جي اجرڪ · Sakrand Sovereign Handshake
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8F7F3]">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5EEAD4]">
            {subtitle}
          </p>
        </div>

        {/* Chromatic Kashi Progress Track */}
        <div className="w-full max-w-md h-1.5 rounded-full overflow-hidden bg-[#030B10] border border-[#F59E0B]/25">
          <div className="h-full w-full rail-flow-active" />
        </div>
      </div>

      <AjrakBlockBorder />
    </section>
  );
};
