import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import QRCode from 'qrcode';
import { Check, Copy, QrCode, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { AjrakBlockBorder, ChromaticKashiRule } from './SovereignArt';
import { triggerSovereignHaptic } from '../utils/haptics';

export interface JudgePassportPayload {
  passportId: string;
  founder: string;
  headquarters: string;
  issuedAt: string;
  nonce: string;
  merkleRootSha256: string;
  complianceCertificate: string;
  snapshot: {
    activeDealsPkr: number;
    dealsCount: number;
    railsCount: number;
    goldGrams: number;
    killSwitchActive: boolean;
  };
  signature: string;
}

interface JudgePassportModalProps {
  open: boolean;
  onClose: () => void;
}

export const JudgePassportModal: React.FC<JudgePassportModalProps> = ({ open, onClose }) => {
  const [passport, setPassport] = useState<JudgePassportPayload | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrMode, setQrMode] = useState<'url' | 'offline-text'>('url');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

  const loadLivePassport = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/apex/judge-passport');
      const data = (await res.json()) as JudgePassportPayload & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setPassport(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Unable to issue live Judge Passport.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    triggerSovereignHaptic('authenticate');
    void loadLivePassport();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, loadLivePassport, onClose]);

  const encodedText = passport
    ? qrMode === 'url' && typeof window !== 'undefined'
      ? `${window.location.origin}/verify-judge?pid=${encodeURIComponent(passport.passportId)}&founder=${encodeURIComponent(passport.founder)}&merkle=${encodeURIComponent(passport.merkleRootSha256)}&cert=${encodeURIComponent('0% Riba & Pakistan ETO-2002 Verified')}&ts=${encodeURIComponent(passport.issuedAt)}&sig=${encodeURIComponent(passport.signature)}`
      : [
          'BOLMIZAN VERITAS-SOVEREIGN OS v30.0 — LIVE JUDGE PASSPORT',
          `Founder: ${passport.founder}`,
          `HQ: ${passport.headquarters}`,
          `Live SHA-256 Merkle Root: ${passport.merkleRootSha256}`,
          `Compliance: ${passport.complianceCertificate}`,
          `Timestamp: ${passport.issuedAt}`,
          `Passport ID: ${passport.passportId}`,
          `HMAC Sig: ${passport.signature}`,
        ].join('\n')
    : '';

  useEffect(() => {
    if (!encodedText) return;
    let active = true;
    QRCode.toDataURL(encodedText, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#05131B',
        light: '#F8F7F3',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [encodedText]);

  const handleCopyProof = async () => {
    if (!passport) return;
    triggerSovereignHaptic('tap');
    await navigator.clipboard.writeText(encodedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Live Judge Verification QR Passport"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.94, filter: 'blur(6px)' }
            }
            animate={
              prefersReduced
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    transitionEnd: { filter: 'none' },
                  }
            }
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.96, filter: 'blur(4px)' }
            }
            transition={{ duration: prefersReduced ? 0.14 : 0.34, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-[#F59E0B]/45 ajrak-moving-glass shadow-[0_28px_70px_-14px_rgba(20,184,166,0.32)] text-[#F8F7F3]"
          >
            {/* Quantum-Shimmer Cryptographic Sweep upon Modal Entry & Proof Regeneration */}
            {!prefersReduced && (
              <motion.div
                key={`shimmer-${passport?.nonce ?? 'init'}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-2/3 z-30 -skew-x-12"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 15%, rgba(94, 234, 212, 0.14) 42%, rgba(253, 230, 138, 0.28) 50%, rgba(245, 158, 11, 0.14) 58%, transparent 85%)',
                }}
                initial={{ x: '-90%', opacity: 0 }}
                animate={{ x: '230%', opacity: [0, 1, 0.9, 0] }}
                transition={{ duration: 0.95, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            )}

            <AjrakBlockBorder />
            <ChromaticKashiRule />

            <div className="relative z-10 p-6 sm:p-7 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono-tabular font-semibold text-[#5EEAD4] inline-flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#F59E0B]" />
                    1-CLICK JUDGE HANDSHAKE // LIVE SERVER CRYPTOGRAPHIC PROOF
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#F8F7F3]">
                    Live Judge Verification QR Passport
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Judge Passport"
                  className="p-2 rounded-lg border border-[#F59E0B]/25 text-[#F8F7F3]/80 hover:text-[#F59E0B] hover:border-[#F59E0B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {fetchError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-500/45 bg-rose-950/60 px-4 py-2.5 text-xs text-rose-200 flex items-center justify-between gap-3"
                >
                  <span>Live proof handshake issue: {fetchError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerSovereignHaptic('tap');
                      void loadLivePassport();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-500/25 border border-rose-400/40 font-semibold text-rose-100 hover:bg-rose-500/40 shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Scannable QR Container with High-Contrast Modules inside Ajrak Gold Bezel */}
                <motion.div
                  initial={prefersReduced ? undefined : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.32, delay: prefersReduced ? 0 : 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="sm:col-span-5 flex flex-col items-center space-y-3"
                >
                  <div className="relative overflow-hidden p-3 rounded-2xl border-2 border-[#F59E0B] bg-[#05131B] shadow-xl">
                    {!prefersReduced && (
                      <motion.div
                        key={`qr-scan-${passport?.nonce ?? 'init'}`}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-2 h-0.5 z-20 rounded-full"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, #14B8A6, #FDE68A, #14B8A6, transparent)',
                          boxShadow: '0 0 10px 2px rgba(94, 234, 212, 0.6)',
                        }}
                        initial={{ top: '8%', opacity: 0 }}
                        animate={{ top: ['8%', '90%', '10%'], opacity: [0, 0.95, 0.95, 0] }}
                        transition={{ duration: 1.05, delay: 0.14, ease: 'easeInOut' }}
                      />
                    )}
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Live Judge Verification QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 rounded-lg block"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-lg bg-[#071D28] flex items-center justify-center text-xs text-[#FDE68A]">
                        Generating SHA-256 QR...
                      </div>
                    )}
                  </div>

                  <div className="inline-flex rounded-lg border border-[#F59E0B]/25 ajrak-well p-1 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        triggerSovereignHaptic('tap');
                        setQrMode('url');
                      }}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        qrMode === 'url' ? 'bg-[#F59E0B] text-[#05131B]' : 'text-[#F8F7F3]/75'
                      }`}
                    >
                      Live URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerSovereignHaptic('tap');
                        setQrMode('offline-text');
                      }}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        qrMode === 'offline-text' ? 'bg-[#F59E0B] text-[#05131B]' : 'text-[#F8F7F3]/75'
                      }`}
                    >
                      Offline Text
                    </button>
                  </div>
                </motion.div>

                {/* Signed Cryptographic Certificate Details */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <motion.div
                    initial={prefersReduced ? undefined : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: prefersReduced ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-lg border border-[#F59E0B]/25 ajrak-well p-3.5 space-y-1"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-[#F59E0B] font-semibold">
                      Founder &amp; Sovereign HQ
                    </p>
                    <p className="text-sm font-bold text-[#F8F7F3]">
                      {passport?.founder ?? 'Mahtab Ali Jamali — Sakrand, Sindh HQ'}
                    </p>
                    <p className="text-[#F8F7F3]/70">
                      {passport?.headquarters ?? 'Sakrand, Shaheed Benazirabad, Sindh, Pakistan'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={prefersReduced ? undefined : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: prefersReduced ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-lg border border-[#14B8A6]/30 ajrak-well p-3.5 space-y-1"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-[#5EEAD4] font-semibold">
                      Live SHA-256 Merkle Root Hash
                    </p>
                    <p className="font-mono-tabular text-[11px] break-all text-emerald-300">
                      {passport?.merkleRootSha256 ?? 'Computing live state digest...'}
                    </p>
                    <p className="font-mono-tabular text-[10px] text-[#F8F7F3]/60 pt-1">
                      Issued Live: {passport?.issuedAt ?? '—'} • ID: {passport?.passportId ?? '—'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={prefersReduced ? undefined : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: prefersReduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-lg border border-emerald-400/35 bg-emerald-950/35 p-3.5 flex items-start gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-emerald-300">
                        0% Riba &amp; ETO-2002 Compliance Certificate
                      </p>
                      <p className="text-[#F8F7F3]/80">
                        {passport?.complianceCertificate ??
                          '0% Riba • Quran 2:282 • Pakistan ETO-2002 Verified'}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F59E0B]/20">
                <p className="text-[11px] text-[#F8F7F3]/70">
                  Point any smartphone camera at the QR code to verify live running server state.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      triggerSovereignHaptic('authenticate');
                      void loadLivePassport();
                    }}
                    className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#F59E0B]/35 bg-[#041017]/85 text-xs font-semibold text-[#FDE68A] hover:border-[#F59E0B]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Regenerate Live Proof
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCopyProof()}
                    className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F59E0B] text-[#05131B] text-xs font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Proof' : 'Copy Proof'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
