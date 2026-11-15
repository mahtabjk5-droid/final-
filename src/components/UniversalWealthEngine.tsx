import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Compass, Globe2, HeartHandshake, ShieldCheck, Wallet } from 'lucide-react';
import type { AudienceMode, FXUnit } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { AjrakClothPattern, ChromaticKashiRule, HalaKashiCornerOrnament } from './SovereignArt';

interface UniversalWealthEngineProps {
  mode: AudienceMode;
  fxUnit: FXUnit;
}

const GOLD_PRICE_PKR_PER_G = 24_800;
const USD_TO_PKR = 278;
const NISAB_GOLD_GRAMS = 87.48;
const NISAB_PKR = Math.round(NISAB_GOLD_GRAMS * GOLD_PRICE_PKR_PER_G);

const WEALTH_PRESETS = [
  {
    id: 'vendor',
    label: 'Daily Sabzi-Wala',
    monthlyIncomePkr: 95_000,
    debtToClearPkr: 18_000,
    goldHedgePct: 12,
    opsPct: 68,
    sadaqahPct: 5,
    note: 'Protects a street vendor from 40% daily mandi loan sharks while automatically saving small 24K gold/cash reserves.',
  },
  {
    id: 'mill',
    label: 'Sakrand Rice Mill',
    monthlyIncomePkr: 4_500_000,
    debtToClearPkr: 600_000,
    goldHedgePct: 25,
    opsPct: 52,
    sadaqahPct: 7,
    note: 'Balances harvest working capital, zero-Riba supplier clearing, and inflation hedging against rupee volatility.',
  },
  {
    id: 'sovereign',
    label: 'Global Treasury ($25M)',
    monthlyIncomePkr: 6_950_000_000,
    debtToClearPkr: 0,
    goldHedgePct: 35,
    opsPct: 45,
    sadaqahPct: 5,
    note: 'Institutional planetary capital allocation: hard-asset commodity backing, 0% interest treasury liquidity, and transparent impact reserve.',
  },
] as const;

export const UniversalWealthEngine: React.FC<UniversalWealthEngineProps> = ({
  mode,
  fxUnit,
}) => {
  const [monthlyIncomePkr, setMonthlyIncomePkr] = useState<number>(
    mode === 'sabzi-wala' ? 95_000 : 4_500_000,
  );
  const [debtToClearPkr, setDebtToClearPkr] = useState<number>(
    mode === 'sabzi-wala' ? 18_000 : 600_000,
  );
  const [opsPct, setOpsPct] = useState<number>(55);
  const [goldHedgePct, setGoldHedgePct] = useState<number>(25);
  const [sadaqahPct, setSadaqahPct] = useState<number>(5);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    mode === 'sabzi-wala' ? 'vendor' : 'mill',
  );

  const safeReservePct = Math.max(0, 100 - opsPct - goldHedgePct - sadaqahPct);

  const formatMoney = (pkr: number): string => {
    if (fxUnit === 'USD') {
      const usd = pkr / USD_TO_PKR;
      if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
      return `$${Math.round(usd).toLocaleString('en-US')}`;
    }
    if (fxUnit === 'SAR') {
      const sar = pkr / 74.1;
      if (sar >= 1_000_000) return `SAR ${(sar / 1_000_000).toFixed(2)}M`;
      return `SAR ${Math.round(sar).toLocaleString('en-US')}`;
    }
    if (fxUnit === 'GOLD') {
      const g = pkr / GOLD_PRICE_PKR_PER_G;
      return `${g >= 100 ? Math.round(g).toLocaleString('en-US') : g.toFixed(2)}g Au`;
    }
    if (pkr >= 1_000_000_000) return `PKR ${(pkr / 1_000_000_000).toFixed(2)}B`;
    if (pkr >= 10_000_000) return `PKR ${(pkr / 1_000_000).toFixed(2)}M`;
    return `PKR ${Math.round(pkr).toLocaleString('en-US')}`;
  };

  const monthlyOpsPkr = Math.round((monthlyIncomePkr * opsPct) / 100);
  const monthlyGoldPkr = Math.round((monthlyIncomePkr * goldHedgePct) / 100);
  const monthlyReservePkr = Math.round((monthlyIncomePkr * safeReservePct) / 100);
  const monthlySadaqahPkr = Math.round((monthlyIncomePkr * sadaqahPct) / 100);

  const goldGramsPerMonth = Number((monthlyGoldPkr / GOLD_PRICE_PKR_PER_G).toFixed(2));
  const annualizedGoldGrams = Number((goldGramsPerMonth * 12).toFixed(1));
  const annualizedSadaqahPkr = monthlySadaqahPkr * 12;

  // Interest avoided vs 40% rural predatory / credit card APR over 12 months
  const annualRibaSavedPkr = Math.round(debtToClearPkr * 0.4 + monthlyIncomePkr * 0.08 * 12);

  // Zakat calculation based on annual net liquid savings vs Gold Nisab (87.48g Au)
  const projectedAnnualSavablePkr = (monthlyGoldPkr + monthlyReservePkr) * 12;
  const zakatEligible = projectedAnnualSavablePkr >= NISAB_PKR;
  const annualZakatDuePkr = zakatEligible ? Math.round(projectedAnnualSavablePkr * 0.025) : 0;

  const debtClearMonths =
    debtToClearPkr <= 0
      ? 0
      : Math.max(1, Math.ceil(debtToClearPkr / Math.max(2000, monthlyReservePkr)));

  const activePreset = WEALTH_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <section className="relative rounded-2xl overflow-hidden border border-[#F59E0B]/35 ajrak-moving-glass shadow-xl">
      <ChromaticKashiRule />
      <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.08]" />
      <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-55" />

      <div className="relative z-10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#F59E0B]/15 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-medium text-[#5EEAD4]">
              Universal Cashflow · Debt Liberation · 24K Inflation Hedge · Zakat Engine
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Any Scale Financial Solver: Street Cart to Sovereign Treasury
            </h2>
            <p className="text-xs sm:text-sm text-[#F8F7F3]/75">
              Eliminate predatory debt, allocate living &amp; operating cashflow, lock 24K gold against currency inflation, and compute automated Zakat/Sadaqah accuracy.
            </p>
          </div>

          {/* Instant Persona Presets */}
          <div className="flex flex-wrap gap-2">
            {WEALTH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setMonthlyIncomePkr(preset.monthlyIncomePkr);
                  setDebtToClearPkr(preset.debtToClearPkr);
                  setGoldHedgePct(preset.goldHedgePct);
                  setOpsPct(preset.opsPct);
                  setSadaqahPct(preset.sadaqahPct);
                  triggerApexHaptic('seal_minted', `Loaded ${preset.label}`);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedPresetId === preset.id
                    ? 'bg-[#F59E0B] text-[#05131B]'
                    : 'border border-[#F59E0B]/25 bg-[#041219] text-[#FDE68A] hover:border-[#F59E0B]/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <label className="space-y-1.5">
            <span className="text-[#F8F7F3]/80 font-medium">Monthly Revenue / Cash Inflow (PKR)</span>
            <input
              type="number"
              min={5000}
              step={5000}
              value={monthlyIncomePkr}
              onChange={(e) => {
                setSelectedPresetId('custom');
                setMonthlyIncomePkr(Math.max(1000, Number(e.target.value) || 0));
              }}
              className="w-full rounded-lg border border-[#F59E0B]/30 ajrak-well px-3.5 py-2.5 font-mono-tabular text-sm font-bold text-[#FDE68A]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[#F8F7F3]/80 font-medium">Existing Udhaar / Debt to Clear (PKR)</span>
            <input
              type="number"
              min={0}
              step={2000}
              value={debtToClearPkr}
              onChange={(e) => {
                setSelectedPresetId('custom');
                setDebtToClearPkr(Math.max(0, Number(e.target.value) || 0));
              }}
              className="w-full rounded-lg border border-[#14B8A6]/30 ajrak-well px-3.5 py-2.5 font-mono-tabular text-sm font-bold text-white"
            />
          </label>

          <label className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#F8F7F3]/80 font-medium">Ops / Family Essentials</span>
              <span className="font-mono-tabular font-bold text-[#5EEAD4]">{opsPct}%</span>
            </div>
            <input
              type="range"
              min={25}
              max={80}
              value={opsPct}
              onChange={(e) => {
                const next = Number(e.target.value);
                setOpsPct(next);
                if (next + goldHedgePct + sadaqahPct > 98) {
                  setGoldHedgePct(Math.max(5, 95 - next - sadaqahPct));
                }
              }}
              className="w-full accent-[#14B8A6] mt-2"
            />
          </label>

          <label className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#F8F7F3]/80 font-medium">24K Gold Inflation Shield</span>
              <span className="font-mono-tabular font-bold text-[#FDE68A]">{goldHedgePct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={45}
              value={goldHedgePct}
              onChange={(e) => {
                const next = Number(e.target.value);
                setGoldHedgePct(Math.min(next, 95 - opsPct - sadaqahPct));
              }}
              className="w-full accent-[#F59E0B] mt-2"
            />
          </label>
        </div>

        {/* Visual Segmented Allocation Ribbon */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-mono-tabular text-[#F8F7F3]/80">
            <span>Essentials &amp; Ops ({opsPct}%)</span>
            <span>Liquid Reserve ({safeReservePct}%)</span>
            <span>24K Gold Hedge ({goldHedgePct}%)</span>
            <span>Sadaqah ({sadaqahPct}%)</span>
          </div>
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#030B10] border border-[#F59E0B]/20">
            <motion.div
              className="bg-[#0F766E] h-full"
              animate={{ width: `${opsPct}%` }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              className="bg-sky-400 h-full"
              animate={{ width: `${safeReservePct}%` }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              className="bg-[#F59E0B] h-full"
              animate={{ width: `${goldHedgePct}%` }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              className="bg-[#9B1C2E] h-full"
              animate={{ width: `${sadaqahPct}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        {/* 4 Outcome Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#F59E0B]/15">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5EEAD4]">
              <Wallet className="w-3.5 h-3.5" />
              <span>Monthly Ops &amp; Debt Exit</span>
            </div>
            <div className="font-mono-tabular text-xl font-bold text-white">
              {formatMoney(monthlyOpsPkr)} / mo
            </div>
            <p className="text-[11px] text-[#F8F7F3]/70">
              {debtToClearPkr <= 0
                ? '100% Debt-Free Operating Surplus'
                : `Debt cleared in ~${debtClearMonths} mo via ${formatMoney(monthlyReservePkr)}/mo reserve`}
            </p>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FDE68A]">
              <Coins className="w-3.5 h-3.5" />
              <span>Inflation-Proof 24K Au</span>
            </div>
            <div className="font-mono-tabular text-xl font-bold text-[#FDE68A]">
              +{annualizedGoldGrams.toLocaleString('en-US')}g Au / yr
            </div>
            <p className="text-[11px] text-[#F8F7F3]/70">
              {formatMoney(monthlyGoldPkr)} locked monthly into hard gold reserve
            </p>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Predatory Interest Saved</span>
            </div>
            <div className="font-mono-tabular text-xl font-bold text-emerald-300">
              {formatMoney(annualRibaSavedPkr)} / yr
            </div>
            <p className="text-[11px] text-[#F8F7F3]/70">
              Saved against 40% mandi shark or high-APR commercial debt
            </p>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-300">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Zakat (2.5%) &amp; Sadaqah</span>
            </div>
            <div className="font-mono-tabular text-xl font-bold text-white">
              {zakatEligible ? `${formatMoney(annualZakatDuePkr)} Zakat` : 'Below Nisab'}
            </div>
            <p className="text-[11px] text-[#F8F7F3]/70">
              + {formatMoney(annualizedSadaqahPkr)}/yr voluntary Khufiya Sadaqah
            </p>
          </div>
        </div>

        {activePreset && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#F8F7F3]/75">
            <span className="inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{activePreset.note}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono-tabular text-[#5EEAD4]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Gold Nisab: PKR {NISAB_PKR.toLocaleString('en-US')} (87.48g Au)</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
