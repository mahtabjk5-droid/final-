import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  FileCheck2,
  MapPin,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import basmatiImg from '../assets/images/sakrand_basmati_mizan_1794637623859.jpg';
import datesImg from '../assets/images/khairpur_dates_mangoes_1794637623124.jpg';
import solarImg from '../assets/images/indus_solar_water_1794637624566.jpg';
import type { SovereignDeal, SovereignSystemState } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { AjrakClothPattern, ChromaticKashiRule, ResilientImage } from './SovereignArt';

interface SovereignDealVaultProps {
  state: SovereignSystemState;
  onStateRefresh: () => Promise<void>;
}

function getDealImage(deal: SovereignDeal): string {
  if (deal.sector === 'sector-2-solar-energy') return solarImg;
  if (deal.id.includes('dates') || deal.commodity.toLowerCase().includes('date')) return datesImg;
  return basmatiImg;
}

export const SovereignDealVault: React.FC<SovereignDealVaultProps> = ({
  state,
  onStateRefresh,
}) => {
  const [sectorFilter, setSectorFilter] = useState<'all' | 'sector-1-food-water' | 'sector-2-solar-energy'>('all');
  const [showNewForm, setShowNewForm] = useState(false);

  const [title, setTitle] = useState('');
  const [sector, setSector] = useState<'sector-1-food-water' | 'sector-2-solar-energy'>('sector-1-food-water');
  const [commodity, setCommodity] = useState('');
  const [supplierName, setSupplierName] = useState('Sakrand Producers Syndicate');
  const [buyerName, setBuyerName] = useState('Najd Al-Barakah Foods LLC (Riyadh)');
  const [destinationCity, setDestinationCity] = useState('Riyadh, Saudi Arabia');
  const [dealValuePkr, setDealValuePkr] = useState('2500000');
  const [ujrahPct, setUjrahPct] = useState('6.5');
  const [syndicateMembers, setSyndicateMembers] = useState('12');
  const [sadaqahPct, setSadaqahPct] = useState('7');
  const [defectDisclosure, setDefectDisclosure] = useState(
    '1.0% natural moisture tolerance disclosed upfront per Siddiq (RA) Zero-Hype Protocol.',
  );
  const [niyatHalal, setNiyatHalal] = useState(true);
  const [niyatZeroRiba, setNiyatZeroRiba] = useState(true);
  const [niyatNoDeception, setNiyatNoDeception] = useState(true);
  const [niyatLaborPriority, setNiyatLaborPriority] = useState(true);
  const [busy, setBusy] = useState(false);

  const [attestingId, setAttestingId] = useState<string | null>(null);
  const [witness1, setWitness1] = useState('Haji Abdul Karim Lakho');
  const [witness2, setWitness2] = useState('Engr. Tariq Mehmood Rahu');

  const niyatReady = niyatHalal && niyatZeroRiba && niyatNoDeception && niyatLaborPriority;

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !commodity.trim() || !Number(dealValuePkr) || !niyatReady) return;
    setBusy(true);
    try {
      const res = await fetch('/api/sovereign/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          sector,
          commodity,
          supplierName,
          buyerName,
          destinationCity,
          dealValuePkr: Number(dealValuePkr),
          ujrahMarginPct: sector === 'sector-1-food-water' ? Number(ujrahPct) : 0,
          mudarabahEquitySharePct: sector === 'sector-2-solar-energy' ? 22 : 0,
          syndicateMembers: Number(syndicateMembers) || 1,
          khufiyaSadaqahPct: Number(sadaqahPct) || 7,
          defectDisclosure,
        }),
      });
      if (res.ok) {
        triggerApexHaptic('seal_minted', 'New Sovereign Deal Created');
        setTitle('');
        setCommodity('');
        setShowNewForm(false);
        await onStateRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleAttest = async (dealId: string) => {
    if (!witness1.trim() || !witness2.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/sovereign/deals/${dealId}/attest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ witness1, witness2 }),
      });
      if (res.ok) {
        triggerApexHaptic('seal_minted', 'Otaq Majlis 2-Witness Attestation');
        setAttestingId(null);
        await onStateRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const filteredDeals = state.deals.filter((d) =>
    sectorFilter === 'all' ? true : d.sector === sectorFilter,
  );

  return (
    <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
      <ChromaticKashiRule />
      <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.075]" />
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#5EEAD4]">
              Zero-Capital Sakrand-to-Gulf Trade · Quran 2:282 Otaq Majlis Witness Protocol
            </p>
            <h2 className="font-display text-2xl font-bold text-[#F8F7F3]">
              Sovereign Deal Vault &amp; Niyat-Verified Exports
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-[#F59E0B]/25 bg-[#04141A]">
              {[
                { id: 'all', label: 'All Deals' },
                { id: 'sector-1-food-water', label: 'Agri & Food' },
                { id: 'sector-2-solar-energy', label: 'Solar & Water' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSectorFilter(tab.id as typeof sectorFilter)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    sectorFilter === tab.id
                      ? 'bg-[#0F766E] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowNewForm((s) => !s)}
              className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#05131B] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{showNewForm ? 'Close Deal Form' : 'Launch Zero-Capital Deal'}</span>
            </button>
          </div>
        </div>

        {showNewForm && (
          <form
            onSubmit={(e) => void handleCreateDeal(e)}
            className="rounded-xl border border-[#F59E0B]/35 bg-[#04141A] p-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deal Title (e.g. Sakrand Wheat Export)"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              />
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as typeof sector)}
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              >
                <option value="sector-1-food-water">Sector 1: Food &amp; Clean Water (Murabaha)</option>
                <option value="sector-2-solar-energy">Sector 2: Solar &amp; Micro-Grid (Mudarabah)</option>
              </select>
              <input
                type="text"
                required
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="Commodity & Volume"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Sakrand Supplier / Co-op"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Gulf / Domestic Buyer"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                required
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Destination City"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              />
              <input
                type="number"
                required
                min={1000}
                value={dealValuePkr}
                onChange={(e) => setDealValuePkr(e.target.value)}
                placeholder="Deal Value PKR"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-white"
              />
              <input
                type="number"
                min={1}
                max={100}
                value={syndicateMembers}
                onChange={(e) => setSyndicateMembers(e.target.value)}
                placeholder="Syndicate Shops"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-white"
              />
              <input
                type="number"
                min={5}
                max={10}
                value={sadaqahPct}
                onChange={(e) => setSadaqahPct(e.target.value)}
                placeholder="Khufiya Sadaqah % (5-10)"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-white"
              />
              <input
                type="text"
                value={ujrahPct}
                onChange={(e) => setUjrahPct(e.target.value)}
                placeholder="Ujrah Margin %"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-white"
              />
              <input
                type="text"
                value={defectDisclosure}
                onChange={(e) => setDefectDisclosure(e.target.value)}
                placeholder="Upfront Defect Disclosure"
                className="sm:col-span-2 rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              />
            </div>

            {/* 4-Point Niyat Gate Checklist */}
            <div className="rounded-lg border border-[#14B8A6]/25 bg-[#030D12] p-3.5 space-y-2">
              <div className="text-xs font-semibold text-[#5EEAD4]">
                Mandatory 4-Point Shariah Niyat Gate
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={niyatHalal} onChange={(e) => setNiyatHalal(e.target.checked)} className="accent-teal-500" />
                  <span>100% Halal Origin</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={niyatZeroRiba} onChange={(e) => setNiyatZeroRiba(e.target.checked)} className="accent-teal-500" />
                  <span>0% Riba / Zero Late Fee</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={niyatNoDeception} onChange={(e) => setNiyatNoDeception(e.target.checked)} className="accent-teal-500" />
                  <span>Upfront Defect Honesty</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={niyatLaborPriority} onChange={(e) => setNiyatLaborPriority(e.target.checked)} className="accent-teal-500" />
                  <span>Haq-e-Mazdoor Priority</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy || !niyatReady}
                className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] disabled:opacity-45 px-4 py-2 text-xs font-bold text-white"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{busy ? 'Minting Contract...' : 'Seal & Mint SHA-256 Contract'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {filteredDeals.map((deal) => (
            <article
              key={deal.id}
              className="rounded-xl border border-[#F59E0B]/25 bg-[#04141A] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 overflow-hidden">
                  <ResilientImage
                    src={getDealImage(deal)}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04141A] via-[#04141A]/35 to-transparent" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between gap-2">
                    <div className="font-mono-tabular text-sm font-bold text-[#FDE68A]">
                      PKR {deal.dealValuePkr.toLocaleString('en-US')}{' '}
                      <span className="text-[11px] text-[#5EEAD4]">
                        (${deal.dealValueUsd.toLocaleString('en-US')})
                      </span>
                    </div>
                    <span className="font-mono-tabular text-[11px] font-semibold text-white/90 capitalize">
                      {deal.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="text-[11px] text-[#5EEAD4]">
                    {deal.originCity} → {deal.destinationCity} ·{' '}
                    {deal.mudarabahEquitySharePct > 0
                      ? `${deal.mudarabahEquitySharePct}% Mudarabah (${deal.syndicateMembers} shops)`
                      : `${deal.ujrahMarginPct}% Ujrah`}
                  </div>
                  <h3 className="font-display text-base font-bold text-white leading-snug">
                    {deal.title}
                  </h3>
                  <div className="text-[11px] text-[#F8F7F3]/75 space-y-0.5">
                    <div><strong>Supplier:</strong> {deal.supplierName}</div>
                    <div><strong>Buyer:</strong> {deal.buyerName}</div>
                  </div>
                  <p className="text-[#F8F7F3]/75 text-[11px] leading-relaxed">
                    <strong>Siddiq (RA) Disclosure:</strong> {deal.defectDisclosure}
                  </p>

                  <div className="pt-1 text-[11px] font-mono-tabular text-[#5EEAD4]/90 space-y-1">
                    <div className="inline-flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{deal.warehouseProof.videoFileRef}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#F8F7F3]/65">
                      <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
                      <span>{deal.warehouseProof.gpsCoords}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>0% Riba Niyat Verified · {deal.khufiyaSadaqahPct}% Khufiya Sadaqah</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#F59E0B]/15 p-3.5 bg-[#030E13] space-y-2 text-[11px]">
                {deal.otaqMajlisWitnesses.shahadahHash ? (
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Otaq Majlis Witnessed</span>
                    </div>
                    <div className="text-[#F8F7F3]/70 truncate">
                      {deal.otaqMajlisWitnesses.witness1} &amp; {deal.otaqMajlisWitnesses.witness2}
                    </div>
                    <div className="font-mono-tabular text-[10px] text-[#5EEAD4]/80">
                      sha256:{deal.contractHash.slice(0, 14)}
                    </div>
                  </div>
                ) : attestingId === deal.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={witness1}
                      onChange={(e) => setWitness1(e.target.value)}
                      placeholder="Witness 1"
                      className="w-full rounded border border-[#F59E0B]/30 bg-[#04141A] px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={witness2}
                      onChange={(e) => setWitness2(e.target.value)}
                      placeholder="Witness 2"
                      className="w-full rounded border border-[#F59E0B]/30 bg-[#04141A] px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAttest(deal.id)}
                        className="flex-1 rounded bg-[#0F766E] py-1.5 font-bold text-white"
                      >
                        Record Shahadah
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttestingId(null)}
                        className="rounded border border-slate-600 px-2.5 py-1.5 text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAttestingId(deal.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#F59E0B]/40 py-1.5 font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Attest with 2 Otaq Majlis Witnesses</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
