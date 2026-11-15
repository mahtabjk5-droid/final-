import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Award, Printer, ShieldCheck, X } from 'lucide-react';
import type { SovereignSystemState } from '../types/sovereign';
import { BolMizanLogo } from './SovereignArt';

interface JudgePassportModalProps {
  open: boolean;
  onClose: () => void;
  state: SovereignSystemState;
}

export const JudgePassportModal: React.FC<JudgePassportModalProps> = ({
  open,
  onClose,
  state,
}) => {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-xl rounded-2xl border border-[#F59E0B]/45 bg-[#041016] p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <BolMizanLogo size="sm" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F59E0B]">
                    Judge &amp; Auditor Verification Passport
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    BolMizan VERITAS-SOVEREIGN OS v30.0
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10"
                aria-label="Close Passport"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-tabular">
              <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-3">
                <div className="text-[#5EEAD4] text-[10px]">HEADQUARTERS</div>
                <div className="text-white font-bold mt-0.5">Sakrand, Sindh, PK</div>
              </div>
              <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-3">
                <div className="text-[#5EEAD4] text-[10px]">PAYMENT RAILS</div>
                <div className="text-white font-bold mt-0.5">
                  {state.killSwitch.rails.length} Sovereign Rails
                </div>
              </div>
              <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-3">
                <div className="text-[#5EEAD4] text-[10px]">ACTIVE ESTATE VALUE</div>
                <div className="text-[#FDE68A] font-bold mt-0.5">
                  PKR {state.totals.activeDealsPkr.toLocaleString('en-US')}
                </div>
              </div>
              <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-3">
                <div className="text-[#5EEAD4] text-[10px]">24K GOLD RESERVE</div>
                <div className="text-emerald-300 font-bold mt-0.5">
                  {state.totals.goldEquivalentGrams}g Au Hedge
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/30 p-3.5 text-xs text-emerald-100 space-y-1">
              <div className="inline-flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-[#F59E0B]" />
                <span>Compliance Certifications Active</span>
              </div>
              <p className="text-[11px] opacity-90">
                Quran 2:282 Written Debt Attestation • Pakistan ETO-2002 Electronic Evidence •
                SBP Raast EMVCo CRC-16 QR • SQLite WAL Multi-Tenant Isolation • Bayesian Anti-Scam Firewall.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#5EEAD4]">
                <ShieldCheck className="w-4 h-4" /> Default Sovereign PIN: 7860
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#041016]"
              >
                <Printer className="w-3.5 h-3.5" /> Print Passport
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
