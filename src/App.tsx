import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Award, RefreshCw } from 'lucide-react';
import { AjrakCursorTrail } from './components/AjrakCursorTrail';
import { AjrakLivingStage } from './components/AjrakLivingStage';
import { AjrakSovereignGate } from './components/AjrakSovereignGate';
import { AmbientAjrakCanvas } from './components/AmbientAjrakCanvas';
import { CinematicDirectorStage } from './components/CinematicDirectorStage';
import { DignityImpactRibbon } from './components/DignityImpactRibbon';
import { GoldDustOverlay } from './components/GoldDustOverlay';
import { IndusCulturalWave } from './components/IndusCulturalWave';
import { JudgePassportModal } from './components/JudgePassportModal';
import { SindhCultureGallery } from './components/SindhCultureGallery';
import {
  AjrakBlockBorder,
  AjrakClothPattern,
  AjrakLoomDivider,
  HalaKashiCornerOrnament,
} from './components/SovereignArt';
import { SovereignShields } from './components/SovereignShields';
import { TreasuryOperations } from './components/TreasuryOperations';
import { VeritasLedger } from './components/VeritasLedger';
import { VoiceMizanWorkspace } from './components/VoiceMizanWorkspace';
import type {
  AjrakDyeTheme,
  AudienceMode,
  FXUnit,
  LocaleScript,
  QuickCommandDraft,
  SovereignSystemState,
} from './types/sovereign';
import { triggerApexHaptic } from './utils/haptics';

type OsTab = 'treasury' | 'shields' | 'voice' | 'ledger';

const TAB_CONTEXT: Record<Exclude<OsTab, 'treasury'>, { title: string; subtitle: string }> = {
  shields: {
    title: 'Anti-Scam Cognitive Firewall & 21-Rail Emergency Switchboard',
    subtitle: 'Defend merchants against fake 8171/OTP calls, audit invoice math for hidden Riba, and freeze payment rails instantaneously.',
  },
  voice: {
    title: 'Multilingual Voice-to-Hisab, Biometric Spectrum & Haptic Shield',
    subtitle: 'Convert spoken Urdu, Sindhi, Arabic, or English bazaar notes into verified entries with vocal cadence attestation.',
  },
  ledger: {
    title: 'Veritas Immutable Audit Ledger & Otaq Majlis Witness Seals',
    subtitle: 'Inspect cryptographic SHA-256 contract chains, export compliance proofs, and print physical bazaar audit records.',
  },
};

const KPI_LABELS: Record<
  LocaleScript,
  { estate: string; gold: string; mukasa: string; wages: string; sadaqah: string }
> = {
  en: {
    estate: 'Active Trade Estate',
    gold: '24K Gold Hedge',
    mukasa: 'Mukasa Cleared',
    wages: 'Labor Wages Paid',
    sadaqah: 'Sadaqah Reserve',
  },
  ur: {
    estate: 'کل تجارتی اثاثہ',
    gold: 'سونا 24 قیراط تحفظ',
    mukasa: 'مقاصہ کلیئرنگ',
    wages: 'مزدوروں کی اجرت',
    sadaqah: 'خفیہ صدقہ فنڈ',
  },
  sd: {
    estate: 'فعال واپاري ماليت',
    gold: '24 ڪيرٽ سون جو تحفظ',
    mukasa: 'مقاصه قرض صفائي',
    wages: 'مزدورن جي اجرت',
    sadaqah: 'خفيه صدقو فنڊ',
  },
};

export default function App() {
  const [state, setState] = useState<SovereignSystemState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OsTab>('treasury');
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('enterprise');
  const [script, setScript] = useState<LocaleScript>('en');
  const [dyeTheme, setDyeTheme] = useState<AjrakDyeTheme>('indigo');
  const [fxUnit, setFxUnit] = useState<FXUnit>('PKR');
  const [commandDraft, setCommandDraft] = useState<QuickCommandDraft | null>(null);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  const [directorOpen, setDirectorOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [vaultLocked, setVaultLocked] = useState(false);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/sovereign/state');
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = (await res.json()) as SovereignSystemState;
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to BolMizan backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const handleModeChange = (nextMode: AudienceMode) => {
    setAudienceMode(nextMode);
    triggerApexHaptic('tap', `Switched to ${nextMode}`);
  };

  const handleScriptChange = (nextScript: LocaleScript) => {
    setScript(nextScript);
    triggerApexHaptic('tap', `Language switched to ${nextScript}`);
  };

  const handleDyeThemeChange = (nextDye: AjrakDyeTheme) => {
    setDyeTheme(nextDye);
    triggerApexHaptic('seal_minted', `Ajrak weave switched to ${nextDye}`);
  };

  const handleFxUnitChange = (nextFx: FXUnit) => {
    setFxUnit(nextFx);
    triggerApexHaptic('tap', `Currency switched to ${nextFx}`);
  };

  const formatKpiMoney = (pkr: number): string => {
    if (fxUnit === 'USD') return `$${Math.round(pkr / 278).toLocaleString('en-US')}`;
    if (fxUnit === 'SAR') return `SAR ${Math.round(pkr / 74.1).toLocaleString('en-US')}`;
    if (fxUnit === 'GOLD') return `${(pkr / 24_800).toFixed(1)}g Au`;
    if (pkr >= 1_000_000) return `PKR ${(pkr / 1_000_000).toFixed(2)}M`;
    return `PKR ${Math.round(pkr).toLocaleString('en-US')}`;
  };

  const handleSendToParchi = (draft: Omit<QuickCommandDraft, 'id'>) => {
    setCommandDraft({ ...draft, id: Date.now() });
    setActiveTab('treasury');
    triggerApexHaptic('seal_minted', 'Stamped into Live Cotton Parchi');
    setTimeout(() => {
      document.getElementById('treasury-studio')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleUniversalCommand = async (raw: string) => {
    const lower = raw.toLowerCase();
    setCommandFeedback(null);

    if (lower.includes('8171') || lower.includes('otp') || lower.includes('scam') || lower.includes('pin')) {
      setActiveTab('shields');
      triggerApexHaptic('security_violation', 'Routed to Cognitive Firewall');
      return;
    }

    if (lower.includes('hedge') || lower.includes('gold') || lower.includes('murabaha') || lower.includes('how') || lower.includes('structure')) {
      setCommandFeedback('Consulting Mizan-Advisor AI Strategist...');
      try {
        const res = await fetch('/api/ai/mizan-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: raw, language: 'English & Urdu' }),
        });
        if (res.ok) {
          const data = await res.json();
          setCommandFeedback(data.answer);
          triggerApexHaptic('seal_minted', 'AI CFO Answered');
          return;
        }
      } catch {
        setActiveTab('voice');
        return;
      }
    }

    // Otherwise parse via Voice-to-Hisab endpoint and stamp directly into Parchi!
    try {
      const res = await fetch('/api/ai/extract-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: raw }),
      });
      if (res.ok) {
        const parsed = await res.json();
        handleSendToParchi({
          customer: parsed.partyName || 'Walk-in Buyer',
          item: parsed.commodity || raw,
          amountPkr: parsed.amountPkr ?? 18500,
          entryType: lower.includes('wasooli') || lower.includes('paid') ? 'Wasooli (Paid)' : 'Udhaar (Credit)',
        });
        setCommandFeedback(`Parchi stamped for ${parsed.partyName} — PKR ${(parsed.amountPkr ?? 18500).toLocaleString('en-US')}.`);
        return;
      }
    } catch {
      // Fallback local parse
    }
    const nums = raw.match(/\d[\d,]*/g);
    const amt = nums ? Number(nums[nums.length - 1].replace(/,/g, '')) : 18500;
    handleSendToParchi({
      customer: raw.split(/\s+/).slice(0, 2).join(' ') || 'Walk-in Buyer',
      item: raw,
      amountPkr: Math.max(50, amt),
      entryType: 'Udhaar (Credit)',
    });
  };

  const handleTabChange = (tab: OsTab) => {
    setActiveTab(tab);
    triggerApexHaptic('tap', `Navigated to ${tab}`);
  };

  const mizanTilt = state
    ? state.killSwitch.active
      ? -12
      : Math.min(8, Math.max(-8, state.deals.length - 3))
    : 0;

  const kpiCopy = KPI_LABELS[script];

  return (
    <div
      className={`min-h-screen relative flex flex-col ajrak-canvas-bg ajrak-dye-${dyeTheme} text-[#F8F7F3] ${
        audienceMode === 'sabzi-wala' ? 'ajrak-crimson-mode' : ''
      }`}
    >
      {/* Living Atmospheric Layers */}
      <AmbientAjrakCanvas crimson={audienceMode === 'sabzi-wala'} dyeTheme={dyeTheme} />
      <GoldDustOverlay />
      <AjrakCursorTrail />

      {/* Clean Single-Row 3-Zone Editorial Header */}
      <header className="sticky top-0 z-40 border-b border-[#F59E0B]/20 bg-[#041016]/95">
        <div className="ajrak-mosaic-band" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleTabChange('treasury')}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-[#FDE68A] transition-colors"
          >
            BolMizan
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary Workspace Navigation"
            className="flex items-center gap-5 sm:gap-7 overflow-x-auto text-xs sm:text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => handleTabChange('treasury')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'treasury'
                  ? 'border-[#F59E0B] text-white font-semibold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Khata &amp; Treasury
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('shields')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'shields'
                  ? 'border-[#9B1C2E] text-white font-semibold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Shields &amp; Switchboard
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('voice')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'voice'
                  ? 'border-[#14B8A6] text-white font-semibold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Voice &amp; Biometrics
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('ledger')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'ledger'
                  ? 'border-[#F59E0B] text-white font-semibold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Audit Ledger
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="no-print shrink-0">
            <button
              type="button"
              onClick={() => setPassportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#14B8A6] text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Judge Passport</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {loading && !state ? (
          <div className="rounded-2xl border border-[#F59E0B]/25 ajrak-moving-glass p-10 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#FDE68A]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading BolMizan Sovereign Workspace...</span>
            </div>
          </div>
        ) : !state ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-200">
              {error || 'Unable to load workspace state.'}
            </p>
            <button
              type="button"
              onClick={() => void refreshState()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-xs font-bold text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'treasury' ? (
              <>
                {/* Living Cultural Hero Command Stage with Universal Prompt & Multi-Currency */}
                <AjrakLivingStage
                  state={state}
                  mode={audienceMode}
                  onModeChange={handleModeChange}
                  script={script}
                  onScriptChange={handleScriptChange}
                  dyeTheme={dyeTheme}
                  onDyeThemeChange={handleDyeThemeChange}
                  fxUnit={fxUnit}
                  onFxUnitChange={handleFxUnitChange}
                  onUniversalCommand={handleUniversalCommand}
                  mizanTilt={mizanTilt}
                  onReplayWelcome={() => triggerApexHaptic('authenticate', 'Ajrak Welcome Replayed')}
                  onOpenDirector={() => setDirectorOpen(true)}
                  onLockVault={() => {
                    triggerApexHaptic('signOut', 'Vault Locked');
                    setVaultLocked(true);
                  }}
                />

                {commandFeedback && (
                  <div className="rounded-xl border border-[#14B8A6]/45 bg-[#04151B] px-5 py-3.5 text-xs sm:text-sm text-[#FDE68A] flex items-center justify-between gap-3">
                    <span>{commandFeedback}</span>
                    <button
                      type="button"
                      onClick={() => setCommandFeedback(null)}
                      className="text-xs font-semibold text-[#5EEAD4] hover:underline shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Full-Width 5-Metric Sovereign KPI Strip (Dynamically Scaled to PKR / USD / SAR / 24K Au) */}
                <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 border-y border-[#F59E0B]/15 py-5">
                  <div>
                    <div className="text-xs text-[#5EEAD4]">{kpiCopy.estate}</div>
                    <div className="font-mono-tabular text-xl font-bold text-white mt-0.5">
                      {formatKpiMoney(state.totals.activeDealsPkr)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#5EEAD4]">{kpiCopy.gold}</div>
                    <div className="font-mono-tabular text-xl font-bold text-[#FDE68A] mt-0.5">
                      {state.totals.goldEquivalentGrams}g Au
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#5EEAD4]">{kpiCopy.mukasa}</div>
                    <div className="font-mono-tabular text-xl font-bold text-emerald-300 mt-0.5">
                      {formatKpiMoney(state.totals.mukasaClearedTotalPkr)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#5EEAD4]">{kpiCopy.wages}</div>
                    <div className="font-mono-tabular text-xl font-bold text-white mt-0.5">
                      {formatKpiMoney(state.totals.wagesPaidPkr)}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-xs text-[#5EEAD4]">{kpiCopy.sadaqah}</div>
                    <div className="font-mono-tabular text-xl font-bold text-[#FDE68A] mt-0.5">
                      {formatKpiMoney(state.totals.sadaqahReservePkr)}
                    </div>
                  </div>
                </section>

                {/* Emotional Indus Cultural Wave Storytelling Band */}
                <IndusCulturalWave
                  onJumpToTab={handleTabChange}
                  totalSadaqahPkr={state.totals.sadaqahReservePkr}
                  activeDealsCount={state.deals.length}
                  script={script}
                />

                {/* Living Sindhi Heritage & Color Pigment Photographic Gallery */}
                <SindhCultureGallery script={script} />

                {/* Human Meaning & Empathy Impact Translation */}
                <DignityImpactRibbon state={state} mode={audienceMode} script={script} />
              </>
            ) : (
              /* Focused Ajrak-Woven Workspace Banner on Specialized Tabs */
              <section className="relative rounded-2xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass shadow-lg">
                <AjrakBlockBorder />
                <AjrakClothPattern
                  accentHex={activeTab === 'shields' ? '#9B1C2E' : activeTab === 'voice' ? '#14B8A6' : '#F59E0B'}
                  opacityClass="opacity-[0.1]"
                />
                <HalaKashiCornerOrnament className="absolute top-3 left-2 opacity-65" />
                <div className="relative z-10 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 pl-3">
                    <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#5EEAD4]">
                      Ajrak Sovereign Module · Sakrand 0% Riba Standard
                    </div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                      {TAB_CONTEXT[activeTab].title}
                    </h1>
                    <p className="text-xs text-[#F8F7F3]/80 max-w-2xl">
                      {TAB_CONTEXT[activeTab].subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('treasury')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#F59E0B]/35 bg-[#041219]/80 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/15 whitespace-nowrap shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Command Home</span>
                  </button>
                </div>
              </section>
            )}

            {/* Active Workspace Tab */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'treasury' && (
                <TreasuryOperations
                  state={state}
                  mode={audienceMode}
                  script={script}
                  fxUnit={fxUnit}
                  externalDraft={commandDraft}
                  onStateRefresh={refreshState}
                />
              )}
              {activeTab === 'shields' && (
                <SovereignShields state={state} onStateRefresh={refreshState} />
              )}
              {activeTab === 'voice' && (
                <VoiceMizanWorkspace onSendToParchi={handleSendToParchi} />
              )}
              {activeTab === 'ledger' && (
                <VeritasLedger state={state} onStateRefresh={refreshState} />
              )}
            </motion.div>
          </>
        )}
      </main>

      <footer className="relative z-20 border-t border-[#F59E0B]/20 bg-[#030B10]/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-5 space-y-2 text-center">
          <AjrakLoomDivider label="Ajrak Craft · Zero-Riba Sovereign Standard" />
          <div dir="rtl" className="text-sm font-semibold text-[#FDE68A]/90">
            سائينم سدائين ڪرين مٿي سنڌ سڪار — شاهه عبداللطيف ڀٽائي
          </div>
          <p className="text-xs text-[#F8F7F3]/70">
            BolMizan · Sakrand, Shaheed Benazirabad, Sindh · Honest Weight, Otaq Witness &amp; 0% Fee Raast Trade
          </p>
        </div>
        <AjrakBlockBorder />
      </footer>

      {/* Overlays */}
      <CinematicDirectorStage open={directorOpen} onClose={() => setDirectorOpen(false)} />
      {state && (
        <JudgePassportModal
          open={passportOpen}
          onClose={() => setPassportOpen(false)}
          state={state}
        />
      )}
      <AjrakSovereignGate locked={vaultLocked} onUnlock={() => setVaultLocked(false)} />
    </div>
  );
}