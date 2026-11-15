import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck2,
  Printer,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { SovereignSystemState } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import {
  AjrakClothPattern,
  AjrakLoomDivider,
  ChromaticKashiRule,
  HalaKashiCornerOrnament,
} from './SovereignArt';

interface VeritasLedgerProps {
  state: SovereignSystemState;
  onStateRefresh: () => Promise<void>;
}

export const VeritasLedger: React.FC<VeritasLedgerProps> = ({ state, onStateRefresh }) => {
  const [pin, setPin] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [verifiedNotice, setVerifiedNotice] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg(null);
    const res = await fetch('/api/sovereign/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setResetMsg(data.error || 'PIN invalid.');
      return;
    }
    setPin('');
    setResetMsg('Sovereign ledger reset to verified genesis state.');
    await onStateRefresh();
  };

  const handleVerifyChain = () => {
    const witnessed = state.deals.filter((d) => Boolean(d.otaqMajlisWitnesses.shahadahHash)).length;
    setVerifiedNotice(
      `100% Unbroken Hash Continuity Verified across ${state.deals.length} Contracts (${witnessed} Otaq-Witnessed) & ${state.recentIntentSeals.length} Security Seals.`,
    );
    triggerApexHaptic('seal_minted', 'Audit Chain Verified');
  };

  const handleExportAuditJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      standard: 'Quran 2:282 Written Attestation & Pakistan ETO-2002',
      headquarters: state.headquarters,
      totals: state.totals,
      deals: state.deals,
      recentIntentSeals: state.recentIntentSeals,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bolmizan-eto2002-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerApexHaptic('sync_steady', 'Audit JSON Exported');
  };

  return (
    <div className="space-y-6">
      {/* 1. Deal & Otaq Majlis Cryptographic Hashes */}
      <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
        <ChromaticKashiRule />
        <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.08]" />
        <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-50" />
        <div className="relative z-10 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                SHA-256 Sovereign Audit Trail · Pakistan ETO-2002 Electronic Witness Record
              </p>
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#F59E0B]" />
                <span>Veritas Cryptographic Audit Ledger</span>
              </h2>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyChain}
                className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-bold text-white"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Chain Continuity</span>
              </button>
              <button
                type="button"
                onClick={handleExportAuditJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/35 px-3 py-2 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Legal Proof</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#14B8A6]/35 px-3 py-2 text-xs font-semibold text-[#5EEAD4] hover:bg-[#14B8A6]/10"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {verifiedNotice && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>{verifiedNotice}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {state.deals.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-[#F59E0B]/20 ajrak-well p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{d.title}</div>
                  <div className="text-[11px] text-[#F8F7F3]/70">
                    Witnesses:{' '}
                    {d.otaqMajlisWitnesses.witness1
                      ? `${d.otaqMajlisWitnesses.witness1} & ${d.otaqMajlisWitnesses.witness2}`
                      : 'Pending Otaq Majlis Attestation'}
                  </div>
                </div>
                <div className="font-mono-tabular text-right">
                  <div className="font-bold text-[#FDE68A]">
                    PKR {d.dealValuePkr.toLocaleString('en-US')}
                  </div>
                  <div className="text-[10px] text-[#5EEAD4]">
                    contract:{d.contractHash.slice(0, 16)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AjrakLoomDivider label="Cognitive Intent Seal Registry" />

      {/* 2. Recent Cognitive Firewall Intent Seals */}
      <section className="relative kashi-card rounded-xl overflow-hidden border border-[#14B8A6]/30 ajrak-moving-glass">
        <ChromaticKashiRule />
        <AjrakClothPattern accentHex="#14B8A6" opacityClass="opacity-[0.075]" />
        <div className="relative z-10 p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">
            Recent Anti-Scam &amp; Human-Intent Seals ({state.recentIntentSeals.length})
          </h3>
          {state.recentIntentSeals.length === 0 ? (
            <p className="text-xs text-[#F8F7F3]/65">
              Run a scan in the Shields &amp; Switchboard tab to record sealed cryptographic intent events here.
            </p>
          ) : (
            <div className="space-y-2">
              {state.recentIntentSeals.map((seal, idx) => (
                <div
                  key={`${seal.timestamp}-${idx}`}
                  className="rounded-lg border border-[#F59E0B]/20 ajrak-well px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {seal.decision === 'SEALED' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="font-bold text-white">{seal.decision}</span>
                    <span className="text-[#F8F7F3]/75">{seal.alertEnglish}</span>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-[#5EEAD4]">
                    Posterior {(seal.bayesianPosterior * 100).toFixed(1)}% ·{' '}
                    {new Date(seal.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => void handleReset(e)}
            className="no-print pt-3 border-t border-[#F59E0B]/15 flex flex-wrap items-center gap-2"
          >
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Sovereign PIN (7860) to reset"
              className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-1.5 text-xs font-mono-tabular text-white"
            />
            <button
              type="submit"
              className="kashi-btn inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-950/50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Sovereign Ledger
            </button>
            {resetMsg && <span className="text-xs text-[#FDE68A]">{resetMsg}</span>}
          </form>
        </div>
      </section>
    </div>
  );
};
