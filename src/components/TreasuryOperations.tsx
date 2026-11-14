import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  HandCoins,
  PackageCheck,
  Plus,
  Send,
} from 'lucide-react';
import { ApexFrontierCommandStrip } from './ApexFrontierCommandStrip';
import { MultiTenantKhataDesk } from './MultiTenantKhataDesk';
import { ChromaticKashiRule, MukasaLoopDiagram } from './SovereignArt';
import { SovereignDealVault } from './SovereignDealVault';
import type { SovereignSystemState } from '../types/sovereign';

interface TreasuryOperationsProps {
  state: SovereignSystemState;
  onStateRefresh: () => Promise<void>;
}

export const TreasuryOperations: React.FC<TreasuryOperationsProps> = ({
  state,
  onStateRefresh,
}) => {
  // Mukasa new debt edge form
  const [fromParty, setFromParty] = useState('');
  const [toParty, setToParty] = useState('');
  const [edgeAmount, setEdgeAmount] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [mukasaBusy, setMukasaBusy] = useState(false);

  // Haq-e-Mazdoor new worker wage form
  const [workerName, setWorkerName] = useState('');
  const [workerRole, setWorkerRole] = useState('Grain Sorter & Loader');
  const [raastId, setRaastId] = useState('0300-XXXX');
  const [wageAmount, setWageAmount] = useState('25000');
  const [sadaqahPct, setSadaqahPct] = useState(5);
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
      await fetch(`/api/sovereign/wages/${id}/settle`, { method: 'POST' });
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
    await onStateRefresh();
  };

  return (
    <div className="space-y-8">
      {/* 0. Production Multi-Tenant SQLite Shopkeeper Khata Vault */}
      <MultiTenantKhataDesk />

      {/* 1. v30.0 Apex Singularity & Out-of-the-Box Frontier Engines */}
      <ApexFrontierCommandStrip totalEstatePkr={state.totals.activeDealsPkr} />

      {/* 2. 100,000,000x Sovereign Deal Vault & Hard-Asset Compounding OS */}
      <SovereignDealVault state={state} onStateRefresh={onStateRefresh} />

      {/* 3. Mukasa Zero-Cash Circular Debt Clearinghouse */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
        <ChromaticKashiRule />
        <div className="p-6 space-y-6">
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
              {mukasaBusy ? 'Solving Graph...' : 'Detect & Clear Circular Loops'}
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
        <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
Usman Ghani (RA) Food & Essential Security


Maal-Guard 30% Pre-Expiry Flash Rescue



{state.maalGuard.map((lot) => (



{lot.item}

{lot.location} • {lot.quantityKg} kg • {lot.hoursRemaining}h window



-{lot.discountPct}% RESCUE

PKR {lot.originalPricePkr.toLocaleString('en-US')}


PKR {lot.rescuePricePkr.toLocaleString('en-US')}

{lot.rescued ? (

 Rescued ({lot.rescuedBy})

) : (
<button
type="button"
onClick={() => void handleRescueMaalGuard(lot.id)}
className="kashi-btn px-3.5 py-1.5 rounded-lg bg-[#0F766E] text-white font-semibold"
>
Execute Flash Rescue

)}


))}

{/* Haq-e-Mazdoor 0%-Fee Raast Payroll */}
Pay Before Sweat Dries • 0% Platform Fee


Haq-e-Mazdoor Direct Raast Wage Vault



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

 Add Worker

{state.wages.map((w) => (


{w.workerName}

{w.role} • {w.raastId} • Fee: PKR 0 (+PKR {w.sadaqahAttachedPkr} Sadaqah)




PKR {w.amountPkr.toLocaleString('en-US')}

{w.status === 'settled' ? (

 Settled

) : (
<button
type="button"
disabled={wageBusy}
onClick={() => void handleSettleWage(w.id)}
className="kashi-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F59E0B] text-[#05131B] font-bold"
>
 Pay 0% Fee

)}


))}




);
};