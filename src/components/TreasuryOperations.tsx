import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Coins,
  HandCoins,
  LayoutGrid,
  PackageCheck,
  Plus,
  ReceiptText,
  Send,
} from 'lucide-react';
import type {
  AudienceMode,
  FXUnit,
  LocaleScript,
  QuickCommandDraft,
  SovereignSystemState,
} from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { ApexFrontierCommandStrip } from './ApexFrontierCommandStrip';
import { BolMizanSpreadChart } from './BolMizanSpreadChart';
import { MultiTenantKhataDesk } from './MultiTenantKhataDesk';
import { SabziParchiAtelier } from './SabziParchiAtelier';
import {
  AjrakClothPattern,
  AjrakLoomDivider,
  ChromaticKashiRule,
  HalaKashiCornerOrnament,
  MukasaLoopDiagram,
} from './SovereignArt';
import { SovereignDealVault } from './SovereignDealVault';
import { TreasurySpreadGoldChart } from './TreasurySpreadGoldChart';
import { UniversalWealthEngine } from './UniversalWealthEngine';

interface TreasuryOperationsProps {
  state: SovereignSystemState;
  mode: AudienceMode;
  script: LocaleScript;
  fxUnit: FXUnit;
  externalDraft?: QuickCommandDraft | null;
  onStateRefresh: () => Promise<void>;
}

type TreasuryLens = 'khata' | 'wealth' | 'exports' | 'clearing' | 'all';

export const TreasuryOperations: React.FC<TreasuryOperationsProps> = ({
  state,
  mode,
  script,
  fxUnit,
  externalDraft,
  onStateRefresh,
}) => {
  const [lens, setLens] = useState<TreasuryLens>('khata');
  const [fromParty, setFromParty] = useState('');
  const [toParty, setToParty] = useState('');
  const [edgeAmount, setEdgeAmount] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [mukasaBusy, setMukasaBusy] = useState(false);

  const [workerName, setWorkerName] = useState('');
  const [workerRole] = useState('Grain Sorter & Loader');
  const [raastId, setRaastId] = useState('0300-XXXX');
  const [wageAmount, setWageAmount] = useState('25000');
  const [sadaqahPct] = useState(5);
  const [wageBusy, setWageBusy] = useState(false);

  const handleAddMukasaEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromParty.trim() || !toParty.trim() || !Number(edgeAmount)) return;
    setMukasaBusy(true);
    try {
      await fetch('/api/sovereign/mukasa/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromParty,
          to: toParty,
          amountPkr: Number(edgeAmount),
          invoiceRef,
        }),
      });
      setFromParty('');
      setToParty('');
      setEdgeAmount('');
      setInvoiceRef('');
      await onStateRefresh();
    } finally {
      setMukasaBusy(false);
    }
  };

  const handleRunMukasaClear = async () => {
    setMukasaBusy(true);
    try {
      await fetch('/api/sovereign/mukasa/clear', { method: 'POST' });
      triggerApexHaptic('seal_minted', 'Mukasa Circular Clearing');
      await onStateRefresh();
    } finally {
      setMukasaBusy(false);
    }
  };

  const handleAddWage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim() || !raastId.trim() || !Number(wageAmount)) return;
    setWageBusy(true);
    try {
      await fetch('/api/sovereign/wages/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerName,
          role: workerRole,
          raastId,
          amountPkr: Number(wageAmount),
          sadaqahPct,
        }),
      });
      setWorkerName('');
      await onStateRefresh();
    } finally {
      setWageBusy(false);
    }
  };

  const handleSettleWage = async (id: string) => {
    setWageBusy(true);
    try {
      const res = await fetch(`/api/sovereign/wages/${id}/settle`, { method: 'POST' });
      if (res.ok) {
        triggerApexHaptic('sync_steady', 'Haq-e-Mazdoor 0%-Fee Settlement');
      }
      await onStateRefresh();
    } finally {
      setWageBusy(false);
    }
  };

  const handleRescueMaalGuard = async (id: string) => {
    await fetch(`/api/sovereign/maal-guard/${id}/rescue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rescuedBy: 'Sakrand & Karachi Bulk Buyer Syndicate' }),
    });
    triggerApexHaptic('seal_minted', 'Maal-Guard Flash Rescue');
    await onStateRefresh();
  };

  const switchLens = (next: TreasuryLens) => {
    setLens(next);
    triggerApexHaptic('tap', `Treasury Lens: ${next}`);
  };

  const showKhata = lens === 'khata' || lens === 'all';
  const showWealth = lens === 'wealth' || lens === 'all';
  const showExports = lens === 'exports' || lens === 'all';
  const showClearing = lens === 'clearing' || lens === 'all';

  return (
    <div id="treasury-studio" className="space-y-8">
      {/* Focused Interactive Workspace Lens Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F59E0B]/20 pb-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Universal Finance &amp; Mandi Workbench
          </h2>
          <p className="text-xs text-[#F8F7F3]/70">
            Every money problem solved in one workspace: daily Parchis, wealth/Zakat planning, global exports &amp; zero-cash debt clearing.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Treasury Workspace Lenses"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-[#F59E0B]/25 bg-[#041016]"
        >
          {([
            { id: 'khata', label: 'Parchi & Khata', icon: ReceiptText },
            { id: 'wealth', label: 'Cashflow, Gold & Zakat', icon: HandCoins },
            { id: 'exports', label: 'Exports & Deals', icon: Coins },
            { id: 'clearing', label: 'Mukasa & Wages', icon: ArrowRightLeft },
            { id: 'all', label: 'All Views', icon: LayoutGrid },
          ] as const).map((item) => {
            const Icon = item.icon;
            const active = lens === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchLens(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-[#F59E0B] text-[#05131B]'
                    : 'text-[#F8F7F3]/75 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lens 1: Parchi & SQLite Shopkeeper Khata */}
      {showKhata && (
        <motion.div
          key="lens-khata"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="space-y-8"
        >
          {mode === 'sabzi-wala' ? (
            <>
              <SabziParchiAtelier script={script} externalDraft={externalDraft} />
              <MultiTenantKhataDesk />
            </>
          ) : (
            <>
              <MultiTenantKhataDesk />
              <SabziParchiAtelier script={script} externalDraft={externalDraft} />
            </>
          )}
        </motion.div>
      )}

      {/* Lens 2: Universal Cashflow, Zakat, Inflation & Debt Solver */}
      {showWealth && (
        <motion.div
          key="lens-wealth"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <UniversalWealthEngine mode={mode} fxUnit={fxUnit} />
        </motion.div>
      )}

      {/* Lens 2: Simulator, D3 Gold Charts & Sovereign Deal Vault */}
      {showExports && (
        <motion.div
          key="lens-exports"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="space-y-8"
        >
          <ApexFrontierCommandStrip totalEstatePkr={state.totals.activeDealsPkr} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TreasurySpreadGoldChart
              deals={state.deals}
              goldEquivalentGrams={state.totals.goldEquivalentGrams}
            />
            <BolMizanSpreadChart
              deals={state.deals}
              goldEquivalentGrams={state.totals.goldEquivalentGrams}
            />
          </div>
          <SovereignDealVault state={state} onStateRefresh={onStateRefresh} />
        </motion.div>
      )}

      {/* Lens 3: Mukasa Circular Clearing, Maal-Guard Rescue & Wages */}
      {showClearing && (
        <motion.div
          key="lens-clearing"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="space-y-8"
        >
          <AjrakLoomDivider label="Mukasa Zero-Cash Graph · Food & Wage Security" />

          {/* Mukasa Zero-Cash Circular Debt Clearinghouse */}
          <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
            <ChromaticKashiRule />
            <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.08]" />
            <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-50" />
            <div className="relative z-10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#5EEAD4]">
                    Graph DFS Cycle Solver // Zero Bank Cash Movement
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#F8F7F3]">
                    Mukasa Circular Bazaar Debt Clearinghouse
                  </h2>
              <p className="text-xs text-[#F8F7F3]/75">
                Cumulative Bazaar Debt Cleared Without Bank Fees:{' '}
                <strong className="font-mono-tabular text-[#FDE68A]">
                  PKR {state.totals.mukasaClearedTotalPkr.toLocaleString('en-US')}
                </strong>
              </p>
            </div>
            <button
              type="button"
              disabled={mukasaBusy}
              onClick={() => void handleRunMukasaClear()}
              className="kashi-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white text-xs font-bold uppercase tracking-wider shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{mukasaBusy ? 'Solving Graph...' : 'Detect & Clear Circular Loops'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <MukasaLoopDiagram edges={state.mukasaEdges} />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={(e) => void handleAddMukasaEdge(e)}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2.5"
              >
                <input
                  type="text"
                  required
                  value={fromParty}
                  onChange={(e) => setFromParty(e.target.value)}
                  placeholder="Debtor (Owes)"
                  className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-[#F8F7F3]"
                />
                <input
                  type="text"
                  required
                  value={toParty}
                  onChange={(e) => setToParty(e.target.value)}
                  placeholder="Creditor (Owed To)"
                  className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-[#F8F7F3]"
                />
                <input
                  type="number"
                  required
                  min={100}
                  value={edgeAmount}
                  onChange={(e) => setEdgeAmount(e.target.value)}
                  placeholder="Amount PKR"
                  className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-[#F8F7F3]"
                />
                <button
                  type="submit"
                  disabled={mukasaBusy}
                  className="kashi-btn inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#F59E0B] text-[#05131B] px-3 py-2 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Debt Edge
                </button>
              </form>

              <div className="space-y-2">
                {state.mukasaEdges.map((edge) => (
                  <div
                    key={edge.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F59E0B]/20 ajrak-well px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular text-[#FDE68A]">{edge.invoiceRef}</span>
                      <span className="font-semibold text-[#F8F7F3]">{edge.from}</span>
                      <span className="text-[#5EEAD4]">→</span>
                      <span className="font-semibold text-[#F8F7F3]">{edge.to}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono-tabular">
                      <span className="font-bold text-[#FDE68A]">
                        PKR {edge.amountPkr.toLocaleString('en-US')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          edge.cleared
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {edge.cleared ? 'CLEARED (0 CASH)' : 'OPEN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {state.lastMukasaReport && (
                <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/40 p-3.5 text-xs text-emerald-200">
                  <strong>Latest Mukasa Run:</strong> Detected{' '}
                  {state.lastMukasaReport.cyclesDetected} loop(s) and cleared{' '}
                  <span className="font-mono-tabular font-bold">
                    PKR {state.lastMukasaReport.totalClearedPkr.toLocaleString('en-US')}
                  </span>{' '}
                  with zero cash movement.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Maal-Guard 30% Pre-Expiry Rescue & Haq-e-Mazdoor 0%-Fee Raast Payroll */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Maal-Guard 30% Flash Expiry Rescue */}
        <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
          <ChromaticKashiRule />
          <AjrakClothPattern accentHex="#14B8A6" opacityClass="opacity-[0.075]" />
          <div className="relative z-10 p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                Usman Ghani (RA) Food &amp; Essential Security
              </p>
              <h3 className="font-display text-xl font-bold text-[#F8F7F3] flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#F59E0B]" />
                <span>Maal-Guard 30% Pre-Expiry Flash Rescue</span>
              </h3>
            </div>

            <div className="space-y-3">
              {state.maalGuard.map((lot) => (
                <div
                  key={lot.id}
                  className="rounded-xl border border-[#F59E0B]/20 ajrak-well p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white">{lot.item}</div>
                    <div className="text-[#F8F7F3]/70 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5EEAD4]" />
                      <span>
                        {lot.location} • {lot.quantityKg} kg • {lot.hoursRemaining}h window
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono-tabular">
                      <div className="text-[10px] font-bold text-emerald-300">
                        -{lot.discountPct}% RESCUE
                      </div>
                      <div className="text-[11px] line-through text-slate-400">
                        PKR {lot.originalPricePkr.toLocaleString('en-US')}
                      </div>
                      <div className="font-bold text-[#FDE68A]">
                        PKR {lot.rescuePricePkr.toLocaleString('en-US')}
                      </div>
                    </div>

                    {lot.rescued ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Rescued ({lot.rescuedBy})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleRescueMaalGuard(lot.id)}
                        className="kashi-btn px-3.5 py-2 rounded-lg bg-[#0F766E] text-white font-semibold"
                      >
                        Execute Flash Rescue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Haq-e-Mazdoor 0%-Fee Raast Payroll */}
        <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
          <ChromaticKashiRule />
          <AjrakClothPattern accentHex="#9B1C2E" opacityClass="opacity-[0.08]" />
          <div className="relative z-10 p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                Pay Before Sweat Dries • 0% Platform Fee
              </p>
              <h3 className="font-display text-xl font-bold text-[#F8F7F3] flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-[#F59E0B]" />
                <span>Haq-e-Mazdoor Direct Raast Wage Vault</span>
              </h3>
            </div>

            <form
              onSubmit={(e) => void handleAddWage(e)}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2"
            >
              <input
                type="text"
                required
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder="Worker Name"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-[#F8F7F3]"
              />
              <input
                type="text"
                required
                value={raastId}
                onChange={(e) => setRaastId(e.target.value)}
                placeholder="Raast Mobile ID"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-[#F8F7F3]"
              />
              <input
                type="number"
                required
                min={500}
                value={wageAmount}
                onChange={(e) => setWageAmount(e.target.value)}
                placeholder="PKR Wage"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs font-mono-tabular text-[#F8F7F3]"
              />
              <button
                type="submit"
                disabled={wageBusy}
                className="kashi-btn inline-flex items-center justify-center gap-1 rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-bold text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Add Worker
              </button>
            </form>

            <div className="space-y-2.5">
              {state.wages.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-[#F59E0B]/20 ajrak-well p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{w.workerName}</div>
                    <div className="text-[11px] text-[#F8F7F3]/70">
                      {w.role} • {w.raastId} • Fee: PKR 0 (+PKR {w.sadaqahAttachedPkr} Sadaqah)
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono-tabular">
                    <span className="font-bold text-[#FDE68A]">
                      PKR {w.amountPkr.toLocaleString('en-US')}
                    </span>
                    {w.status === 'settled' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={wageBusy}
                        onClick={() => void handleSettleWage(w.id)}
                        className="kashi-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F59E0B] text-[#05131B] font-bold"
                      >
                        <Send className="w-3 h-3" /> Pay 0% Fee
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
        </motion.div>
      )}
    </div>
  );
};
