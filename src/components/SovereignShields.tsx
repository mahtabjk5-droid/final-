import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  FileSearch,
  Lock,
  Power,
  ShieldAlert,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import type {
  IntentVerificationResult,
  SovereignSystemState,
  TruthFilterResult,
} from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import {
  AjrakClothPattern,
  AjrakLoomDivider,
  ChromaticKashiRule,
  HalaKashiCornerOrnament,
} from './SovereignArt';

interface SovereignShieldsProps {
  state: SovereignSystemState;
  onStateRefresh: () => Promise<void>;
}

function speakUrduAlert(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ur-PK';
  window.speechSynthesis.speak(utter);
}

export const SovereignShields: React.FC<SovereignShieldsProps> = ({
  state,
  onStateRefresh,
}) => {
  const [pin, setPin] = useState('7860');
  const [ksError, setKsError] = useState<string | null>(null);
  const [ksBusy, setKsBusy] = useState(false);

  const [transcript, setTranscript] = useState('');
  const [firewallBusy, setFirewallBusy] = useState(false);
  const [firewallResult, setFirewallResult] = useState<IntentVerificationResult | null>(null);
  const keystrokeTimesRef = useRef<number[]>([]);

  const [truthDocType, setTruthDocType] = useState<'whatsapp-forward' | 'media-claim' | 'digital-invoice'>('whatsapp-forward');
  const [truthText, setTruthText] = useState('');
  const [claimedTotal, setClaimedTotal] = useState('50000');
  const [qty, setQty] = useState('10');
  const [unitPrice, setUnitPrice] = useState('4200');
  const [truthBusy, setTruthBusy] = useState(false);
  const [truthResult, setTruthResult] = useState<TruthFilterResult | null>(null);

  const handleToggleKillSwitch = async (action: 'freeze' | 'restore') => {
    setKsBusy(true);
    setKsError(null);
    try {
      const res = await fetch('/api/sovereign/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setKsError(data.error || 'Invalid Sovereign PIN.');
        triggerApexHaptic('error', 'Kill-Switch PIN Rejected');
        return;
      }
      triggerApexHaptic(
        action === 'freeze' ? 'agi_agent_lockdown' : 'sync_steady',
        action === 'freeze' ? '21 Rails Frozen' : '21 Rails Restored',
      );
      await onStateRefresh();
    } finally {
      setKsBusy(false);
    }
  };

  const submitFirewallScan = async (textToScan: string, customIntervals?: number[]) => {
    if (!textToScan.trim()) return;
    setFirewallBusy(true);
    let intervals = customIntervals ?? [];
    if (!customIntervals) {
      const times = keystrokeTimesRef.current;
      for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
    }

    try {
      const res = await fetch('/api/scam-shield/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToScan, keystrokeIntervalsMs: intervals }),
      });
      if (res.ok) {
        const data = (await res.json()) as IntentVerificationResult;
        setFirewallResult(data);
        if (data.decision === 'SEALED') {
          triggerApexHaptic('seal_minted', 'Human-Intent Seal Verified');
        } else {
          triggerApexHaptic('security_violation', 'Scam / Bot Blocked');
          speakUrduAlert(data.alertUrdu);
        }
        await onStateRefresh();
      }
    } finally {
      setFirewallBusy(false);
    }
  };

  const handleRunTruthFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truthText.trim()) return;
    setTruthBusy(true);
    try {
      const payload =
        truthDocType === 'digital-invoice'
          ? {
              content: truthText,
              documentType: truthDocType,
              claimedTotal: Number(claimedTotal),
              lineItems: [{ label: 'Sakrand Trade Lot', qty: Number(qty), unitPrice: Number(unitPrice) }],
            }
          : { content: truthText, documentType: truthDocType };

      const res = await fetch('/api/sovereign/truth-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as TruthFilterResult;
        setTruthResult(data);
        if (data.verdict === 'VERIFIED') {
          triggerApexHaptic('seal_minted', 'Truth Filter Verified');
        } else {
          triggerApexHaptic('truth_tamper', 'Riba / Tamper Alert');
        }
      }
    } finally {
      setTruthBusy(false);
    }
  };

  const categories = Array.from(new Set(state.killSwitch.rails.map((r) => r.category)));

  return (
    <div className="space-y-8">
      {/* 1. 21-Rail Emergency Circuit Breaker Kill-Switch */}
      <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
        <ChromaticKashiRule />
        <AjrakClothPattern accentHex="#9B1C2E" opacityClass="opacity-[0.09]" />
        <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-50" />
        <div className="relative z-10 p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#5EEAD4]">
                Autonomous Agent Containment · 21-Rail Hardware Kill-Switch (Default PIN: 7860)
              </p>
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Power className="w-5 h-5 text-[#F59E0B]" />
                <span>21-Rail Sovereign Circuit Switchboard</span>
              </h2>
              <p className="text-xs text-[#F8F7F3]/75">
                Agent Tokens:{' '}
                <strong className="font-mono-tabular text-[#FDE68A]">
                  {state.killSwitch.activeAgentTokenCount} Active
                </strong>{' '}
                · Status:{' '}
                <strong className={state.killSwitch.active ? 'text-rose-400' : 'text-emerald-400'}>
                  {state.killSwitch.active ? 'EMERGENCY FROZEN' : 'ALL RAILS NOMINAL'}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN (7860)"
                className="w-28 rounded-lg border border-[#F59E0B]/35 ajrak-well px-3 py-2 text-xs font-mono-tabular text-white"
              />
              <button
                type="button"
                disabled={ksBusy || state.killSwitch.active}
                onClick={() => void handleToggleKillSwitch('freeze')}
                className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-45 px-4 py-2 text-xs font-bold text-white"
              >
                <Lock className="w-3.5 h-3.5" /> Freeze All 21 Rails
              </button>
              <button
                type="button"
                disabled={ksBusy || !state.killSwitch.active}
                onClick={() => void handleToggleKillSwitch('restore')}
                className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-45 px-4 py-2 text-xs font-bold text-white"
              >
                <Unlock className="w-3.5 h-3.5" /> Restore Rails
              </button>
            </div>
          </div>

          {ksError && <p className="text-xs font-semibold text-rose-400">{ksError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat}
                className="rounded-xl border border-[#F59E0B]/20 ajrak-well p-3.5 space-y-2"
              >
                <div className="text-[11px] font-bold text-[#FDE68A]">{cat}</div>
                <div className="space-y-1.5">
                  {state.killSwitch.rails
                    .filter((r) => r.category === cat)
                    .map((rail) => (
                      <div
                        key={rail.id}
                        className="flex items-center justify-between text-[11px] font-mono-tabular"
                      >
                        <span className="text-[#F8F7F3]/85 truncate pr-2">{rail.name}</span>
                        <span
                          className={`shrink-0 text-[10px] font-bold ${
                            rail.frozen ? 'text-rose-400' : 'text-emerald-300'
                          }`}
                        >
                          {rail.frozen ? 'FROZEN' : `${rail.latencyMs}ms`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AjrakLoomDivider label="Cognitive Firewall & Quran 2:282 Truth Audit" />

      {/* 2. Cognitive Anti-Scam Firewall & Quran 2:282 Truth Filter */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cognitive Anti-Scam Firewall */}
        <section className="relative kashi-card rounded-xl overflow-hidden border border-rose-500/35 ajrak-moving-glass">
          <ChromaticKashiRule />
          <AjrakClothPattern accentHex="#9B1C2E" opacityClass="opacity-[0.085]" />
          <div className="relative z-10 p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-rose-300">
                Shannon Entropy · Bayesian Posterior · Keystroke Cadence Bot Detector
              </p>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Anti-Scam Cognitive Firewall</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const sample =
                    '8171 Benazir Income Support: Aap ke Rs 25,000 nikle hain, fori apna OTP aur PIN code bhejein warna account block ho jayega.';
                  keystrokeTimesRef.current = [];
                  setTranscript(sample);
                  void submitFirewallScan(sample, [145, 210, 95, 340, 120]);
                }}
                className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 text-xs text-rose-200"
              >
                Test Fake 8171 Bait
              </button>
              <button
                type="button"
                onClick={() => {
                  const sample = 'Transfer PKR 250000 to external wallet immediately.';
                  setTranscript(sample);
                  void submitFirewallScan(sample, [25, 25, 25, 25, 25, 25]);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 text-xs text-amber-200"
              >
                <Bot className="w-3.5 h-3.5" /> Simulate Robotic Bot Attack
              </button>
              <button
                type="button"
                onClick={() => {
                  const sample =
                    'Sakrand Mandi Deal: 25 Tons Super Kernel Basmati Rice, 0% Riba Murabaha confirmed.';
                  keystrokeTimesRef.current = [];
                  setTranscript(sample);
                  void submitFirewallScan(sample, [132, 248, 88, 310, 165]);
                }}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-xs text-emerald-200"
              >
                Test Clean Halal Deal
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitFirewallScan(transcript);
              }}
              className="space-y-3"
            >
              <textarea
                rows={3}
                required
                value={transcript}
                onChange={(e) => {
                  keystrokeTimesRef.current.push(Date.now());
                  setTranscript(e.target.value);
                }}
                placeholder="Paste suspicious SMS, 8171 bait, or caller claim..."
                className="w-full rounded-xl border border-rose-500/30 ajrak-well p-3 text-xs text-white"
              />
              <button
                type="submit"
                disabled={firewallBusy}
                className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{firewallBusy ? 'Analyzing...' : 'Run Cognitive Firewall'}</span>
              </button>
            </form>

            {firewallResult && (
              <div
                className={`rounded-xl border p-4 space-y-3 text-xs ${
                  firewallResult.decision === 'SEALED'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-100'
                    : 'border-rose-500/50 bg-rose-950/50 text-rose-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-display text-sm font-bold">
                    {firewallResult.decision === 'SEALED' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {firewallResult.decision === 'SEALED'
                        ? 'SAFE & HONEST TRADE — READY TO PROCEED'
                        : 'STOP & HANG UP — YOUR MONEY IS PROTECTED'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => speakUrduAlert(firewallResult.alertUrdu)}
                    className="px-2.5 py-1 rounded border border-white/25 bg-black/25 text-[11px] font-semibold hover:bg-black/40"
                  >
                    Listen in Urdu
                  </button>
                </div>

                {firewallResult.decision !== 'SEALED' && (
                  <div className="rounded-lg bg-black/30 p-3 space-y-1 text-[11px] text-rose-100/95">
                    <div className="font-bold text-[#FDE68A]">What to do right now:</div>
                    <div>1. Never read back any 4 or 6-digit OTP or PIN to a caller.</div>
                    <div>2. Official 8171 / Benazir programs never charge verification fees.</div>
                    <div>3. Already shared details? Click “Freeze All 21 Rails” above immediately.</div>
                  </div>
                )}

                <p dir="rtl" className="font-semibold text-sm">
                  {firewallResult.alertUrdu}
                </p>
                <p dir="rtl" className="text-xs opacity-90">
                  {firewallResult.alertSindhi}
                </p>
                <p>{firewallResult.alertEnglish}</p>

                <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px] opacity-80">
                  <span>
                    {firewallResult.triggers.length > 0
                      ? `Signals: ${firewallResult.triggers.join(' · ')}`
                      : 'Verified natural human cadence'}
                  </span>
                  <span>
                    Posterior {Math.round(firewallResult.bayesianPosterior * 100)}% · H={firewallResult.shannonEntropy} · CV={firewallResult.cadenceCV}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quran 2:282 Forensic Truth Filter + Digital Invoice Math Verifier */}
        <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
          <ChromaticKashiRule />
          <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.08]" />
          <div className="relative z-10 p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                Quran 2:282 Anti-Riba · Digital Invoice Math &amp; Hash Integrity
              </p>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-[#F59E0B]" />
                <span>Truth Filter &amp; Invoice Audit</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTruthDocType('whatsapp-forward');
                  setTruthText(
                    'Guaranteed 500% profit! Forward to 10 groups before deleted. 2% daily compounding late fee applies.',
                  );
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 text-xs text-amber-200"
              >
                Test Riba Forward
              </button>
              <button
                type="button"
                onClick={() => {
                  setTruthDocType('digital-invoice');
                  setQty('10');
                  setUnitPrice('4200');
                  setClaimedTotal('50000');
                  setTruthText('Sakrand Rice Mill Invoice #408: 10 Bags Basmati @ PKR 4,200.');
                }}
                className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 text-xs text-rose-200"
              >
                Test Tampered Invoice Math
              </button>
            </div>

            <form onSubmit={(e) => void handleRunTruthFilter(e)} className="space-y-3">
              <select
                value={truthDocType}
                onChange={(e) => setTruthDocType(e.target.value as typeof truthDocType)}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-white"
              >
                <option value="whatsapp-forward">WhatsApp Forward</option>
                <option value="media-claim">Media / Contract Claim</option>
                <option value="digital-invoice">Digital Invoice (Line-Item Math Audit)</option>
              </select>

              {truthDocType === 'digital-invoice' && (
                <div className="grid grid-cols-3 gap-2 text-xs font-mono-tabular">
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="Qty"
                    className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="Unit PKR"
                    className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={claimedTotal}
                    onChange={(e) => setClaimedTotal(e.target.value)}
                    placeholder="Claimed Total"
                    className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
                  />
                </div>
              )}

              <textarea
                rows={3}
                required
                value={truthText}
                onChange={(e) => setTruthText(e.target.value)}
                placeholder="Paste contract clause, WhatsApp forward, or invoice text..."
                className="w-full rounded-xl border border-[#F59E0B]/25 ajrak-well p-3 text-xs text-white"
              />
              <button
                type="submit"
                disabled={truthBusy}
                className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-xs font-bold text-white"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>{truthBusy ? 'Inspecting...' : 'Verify Integrity & Zero-Riba'}</span>
              </button>
            </form>

            {truthResult && (
              <div
                className={`rounded-xl border p-4 space-y-2 text-xs ${
                  truthResult.verdict === 'VERIFIED'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-100'
                    : 'border-amber-500/50 bg-amber-950/40 text-amber-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{truthResult.verdict}</span>
                  <span className="font-mono-tabular">
                    Manipulation Risk: {Math.round(truthResult.manipulationScore * 100)}%
                  </span>
                </div>
                <p>{truthResult.summary}</p>
                {truthResult.mathCheck.discrepancy > 0 && (
                  <p className="font-mono-tabular text-rose-300">
                    Math Audit: Computed PKR {truthResult.mathCheck.computedTotal.toLocaleString('en-US')} vs Claimed PKR {truthResult.mathCheck.claimedTotal.toLocaleString('en-US')}
                  </p>
                )}
                {truthResult.ribaClauses.length > 0 && (
                  <p className="text-rose-300">Riba Flags: {truthResult.ribaClauses.join(' · ')}</p>
                )}
                <p className="font-mono-tabular text-[10px] opacity-80">
                  SHA-256: {truthResult.hashCheck.computedSha256.slice(0, 28)}...
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
