export type AudienceMode = 'sabzi-wala' | 'enterprise';
export type LocaleScript = 'en' | 'ur' | 'sd';
export type AjrakDyeTheme = 'indigo' | 'crimson' | 'kashi';
export type FXUnit = 'PKR' | 'USD' | 'SAR' | 'GOLD';

export interface QuickCommandDraft {
  id: number;
  customer: string;
  item: string;
  amountPkr: number;
  entryType: 'Udhaar (Credit)' | 'Wasooli (Paid)';
}

export interface PaymentRail {
  id: string;
  name: string;
  category: 'Domestic Raast & Wallets' | 'Commercial Banking' | 'Gulf & FX' | 'Sovereign Escrows';
  frozen: boolean;
  latencyMs: number;
}

export interface IntentVerificationResult {
  decision: 'SEALED' | 'BLOCKED_SCAM' | 'SUSPECT_BOT';
  bayesianPosterior: number;
  shannonEntropy: number;
  cadenceCV: number;
  cadenceVarianceMs2: number;
  latencyMs: number;
  humanIntentSeal: string | null;
  triggers: string[];
  alertUrdu: string;
  alertSindhi: string;
  alertEnglish: string;
  timestamp: string;
}

export interface TruthFilterResult {
  verdict: 'VERIFIED' | 'MANIPULATION_DETECTED' | 'RIBA_OR_MATH_ALERT';
  manipulationScore: number;
  ribaDetected: boolean;
  ribaClauses: string[];
  manipulationSignals: string[];
  mathCheck: {
    valid: boolean;
    computedTotal: number;
    claimedTotal: number;
    discrepancy: number;
  };
  hashCheck: {
    provided: string | null;
    computedSha256: string;
    matched: boolean;
  };
  summary: string;
  timestamp: string;
}

export interface KillSwitchState {
  active: boolean;
  agentTokensRevoked: boolean;
  activeAgentTokenCount: number;
  failedAttempts: number;
  maxAttempts: number;
  lockoutUntil: number | null;
  lastToggledAt: string | null;
  rails: PaymentRail[];
}

export interface NiyatChecklist {
  halalOrigin: boolean;
  zeroRiba: boolean;
  zeroDeception: boolean;
  haqEMazdoorPriority: boolean;
}

export interface SovereignDeal {
  id: string;
  title: string;
  sector: 'sector-1-food-water' | 'sector-2-solar-energy';
  commodity: string;
  originCity: string;
  destinationCity: string;
  supplierName: string;
  buyerName: string;
  dealValuePkr: number;
  dealValueUsd: number;
  ujrahMarginPct: number;
  mudarabahEquitySharePct: number;
  syndicateMembers: number;
  khufiyaSadaqahPct: number;
  niyatChecklist: NiyatChecklist;
  defectDisclosure: string;
  warehouseProof: {
    videoFileRef: string;
    gpsCoords: string;
    capturedAt: string;
    verified: boolean;
  };
  otaqMajlisWitnesses: {
    witness1: string;
    witness2: string;
    attestedAt: string | null;
    shahadahHash: string | null;
  };
  status: 'draft' | 'witnessed' | 'active' | 'settled';
  contractHash: string;
  createdAt: string;
}

export interface MukasaEdge {
  id: string;
  from: string;
  to: string;
  amountPkr: number;
  invoiceRef: string;
  cleared: boolean;
}

export interface MukasaClearReport {
  cyclesDetected: number;
  totalClearedPkr: number;
  clearedLoops: Array<{ path: string[]; clearedAmountPkr: number }>;
  remainingEdges: MukasaEdge[];
}

export interface MaalGuardListing {
  id: string;
  item: string;
  location: string;
  originalPricePkr: number;
  rescuePricePkr: number;
  discountPct: number;
  hoursRemaining: number;
  quantityKg: number;
  rescued: boolean;
  rescuedBy?: string;
}

export interface HaqWagePayout {
  id: string;
  workerName: string;
  role: string;
  raastId: string;
  amountPkr: number;
  feePkr: number;
  sadaqahAttachedPkr: number;
  status: 'pending' | 'settled';
  settledAt: string | null;
  txHash: string | null;
}

export interface VoiceExtractionResult {
  engine: 'gemini-2.5-flash' | 'utf8-offline-regex';
  languageDetected: 'Urdu' | 'Sindhi' | 'Arabic' | 'English' | 'Multilingual';
  partyName: string;
  commodity: string;
  quantity: number | null;
  unit: string;
  amountPkr: number | null;
  transactionType: 'Mudarabah' | 'Murabaha' | 'Ujrah' | 'Haq-e-Mazdoor' | 'Sadaqah' | 'General';
  ribaFlags: string[];
  summary: string;
  rawText: string;
}

export interface SovereignSystemState {
  version: string;
  headquarters: string;
  killSwitch: KillSwitchState;
  deals: SovereignDeal[];
  mukasaEdges: MukasaEdge[];
  lastMukasaReport: MukasaClearReport | null;
  maalGuard: MaalGuardListing[];
  wages: HaqWagePayout[];
  recentIntentSeals: IntentVerificationResult[];
  totals: {
    activeDealsPkr: number;
    sadaqahReservePkr: number;
    wagesPaidPkr: number;
    mukasaClearedTotalPkr: number;
    goldEquivalentGrams: number;
  };
}
