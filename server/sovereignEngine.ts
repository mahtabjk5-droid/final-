import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  HaqWagePayout,
  IntentVerificationResult,
  MaalGuardListing,
  MukasaClearReport,
  MukasaEdge,
  PaymentRail,
  SovereignDeal,
  SovereignSystemState,
  TruthFilterResult,
} from '../src/types/sovereign.ts';

const LEDGER_FILE = path.resolve(process.cwd(), 'data', 'sovereign-ledger.json');

export const INITIAL_RAILS: PaymentRail[] = [
  // Domestic Raast & Wallets (6)
  { id: 'raast-p2p', name: 'SBP Raast Instant P2P', category: 'Domestic Raast & Wallets', frozen: false, latencyMs: 14 },
  { id: 'raast-qr', name: 'SBP Raast Merchant QR', category: 'Domestic Raast & Wallets', frozen: false, latencyMs: 18 },
  { id: 'easypaisa', name: 'Easypaisa Wallet API', category: 'Domestic Raast & Wallets', frozen: false, latencyMs: 29 },
  { id: 'jazzcash', name: 'JazzCash Disbursement', category: 'Domestic Raast & Wallets', frozen: false, latencyMs: 31 },
  { id: 'sadapay', name: 'SadaPay Business Rail', category: 'Domestic Raast & Wallets', frozen: false, latencyMs: 24 },
  { id: 'nayapay', name: 'NayaPay Merchant IBFT', category: 'Domestic Raast & Wallets', frozen: false, latencyMs: 27 },

  // Commercial Banking (5)
  { id: 'meezan-ibft', name: 'Meezan Islamic IBFT', category: 'Commercial Banking', frozen: false, latencyMs: 42 },
  { id: 'hbl-konnect', name: 'HBL Konnect Trade Desk', category: 'Commercial Banking', frozen: false, latencyMs: 48 },
  { id: 'ubl-omni', name: 'UBL Omni / Digital IBFT', category: 'Commercial Banking', frozen: false, latencyMs: 46 },
  { id: 'alfalah-islamic', name: 'Bank Alfalah Islamic RTGS', category: 'Commercial Banking', frozen: false, latencyMs: 39 },
  { id: 'faysal-islamic', name: 'Faysal Islami Escrow Rail', category: 'Commercial Banking', frozen: false, latencyMs: 44 },

  // Gulf & FX (5)
  { id: 'sar-mudad', name: 'Riyadh SAR Trade Settlement', category: 'Gulf & FX', frozen: false, latencyMs: 68 },
  { id: 'uae-fts', name: 'Dubai AED Corridor FTS', category: 'Gulf & FX', frozen: false, latencyMs: 64 },
  { id: 'qatar-qcb', name: 'Doha QAR Murabaha Clear', category: 'Gulf & FX', frozen: false, latencyMs: 74 },
  { id: 'oman-omr', name: 'Muscat OMR Produce Desk', category: 'Gulf & FX', frozen: false, latencyMs: 79 },
  { id: 'swift-iso20022', name: 'ISO-20022 Export FX Gateway', category: 'Gulf & FX', frozen: false, latencyMs: 92 },

  // Sovereign Escrows (5)
  { id: 'mukasa-net', name: 'Mukasa Zero-Cash Clearing', category: 'Sovereign Escrows', frozen: false, latencyMs: 6 },
  { id: 'waqf-pool', name: 'Khufiya Sadaqah Reserve Pool', category: 'Sovereign Escrows', frozen: false, latencyMs: 9 },
  { id: 'haq-mazdoor', name: 'Haq-e-Mazdoor 0% Fee Vault', category: 'Sovereign Escrows', frozen: false, latencyMs: 11 },
  { id: 'gold-vault', name: '24K Physical Gold Hedge', category: 'Sovereign Escrows', frozen: false, latencyMs: 16 },
  { id: 'solar-syndicate', name: 'Ameen Solar Mudarabah Escrow', category: 'Sovereign Escrows', frozen: false, latencyMs: 15 },
];

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function computeShannonEntropy(text: string): number {
  if (!text.length) return 0;
  const counts = new Map<string, number>();
  for (const ch of text) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  const len = text.length;
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

export function computeCadenceStats(intervalsMs: number[]): { cv: number; varianceMs2: number } {
  const valid = intervalsMs.filter((n) => Number.isFinite(n) && n > 0 && n < 5000);
  if (valid.length < 3) {
    return { cv: 0.24, varianceMs2: 960 };
  }
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const variance = valid.reduce((sum, x) => sum + (x - mean) ** 2, 0) / valid.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;
  return {
    cv: Number(cv.toFixed(3)),
    varianceMs2: Math.round(variance),
  };
}

export function verifyIntentCognitiveFirewall(params: {
  transcript: string;
  keystrokeIntervalsMs?: number[];
  actionContext?: string;
}): IntentVerificationResult {
  const started = performance.now();
  const text = params.transcript.trim();
  const lower = text.toLowerCase();
  const intervals = params.keystrokeIntervalsMs ?? [];

  const shannonEntropy = computeShannonEntropy(text);
  const cadence = computeCadenceStats(intervals);

  const scamPatterns: Array<{ pattern: RegExp; reason: string; weight: number }> = [
    { pattern: /(8171|benazir|bisp|ehsaas).*(fee|rs|send|pin|otp|block)/i, reason: '8171 / BISP impersonation bait', weight: 3.1 },
    { pattern: /(otp|mpin|pin\s*code|cvv|passcode|password)/i, reason: 'Sensitive credential / OTP harvesting attempt', weight: 2.8 },
    { pattern: /(state bank|sbp|easypaisa|jazzcash|hbl|meezan).*(manager|block|suspend|verify)/i, reason: 'Fake bank / wallet suspension threat', weight: 2.9 },
    { pattern: /(urgent|fori|abhi|immediately|within 10 minutes|account block)/i, reason: 'Artificial urgency / psychological coercion', weight: 1.7 },
    { pattern: /(send fee|processing fee|advance tax|inaam|lottery|lucky draw)/i, reason: 'Advance-fee lottery or prize trap', weight: 2.4 },
    { pattern: /(late fee|compounding interest|riba|markup|سود)/i, reason: 'Non-Shariah Riba / compounding penalty detected', weight: 2.2 },
  ];

  const triggers: string[] = [];
  let logOdds = -2.2; // Prior ~10% base risk

  for (const rule of scamPatterns) {
    if (rule.pattern.test(lower)) {
      triggers.push(rule.reason);
      logOdds += rule.weight;
    }
  }

  let isRobotic = false;
  if (intervals.length >= 4 && cadence.cv < 0.055) {
    isRobotic = true;
    triggers.push(`Robotic uniform keystroke cadence (CV=${cadence.cv})`);
    logOdds += 2.3;
  }

  if (shannonEntropy < 2.2 && text.length > 20) {
    triggers.push(`Low Shannon character entropy (${shannonEntropy} bits)`);
    logOdds += 1.4;
  }

  const posterior = 1 / (1 + Math.exp(-logOdds));
  const bayesianPosterior = Number(posterior.toFixed(4));

  let decision: IntentVerificationResult['decision'] = 'SEALED';
  if (bayesianPosterior >= 0.55) {
    decision = isRobotic && triggers.length === 1 ? 'SUSPECT_BOT' : 'BLOCKED_SCAM';
  } else if (isRobotic) {
    decision = 'SUSPECT_BOT';
  }

  const timestamp = new Date().toISOString();
  const humanIntentSeal =
    decision === 'SEALED'
      ? sha256Hex(`${text}|${params.actionContext || 'sovereign'}|${cadence.cv}|${timestamp}`)
      : null;

  const latencyMs = Math.max(2, Number((performance.now() - started).toFixed(2)));

  return {
    decision,
    bayesianPosterior,
    shannonEntropy,
    cadenceCV: cadence.cv,
    cadenceVarianceMs2: cadence.varianceMs2,
    latencyMs,
    humanIntentSeal,
    triggers,
    alertUrdu:
      decision === 'SEALED'
        ? 'تصدیق مکمل: انسانی نیت محفوظ اور حلال تجارت کے مطابق ہے۔'
        : 'خبردار! مشکوک دھوکہ دہی یا او ٹی پی فراڈ پکڑا گیا ہے۔ کوئی رقم یا پن نہ بھیجیں۔',
    alertSindhi:
      decision === 'SEALED'
        ? 'تصديق مڪمل: انساني نيت محفوظ ۽ حلال واپار موجب آهي.'
        : 'خبردار! شڪي دوکو يا او ٽي پي فراڊ پڪڙجي ويو آهي. ڪا به رقم يا پن نه موڪليو.',
    alertEnglish:
      decision === 'SEALED'
        ? 'Authentic human cadence verified. Cryptographic Human-Intent Seal minted.'
        : 'ALERT: Fraud, coercion, or robotic spoof intercepted. Outbound transfer halted.',
    timestamp,
  };
}

export function runTruthFilter(params: {
  content: string;
  documentType: 'whatsapp-forward' | 'media-claim' | 'digital-invoice';
  declaredHash?: string;
  claimedTotal?: number;
  lineItems?: Array<{ label: string; qty: number; unitPrice: number }>;
}): TruthFilterResult {
  const content = params.content.trim();
  const computedSha256 = sha256Hex(content);
  const providedHash = params.declaredHash?.trim() || null;
  const hashMatched = !providedHash || providedHash.toLowerCase() === computedSha256.toLowerCase();

  const ribaRules: Array<{ regex: RegExp; label: string }> = [
    { regex: /\b(\d+(?:\.\d+)?%?\s*(?:daily|monthly|annual)?\s*compounding\s*(?:late\s*fee|interest|penalty))\b/i, label: 'Compounding late fee / interest clause' },
    { regex: /\b(interest|riba|usury|markup\s*apr|finance\s*charge|سود)\b/i, label: 'Explicit Riba / interest terminology' },
    { regex: /\b(hidden\s*fee|undisclosed\s*commission|gharar)\b/i, label: 'Hidden commission / Gharar ambiguity' },
  ];

  const ribaClauses: string[] = [];
  for (const rule of ribaRules) {
    const match = content.match(rule.regex);
    if (match) ribaClauses.push(`${rule.label}: "${match[0]}"`);
  }

  const manipulationRules: Array<{ regex: RegExp; label: string; score: number }> = [
    { regex: /(forward to \d+ groups|share before deleted|breaking secret leak)/i, label: 'Viral chain-forward coercion', score: 0.35 },
    { regex: /(guaranteed 500%|double your money|risk-free 10x|ponzi)/i, label: 'Unrealistic Ponzi / Gharar hype', score: 0.45 },
    { regex: /(secret government grant|8171|fee bhejein|send processing fee)/i, label: 'Fake subsidy / fee-bait signal', score: 0.45 },
    { regex: /(act within \d+ minutes|account suspended tonight|final warning)/i, label: 'Manufactured panic deadline', score: 0.3 },
  ];

  const manipulationSignals: string[] = [];
  let manipulationScore = 0.05;
  for (const rule of manipulationRules) {
    if (rule.regex.test(content)) {
      manipulationSignals.push(rule.label);
      manipulationScore += rule.score;
    }
  }
  if (!hashMatched) {
    manipulationSignals.push('Declared SHA-256 digest mismatch (tampered payload)');
    manipulationScore += 0.45;
  }

  const computedTotal = (params.lineItems ?? []).reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || 0),
    0,
  );
  const claimedTotal = typeof params.claimedTotal === 'number' ? params.claimedTotal : computedTotal;
  const discrepancy = Math.abs(claimedTotal - computedTotal);
  const mathValid = params.documentType !== 'digital-invoice' || discrepancy <= 1;

  if (!mathValid) {
    manipulationScore += 0.35;
  }

  const clampedScore = Number(Math.min(0.99, manipulationScore).toFixed(2));
  const ribaDetected = ribaClauses.length > 0;

  let verdict: TruthFilterResult['verdict'] = 'VERIFIED';
  if (ribaDetected || !mathValid || !hashMatched) {
    verdict = 'RIBA_OR_MATH_ALERT';
  } else if (clampedScore >= 0.45) {
    verdict = 'MANIPULATION_DETECTED';
  }

  const summary =
    verdict === 'VERIFIED'
      ? `Document passed Quran 2:282 & forensic integrity verification (${params.documentType}).`
      : `Forensic Alert (${params.documentType}): ${[
          ribaDetected ? `${ribaClauses.length} Riba clause(s)` : '',
          !mathValid ? `PKR ${discrepancy.toLocaleString('en-US')} invoice math discrepancy` : '',
          !hashMatched ? 'SHA-256 hash mismatch' : '',
          manipulationSignals.length ? `${manipulationSignals.length} manipulation signal(s)` : '',
        ]
          .filter(Boolean)
          .join(' • ')}.`;

  return {
    verdict,
    manipulationScore: clampedScore,
    ribaDetected,
    ribaClauses,
    manipulationSignals,
    mathCheck: {
      valid: mathValid,
      computedTotal,
      claimedTotal,
      discrepancy,
    },
    hashCheck: {
      provided: providedHash,
      computedSha256,
      matched: hashMatched,
    },
    summary,
    timestamp: new Date().toISOString(),
  };
}

export function detectAndClearMukasaCycles(edgesInput: MukasaEdge[]): MukasaClearReport {
  const working = edgesInput.map((e) => ({ ...e }));
  const clearedLoops: Array<{ path: string[]; clearedAmountPkr: number }> = [];
  let totalClearedPkr = 0;

  // Iterative DFS cycle finder on open edges
  for (let safety = 0; safety < 16; safety++) {
    const openEdges = working.filter((e) => !e.cleared && e.amountPkr > 0);
    if (!openEdges.length) break;

    const adj = new Map<string, typeof openEdges>();
    for (const edge of openEdges) {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)!.push(edge);
    }

    let foundCycleEdges: typeof openEdges | null = null;
    const nodes = Array.from(adj.keys());

    for (const startNode of nodes) {
      const stack: string[] = [startNode];
      const edgeStack: typeof openEdges = [];
      const onStack = new Set<string>([startNode]);
      const visited = new Set<string>();

      const dfs = (u: string): boolean => {
        visited.add(u);
        for (const edge of adj.get(u) ?? []) {
          const v = edge.to;
          if (v === startNode && edgeStack.length >= 1) {
            foundCycleEdges = [...edgeStack, edge];
            return true;
          }
          if (!onStack.has(v) && !visited.has(v)) {
            stack.push(v);
            onStack.add(v);
            edgeStack.push(edge);
            if (dfs(v)) return true;
            edgeStack.pop();
            onStack.delete(v);
            stack.pop();
          }
        }
        return false;
      };

      if (dfs(startNode)) break;
    }

    if (!foundCycleEdges) break;

    const cycleEdges = foundCycleEdges as typeof openEdges;
    const minAmount = Math.min(...cycleEdges.map((e) => e.amountPkr));
    const path = [...cycleEdges.map((e) => e.from), cycleEdges[0].from];

    for (const edge of cycleEdges) {
      edge.amountPkr -= minAmount;
      if (edge.amountPkr <= 0) {
        edge.amountPkr = 0;
        edge.cleared = true;
      }
    }

    totalClearedPkr += minAmount * cycleEdges.length;
    clearedLoops.push({ path, clearedAmountPkr: minAmount });
  }

  return {
    cyclesDetected: clearedLoops.length,
    totalClearedPkr,
    clearedLoops,
    remainingEdges: working,
  };
}

interface PersistedLedgerSnapshot {
  killSwitchActive: boolean;
  agentTokensRevoked: boolean;
  activeAgentTokenCount: number;
  failedAttempts: number;
  lockoutUntil: number | null;
  lastToggledAt: string | null;
  rails: PaymentRail[];
  deals: SovereignDeal[];
  mukasaEdges: MukasaEdge[];
  lastMukasaReport: MukasaClearReport | null;
  mukasaClearedTotalPkr: number;
  maalGuard: MaalGuardListing[];
  wages: HaqWagePayout[];
  recentIntentSeals: IntentVerificationResult[];
}

class SovereignStore {
  private readonly defaultPinDigest = sha256Hex('7860');
  private killSwitchActive = false;
  private agentTokensRevoked = false;
  private activeAgentTokenCount = 12;
  private failedAttempts = 0;
  private readonly maxAttempts = 5;
  private lockoutUntil: number | null = null;
  private lastToggledAt: string | null = null;
  private rails: PaymentRail[] = INITIAL_RAILS.map((r) => ({ ...r }));

  private deals: SovereignDeal[] = [
    {
      id: 'deal-sakrand-basmati-01',
      title: 'Sakrand Super Kernel Basmati Export Lot #1',
      sector: 'sector-1-food-water',
      commodity: 'Super Kernel Basmati Rice (25 Tons)',
      originCity: 'Sakrand, Sindh',
      destinationCity: 'Riyadh, Saudi Arabia',
      supplierName: 'Al-Sindh Rice Millers Cooperative (Sakrand)',
      buyerName: 'Najd Al-Barakah Foods LLC (Riyadh)',
      dealValuePkr: 4_850_000,
      dealValueUsd: 17_446,
      ujrahMarginPct: 6.5,
      mudarabahEquitySharePct: 0,
      syndicateMembers: 1,
      khufiyaSadaqahPct: 7,
      niyatChecklist: {
        halalOrigin: true,
        zeroRiba: true,
        zeroDeception: true,
        haqEMazdoorPriority: true,
      },
      defectDisclosure: '1.1% natural moisture shrinkage disclosed upfront per Siddiq (RA) Zero-Hype protocol.',
      warehouseProof: {
        videoFileRef: 'sakrand_lot01_unedited_gps.mp4',
        gpsCoords: '26.1384° N, 68.2747° E (Sakrand)',
        capturedAt: '2026-11-12T08:15:00.000Z',
        verified: true,
      },
      otaqMajlisWitnesses: {
        witness1: 'Haji Abdul Karim Lakho',
        witness2: 'Engr. Tariq Mehmood Rahu',
        attestedAt: '2026-11-12T09:00:00.000Z',
        shahadahHash: sha256Hex('deal-sakrand-basmati-01|Lakho|Rahu'),
      },
      status: 'active',
      contractHash: sha256Hex('deal-sakrand-basmati-01|4850000|Sakrand|Riyadh'),
      createdAt: '2026-11-12T08:00:00.000Z',
    },
    {
      id: 'deal-khairpur-dates-02',
      title: 'Khairpur Aseel Dates & Sindhri Mango Cold-Chain',
      sector: 'sector-1-food-water',
      commodity: 'Organic Aseel Dates (18 Tons)',
      originCity: 'Khairpur / Sakrand Belt',
      destinationCity: 'Dubai, UAE',
      supplierName: 'Indus Orchard Farmers Pool',
      buyerName: 'Al-Mizan Fresh Markets Dubai',
      dealValuePkr: 3_200_000,
      dealValueUsd: 11_511,
      ujrahMarginPct: 7.0,
      mudarabahEquitySharePct: 0,
      syndicateMembers: 1,
      khufiyaSadaqahPct: 8,
      niyatChecklist: {
        halalOrigin: true,
        zeroRiba: true,
        zeroDeception: true,
        haqEMazdoorPriority: true,
      },
      defectDisclosure: '1.5% outer skin blemish on Grade-B crates disclosed upfront.',
      warehouseProof: {
        videoFileRef: 'khairpur_coldstore_gps.mp4',
        gpsCoords: '27.5295° N, 68.7592° E (Khairpur)',
        capturedAt: '2026-11-13T10:30:00.000Z',
        verified: true,
      },
      otaqMajlisWitnesses: {
        witness1: 'Ustad Muhammad Saleh Jamali',
        witness2: 'Mir Hassan Zardari',
        attestedAt: '2026-11-13T11:15:00.000Z',
        shahadahHash: sha256Hex('deal-khairpur-dates-02|Jamali|Zardari'),
      },
      status: 'witnessed',
      contractHash: sha256Hex('deal-khairpur-dates-02|3200000|Khairpur|Dubai'),
      createdAt: '2026-11-13T10:00:00.000Z',
    },
    {
      id: 'deal-sakrand-solar-03',
      title: 'Ameen Solar Micro-Grid & Clean RO Water Cluster #1',
      sector: 'sector-2-solar-energy',
      commodity: '120kW Off-Grid Solar + 15,000L/day RO Plant',
      originCity: 'Sakrand, Sindh',
      destinationCity: 'Shaheed Benazirabad Agri-Cluster',
      supplierName: 'Indus Renewable Consortium',
      buyerName: '32-Shop Sakrand Bazaar Syndicate',
      dealValuePkr: 9_600_000,
      dealValueUsd: 34_532,
      ujrahMarginPct: 0,
      mudarabahEquitySharePct: 22,
      syndicateMembers: 32,
      khufiyaSadaqahPct: 10,
      niyatChecklist: {
        halalOrigin: true,
        zeroRiba: true,
        zeroDeception: true,
        haqEMazdoorPriority: true,
      },
      defectDisclosure: 'Monsoon dust cleaning schedule disclosed (2% seasonal output variance).',
      warehouseProof: {
        videoFileRef: 'sakrand_solar_ro_commissioning.mp4',
        gpsCoords: '26.1401° N, 68.2712° E (Sakrand)',
        capturedAt: '2026-11-14T06:00:00.000Z',
        verified: true,
      },
      otaqMajlisWitnesses: {
        witness1: 'Haji Abdul Karim Lakho',
        witness2: 'Engr. Tariq Mehmood Rahu',
        attestedAt: '2026-11-14T07:00:00.000Z',
        shahadahHash: sha256Hex('deal-sakrand-solar-03|Lakho|Rahu'),
      },
      status: 'active',
      contractHash: sha256Hex('deal-sakrand-solar-03|9600000|Sakrand|RO'),
      createdAt: '2026-11-14T05:30:00.000Z',
    },
  ];

  private mukasaEdges: MukasaEdge[] = [
    { id: 'mk-1', from: 'Sakrand Grain Store', to: 'Al-Sindh Rice Mill', amountPkr: 450_000, invoiceRef: 'INV-SKR-101', cleared: false },
    { id: 'mk-2', from: 'Al-Sindh Rice Mill', to: 'Indus Transport Co', amountPkr: 380_000, invoiceRef: 'INV-TRN-204', cleared: false },
    { id: 'mk-3', from: 'Indus Transport Co', to: 'Sakrand Grain Store', amountPkr: 410_000, invoiceRef: 'INV-GRN-309', cleared: false },
    { id: 'mk-4', from: 'Nawabshah Cold Room', to: 'Sakrand Grain Store', amountPkr: 195_000, invoiceRef: 'INV-CLD-412', cleared: false },
  ];
  private lastMukasaReport: MukasaClearReport | null = null;
  private mukasaClearedTotalPkr = 1_140_000;

  private maalGuard: MaalGuardListing[] = [
    {
      id: 'mg-1',
      item: 'Grade-A Sindhri Mangoes (Cold-Chain Lot)',
      location: 'Sakrand Mandi Cold Room #2',
      originalPricePkr: 240_000,
      rescuePricePkr: 168_000,
      discountPct: 30,
      hoursRemaining: 9,
      quantityKg: 800,
      rescued: false,
    },
    {
      id: 'mg-2',
      item: 'Fresh Whole-Wheat Chakki Flour Bags',
      location: 'Qazi Ahmed Grain Depot',
      originalPricePkr: 185_000,
      rescuePricePkr: 129_500,
      discountPct: 30,
      hoursRemaining: 14,
      quantityKg: 1250,
      rescued: false,
    },
    {
      id: 'mg-3',
      item: 'Chilled Buffalo Milk & Lassi Supply',
      location: 'Sakrand Dairy Cooperative',
      originalPricePkr: 95_000,
      rescuePricePkr: 66_500,
      discountPct: 30,
      hoursRemaining: 6,
      quantityKg: 600,
      rescued: false,
    },
  ];

  private wages: HaqWagePayout[] = [
    {
      id: 'wg-1',
      workerName: 'Muhammad Ramzan Mallah',
      role: 'Head Grain Sorter',
      raastId: '0301-8421901',
      amountPkr: 32_000,
      feePkr: 0,
      sadaqahAttachedPkr: 1_600,
      status: 'settled',
      settledAt: '2026-11-13T16:40:00.000Z',
      txHash: sha256Hex('wg-1|Mallah|32000'),
    },
    {
      id: 'wg-2',
      workerName: 'Ghulam Mustafa Khaskheli',
      role: 'Solar Panel Technician',
      raastId: '0304-9127730',
      amountPkr: 45_000,
      feePkr: 0,
      sadaqahAttachedPkr: 2_250,
      status: 'pending',
      settledAt: null,
      txHash: null,
    },
    {
      id: 'wg-3',
      workerName: 'Allah Bachayo Machi',
      role: 'Cold-Chain Loader',
      raastId: '0333-2891044',
      amountPkr: 28_000,
      feePkr: 0,
      sadaqahAttachedPkr: 1_400,
      status: 'pending',
      settledAt: null,
      txHash: null,
    },
  ];

  private recentIntentSeals: IntentVerificationResult[] = [];
  private readonly seedSnapshot: PersistedLedgerSnapshot;

  constructor() {
    this.seedSnapshot = this.captureSnapshot();
    this.loadLedger();
  }

  private captureSnapshot(): PersistedLedgerSnapshot {
    return {
      killSwitchActive: this.killSwitchActive,
      agentTokensRevoked: this.agentTokensRevoked,
      activeAgentTokenCount: this.activeAgentTokenCount,
      failedAttempts: this.failedAttempts,
      lockoutUntil: this.lockoutUntil,
      lastToggledAt: this.lastToggledAt,
      rails: structuredClone(this.rails),
      deals: structuredClone(this.deals),
      mukasaEdges: structuredClone(this.mukasaEdges),
      lastMukasaReport: structuredClone(this.lastMukasaReport),
      mukasaClearedTotalPkr: this.mukasaClearedTotalPkr,
      maalGuard: structuredClone(this.maalGuard),
      wages: structuredClone(this.wages),
      recentIntentSeals: structuredClone(this.recentIntentSeals),
    };
  }

  private applySnapshot(snap: Partial<PersistedLedgerSnapshot>) {
    if (typeof snap.killSwitchActive === 'boolean') this.killSwitchActive = snap.killSwitchActive;
    if (typeof snap.agentTokensRevoked === 'boolean') this.agentTokensRevoked = snap.agentTokensRevoked;
    if (typeof snap.activeAgentTokenCount === 'number') this.activeAgentTokenCount = snap.activeAgentTokenCount;
    if (typeof snap.failedAttempts === 'number') this.failedAttempts = snap.failedAttempts;
    if (snap.lockoutUntil !== undefined) this.lockoutUntil = snap.lockoutUntil;
    if (snap.lastToggledAt !== undefined) this.lastToggledAt = snap.lastToggledAt;
    if (Array.isArray(snap.rails) && snap.rails.length > 0) this.rails = snap.rails;
    if (Array.isArray(snap.deals)) this.deals = snap.deals;
    if (Array.isArray(snap.mukasaEdges)) this.mukasaEdges = snap.mukasaEdges;
    if (snap.lastMukasaReport !== undefined) this.lastMukasaReport = snap.lastMukasaReport;
    if (typeof snap.mukasaClearedTotalPkr === 'number') this.mukasaClearedTotalPkr = snap.mukasaClearedTotalPkr;
    if (Array.isArray(snap.maalGuard)) this.maalGuard = snap.maalGuard;
    if (Array.isArray(snap.wages)) this.wages = snap.wages;
    if (Array.isArray(snap.recentIntentSeals)) this.recentIntentSeals = snap.recentIntentSeals;
  }

  private loadLedger() {
    try {
      if (fs.existsSync(LEDGER_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8')) as Partial<PersistedLedgerSnapshot>;
        this.applySnapshot(parsed);
        return;
      }
    } catch {
      // Seed clean ledger if file is missing or unreadable
    }
    this.saveLedger();
  }

  private saveLedger() {
    try {
      const dir = path.dirname(LEDGER_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${LEDGER_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.captureSnapshot(), null, 2), 'utf8');
      fs.renameSync(tmp, LEDGER_FILE);
    } catch {
      // Non-fatal fallback
    }
  }

  recordIntentResult(res: IntentVerificationResult) {
    this.recentIntentSeals = [res, ...this.recentIntentSeals].slice(0, 12);
    this.saveLedger();
  }

  toggleKillSwitch(params: {
    pin: string;
    action: 'freeze' | 'restore';
  }): { ok: boolean; error?: string; state: SovereignSystemState } {
    const now = Date.now();
    if (this.lockoutUntil && now < this.lockoutUntil) {
      const waitSec = Math.ceil((this.lockoutUntil - now) / 1000);
      return {
        ok: false,
        error: `PIN vault temporarily locked for ${waitSec}s after 5 failed attempts.`,
        state: this.getState(),
      };
    }

    const providedDigest = Buffer.from(sha256Hex(params.pin.trim()), 'utf8');
    const expectedDigest = Buffer.from(this.defaultPinDigest, 'utf8');
    const pinOk =
      providedDigest.length === expectedDigest.length &&
      crypto.timingSafeEqual(providedDigest, expectedDigest);

    if (!pinOk) {
      this.failedAttempts += 1;
      if (this.failedAttempts >= this.maxAttempts) {
        this.lockoutUntil = now + 120_000;
      }
      this.saveLedger();
      return {
        ok: false,
        error: `Invalid Sovereign PIN (${this.failedAttempts}/${this.maxAttempts} attempts).`,
        state: this.getState(),
      };
    }

    this.failedAttempts = 0;
    this.lockoutUntil = null;
    this.lastToggledAt = new Date().toISOString();

    if (params.action === 'freeze') {
      this.killSwitchActive = true;
      this.agentTokensRevoked = true;
      this.activeAgentTokenCount = 0;
      this.rails = this.rails.map((r) => ({ ...r, frozen: true }));
    } else {
      this.killSwitchActive = false;
      this.agentTokensRevoked = false;
      this.activeAgentTokenCount = 12;
      this.rails = this.rails.map((r) => ({ ...r, frozen: false }));
    }

    this.saveLedger();
    return { ok: true, state: this.getState() };
  }

  createDeal(
    input: Omit<SovereignDeal, 'id' | 'otaqMajlisWitnesses' | 'status' | 'contractHash' | 'createdAt'>,
  ): SovereignDeal {
    const id = `deal-${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString();
    const contractHash = sha256Hex(`${id}|${input.title}|${input.dealValuePkr}|${createdAt}`);
    const deal: SovereignDeal = {
      ...input,
      id,
      otaqMajlisWitnesses: {
        witness1: '',
        witness2: '',
        attestedAt: null,
        shahadahHash: null,
      },
      status: 'draft',
      contractHash,
      createdAt,
    };
    this.deals = [deal, ...this.deals];
    this.saveLedger();
    return deal;
  }

  attestDeal(id: string, witness1: string, witness2: string): SovereignDeal | null {
    const target = this.deals.find((d) => d.id === id);
    if (!target) return null;
    const attestedAt = new Date().toISOString();
    target.otaqMajlisWitnesses = {
      witness1: witness1.trim(),
      witness2: witness2.trim(),
      attestedAt,
      shahadahHash: sha256Hex(`${target.contractHash}|${witness1}|${witness2}|${attestedAt}`),
    };
    target.status = 'witnessed';
    this.saveLedger();
    return target;
  }

  addMukasaEdge(from: string, to: string, amountPkr: number, invoiceRef: string): MukasaEdge {
    const edge: MukasaEdge = {
      id: `mk-${Date.now().toString(36)}`,
      from: from.trim(),
      to: to.trim(),
      amountPkr: Math.max(100, Math.round(amountPkr)),
      invoiceRef: invoiceRef.trim() || `INV-${crypto.randomInt(100, 999)}`,
      cleared: false,
    };
    this.mukasaEdges = [...this.mukasaEdges, edge];
    this.saveLedger();
    return edge;
  }

  clearMukasa(): MukasaClearReport {
    const report = detectAndClearMukasaCycles(this.mukasaEdges);
    this.mukasaEdges = report.remainingEdges;
    this.mukasaClearedTotalPkr += report.totalClearedPkr;
    this.lastMukasaReport = report;
    this.saveLedger();
    return report;
  }

  addWage(
    workerName: string,
    role: string,
    raastId: string,
    amountPkr: number,
    sadaqahPct: number,
  ): HaqWagePayout {
    const safeAmt = Math.max(500, Math.round(amountPkr));
    const payout: HaqWagePayout = {
      id: `wg-${Date.now().toString(36)}`,
      workerName: workerName.trim(),
      role: role.trim() || 'Mill Worker',
      raastId: raastId.trim(),
      amountPkr: safeAmt,
      feePkr: 0,
      sadaqahAttachedPkr: Math.round((safeAmt * Math.max(5, Math.min(10, sadaqahPct))) / 100),
      status: 'pending',
      settledAt: null,
      txHash: null,
    };
    this.wages = [payout, ...this.wages];
    this.saveLedger();
    return payout;
  }

  settleWage(id: string): { ok: boolean; error?: string; payout?: HaqWagePayout } {
    if (this.killSwitchActive) {
      return { ok: false, error: 'Cannot settle wage while Kill-Switch is FROZEN.' };
    }
    const target = this.wages.find((w) => w.id === id);
    if (!target) return { ok: false, error: 'Wage payout record not found.' };
    target.status = 'settled';
    target.settledAt = new Date().toISOString();
    target.txHash = sha256Hex(`${target.id}|${target.raastId}|${target.amountPkr}|${target.settledAt}`);
    this.saveLedger();
    return { ok: true, payout: target };
  }

  rescueMaalGuard(id: string, rescuedBy: string): { ok: boolean; error?: string; item?: MaalGuardListing } {
    if (this.killSwitchActive) {
      return { ok: false, error: 'Cannot execute flash rescue while Kill-Switch is FROZEN.' };
    }
    const target = this.maalGuard.find((m) => m.id === id);
    if (!target) return { ok: false, error: 'Maal-Guard lot not found.' };
    target.rescued = true;
    target.rescuedBy = rescuedBy;
    this.saveLedger();
    return { ok: true, item: target };
  }

  resetDemoState(pin: string): { ok: boolean; error?: string; state: SovereignSystemState } {
    const providedDigest = Buffer.from(sha256Hex(pin.trim()), 'utf8');
    const expectedDigest = Buffer.from(this.defaultPinDigest, 'utf8');
    const pinOk =
      providedDigest.length === expectedDigest.length &&
      crypto.timingSafeEqual(providedDigest, expectedDigest);
    if (!pinOk) {
      return { ok: false, error: 'Valid Sovereign PIN required to reset ledger.', state: this.getState() };
    }
    this.applySnapshot(structuredClone(this.seedSnapshot));
    this.saveLedger();
    return { ok: true, state: this.getState() };
  }

  getState(): SovereignSystemState {
    const activeDealsPkr = this.deals.reduce((sum, d) => sum + d.dealValuePkr, 0);
    const sadaqahReservePkr =
      this.deals.reduce(
        (sum, d) =>
          sum +
          Math.round(
            d.dealValuePkr *
              (Math.max(d.ujrahMarginPct, d.mudarabahEquitySharePct) / 100) *
              (d.khufiyaSadaqahPct / 100),
          ),
        0,
      ) + this.wages.reduce((s, w) => s + w.sadaqahAttachedPkr, 0);

    const wagesPaidPkr = this.wages
      .filter((w) => w.status === 'settled')
      .reduce((sum, w) => sum + w.amountPkr, 0);

    const goldEquivalentGrams = Number(((activeDealsPkr * 0.08 * 0.35) / 24_800).toFixed(2));

    return {
      version: 'v30.0 (Apex Singularity Edition)',
      headquarters: 'Sakrand, Shaheed Benazirabad, Sindh, Pakistan',
      killSwitch: {
        active: this.killSwitchActive,
        agentTokensRevoked: this.agentTokensRevoked,
        activeAgentTokenCount: this.activeAgentTokenCount,
        failedAttempts: this.failedAttempts,
        maxAttempts: this.maxAttempts,
        lockoutUntil: this.lockoutUntil,
        lastToggledAt: this.lastToggledAt,
        rails: this.rails,
      },
      deals: this.deals,
      mukasaEdges: this.mukasaEdges,
      lastMukasaReport: this.lastMukasaReport,
      maalGuard: this.maalGuard,
      wages: this.wages,
      recentIntentSeals: this.recentIntentSeals,
      totals: {
        activeDealsPkr,
        sadaqahReservePkr,
        wagesPaidPkr,
        mukasaClearedTotalPkr: this.mukasaClearedTotalPkr,
        goldEquivalentGrams,
      },
    };
  }
}

export const sovereignStore = new SovereignStore();
