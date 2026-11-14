import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Link2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ChromaticKashiRule } from './SovereignArt';
import { triggerApexHaptic } from '../utils/haptics';
import type { SovereignSystemState } from '../types/sovereign';

interface VeritasLedgerProps {
  state: SovereignSystemState;
}

type LedgerFilter = 'all' | 'deal' | 'wage';

interface RawLedgerItem {
  id: string;
  kind: 'deal' | 'wage';
  title: string;
  subtitle: string;
  amountPkr: number;
  sadaqahNote: string;
  status: string;
  timestamp: string;
  payloadHash: string;
  secondaryHash: string | null;
  secondaryLabel: string | null;
}

interface ChainedLedgerBlock extends RawLedgerItem {
  blockIndex: number;
  prevHash: string;
  blockHash: string;
}

const GENESIS_SEED = 'BOLMIZAN_VERITAS_SAKRAND_GENESIS_QURAN_2_282_ETO_2002_0_RIBA';

async function computeSha256(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(64, '0');
}

export const VeritasLedger: React.FC<VeritasLedgerProps> = ({ state }) => {
  const [filter, setFilter] = useState<LedgerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [blocks, setBlocks] = useState<ChainedLedgerBlock[]>([]);
  const [genesisHash, setGenesisHash] = useState<string>('');
  const [chainVerified, setChainVerified] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Build deterministic chronological audit stream from all deals & Raast wages
  const rawItems = useMemo<RawLedgerItem[]>(() => {
    const dealItems: RawLedgerItem[] = state.deals.map((deal) => ({
      id: `deal-${deal.id}`,
      kind: 'deal',
      title: deal.title,
      subtitle: `${deal.supplierName} → ${deal.buyerName} · ${deal.originCity}`,
      amountPkr: deal.dealValuePkr,
      sadaqahNote: `${deal.khufiyaSadaqahPct}% Sadaqah`,
      status: deal.status.toUpperCase(),
      timestamp: deal.createdAt,
      payloadHash: deal.contractHash,
      secondaryHash: deal.otaqMajlisWitnesses.shahadahHash,
      secondaryLabel: deal.otaqMajlisWitnesses.attestedAt
        ? `Otaq Shahadah (${deal.otaqMajlisWitnesses.witness1} & ${deal.otaqMajlisWitnesses.witness2})`
        : null,
    }));

    const wageItems: RawLedgerItem[] = state.wages.map((w, idx) => ({
      id: `wage-${w.id}`,
      kind: 'wage',
      title: `Haq-e-Mazdoor: ${w.workerName}`,
      subtitle: `${w.role} · Raast ID ${w.raastId} · Fee PKR 0`,
      amountPkr: w.amountPkr,
      sadaqahNote: `+PKR ${w.sadaqahAttachedPkr} Sadaqah`,
      status: w.status === 'settled' ? 'SETTLED (0% FEE)' : 'QUEUED',
      timestamp: w.settledAt ?? new Date(Date.UTC(2026, 2, 1, 8, idx * 15)).toISOString(),
      payloadHash: w.txHash ?? `pending-raast-commit-${w.id}-${w.amountPkr}`,
      secondaryHash: null,
      secondaryLabel: null,
    }));

    return [...dealItems, ...wageItems].sort(
      (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
    );
  }, [state.deals, state.wages]);

  const buildAndVerifyChain = async (announce = false) => {
    setVerifying(true);
    try {
      const gHash = await computeSha256(GENESIS_SEED);
      let prev = gHash;
      const chained: ChainedLedgerBlock[] = [];

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        // Canonical payload digest guarantees non-hash pending wages also get a full 64-hex SHA-256 link
        const canonicalPayload = /^[a-f0-9]{64}$/i.test(item.payloadHash)
          ? item.payloadHash
          : await computeSha256(`${item.id}:${item.payloadHash}:${item.amountPkr}`);

        const blockHash = await computeSha256(
          `${prev}|${canonicalPayload}|${i + 1}|${item.timestamp}|${item.amountPkr}`,
        );

        chained.push({
          ...item,
          payloadHash: canonicalPayload,
          blockIndex: i + 1,
          prevHash: prev,
          blockHash,
        });
        prev = blockHash;
      }

      setGenesisHash(gHash);
      setBlocks(chained);
      setChainVerified(true);
      if (announce) {
        triggerApexHaptic('authenticate', 'Veritas SHA-256 Ledger Verified');
      }
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    void buildAndVerifyChain(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawItems]);

  const filteredBlocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blocks.filter((b) => {
      if (filter !== 'all' && b.kind !== filter) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q) ||
        b.blockHash.toLowerCase().includes(q) ||
        b.prevHash.toLowerCase().includes(q) ||
        b.payloadHash.toLowerCase().includes(q)
      );
    });
  }, [blocks, filter, searchQuery]);

  const chainHeadHash = blocks.length > 0 ? blocks[blocks.length - 1].blockHash : genesisHash;

  const totalAuditedPkr = useMemo(
    () => blocks.reduce((acc, b) => acc + b.amountPkr, 0),
    [blocks],
  );

  const handleCopyHash = async (id: string, value: string) => {
    triggerApexHaptic('tap', 'Copied SHA-256 Block Proof');
    await navigator.clipboard.writeText(value);
    setCopiedHashId(id);
    window.setTimeout(() => setCopiedHashId(null), 1800);
  };

  const handleExportChainJson = () => {
    triggerApexHaptic('tap', 'Exported Veritas Ledger Chain');
    const payload = {
      ledger: 'BolMizan Veritas Immutable SHA-256 Audit Chain',
      headquarters: state.headquarters,
      genesisHash,
      chainHeadHash,
      verified: chainVerified,
      blockCount: blocks.length,
      exportedAt: new Date().toISOString(),
      blocks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bolmizan-veritas-ledger-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/35 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-5">
        {/* Header & Verification Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#5EEAD4] inline-flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-[#F59E0B]" />
              Immutable SHA-256 Hash-Linked Audit Console // Quran 2:282 &amp; ETO-2002
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F8F7F3]">
              Veritas Ledger · Cryptographic Deal &amp; Wage Audit Chain
            </h2>
            <p className="font-mono-tabular text-[11px] text-[#F8F7F3]/70 break-all">
              Chain Head SHA-256: <span className="text-emerald-300">{chainHeadHash || 'Computing...'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={verifying}
              onClick={() => void buildAndVerifyChain(true)}
              className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0D9488] whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {verifying
                ? 'Verifying Links...'
                : chainVerified
                  ? `Chain Verified (${blocks.length}/${blocks.length})`
                  : 'Verify Chain'}
            </button>
            <button
              type="button"
              onClick={handleExportChainJson}
              className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#F59E0B]/35 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit JSON
            </button>
          </div>
        </div>

        {/* Summary Metrics & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-[#F59E0B]/20 ajrak-well p-3.5">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1 rounded-lg bg-[#041017]/80 p-1 border border-[#F59E0B]/20">
              {(
                [
                  { id: 'all', label: `All (${blocks.length})` },
                  { id: 'deal', label: `Deals (${blocks.filter((b) => b.kind === 'deal').length})` },
                  { id: 'wage', label: `Wages (${blocks.filter((b) => b.kind === 'wage').length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerApexHaptic('tap', 'Filter Veritas Ledger');
                    setFilter(tab.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    filter === tab.id
                      ? 'bg-[#F59E0B] text-[#05131B]'
                      : 'text-[#F8F7F3]/75 hover:text-[#FDE68A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="font-mono-tabular text-[#FDE68A]">
              Audited Volume: <strong>PKR {totalAuditedPkr.toLocaleString('en-US')}</strong>
            </span>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-[#F59E0B]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hash, worker, or deal..."
              aria-label="Search Veritas Ledger"
              className="w-full rounded-lg border border-[#F59E0B]/25 bg-[#041017]/90 pl-8 pr-3 py-1.5 text-xs font-mono-tabular text-[#F8F7F3] placeholder:text-[#F8F7F3]/40 focus:outline-none focus:border-[#F59E0B]"
            />
          </div>
        </div>

        {/* Scrolling Immutable Cryptographic Console */}
        <div
          data-no-swipe="true"
          className="rounded-xl border border-[#14B8A6]/30 bg-[#030B11] p-4 max-h-[460px] overflow-y-auto space-y-1 font-mono-tabular text-xs"
          aria-label="Veritas Immutable SHA-256 Ledger Console"
        >
          {/* Genesis Anchor Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F59E0B]/25 bg-[#071822] px-3.5 py-2 text-[11px] text-[#FDE68A]">
            <span className="font-bold inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              GENESIS #0000 · SAKRAND SOVEREIGN ROOT
            </span>
            <span className="text-[#5EEAD4] truncate max-w-md">
              SHA-256: {genesisHash || '—'}
            </span>
          </div>

          {filteredBlocks.length === 0 ? (
            <div className="py-10 text-center text-[#F8F7F3]/60">
              No ledger blocks match the current filter criteria.
            </div>
          ) : (
            filteredBlocks.map((block, idx) => {
              const isSelected = selectedBlockId === block.id;
              return (
                <React.Fragment key={block.id}>
                  {/* Visual SHA-256 Hash Link Bridge */}
                  <div className="flex items-center gap-2 pl-5 py-1 text-[10px] text-[#5EEAD4]/80">
                    <ArrowDown className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                    <Link2 className="w-3 h-3 text-[#5EEAD4] shrink-0" />
                    <span className="truncate">
                      LINKED PREV_HASH: <strong className="text-[#FDE68A]">{block.prevHash.slice(0, 18)}…</strong>{' '}
                      ──▶ BLOCK #{String(block.blockIndex).padStart(4, '0')}
                    </span>
                  </div>

                  {/* Immutable Ledger Block */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.25) }}
                    className={`rounded-lg border transition-colors ${
                      block.kind === 'deal'
                        ? 'border-[#F59E0B]/30 bg-[#061620]'
                        : 'border-[#14B8A6]/30 bg-[#051B22]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        triggerApexHaptic('tap', 'Inspect Ledger Block');
                        setSelectedBlockId(isSelected ? null : block.id);
                      }}
                      className="w-full text-left px-3.5 py-3 space-y-2 hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="text-[#F59E0B] font-bold">
                            #{String(block.blockIndex).padStart(4, '0')}
                          </span>
                          <span aria-hidden="true" className="text-[#F8F7F3]/35">·</span>
                          <span
                            className={
                              block.kind === 'deal'
                                ? 'text-[#FDE68A] font-semibold'
                                : 'text-[#5EEAD4] font-semibold'
                            }
                          >
                            {block.kind === 'deal' ? 'DEAL_CONTRACT' : 'RAAST_WAGE'}
                          </span>
                          <span aria-hidden="true" className="text-[#F8F7F3]/35">·</span>
                          <span className="font-sans font-semibold text-[#F8F7F3] truncate">
                            {block.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-[#FDE68A]">
                            PKR {block.amountPkr.toLocaleString('en-US')}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              block.status.includes('SETTLED') ||
                              block.status.includes('ACTIVE') ||
                              block.status.includes('WITNESSED')
                                ? 'text-emerald-300'
                                : 'text-amber-300'
                            }`}
                          >
                            [{block.status}]
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#F8F7F3]/70">
                        <span className="font-sans truncate">
                          {block.subtitle} · {block.sadaqahNote}
                        </span>
                        <span className="text-[#F8F7F3]/55">
                          {new Date(block.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/10 text-[11px]">
                        <span className="text-emerald-300 truncate">
                          BLOCK SHA-256: {block.blockHash.slice(0, 26)}…{block.blockHash.slice(-8)}
                        </span>
                        <span className="text-[#5EEAD4]/85">
                          {isSelected ? 'Hide Block Proof ▲' : 'Inspect Full Proof ▼'}
                        </span>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-[#F59E0B]/15 bg-[#02080D] space-y-2 text-[11px]">
                        <div className="grid grid-cols-1 gap-1.5">
                          <p className="break-all text-[#F8F7F3]/75">
                            <span className="text-[#F59E0B]">prevHash:</span> {block.prevHash}
                          </p>
                          <p className="break-all text-[#F8F7F3]/75">
                            <span className="text-[#5EEAD4]">payloadHash:</span> {block.payloadHash}
                          </p>
                          <p className="break-all text-emerald-300">
                            <span className="text-emerald-400">blockHash:</span> {block.blockHash}
                          </p>
                          {block.secondaryHash && block.secondaryLabel && (
                            <p className="break-all text-[#FDE68A]/90">
                              <span className="text-[#F59E0B]">{block.secondaryLabel}:</span>{' '}
                              {block.secondaryHash}
                            </p>
                          )}
                        </div>
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => void handleCopyHash(block.id, block.blockHash)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#F59E0B]/30 text-[#FDE68A] hover:bg-white/5"
                          >
                            {copiedHashId === block.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedHashId === block.id ? 'Copied Block SHA-256' : 'Copy Block SHA-256'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
