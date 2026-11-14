import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Delete, Lock, Palette, ShieldCheck, Sparkles, Unlock } from 'lucide-react';
import heroKashiImg from '../assets/images/sakrand_kashi_command_1794637623349.jpg';
import type { AudienceMode } from '../types/sovereign';
import { triggerSovereignHaptic } from '../utils/haptics';
import {
  AjrakBlockBorder,
  BolMizanLogo,
  ChromaticKashiRule,
  HalaKashiCornerOrnament,
  HalaKashiFrieze,
  ResilientImage,
} from './SovereignArt';

interface AjrakSovereignGateProps {
  isSessionLock: boolean;
  audienceMode: AudienceMode;
  onAudienceModeChange: (mode: AudienceMode) => void;
  crimsonTheme: boolean;
  onToggleAjrakPalette: () => void;
  onAuthenticate: (pin: string) => Promise<{ ok: boolean; error?: string }>;
}

/**
 * Extraordinary Sindhi Ajrak Starting Login & Sovereign Vault Gate.
 * Styled exclusively in moving Royal Ajrak Indigo, Crimson, Hala Turquoise & 24K Gold (Zero White).
 */
export const AjrakSovereignGate: React.FC<AjrakSovereignGateProps> = ({
  isSessionLock,
  audienceMode,
  onAudienceModeChange,
  crimsonTheme,
  onToggleAjrakPalette,
  onAuthenticate,
}) => {
  const [pin, setPin] = useState(isSessionLock ? '' : '7860');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const appendDigit = (digit: string) => {
    triggerSovereignHaptic('tap');
    setError(null);
    setPin((prev) => (prev.length >= 6 ? prev : prev + digit));
  };

  const handleSubmit = async (e?: React.FormEvent, overridePin?: string) => {
    if (e) e.preventDefault();
    const candidate = (overridePin ?? pin).trim();
    if (!candidate) {
      triggerSovereignHaptic('error');
      setError('Enter Sovereign PIN (default: 7860) to unlock command.');
      return;
    }
    triggerSovereignHaptic('authenticate');
    setSubmitting(true);
    setError(null);
    try {
      const res = await onAuthenticate(candidate);
      if (!res.ok) {
        triggerSovereignHaptic('error');
        setError(res.error || 'Invalid Sovereign PIN (Default: 7860)');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isSabzi = audienceMode === 'sabzi-wala';

  return (
    <div className="min-h-screen flex flex-col justify-between relative z-10 overflow-x-hidden">
      {/* Top Authentic Sindhi Ajrak Hand-Block Border */}
      <div className="no-print">
        <AjrakBlockBorder />
      </div>

      {/* Main Balanced Two-Column Sovereign Entry Stage */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left Panel: Sindhi Ajrak Heritage Showcase & Bespoke Logo */}
          <section className="kashi-card ajrak-moving-glass lg:col-span-7 rounded-2xl overflow-hidden border border-[#F59E0B]/35 shadow-2xl flex flex-col justify-between relative">
            <ChromaticKashiRule />

            {/* Subtle Kashi architectural photography with deep Ajrak scrim */}
            <div className="absolute inset-0 pointer-events-none">
              <ResilientImage
                src={heroKashiImg}
                alt="Sakrand Hala Kashi Command Architecture"
                fallbackTitle="Sakrand Ajrak Command"
                className="w-full h-full object-cover opacity-22"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#061822]/90 via-[#380B18]/78 to-[#092B2E]/90" />
            </div>

            <HalaKashiCornerOrnament className="absolute top-4 left-4 z-10" />
            <HalaKashiCornerOrnament className="absolute top-4 right-4 rotate-90 z-10" />

            <div className="relative z-10 p-6 sm:p-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium text-[#5EEAD4]">
                  Sindhi Ajrak Heritage · Sakrand, Shaheed Benazirabad
                </p>
                <button
                  type="button"
                  onClick={onToggleAjrakPalette}
                  className="kashi-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F59E0B]/35 bg-[#041017]/75 text-xs font-medium text-[#FDE68A] hover:border-[#F59E0B] whitespace-nowrap shrink-0"
                >
                  <Palette className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {crimsonTheme ? 'Ajrak Royal Indigo' : 'Ajrak Crimson Silk'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <BolMizanLogo size="xl" animated />

                <div className="space-y-2">
                  <p dir="rtl" className="text-xl sm:text-2xl font-bold text-[#F59E0B]">
                    ڀلي ڪري آيا · سنڌ جي اجرڪ · صدقِ واپار
                  </p>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance leading-[1.12]">
                    BolMizan VERITAS-SOVEREIGN
                  </h1>
                  <p className="text-sm text-[#F8F7F3]/85 max-w-lg leading-relaxed">
                    Zero-Riba Trade Sovereignty, Real-Time Cognitive Scam Defense, and 100,000,000x Hard-Asset Compounding from Sindh to Global Markets.
                  </p>
                </div>
              </div>

              {/* Three Clear Sovereign Architecture Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F59E0B]/20 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-[#F59E0B]">0. Sovereign AI Shields</p>
                  <p className="text-[#F8F7F3]/80 leading-relaxed">
                    Bayesian anti-scam firewall, Riba truth-filter, and 0.01s 21-rail kill-switch.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-[#5EEAD4]">1. Sakrand-to-Gulf Vault</p>
                  <p className="text-[#F8F7F3]/80 leading-relaxed">
                    Zero-capital Basmati, Aseel Dates & Solar Mudarabah with Quran 2:282 contracts.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-[#FDE68A]">2. Hard-Asset Reserves</p>
                  <p className="text-[#F8F7F3]/80 leading-relaxed">
                    24K Gold bullion conversion, Indus farmland rights, and perpetual Waqf.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <HalaKashiFrieze className="text-[#F59E0B]/65" />
            </div>
          </section>

          {/* Right Panel: Interactive Illuminated Ajrak PIN Vault */}
          <section className="kashi-card ajrak-moving-glass lg:col-span-5 rounded-2xl overflow-hidden border border-[#F59E0B]/35 shadow-2xl flex flex-col justify-between">
            <ChromaticKashiRule />

            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between relative z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#F59E0B] flex items-center gap-1.5">
                    {isSessionLock ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#5EEAD4]" />}
                    {isSessionLock ? 'Vault Locked · Re-Authenticate' : 'Sovereign Command Gate'}
                  </span>
                  <span className="font-mono-tabular text-xs text-[#5EEAD4]">
                    PIN: 7860
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#F8F7F3]">
                  {isSessionLock ? 'Unlock Active Session' : 'Enter Command Center'}
                </h2>
                <p className="text-xs text-[#F8F7F3]/75">
                  Select your operating clarity profile and enter your Sovereign PIN to unseal all 21 rails.
                </p>
              </div>

              {/* Dual-Audience Mode Pre-Selector */}
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-[#F8F7F3]/80">
                  Operating Interface Profile
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-[#F59E0B]/25 ajrak-well">
                  <button
                    type="button"
                    onClick={() => onAudienceModeChange('sabzi-wala')}
                    className={`kashi-btn px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] ${
                      isSabzi
                        ? 'bg-[#9B1C2E] text-white shadow-sm border border-[#F59E0B]/30'
                        : 'text-[#F8F7F3]/75 hover:text-[#FDE68A]'
                    }`}
                  >
                    Sabzi-Wala Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => onAudienceModeChange('enterprise')}
                    className={`kashi-btn px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] ${
                      !isSabzi
                        ? 'bg-[#F59E0B] text-[#0D2327] shadow-sm'
                        : 'text-[#F8F7F3]/75 hover:text-[#FDE68A]'
                    }`}
                  >
                    Enterprise Mode
                  </button>
                </div>
              </div>

              {/* PIN Input + Tactile Gold-Dust Keypad */}
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div>
                  <label htmlFor="sovereign-gate-pin" className="sr-only">
                    Sovereign PIN
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="sovereign-gate-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      value={pin}
                      onChange={(e) => {
                        setError(null);
                        setPin(e.target.value);
                      }}
                      placeholder="Enter PIN (7860)"
                      className="flex-1 rounded-xl border border-[#F59E0B]/40 ajrak-well px-4 py-3 text-center text-lg font-mono-tabular tracking-[0.4em] text-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPin('7860');
                      }}
                      className="kashi-btn px-3.5 py-3 rounded-xl border border-[#F59E0B]/50 bg-[#9B1C2E]/40 text-[#FDE68A] text-xs font-bold whitespace-nowrap shrink-0 min-h-[48px]"
                      title="Fill Default Demo PIN 7860"
                    >
                      7860
                    </button>
                  </div>
                </div>

                {/* Tactile Numeric Keypad (Deep Ajrak Indigo + Gold-Dust Particles) */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => appendDigit(digit)}
                      className="kashi-btn py-2.5 rounded-lg border border-[#F59E0B]/25 bg-[#071D28]/90 text-sm font-mono-tabular font-bold text-[#F8F7F3] hover:border-[#F59E0B] hover:text-[#F59E0B] min-h-[42px]"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setPin('');
                    }}
                    className="kashi-btn py-2.5 rounded-lg border border-[#9B1C2E]/45 bg-[#360B17]/80 text-xs font-semibold text-rose-200 min-h-[42px]"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => appendDigit('0')}
                    className="kashi-btn py-2.5 rounded-lg border border-[#F59E0B]/25 bg-[#071D28]/90 text-sm font-mono-tabular font-bold text-[#F8F7F3] hover:border-[#F59E0B] hover:text-[#F59E0B] min-h-[42px]"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    aria-label="Backspace PIN digit"
                    onClick={() => setPin((p) => p.slice(0, -1))}
                    className="kashi-btn py-2.5 rounded-lg border border-[#14B8A6]/35 bg-[#07262B]/85 flex items-center justify-center text-[#5EEAD4] min-h-[42px]"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <p className="text-xs font-semibold text-rose-300 text-center">
                    {error}
                  </p>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="kashi-btn w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] text-[#08181B] text-sm font-bold flex items-center justify-center gap-2 shadow-lg min-h-[46px]"
                  >
                    {isSessionLock ? <Unlock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    {submitting
                      ? 'Unsealing Sovereign Vault...'
                      : isSessionLock
                        ? 'Unlock Sovereign Session'
                        : 'Enter Sovereign Command'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {isSessionLock && (
                    <button
                      type="button"
                      onClick={() => void handleSubmit(undefined, '7860')}
                      className="kashi-btn w-full py-2 rounded-lg border border-[#F59E0B]/35 bg-[#041017]/80 text-xs font-semibold text-[#FDE68A] hover:border-[#F59E0B]"
                    >
                      Quick Demo Unlock (PIN 7860)
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        </motion.div>
      </div>

      {/* Bottom Authentic Sindhi Ajrak Hand-Block Border */}
      <div className="no-print">
        <AjrakBlockBorder />
      </div>
    </div>
  );
};
