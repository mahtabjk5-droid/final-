import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Flame, Globe2, Layers, Sparkles } from 'lucide-react';
import { AjrakPixelParticle } from './AjrakPixelParticle';

interface ApexFrontierCommandStripProps {
  totalEstatePkr: number;
}

export const ApexFrontierCommandStrip: React.FC<ApexFrontierCommandStripProps> = ({
  totalEstatePkr,
}) => {
  const [syndicateShops, setSyndicateShops] = useState(32);
  const [cyclesPerYear, setCyclesPerYear] = useState(12);
  const [ujrahPct, setUjrahPct] = useState(6.5);
  const [sadaqahPct, setSadaqahPct] = useState(7);

  const avgDealPkr = Math.max(2_500_000, Math.round(totalEstatePkr / 3));
  const annualThroughputPkr = Math.round(avgDealPkr * cyclesPerYear * (syndicateShops / 16));
  const annualMarginPkr = Math.round(annualThroughputPkr * (ujrahPct / 100));
  const annualSadaqahPkr = Math.round(annualMarginPkr * (sadaqahPct / 100));
  const annualGoldGrams = Number(((annualMarginPkr * 0.35) / 24_800).toFixed(1));

  const cards = [
    {
      icon: Flame,
      tag: 'Zero-Capital Arbitrage',
      title: 'Sakrand Velocity',
      metric: `PKR ${(annualThroughputPkr / 1_000_000).toFixed(1)}M/yr`,
      sub: `${syndicateShops} syndicate shops · ${cyclesPerYear}x cycles`,
    },
    {
      icon: Coins,
      tag: '24K Gold Shield',
      title: 'Hard-Asset Reserve',
      metric: `${annualGoldGrams}g Au/yr`,
      sub: '35% net surplus hedged in 24K Au',
    },
    {
      icon: Globe2,
      tag: 'Gulf Corridor',
      title: 'Sakrand → Dubai → Riyadh',
      metric: `${ujrahPct}% Ujrah`,
      sub: '0% Riba · ISO-20022 + SBP Raast',
    },
    {
      icon: Layers,
      tag: 'Khufiya Sadaqah',
      title: 'Discreet Community Pool',
      metric: `PKR ${(annualSadaqahPkr / 1_000).toFixed(0)}K/yr`,
      sub: `${sadaqahPct}% silent allocation for wages & orphan aid`,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-[#F59E0B]/30 bg-gradient-to-r from-[#071A21] via-[#260914] to-[#082227] p-5 shadow-lg space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-2 font-semibold text-[#FDE68A]">
          <AjrakPixelParticle />
          <span>Zero-Capital Sakrand-to-Gulf Compounding Simulator</span>
        </span>
        <span className="font-mono-tabular text-xs text-[#5EEAD4]">
          Base Active Estate: PKR {(totalEstatePkr / 1_000_000).toFixed(2)}M · 0% Riba
        </span>
      </div>

      {/* Interactive Compounding Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border border-[#F59E0B]/15 bg-[#041016]/80 p-4 text-xs">
        <label className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#F8F7F3]/80">Syndicate Shops</span>
            <span className="font-mono-tabular font-bold text-[#FDE68A]">{syndicateShops} shops</span>
          </div>
          <input
            type="range"
            min={1}
            max={64}
            value={syndicateShops}
            onChange={(e) => setSyndicateShops(Number(e.target.value))}
            className="w-full accent-[#F59E0B]"
          />
        </label>

        <label className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#F8F7F3]/80">Trade Cycles / Year</span>
            <span className="font-mono-tabular font-bold text-[#5EEAD4]">{cyclesPerYear}x</span>
          </div>
          <input
            type="range"
            min={4}
            max={36}
            value={cyclesPerYear}
            onChange={(e) => setCyclesPerYear(Number(e.target.value))}
            className="w-full accent-[#14B8A6]"
          />
        </label>

        <label className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#F8F7F3]/80">Disclosed Ujrah Margin</span>
            <span className="font-mono-tabular font-bold text-[#FDE68A]">{ujrahPct}%</span>
          </div>
          <input
            type="range"
            min={2}
            max={15}
            step={0.5}
            value={ujrahPct}
            onChange={(e) => setUjrahPct(Number(e.target.value))}
            className="w-full accent-[#F59E0B]"
          />
        </label>

        <label className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#F8F7F3]/80">Khufiya Sadaqah (5%–10%)</span>
            <span className="font-mono-tabular font-bold text-emerald-300">{sadaqahPct}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={10}
            value={sadaqahPct}
            onChange={(e) => setSadaqahPct(Number(e.target.value))}
            className="w-full accent-[#10B981]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-xl border border-[#F59E0B]/20 bg-[#041016]/85 px-4 py-3.5 flex items-start justify-between gap-2"
            >
              <div>
                <div className="text-[11px] font-medium text-[#5EEAD4]">{c.tag}</div>
                <div className="text-sm font-bold text-white mt-0.5">{c.title}</div>
                <div className="text-xs text-[#F8F7F3]/70 mt-0.5">{c.sub}</div>
              </div>
              <div className="text-right shrink-0">
                <Icon className="w-4 h-4 text-[#F59E0B] ml-auto" />
                <div className="font-mono-tabular text-xs font-bold text-[#FDE68A] mt-1">
                  {c.metric}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#F8F7F3]/65">
        <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>
          Zero borrowed bank capital: buyer pre-commitments + Otaq Majlis witnesses fund supplier dispatch directly.
        </span>
      </div>
    </motion.section>
  );
};
