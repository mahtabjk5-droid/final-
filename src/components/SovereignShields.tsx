import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Volume2,
} from 'lucide-react';
import { ApexHapticControlCard } from './ApexHapticControlCard';
import { CadenceOscilloscope, ChromaticKashiRule } from './SovereignArt';
import { triggerApexHaptic } from '../utils/haptics';
import type {
  AudienceMode,
  IntentVerificationResult,
  SovereignSystemState,
  TruthFilterResult,
} from '../types/sovereign';

interface SovereignShieldsProps {
  state: SovereignSystemState;
  mode: AudienceMode;
  isConnected: boolean;
  lastSyncAt?: string | null;
  onStateRefresh: () => Promise<void>;
}

const QuantumHeartbeatAura: React.FC<{
  active: boolean;
  frozen: boolean;
  delaySeconds?: number;
}> = ({ active, frozen, delaySeconds = 0 }) => {
  if (!active) return null;
  const gradient = frozen
    ? 'radial-gradient(circle at 82% 18%, rgba(225, 29, 72, 0.34) 0%, rgba(245, 158, 11, 0.16) 36%, transparent 68%)'
    : 'radial-gradient(circle at 82% 18%, rgba(20, 184, 166, 0.28) 0%, rgba(245, 158, 11, 0.16) 34%, transparent 68%)';
  const ringShadow = frozen
    ? 'inset 0 0 0 1px rgba(251, 113, 133, 0.45), inset 0 1px 18px rgba(225, 29, 72, 0.22)'
    : 'inset 0 0 0 1px rgba(94, 234, 212, 0.4), inset 0 1px 18px rgba(20, 184, 166, 0.18)';

  return (
    <>
      <div
        aria-hidden="true"
        className="quantum-heartbeat-radial"
        style={{
          background: gradient,
          animationDelay: `${delaySeconds}s`,
        }}
      />
      <div
        aria-hidden="true"
        className="quantum-heartbeat-ring"
        style={{
          boxShadow: ringShadow,
          animationDelay: `${delaySeconds}s`,
        }}
      />
    </>
  );
};

const SCAM_PRESETS = [
  {
    label: '8171 / BISP Fake SMS',
    text: 'Mubarak! 8171 Benazir Income Support Rs 25,000 approved. Send Rs 1,500 fee immediately and share your OTP PIN code before account block.',
  },
  {
    label: 'Fake Bank / Easypaisa Call',
    text: 'Assalam o Alaikum main State Bank / Easypaisa manager bol raha hoon. Aapka account aaj block ho jayega, fori apna MPIN aur 6 digit OTP code batayein.',
  },
  {
    label: 'Genuine Sakrand Rice Deal',
    text: 'Al-Sindh Rice Millers Sakrand dispatching 20 tons Super Kernel Basmati to Riyadh buyer under Quran 2:282 Murabaha with 2 Otaq witnesses.',
  },
];

export const SovereignShields: React.FC<SovereignShieldsProps> = ({
  state,
  mode,
  isConnected,
  lastSyncAt,
  onStateRefresh,
}) => {
  // Protocol 1 state
  const [intentText, setIntentText] = useState(SCAM_PRESETS[2].text);
  const [actionContext, setActionContext] = useState('Outbound Murabaha Dispatch');
  const [intervals, setIntervals] = useState<number[]>([]);
  const lastKeyTimeRef = useRef<number | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentVerificationResult | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);

  // Protocol 2 state
  const [docType, setDocType] = useState<'whatsapp-forward' | 'media-claim' | 'digital-invoice'>('digital-invoice');
  const [truthText, setTruthText] = useState(
    'Invoice #SKR-902: Sakrand Basmati 10 tons @ 280,000/ton + Cold storage 120,000. Note: 2% daily compounding late fee applies after 3 days.',
  );
  const [declaredHash, setDeclaredHash] = useState('');
  const [claimedTotal, setClaimedTotal] = useState('3100000');
  const [truthLoading, setTruthLoading] = useState(false);
  const [truthResult, setTruthResult] = useState<TruthFilterResult | null>(null);
  const [truthError, setTruthError] = useState<string | null>(null);

  // Protocol 3 state
  const [pinInput, setPinInput] = useState('');
  const [killSwitchLoading, setKillSwitchLoading] = useState(false);
  const [killSwitchMessage, setKillSwitchMessage] = useState<string | null>(null);

  const isSabziMode = mode === 'sabzi-wala';

  const speakAlert = (text: string, lang: 'ur-PK' | 'en-US') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleCadenceInput = () => {
    const now = performance.now();
    if (lastKeyTimeRef.current !== null) {
      const delta = Math.round(now - lastKeyTimeRef.current);
      if (delta > 0 && delta < 5000) {
        setIntervals((prev) => [...prev.slice(-39), delta]);
      }
    }
    lastKeyTimeRef.current = now;
  };

  const handleVerifyIntent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!intentText.trim()) return;
    setIntentLoading(true);
    setIntentError(null);
    try {
      const res = await fetch('/api/sovereign/verify-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: intentText,
          keystrokeIntervalsMs: intervals,
          actionContext,
        }),
      });
      const data = (await res.json()) as IntentVerificationResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Intent verification failed (HTTP ${res.status})`);
      }
      setIntentResult(data);
      if (data.decision === 'SEALED') {
        triggerApexHaptic('seal_minted', 'Protocol 1 Human-Intent Seal');
      } else {
        triggerApexHaptic('security_violation', 'Protocol 1 Anti-Scam Firewall');
      }
      if (data.decision !== 'SEALED' && isSabziMode) {
        speakAlert(data.alertUrdu, 'ur-PK');
      }
      await onStateRefresh();
    } catch (err) {
      triggerApexHaptic('error', 'Protocol 1 Network Fault');
      setIntentError(err instanceof Error ? err.message : 'Unable to verify intent right now.');
    } finally {
      setIntentLoading(false);
    }
  };

  const handleRunTruthFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truthText.trim()) return;
    setTruthLoading(true);
    setTruthError(null);
    try {
      const sampleLineItems =
        docType === 'digital-invoice'
          ? [
              { label: 'Sakrand Basmati (10 Tons)', qty: 10, unitPrice: 280_000 },
              { label: 'Cold Storage Handling', qty: 1, unitPrice: 120_000 },
            ]
          : [];

      const res = await fetch('/api/sovereign/truth-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: truthText,
          documentType: docType,
          declaredHash: declaredHash.trim() || undefined,
          claimedTotal: docType === 'digital-invoice' ? Number(claimedTotal) || 0 : undefined,
          lineItems: sampleLineItems,
        }),
      });
      const data = (await res.json()) as TruthFilterResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Truth-Filter failed (HTTP ${res.status})`);
      }
      setTruthResult(data);
      if (data.verdict === 'VERIFIED') {
        triggerApexHaptic('sync_steady', 'Protocol 2 Verified Clean');
      } else {
        triggerApexHaptic('truth_tamper', 'Protocol 2 Riba & Tamper Scanner');
      }
    } catch (err) {
      triggerApexHaptic('error', 'Protocol 2 Scanner Fault');
      setTruthError(err instanceof Error ? err.message : 'Unable to run forensic truth-filter.');
    } finally {
      setTruthLoading(false);
    }
  };

  const handleToggleKillSwitch = async (action: 'freeze' | 'restore', overridePin?: string) => {
    const effectivePin = overridePin ?? pinInput;
    if (!effectivePin.trim()) {
      triggerApexHaptic('error', 'Kill-Switch PIN Required');
      setKillSwitchMessage('Enter Sovereign PIN (default 7860) to authorize rail control.');
      return;
    }
    setKillSwitchLoading(true);
    setKillSwitchMessage(null);
    try {
      const res = await fetch('/api/sovereign/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: effectivePin, action }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        triggerApexHaptic('security_violation', 'Invalid Kill-Switch Authorization');
        setKillSwitchMessage(data.error || 'PIN authorization rejected.');
      } else {
        triggerApexHaptic(
          action === 'freeze' ? 'agi_agent_lockdown' : 'sync_steady',
          action === 'freeze' ? 'Protocol 3 AGI Kill-Switch Freeze' : 'Protocol 3 Rails Restored',
        );
        setKillSwitchMessage(
          action === 'freeze'
            ? 'EMERGENCY FREEZE EXECUTED: All AI agent tokens revoked and 21 outbound rails locked.'
            : 'SOVEREIGN RAILS RESTORED: 21 outbound payment rails active.',
        );
        if (isSabziMode) {
          speakAlert(
            action === 'freeze'
              ? 'ایمرجنسی لاک فعال ہو گیا ہے۔ تمام ادائیگیاں روک دی گئی ہیں۔'
              : 'تمام ادائیگی کے راستے بحال کر دیے گئے ہیں۔',
            'ur-PK',
          );
        }
        setPinInput('');
      }
      await onStateRefresh();
    } catch (err) {
      triggerApexHaptic('error', 'Kill-Switch Transport Fault');
      setKillSwitchMessage(err instanceof Error ? err.message : 'Kill-Switch request failed.');
    } finally {
      setKillSwitchLoading(false);
    }
  };

  const handleResetDemo = async () => {
    const effectivePin = pinInput.trim();
    if (!effectivePin) {
      triggerApexHaptic('error', 'Ledger Reset PIN Required');
      setKillSwitchMessage('Enter Sovereign PIN (default 7860) to reset the demo ledger.');
      return;
    }
    setKillSwitchLoading(true);
    setKillSwitchMessage(null);
    try {
      const res = await fetch('/api/sovereign/reset-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: effectivePin }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        triggerApexHaptic('security_violation', 'Invalid Ledger Reset PIN');
        setKillSwitchMessage(data.error || 'PIN authorization rejected for ledger reset.');
      } else {
        triggerApexHaptic('sync_steady', 'Sovereign Ledger Sync Restored');
        setKillSwitchMessage('SOVEREIGN LEDGER RESTORED: All deals, Mukasa edges, and Raast wages reset to Sakrand seed state.');
        setPinInput('');
      }
      await onStateRefresh();
    } catch (err) {
      triggerApexHaptic('error', 'Ledger Reset Fault');
      setKillSwitchMessage(err instanceof Error ? err.message : 'Ledger reset failed.');
    } finally {
      setKillSwitchLoading(false);
    }
  };

  const railCategories = useMemo(() => {
    const groups = new Map<string, typeof state.killSwitch.rails>();
    for (const rail of state.killSwitch.rails) {
      if (!groups.has(rail.category)) groups.set(rail.category, []);
      groups.get(rail.category)!.push(rail);
    }
    return Array.from(groups.entries());
  }, [state.killSwitch.rails]);

  return (
    <div className="space-y-8">
      {/* Quantum Heartbeat Real-Time WebSocket Telemetry Strip */}
      <div
        className={`rounded-xl border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
          isConnected
            ? state.killSwitch.active
              ? 'border-rose-500/35 bg-[#2A0814]/70'
              : 'border-[#14B8A6]/35 bg-[#051B22]/75'
            : 'border-[#F59E0B]/20 bg-[#05141D]/75'
        }`}
      >
        <div className="flex items-center gap-2.5 text-xs">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            {isConnected && (
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  state.killSwitch.active ? 'bg-rose-400' : 'bg-[#14B8A6]'
                }`}
              />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected
                  ? state.killSwitch.active
                    ? 'bg-rose-500'
                    : 'bg-[#14B8A6]'
                  : 'bg-amber-400'
              }`}
            />
          </span>
          <Activity
            className={`w-3.5 h-3.5 shrink-0 ${
              isConnected
                ? state.killSwitch.active
                  ? 'text-rose-400'
                  : 'text-[#5EEAD4]'
                : 'text-amber-300'
            }`}
          />
          <span className="font-semibold text-[#F8F7F3]">
            Quantum Heartbeat:
          </span>
          <span
            className={
              isConnected
                ? state.killSwitch.active
                  ? 'text-rose-300 font-medium'
                  : 'text-[#5EEAD4] font-medium'
                : 'text-amber-200/85'
            }
          >
            {isConnected
              ? state.killSwitch.active
                ? 'Active Lock Pulse (21 Rails Frozen)'
                : 'Real-Time WebSocket Sync Active'
              : 'Standby (HTTP Sync Mode)'}
          </span>
        </div>
        {lastSyncAt && (
          <span className="font-mono-tabular text-[11px] text-[#F8F7F3]/65">
            Last Sync: {new Date(lastSyncAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Apex Haptic Feedback Telemetry & AGI Agent Guardrails */}
      <ApexHapticControlCard
        activeAgentTokenCount={state.killSwitch.activeAgentTokenCount}
        killSwitchActive={state.killSwitch.active}
        isConnected={isConnected}
      />

      {/* Sabzi-Wala 1-Tap Emergency Banner (Only in Sabzi-Wala Mode for ultra-fast field use) */}
      {isSabziMode && (
        <section className="kashi-card relative overflow-hidden rounded-xl border border-[#9B1C2E]/30 dark:border-[#F59E0B]/40 bg-[#9B1C2E]/[0.06] dark:bg-[#F59E0B]/[0.08] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <QuantumHeartbeatAura active={isConnected} frozen={state.killSwitch.active} delaySeconds={0.2} />
          <div className="relative z-10 space-y-1">
            <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
              فوری تحفظ بٹن · 1-Tap Sovereign Payment Lock
            </h2>
            <p className="text-sm text-[#0D2327]/80 dark:text-[#F8F7F3]/80">
              اگر کوئی مشکوک کال یا 8171/ایزی پیسہ پیغام آئے تو فوراً تمام ادائیگی کے راستے بند کریں۔
            </p>
          </div>
          <button
            type="button"
            disabled={killSwitchLoading}
            onClick={() =>
              void handleToggleKillSwitch(state.killSwitch.active ? 'restore' : 'freeze', '7860')
            }
            className={`relative z-10 kashi-btn px-5 py-3 rounded-lg text-sm font-bold whitespace-nowrap shrink-0 min-h-[44px] flex items-center gap-2 ${
              state.killSwitch.active
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-[#9B1C2E] hover:bg-[#7F1524] text-white'
            }`}
          >
            {state.killSwitch.active ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {state.killSwitch.active ? 'Restore Payments (PIN 7860)' : '1-Tap Freeze All Payments'}
          </button>
        </section>
      )}

      {/* Protocol 1 & Protocol 2 Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Protocol 1: Cognitive Proof-of-Intent & Anti-Scam Firewall */}
        <section className="kashi-card relative rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
          <QuantumHeartbeatAura active={isConnected} frozen={state.killSwitch.active} delaySeconds={0} />
          <ChromaticKashiRule />
          <div className="relative z-10 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#0F766E] dark:text-[#5EEAD4]">
                  Protocol 1 · Cognitive Firewall
                </p>
                <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                  Proof-of-Intent & Anti-Scam Firewall
                </h2>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#9B1C2E] dark:text-[#F59E0B] shrink-0" />
            </div>

          <div className="flex flex-wrap gap-2">
            {SCAM_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setIntentText(preset.text);
                  setIntervals([112, 148, 95, 184, 129, 161, 108]);
                }}
                className="px-3 py-1.5 rounded-md border border-[#0D2327]/15 dark:border-[#F8F7F3]/20 text-xs font-medium text-[#0D2327] dark:text-[#F8F7F3] hover:bg-[#0D2327]/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void handleVerifyIntent(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0D2327]/75 dark:text-[#F8F7F3]/75 mb-1.5">
                Action Context
              </label>
              <input
                type="text"
                value={actionContext}
                onChange={(e) => setActionContext(e.target.value)}
                className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3.5 py-2 text-sm text-[#0D2327] dark:text-[#F8F7F3] focus:outline-none focus:ring-2 focus:ring-[#9B1C2E] dark:focus:ring-[#F59E0B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#0D2327]/75 dark:text-[#F8F7F3]/75">
                  Call Transcript, SMS, or Trade Instruction (Cadence Measured Live)
                </label>
                <span className="font-mono-tabular text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">
                  {intervals.length} keystroke intervals
                </span>
              </div>
              <textarea
                rows={3}
                value={intentText}
                onKeyDown={handleCadenceInput}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder="Type or paste suspicious SMS/call transcript (Urdu, Sindhi, English)..."
                className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3.5 py-2.5 text-sm text-[#0D2327] dark:text-[#F8F7F3] focus:outline-none focus:ring-2 focus:ring-[#9B1C2E] dark:focus:ring-[#F59E0B]"
              />
            </div>

            <CadenceOscilloscope
              intervals={intervals}
              posterior={intentResult ? intentResult.bayesianPosterior : null}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={intentLoading}
                className="kashi-btn px-4 py-2.5 rounded-lg bg-[#0D2327] dark:bg-[#F59E0B] text-white dark:text-[#0D2327] text-xs font-semibold hover:opacity-95 whitespace-nowrap shrink-0 min-h-[40px]"
              >
                {intentLoading ? 'Analyzing Intent...' : 'Verify Intent & Mint Seal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntervals([]);
                  lastKeyTimeRef.current = null;
                }}
                className="kashi-btn px-3.5 py-2 rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 text-xs font-medium text-[#0D2327] dark:text-[#F8F7F3] hover:bg-[#0D2327]/5 dark:hover:bg-white/5 whitespace-nowrap shrink-0 min-h-[40px]"
              >
                Reset Cadence Buffer
              </button>
            </div>
          </form>

          {intentError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/45 bg-rose-950/60 px-3.5 py-2 text-xs text-rose-200"
            >
              {intentError}
            </div>
          )}

          {intentResult && (
            <div className="rounded-lg border border-[#0D2327]/15 dark:border-[#F8F7F3]/15 ajrak-well text-[#F8F7F3] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {intentResult.decision === 'SEALED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-[#9B1C2E] dark:text-rose-400 shrink-0" />
                  )}
                  <span className="text-sm font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                    {intentResult.decision === 'SEALED'
                      ? 'SEALED · Authentic Human Intent'
                      : 'INTERCEPTED · Scam / Coercion Blocked'}
                  </span>
                </div>
                <span className="font-mono-tabular text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
                  {intentResult.latencyMs} ms
                </span>
              </div>

              <div className="space-y-1 text-sm text-[#0D2327]/85 dark:text-[#F8F7F3]/85">
                <p dir="rtl" className="text-right font-medium">{intentResult.alertUrdu}</p>
                <p dir="rtl" className="text-right text-xs text-[#0D2327]/70 dark:text-[#F8F7F3]/70">
                  {intentResult.alertSindhi}
                </p>
                <p className="text-xs text-[#0D2327]/70 dark:text-[#F8F7F3]/70">{intentResult.alertEnglish}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => speakAlert(intentResult.alertUrdu, 'ur-PK')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 text-xs font-medium text-[#0D2327] dark:text-[#F8F7F3] hover:bg-[#0D2327]/5 dark:hover:bg-white/5"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Speak Urdu Alert
                </button>
                <button
                  type="button"
                  onClick={() => speakAlert(intentResult.alertEnglish, 'en-US')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 text-xs font-medium text-[#0D2327] dark:text-[#F8F7F3] hover:bg-[#0D2327]/5 dark:hover:bg-white/5"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Speak English Alert
                </button>
              </div>

              {!isSabziMode && (
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#0D2327]/10 dark:border-[#F8F7F3]/10">
                  <div>
                    <p className="text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Bayesian P(Scam)</p>
                    <p className="font-mono-tabular text-sm font-semibold text-[#0D2327] dark:text-[#F8F7F3]">
                      {(intentResult.bayesianPosterior * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Shannon H(X)</p>
                    <p className="font-mono-tabular text-sm font-semibold text-[#0D2327] dark:text-[#F8F7F3]">
                      {intentResult.shannonEntropy} bits
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Cadence CV</p>
                    <p className="font-mono-tabular text-sm font-semibold text-[#0D2327] dark:text-[#F8F7F3]">
                      {intentResult.cadenceCV}
                    </p>
                  </div>
                </div>
              )}

              {intentResult.triggers.length > 0 && (
                <p className="text-xs text-[#9B1C2E] dark:text-rose-300">
                  Triggers: {intentResult.triggers.join(' · ')}
                </p>
              )}

              {intentResult.humanIntentSeal && !isSabziMode && (
                <div className="pt-1">
                  <p className="text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">SHA-256 Human-Intent Seal</p>
                  <p className="font-mono-tabular text-xs break-all text-emerald-800 dark:text-emerald-300">
                    {intentResult.humanIntentSeal}
                  </p>
                </div>
              )}
            </div>
          )}

          {state.recentIntentSeals.length > 0 && !isSabziMode && (
            <div className="rounded-lg border border-[#F59E0B]/20 ajrak-well p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#FDE68A]">
                <span>Live Cryptographic Intent Audit Log ({state.recentIntentSeals.length})</span>
                <span className="font-mono-tabular text-[#5EEAD4]">WebSocket Synced</span>
              </div>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {state.recentIntentSeals.slice(0, 6).map((seal, idx) => (
                  <li
                    key={`${seal.timestamp}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#F8F7F3]/10 bg-[#041017]/65 px-2.5 py-1.5 text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono-tabular text-[10px] font-bold shrink-0 ${
                          seal.decision === 'SEALED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/25 text-rose-300'
                        }`}
                      >
                        {seal.decision}
                      </span>
                      <span className="truncate text-[#F8F7F3]/80">
                        {seal.humanIntentSeal ? `Seal ${seal.humanIntentSeal.slice(0, 16)}...` : seal.alertEnglish}
                      </span>
                    </div>
                    <span className="font-mono-tabular text-[10px] text-[#F8F7F3]/55 shrink-0">
                      {seal.latencyMs}ms • {new Date(seal.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </section>

        {/* Protocol 2: Real-Time Reality & Anti-Manipulation Truth-Filter */}
        <section className="kashi-card relative rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
          <QuantumHeartbeatAura active={isConnected} frozen={state.killSwitch.active} delaySeconds={0.55} />
          <ChromaticKashiRule />
          <div className="relative z-10 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#0F766E] dark:text-[#5EEAD4]">
                  Protocol 2 · Forensic Integrity Scanner
                </p>
                <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                  Reality & Anti-Manipulation Truth-Filter
                </h2>
              </div>
              <FileSearch className="w-5 h-5 text-[#9B1C2E] dark:text-[#F59E0B] shrink-0" />
            </div>

          <form onSubmit={(e) => void handleRunTruthFilter(e)} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'digital-invoice', label: 'Digital Invoice' },
                  { id: 'whatsapp-forward', label: 'WhatsApp Forward' },
                  { id: 'media-claim', label: 'Media Claim' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDocType(item.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    docType === item.id
                      ? 'bg-[#0D2327] dark:bg-[#F59E0B] text-white dark:text-[#0D2327]'
                      : 'border border-[#0D2327]/15 dark:border-[#F8F7F3]/20 text-[#0D2327]/80 dark:text-[#F8F7F3]/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D2327]/75 dark:text-[#F8F7F3]/75 mb-1.5">
                Forward, Contract Clause, or Invoice Content
              </label>
              <textarea
                rows={3}
                value={truthText}
                onChange={(e) => setTruthText(e.target.value)}
                className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3.5 py-2.5 text-sm text-[#0D2327] dark:text-[#F8F7F3] focus:outline-none focus:ring-2 focus:ring-[#9B1C2E] dark:focus:ring-[#F59E0B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docType === 'digital-invoice' && (
                <div>
                  <label className="block text-xs font-medium text-[#0D2327]/75 dark:text-[#F8F7F3]/75 mb-1">
                    Claimed Invoice Total (PKR)
                  </label>
                  <input
                    type="number"
                    value={claimedTotal}
                    onChange={(e) => setClaimedTotal(e.target.value)}
                    className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular text-[#0D2327] dark:text-[#F8F7F3]"
                  />
                </div>
              )}
              <div className={docType === 'digital-invoice' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-medium text-[#0D2327]/75 dark:text-[#F8F7F3]/75 mb-1">
                  Optional Declared SHA-256 Hash
                </label>
                <input
                  type="text"
                  value={declaredHash}
                  onChange={(e) => setDeclaredHash(e.target.value)}
                  placeholder="Leave blank to compute fresh SHA-256 digest"
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular text-[#0D2327] dark:text-[#F8F7F3]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={truthLoading}
              className="kashi-btn px-4 py-2.5 rounded-lg bg-[#9B1C2E] text-white text-xs font-semibold hover:bg-[#7F1524] whitespace-nowrap shrink-0 min-h-[40px]"
            >
              {truthLoading ? 'Scanning Payload...' : 'Run Forensic Truth-Filter'}
            </button>
          </form>

          {truthError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/45 bg-rose-950/60 px-3.5 py-2 text-xs text-rose-200"
            >
              {truthError}
            </div>
          )}

          {truthResult && (
            <div className="rounded-lg border border-[#0D2327]/15 dark:border-[#F8F7F3]/15 ajrak-well text-[#F8F7F3] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {truthResult.verdict === 'VERIFIED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#9B1C2E] dark:text-[#F59E0B] shrink-0" />
                  )}
                  <span className="text-sm font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                    {truthResult.verdict === 'VERIFIED'
                      ? 'VERIFIED · Clean Document'
                      : truthResult.verdict === 'RIBA_OR_MATH_ALERT'
                        ? 'ALERT · Hidden Riba or Math Tampering'
                        : 'ALERT · Psychological Manipulation Detected'}
                  </span>
                </div>
                <span className="font-mono-tabular text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
                  Manipulation {(truthResult.manipulationScore * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-xs text-[#0D2327]/80 dark:text-[#F8F7F3]/80">{truthResult.summary}</p>

              {truthResult.ribaClauses.length > 0 && (
                <p className="text-xs font-medium text-[#9B1C2E] dark:text-rose-300">
                  Riba Flags: {truthResult.ribaClauses.join(' · ')}
                </p>
              )}

              {truthResult.manipulationSignals.length > 0 && (
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Manipulation Hooks: {truthResult.manipulationSignals.join(' · ')}
                </p>
              )}

              {!isSabziMode && (
                <div className="space-y-1 pt-2 border-t border-[#0D2327]/10 dark:border-[#F8F7F3]/10 text-xs">
                  {docType === 'digital-invoice' && (
                    <p className="font-mono-tabular text-[#0D2327]/75 dark:text-[#F8F7F3]/75">
                      Computed Line Sum: PKR {truthResult.mathCheck.computedTotal.toLocaleString('en-US')} vs Claimed: PKR{' '}
                      {truthResult.mathCheck.claimedTotal.toLocaleString('en-US')} (Delta: PKR{' '}
                      {truthResult.mathCheck.discrepancy.toLocaleString('en-US')})
                    </p>
                  )}
                  <p className="font-mono-tabular break-all text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
                    SHA-256: {truthResult.hashCheck.computedSha256}
                  </p>
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      </div>

      {/* Protocol 3: Master Human-in-the-Loop AI-Agent Kill-Switch & 21 Outbound Rails */}
      <section className="kashi-card relative rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <QuantumHeartbeatAura active={isConnected} frozen={state.killSwitch.active} delaySeconds={1.1} />
        <ChromaticKashiRule />
        <div className="relative z-10 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#0F766E] dark:text-[#5EEAD4]">
                Protocol 3 · Timing-Safe PIN Lock (5-Attempt Brute-Force Protection)
              </p>
              <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                Master Human-in-the-Loop AI-Agent Kill-Switch & 21 Payment Rails
              </h2>
            <p className="text-xs text-[#0D2327]/70 dark:text-[#F8F7F3]/70">
              Status:{' '}
              <strong className={state.killSwitch.active ? 'text-[#9B1C2E] dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                {state.killSwitch.active ? 'FROZEN (ALL 21 RAILS LOCKED)' : 'ARMED & OPERATIONAL'}
              </strong>{' '}
              · Active AI Agent Tokens:{' '}
              <span className="font-mono-tabular font-semibold">{state.killSwitch.activeAgentTokenCount}</span> · Failed PIN Attempts:{' '}
              <span className="font-mono-tabular font-semibold">
                {state.killSwitch.failedAttempts}/{state.killSwitch.maxAttempts}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <input
              type="password"
              inputMode="numeric"
              maxLength={12}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (7860)"
              aria-label="Sovereign Kill-Switch PIN"
              className="w-32 rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular text-[#0D2327] dark:text-[#F8F7F3]"
            />
            <button
              type="button"
              disabled={killSwitchLoading}
              onClick={() => void handleToggleKillSwitch('freeze')}
              className="kashi-btn px-4 py-2 rounded-lg bg-[#9B1C2E] text-white text-xs font-semibold hover:bg-[#7F1524] whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Emergency Freeze (0.01s)
            </button>
            <button
              type="button"
              disabled={killSwitchLoading}
              onClick={() => void handleToggleKillSwitch('restore')}
              className="kashi-btn px-4 py-2 rounded-lg border border-[#0D2327]/25 dark:border-[#F8F7F3]/25 text-xs font-semibold text-[#0D2327] dark:text-[#F8F7F3] hover:bg-[#0D2327]/5 dark:hover:bg-white/5 whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" /> Restore Rails
            </button>
            <button
              type="button"
              disabled={killSwitchLoading}
              onClick={() => void handleResetDemo()}
              title="Reset persisted ledger back to clean Sakrand seed state (requires PIN)"
              className="kashi-btn px-3.5 py-2 rounded-lg border border-[#F59E0B]/35 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10 whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Ledger
            </button>
          </div>
        </div>

        {killSwitchMessage && (
          <div className="rounded-lg border border-[#0D2327]/15 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-4 py-2.5 text-xs font-medium text-[#0D2327] dark:text-[#F8F7F3]">
            {killSwitchMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {railCategories.map(([category, rails], catIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: catIdx * 0.06 }}
              className="rounded-lg border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-well p-4 space-y-2.5"
            >
              <h3 className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4]">{category}</h3>
              <ul className="space-y-2">
                {rails.map((rail) => (
                  <li key={rail.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#0D2327] dark:text-[#F8F7F3] truncate">{rail.name}</span>
                      <span
                        className={`font-mono-tabular font-semibold shrink-0 ${
                          rail.frozen
                            ? 'text-[#9B1C2E] dark:text-rose-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {rail.frozen ? 'FROZEN' : `${rail.latencyMs}ms`}
                      </span>
                    </div>
                    <div
                      className={`h-1 w-full rounded-full overflow-hidden ${
                        rail.frozen
                          ? 'bg-[#9B1C2E]/35 dark:bg-rose-500/35'
                          : 'rail-flow-active'
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
};
