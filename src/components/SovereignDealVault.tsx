import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  Printer,
  ShieldCheck,
  Sprout,
  Sun,
  Users,
} from 'lucide-react';
import basmatiImg from '../assets/images/sakrand_basmati_mizan_1794637623859.jpg';
import datesMangoesImg from '../assets/images/khairpur_dates_mangoes_1794637623124.jpg';
import solarWaterImg from '../assets/images/indus_solar_water_1794637624566.jpg';
import {
  ChromaticKashiRule,
  CompoundingTrajectoryChart,
  GoldVaultEmblem,
  HalaKashiFrieze,
  IndusLandEmblem,
  OrbitalCompoundingRing,
  ResilientImage,
  WaqfWaterEmblem,
} from './SovereignArt';
import { triggerSovereignHaptic } from '../utils/haptics';
import type { SovereignDeal, SovereignSystemState } from '../types/sovereign';

interface SovereignDealVaultProps {
  state: SovereignSystemState;
  onStateRefresh: () => Promise<void>;
}

const OUTREACH_TEMPLATES: Record<'English' | 'Urdu' | 'Sindhi' | 'Arabic', { title: string; body: string }> = {
  English: {
    title: 'Riyadh / Dubai Institutional Buyer & Sakrand Mill Outreach',
    body: `Assalam-o-Alaikum,
We operate BolMizan VERITAS-SOVEREIGN (Sakrand, Sindh, Pakistan) executing direct zero-interest Murabaha & Mudarabah exports of Sakrand Super Kernel Basmati Rice, Khairpur Aseel Dates, and Sindhri Mangoes.
• Live unedited warehouse video + GPS coordinates attached before dispatch
• Upfront Siddiq (RA) defect disclosure (every >=1% quality variance stated honestly)
• Two-witness Otaq Majlis attestation & Pakistan ETO-2002 / Quran 2:282 sealed contract
Reply to schedule direct Sakrand warehouse inspection.`,
  },
  Urdu: {
    title: 'سندھ سپلائرز اور خلیجی خریداروں کے لیے پیغام (اردو)',
    body: `السلام علیکم ورحمۃ اللہ،
بول میزان ویریٹاس سوورین (سکرنڈ، سندھ) بغیر سود مرابحہ اور مضاربہ کے تحت سکرنڈ باسمتی چاول، خیرپور اصیل کھجور اور سندھڑی آم براہِ راست ریاض اور دبئی برآمد کرتا ہے۔
• گودام کی لائیو ویڈیو اور جی پی ایس لوکیشن روانگی سے پہلے فراہم کی جاتی ہے
• صدیق اکبرؓ کے اصول کے مطابق ہر عیب یا کمی پیشگی بیان کی جاتی ہے
• قرآن 2:282 کے مطابق دو گواہوں کے ساتھ تحریری معاہدہ`,
  },
  Sindhi: {
    title: 'سنڌ سپلائرز ۽ گلف خريدارن لاءِ پيغام (سنڌي)',
    body: `السلام عليڪم ورحمة الله،
بول ميزان ويريتاس سوورين (سڪرنڊ، سنڌ) بغير وياج مرابحہ ۽ مضاربت ذريعي سڪرنڊ باسمتي چانور، خيرپور اصيل کجور ۽ سنڌڙي انب سڌو رياض ۽ دبئي موڪلي ٿو.
• گودام جي لائيو وڊيو ۽ GPS پتو روانگي کان اڳ ڏنو ويندو آهي
• ڪنهن به 1 سيڪڙو نقص جو اڳواٽ صاف اقرار (صديقِ اڪبر رضي الله عنه جو اصول)
• قرآن 2:282 موجب ٻن شاهدن سان لکت معاهدو`,
  },
  Arabic: {
    title: 'رسالة تواصل للمشترين في الرياض ودبي (العربية)',
    body: `السلام عليكم ورحمة الله وبركاته،
مؤسسة بول ميزان فيريتاس (سكرند، السند، باكستان) تقدم توريداً مباشراً خالياً من الربا بصيغة المرابحة والمضاربة لأرز بسمتي سكرند الفاخر، وتمور خيربور، ومانجو السندري إلى الرياض ودبي.
• فيديو حي غير معدل من المستودع مع إحداثيات GPS قبل الشحن
• إفصاح مسبق وصادق عن أي تفاوت في الجودة (منهج الصديق رضي الله عنه)
• عقد موثق بشاهدين وفق سورة البقرة ٢٨٢ وقانون المعاملات الإلكترونية`,
  },
};

export const SovereignDealVault: React.FC<SovereignDealVaultProps> = ({
  state,
  onStateRefresh,
}) => {
  // Interactive 100,000,000x Compounding Formula Simulator State
  const [trustIntegrity, setTrustIntegrity] = useState(0.98);
  const [aiSpeed, setAiSpeed] = useState(25);
  const [annualDeals, setAnnualDeals] = useState(18);
  const [mudarabahEquityPct, setMudarabahEquityPct] = useState(22);
  const [sadaqahPct, setSadaqahPct] = useState(8);
  const [haqMazdoorRatio, setHaqMazdoorRatio] = useState(100);

  // Pillar D: 50-Year Hard-Asset & Waqf Sovereignty Converter
  const [goldAllocPct, setGoldAllocPct] = useState(35);
  const [farmlandAllocPct, setFarmlandAllocPct] = useState(40);
  const [waqfAllocPct, setWaqfAllocPct] = useState(25);

  // New Zero-Capital Deal Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sector, setSector] = useState<'sector-1-food-water' | 'sector-2-solar-energy'>('sector-1-food-water');
  const [title, setTitle] = useState('');
  const [commodity, setCommodity] = useState('Super Kernel Basmati Rice');
  const [supplierName, setSupplierName] = useState('Sakrand Mill Cooperative');
  const [buyerName, setBuyerName] = useState('Riyadh Al-Mizan Foods');
  const [dealValuePkr, setDealValuePkr] = useState('2500000');
  const [ujrahMarginPct, setUjrahMarginPct] = useState('6.5');
  const [syndicateMembers, setSyndicateMembers] = useState('25');
  const [dealMudarabahPct, setDealMudarabahPct] = useState('20');
  const [dealSadaqahPct, setDealSadaqahPct] = useState(7);
  const [defectDisclosure, setDefectDisclosure] = useState(
    '1.0% natural moisture/size variance disclosed upfront per Abu Bakr Siddiq (RA) Zero-Hype standard.',
  );
  const [warehouseGps, setWarehouseGps] = useState('26.1384° N, 68.2747° E (Sakrand)');
  const [warehouseVideoRef, setWarehouseVideoRef] = useState('sakrand_unedited_dispatch.mp4');
  const [niyat, setNiyat] = useState({
    halalOrigin: false,
    zeroRiba: false,
    zeroDeception: false,
    haqEMazdoorPriority: false,
  });
  const [dealError, setDealError] = useState<string | null>(null);
  const [dealSaving, setDealSaving] = useState(false);

  // Otaq Majlis Witness Attestation + Printable Contract Modal
  const [attestTargetId, setAttestTargetId] = useState<string | null>(null);
  const [witness1, setWitness1] = useState('');
  const [witness2, setWitness2] = useState('');
  const [attestError, setAttestError] = useState<string | null>(null);
  const [attestSaving, setAttestSaving] = useState(false);
  const [printableDeal, setPrintableDeal] = useState<SovereignDeal | null>(null);

  useEffect(() => {
    if (!printableDeal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPrintableDeal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [printableDeal]);

  // Outreach template state
  const [outreachLang, setOutreachLang] = useState<'English' | 'Urdu' | 'Sindhi' | 'Arabic'>('English');
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  // 100,000,000x Compounding Formula Calculation
  const formulaMetrics = useMemo(() => {
    const baseIntegritySpeed = trustIntegrity * aiSpeed;
    const mudarabahExponent = 1 + mudarabahEquityPct / 100;
    const dealCompound = Math.pow(Math.max(1, annualDeals * 12), mudarabahExponent);
    const barakahTerm = 1 + (sadaqahPct / 10) * 1.5 + (haqMazdoorRatio / 100) * 1.25;
    const exponentialPower = Math.round(baseIntegritySpeed * dealCompound * barakahTerm * 1000);
    const year1SeedPkr = annualDeals * 380_000;
    const year2SolarPkr = Math.round(year1SeedPkr * (1 + mudarabahEquityPct / 20) * 2.4);
    const year3SovereignPkr = Math.round(year2SolarPkr * barakahTerm * 3.1);

    return {
      exponentialPower,
      year1SeedPkr,
      year2SolarPkr,
      year3SovereignPkr,
    };
  }, [trustIntegrity, aiSpeed, annualDeals, mudarabahEquityPct, sadaqahPct, haqMazdoorRatio]);

  // Hard-Asset Treasury Vault Projections
  const treasuryBreakdown = useMemo(() => {
    const totalAlloc = Math.max(1, goldAllocPct + farmlandAllocPct + waqfAllocPct);
    const netHalalProfitPkr = state.deals.reduce(
      (sum, d) =>
        sum +
        Math.round(
          d.dealValuePkr * (Math.max(d.ujrahMarginPct, d.mudarabahEquitySharePct) / 100),
        ),
      0,
    );
    const goldPkr = Math.round(netHalalProfitPkr * (goldAllocPct / totalAlloc));
    const farmlandPkr = Math.round(netHalalProfitPkr * (farmlandAllocPct / totalAlloc));
    const waqfPkr = Math.round(netHalalProfitPkr * (waqfAllocPct / totalAlloc));

    return {
      netHalalProfitPkr,
      goldGrams24k: Number((goldPkr / 24_800).toFixed(2)),
      silverGrams: Number((goldPkr / 315).toFixed(1)),
      farmlandAcresSakrand: Number((farmlandPkr / 1_850_000).toFixed(2)),
      waqfPkr,
      cleanWaterPeopleServed: Math.floor(waqfPkr / 450),
    };
  }, [state.deals, goldAllocPct, farmlandAllocPct, waqfAllocPct]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setDealError(null);
    if (!niyat.halalOrigin || !niyat.zeroRiba || !niyat.zeroDeception || !niyat.haqEMazdoorPriority) {
      triggerSovereignHaptic('error');
      setDealError('Complete all 4 Pre-Deal Niyat Ki Durustagi checks before sealing.');
      return;
    }
    setDealSaving(true);
    try {
      const res = await fetch('/api/sovereign/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || `${commodity} · Sakrand Deal`,
          sector,
          commodity,
          originCity: 'Sakrand, Sindh',
          destinationCity: sector === 'sector-1-food-water' ? 'Riyadh / Dubai' : 'Sakrand / Nawabshah Cluster',
          supplierName,
          buyerName,
          dealValuePkr: Number(dealValuePkr) || 2_500_000,
          ujrahMarginPct: sector === 'sector-1-food-water' ? Number(ujrahMarginPct) || 6.5 : 0,
          mudarabahEquitySharePct: sector === 'sector-2-solar-energy' ? Number(dealMudarabahPct) || 20 : 0,
          syndicateMembers: sector === 'sector-2-solar-energy' ? Number(syndicateMembers) || 25 : 1,
          khufiyaSadaqahPct: dealSadaqahPct,
          niyatChecklist: niyat,
          defectDisclosure,
          warehouseGps,
          warehouseVideoRef,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        triggerSovereignHaptic('error');
        setDealError(data.error || 'Could not create deal.');
      } else {
        triggerSovereignHaptic('authenticate');
        setShowCreateForm(false);
        setTitle('');
        setNiyat({ halalOrigin: false, zeroRiba: false, zeroDeception: false, haqEMazdoorPriority: false });
        await onStateRefresh();
      }
    } catch (err) {
      triggerSovereignHaptic('error');
      setDealError(err instanceof Error ? err.message : 'Network error sealing deal.');
    } finally {
      setDealSaving(false);
    }
  };

  const handleAttestDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attestTargetId || !witness1.trim() || !witness2.trim()) return;
    setAttestError(null);
    setAttestSaving(true);
    try {
      const res = await fetch(`/api/sovereign/deals/${attestTargetId}/attest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ witness1, witness2 }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Witness attestation failed (HTTP ${res.status})`);
      }
      triggerSovereignHaptic('authenticate');
      setAttestTargetId(null);
      setWitness1('');
      setWitness2('');
      await onStateRefresh();
    } catch (err) {
      triggerSovereignHaptic('error');
      setAttestError(err instanceof Error ? err.message : 'Unable to seal Otaq Majlis Shahadah.');
    } finally {
      setAttestSaving(false);
    }
  };

  const handleCopyOutreach = async () => {
    triggerSovereignHaptic('tap');
    await navigator.clipboard.writeText(OUTREACH_TEMPLATES[outreachLang].body);
    setCopiedLang(outreachLang);
    window.setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Interactive 100,000,000x Compounding Formula Simulator */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <ChromaticKashiRule />
        <div className="p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9B1C2E] dark:text-[#F59E0B]">
            5 Exponential Compounding Multiplier Pillars
          </p>
          <h2 className="font-display text-2xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
            100,000,000x Sovereign Compounding Simulator
          </h2>
          <p className="font-mono-tabular text-xs sm:text-sm ajrak-well text-[#F8F7F3] border border-[#0D2327]/10 dark:border-[#F8F7F3]/12 rounded-lg px-4 py-3 text-[#0D2327] dark:text-[#F8F7F3]">
            100,000,000x Power = (Sadiq-o-Ameen Trust × AI Agent Speed) × (Zero-Capital Food/Energy Deals)^(Mudarabah Equity) + Barakah (Sadaqah & Haq-e-Mazdoor)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0D2327]/80 dark:text-[#F8F7F3]/80">Sadiq-o-Ameen Trust</span>
                <span className="font-mono-tabular font-semibold">{(trustIntegrity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.01}
                value={trustIntegrity}
                onChange={(e) => setTrustIntegrity(Number(e.target.value))}
                className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0D2327]/80 dark:text-[#F8F7F3]/80">AI Agent Execution Speed</span>
                <span className="font-mono-tabular font-semibold">{aiSpeed}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={aiSpeed}
                onChange={(e) => setAiSpeed(Number(e.target.value))}
                className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0D2327]/80 dark:text-[#F8F7F3]/80">Zero-Capital Deals / Year</span>
                <span className="font-mono-tabular font-semibold">{annualDeals} deals</span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={annualDeals}
                onChange={(e) => setAnnualDeals(Number(e.target.value))}
                className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0D2327]/80 dark:text-[#F8F7F3]/80">Mudarabah Equity Share</span>
                <span className="font-mono-tabular font-semibold">{mudarabahEquityPct}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                step={1}
                value={mudarabahEquityPct}
                onChange={(e) => setMudarabahEquityPct(Number(e.target.value))}
                className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0D2327]/80 dark:text-[#F8F7F3]/80">Khufiya Sadaqah (Invisible)</span>
                <span className="font-mono-tabular font-semibold">{sadaqahPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={10}
                step={0.5}
                value={sadaqahPct}
                onChange={(e) => setSadaqahPct(Number(e.target.value))}
                className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0D2327]/80 dark:text-[#F8F7F3]/80">Haq-e-Mazdoor Instant Payout</span>
                <span className="font-mono-tabular font-semibold">{haqMazdoorRatio}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={haqMazdoorRatio}
                onChange={(e) => setHaqMazdoorRatio(Number(e.target.value))}
                className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
              />
            </label>
          </div>

          <div className="lg:col-span-5 rounded-lg border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-well text-[#F8F7F3] p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">Simulated Sovereign Leverage Index</p>
                <p className="font-mono-tabular text-3xl font-bold text-[#9B1C2E] dark:text-[#F59E0B]">
                  {formulaMetrics.exponentialPower.toLocaleString('en-US')}x
                </p>
              </div>
              <OrbitalCompoundingRing
                powerLabel={`${(formulaMetrics.exponentialPower / 1_000_000).toFixed(1)}Mx`}
              />
            </div>
            <CompoundingTrajectoryChart
              year1Pkr={formulaMetrics.year1SeedPkr}
              year2Pkr={formulaMetrics.year2SolarPkr}
              year3Pkr={formulaMetrics.year3SovereignPkr}
            />
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#0D2327]/10 dark:border-[#F8F7F3]/10 text-xs">
              <div>
                <p className="text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Year 1 Food/Water</p>
                <p className="font-mono-tabular font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                  PKR {(formulaMetrics.year1SeedPkr / 1_000_000).toFixed(2)}M
                </p>
              </div>
              <div>
                <p className="text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Year 2 Solar Equity</p>
                <p className="font-mono-tabular font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                  PKR {(formulaMetrics.year2SolarPkr / 1_000_000).toFixed(2)}M
                </p>
              </div>
              <div>
                <p className="text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Year 3 Hard-Asset</p>
                <p className="font-mono-tabular font-bold text-emerald-700 dark:text-emerald-400">
                  PKR {(formulaMetrics.year3SovereignPkr / 1_000_000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>
        </div>
        <HalaKashiFrieze />
        </div>
      </section>

      {/* Real-World Arbitrage & Mudarabah Deals (Pillars A, B, C) */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <ChromaticKashiRule />
        <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#0D2327]/60 dark:text-[#F8F7F3]/60">
              Pillars A, B & C · Zero-Capital Food/Water Arbitrage & Ameen Solar Syndicate
            </p>
            <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
              Sovereign Real-World Deal Pipeline ({state.deals.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="kashi-btn px-4 py-2 rounded-lg bg-[#0D2327] dark:bg-[#F59E0B] text-white dark:text-[#0D2327] text-xs font-semibold hover:opacity-95 whitespace-nowrap shrink-0 min-h-[40px]"
          >
            {showCreateForm ? 'Close Deal Builder' : 'Seal New Zero-Capital Deal'}
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={(e) => void handleCreateDeal(e)}
            className="rounded-lg border border-[#0D2327]/15 dark:border-[#F8F7F3]/15 ajrak-well text-[#F8F7F3] p-5 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as typeof sector)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
                >
                  <option value="sector-1-food-water">Sector 1: Food & Water (Year 1 Cash-Flow)</option>
                  <option value="sector-2-solar-energy">Sector 2: Solar & RO Syndicate (Year 2 Equity)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sakrand Basmati -> Riyadh Lot #9"
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Commodity / Plant</label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Supplier (Sindh)</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Buyer / Syndicate</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Deal Value (PKR)</label>
                <input
                  type="number"
                  value={dealValuePkr}
                  onChange={(e) => setDealValuePkr(e.target.value)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sector === 'sector-1-food-water' ? (
                <div>
                  <label className="block text-xs font-medium mb-1">Halal Ujrah Margin (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ujrahMarginPct}
                    onChange={(e) => setUjrahMarginPct(e.target.value)}
                    className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Ameen Syndicate Members (20–50)</label>
                    <input
                      type="number"
                      min={20}
                      max={50}
                      value={syndicateMembers}
                      onChange={(e) => setSyndicateMembers(e.target.value)}
                      className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Permanent Mudarabah Share (10–30%)</label>
                    <input
                      type="number"
                      min={10}
                      max={30}
                      value={dealMudarabahPct}
                      onChange={(e) => setDealMudarabahPct(e.target.value)}
                      className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm font-mono-tabular"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">
                  Khufiya Sadaqah Invisible Reserve ({dealSadaqahPct}%)
                </label>
                <input
                  type="range"
                  min={5}
                  max={10}
                  step={0.5}
                  value={dealSadaqahPct}
                  onChange={(e) => setDealSadaqahPct(Number(e.target.value))}
                  className="w-full accent-[#9B1C2E] dark:accent-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Warehouse GPS & Video Ref</label>
                <input
                  type="text"
                  value={warehouseGps}
                  onChange={(e) => setWarehouseGps(e.target.value)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Unedited Video Reference</label>
                <input
                  type="text"
                  value={warehouseVideoRef}
                  onChange={(e) => setWarehouseVideoRef(e.target.value)}
                  className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Sadiq-o-Ameen Zero-Hype Defect Disclosure (Abu Bakr Siddiq RA Standard)
              </label>
              <input
                type="text"
                value={defectDisclosure}
                onChange={(e) => setDefectDisclosure(e.target.value)}
                className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
              />
            </div>

            {/* Pre-Deal Niyat Ki Durustagi Gate */}
            <div className="space-y-2 pt-2 border-t border-[#0D2327]/10 dark:border-[#F8F7F3]/10">
              <p className="text-xs font-bold text-[#9B1C2E] dark:text-[#F59E0B]">
                Pre-Deal Intention Gate (Niyat Ki Durustagi — Mandatory)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { key: 'halalOrigin', label: '100% Halal commodity & lawful Sakrand/Sindh origin' },
                    { key: 'zeroRiba', label: 'Zero Riba, zero compounding late fees, zero Gharar' },
                    { key: 'zeroDeception', label: 'Every >=1% quality defect disclosed upfront honestly' },
                    { key: 'haqEMazdoorPriority', label: 'Haq-e-Mazdoor laborer wages settled at 0% fee before sunset' },
                  ] as const
                ).map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={niyat[item.key]}
                      onChange={(e) => setNiyat((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded accent-[#9B1C2E]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {dealError && <p className="text-xs font-semibold text-[#9B1C2E] dark:text-rose-400">{dealError}</p>}

            <button
              type="submit"
              disabled={dealSaving}
              className="px-5 py-2.5 rounded-lg bg-[#9B1C2E] text-white text-xs font-semibold hover:bg-[#7F1524] min-h-[40px]"
            >
              {dealSaving ? 'Sealing Deal...' : 'Seal Contract with SHA-256'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {state.deals.map((deal) => {
            const dealPhoto =
              deal.sector === 'sector-2-solar-energy'
                ? solarWaterImg
                : /date|mango|aseel|sindhri/i.test(deal.commodity)
                  ? datesMangoesImg
                  : basmatiImg;

            return (
            <article
              key={deal.id}
              className="kashi-card rounded-lg border border-[#F59E0B]/25 ajrak-well p-5 space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-16 rounded-md overflow-hidden border border-[#0D2327]/15 dark:border-[#F8F7F3]/15 shrink-0 hidden sm:block">
                    <ResilientImage
                      src={dealPhoto}
                      alt={deal.commodity}
                      fallbackTitle={deal.commodity}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
                    <span className="inline-flex items-center gap-1 font-medium text-[#0D2327] dark:text-[#F8F7F3]">
                      {deal.sector === 'sector-1-food-water' ? (
                        <Sprout className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                      )}
                      {deal.sector === 'sector-1-food-water' ? 'Sector 1: Food & Water' : 'Sector 2: Solar & RO'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{deal.originCity} to {deal.destinationCity}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase font-semibold">{deal.status}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                    {deal.title}
                  </h3>
                  </div>
                </div>

                <div className="text-left lg:text-right shrink-0">
                  <p className="font-mono-tabular text-lg font-bold text-[#0D2327] dark:text-[#F8F7F3]">
                    PKR {deal.dealValuePkr.toLocaleString('en-US')}
                  </p>
                  <p className="font-mono-tabular text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
                    USD ${deal.dealValueUsd.toLocaleString('en-US')} ·{' '}
                    {deal.mudarabahEquitySharePct > 0
                      ? `${deal.mudarabahEquitySharePct}% Mudarabah (${deal.syndicateMembers} partners)`
                      : `${deal.ujrahMarginPct}% Halal Ujrah`}{' '}
                    · {deal.khufiyaSadaqahPct}% Sadaqah
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#0D2327]/80 dark:text-[#F8F7F3]/80">
                <strong>Zero-Hype Disclosure:</strong> {deal.defectDisclosure}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#0D2327]/10 dark:border-[#F8F7F3]/10 text-xs">
                <div className="space-y-0.5 text-[#0D2327]/70 dark:text-[#F8F7F3]/70">
                  <p className="font-mono-tabular">
                    GPS Proof: {deal.warehouseProof.gpsCoords} · Video: {deal.warehouseProof.videoFileRef}
                  </p>
                  <p>
                    Otaq Majlis Witnesses:{' '}
                    {deal.otaqMajlisWitnesses.attestedAt
                      ? `${deal.otaqMajlisWitnesses.witness1} & ${deal.otaqMajlisWitnesses.witness2}`
                      : 'Pending 2-Witness Shahadah'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!deal.otaqMajlisWitnesses.attestedAt && (
                    <button
                      type="button"
                      onClick={() => setAttestTargetId(deal.id)}
                      className="px-3 py-1.5 rounded-md border border-[#9B1C2E]/40 text-xs font-semibold text-[#9B1C2E] dark:text-[#F59E0B] hover:bg-[#9B1C2E]/5 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" /> Add 2-Witness Shahadah
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPrintableDeal(deal)}
                    className="px-3 py-1.5 rounded-md bg-[#0D2327] dark:bg-[#F59E0B] text-white dark:text-[#0D2327] text-xs font-semibold hover:opacity-90 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Quran 2:282 Contract
                  </button>
                </div>
              </div>

              {attestTargetId === deal.id && (
                <div className="pt-3 border-t border-[#0D2327]/10 dark:border-[#F8F7F3]/10 space-y-2">
                  <form
                    onSubmit={(e) => void handleAttestDeal(e)}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Witness 1 Full Name (Sakrand)"
                      value={witness1}
                      onChange={(e) => setWitness1(e.target.value)}
                      className="flex-1 rounded-md border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Witness 2 Full Name"
                      value={witness2}
                      onChange={(e) => setWitness2(e.target.value)}
                      className="flex-1 rounded-md border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={attestSaving}
                      className="px-3.5 py-1.5 rounded-md bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                    >
                      {attestSaving ? 'Sealing...' : 'Seal Shahadah'}
                    </button>
                  </form>
                  {attestError && (
                    <p role="alert" className="text-xs font-semibold text-rose-400">
                      {attestError}
                    </p>
                  )}
                </div>
              )}
            </article>
            );
          })}
        </div>
        </div>
      </section>

      {/* Pillar D: 50-Year Hard-Asset & Autonomous Waqf Sovereignty Vault */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <ChromaticKashiRule />
        <div className="p-6 space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#0F766E] dark:text-[#5EEAD4]">
            Pillar D · Year 3 Sovereign Treasury Conversion
          </p>
          <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
            50-Year Hard-Asset & Autonomous Waqf Sovereignty Vault
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>1. Physical 24K Gold & Silver</span>
              <span className="font-mono-tabular font-bold">{goldAllocPct}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={goldAllocPct}
              onChange={(e) => setGoldAllocPct(Number(e.target.value))}
              className="w-full accent-[#F59E0B]"
            />
          </label>
          <label className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>2. Indus Farmland & Water Rights</span>
              <span className="font-mono-tabular font-bold">{farmlandAllocPct}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={farmlandAllocPct}
              onChange={(e) => setFarmlandAllocPct(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
          </label>
          <label className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>3. Perpetual Sadaqah-e-Jariyah Waqf</span>
              <span className="font-mono-tabular font-bold">{waqfAllocPct}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={40}
              value={waqfAllocPct}
              onChange={(e) => setWaqfAllocPct(Number(e.target.value))}
              className="w-full accent-[#9B1C2E]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="rounded-lg border border-[#0D2327]/10 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4">
            <p className="text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">Active Net Halal Profit Pool</p>
            <p className="font-mono-tabular text-xl font-bold mt-1">
              PKR {treasuryBreakdown.netHalalProfitPkr.toLocaleString('en-US')}
            </p>
          </div>
          <div className="rounded-lg border border-[#0D2327]/10 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">24K Gold / Silver Reserve</p>
              <p className="font-mono-tabular text-xl font-bold mt-1 text-[#D97706] dark:text-[#F59E0B]">
                {treasuryBreakdown.goldGrams24k}g Au
              </p>
              <p className="font-mono-tabular text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">
                or {treasuryBreakdown.silverGrams}g Ag
              </p>
            </div>
            <GoldVaultEmblem />
          </div>
          <div className="rounded-lg border border-[#0D2327]/10 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">Sakrand/Nawabshah Farmland</p>
              <p className="font-mono-tabular text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-400">
                {treasuryBreakdown.farmlandAcresSakrand} Acres
              </p>
              <p className="text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Irrigated Indus Belt + RO</p>
            </div>
            <IndusLandEmblem />
          </div>
          <div className="rounded-lg border border-[#0D2327]/10 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[#0D2327]/65 dark:text-[#F8F7F3]/65">Autonomous Waqf Endowment</p>
              <p className="font-mono-tabular text-xl font-bold mt-1 text-[#9B1C2E] dark:text-rose-400">
                PKR {treasuryBreakdown.waqfPkr.toLocaleString('en-US')}
              </p>
              <p className="font-mono-tabular text-xs text-[#0D2327]/60 dark:text-[#F8F7F3]/60">
                ~{treasuryBreakdown.cleanWaterPeopleServed} citizens clean water
              </p>
            </div>
            <WaqfWaterEmblem />
          </div>
        </div>
        </div>
      </section>

      {/* 4-Language Supplier & Gulf Buyer Outreach Templates */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <ChromaticKashiRule />
        <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#0D2327]/60 dark:text-[#F8F7F3]/60">
              Sindh Suppliers & Riyadh / Dubai Buyers
            </p>
            <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
              Multilingual WhatsApp & Email Outreach Templates
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['English', 'Urdu', 'Sindhi', 'Arabic'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setOutreachLang(lang)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  outreachLang === lang
                    ? 'bg-[#0D2327] dark:bg-[#F59E0B] text-white dark:text-[#0D2327]'
                    : 'border border-[#0D2327]/15 dark:border-[#F8F7F3]/20 text-[#0D2327]/80 dark:text-[#F8F7F3]/80'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#0D2327]/12 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#0D2327] dark:text-[#F8F7F3]">
              {OUTREACH_TEMPLATES[outreachLang].title}
            </h3>
            <button
              type="button"
              onClick={() => void handleCopyOutreach()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#9B1C2E] text-white text-xs font-semibold hover:bg-[#7F1524] whitespace-nowrap shrink-0"
            >
              {copiedLang === outreachLang ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLang === outreachLang ? 'Copied' : 'Copy Message'}
            </button>
          </div>
          <pre
            dir={outreachLang === 'English' ? 'ltr' : 'rtl'}
            className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#0D2327]/85 dark:text-[#F8F7F3]/85 font-sans"
          >
            {OUTREACH_TEMPLATES[outreachLang].body}
          </pre>
        </div>
        </div>
      </section>

      {/* Printable Quran 2:282 & Pakistan ETO-2002 Contract Modal */}
      {printableDeal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPrintableDeal(null)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-[#0D2327] rounded-xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl print-only-sheet"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#0D2327]/15 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#9B1C2E]">
                  QURAN 2:282 (KITABAT AL-DAYN) & PAKISTAN ETO-2002 (§3–§7) COMPLIANT INSTRUMENT
                </p>
                <h2 className="font-display text-2xl font-bold mt-1">{printableDeal.title}</h2>
                <p className="text-xs text-[#0D2327]/70 mt-1">
                  Headquarters: BolMizan VERITAS-SOVEREIGN OS v30.0 · Sakrand, Sindh, Pakistan
                </p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D2327] text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableDeal(null)}
                  className="px-3.5 py-2 rounded-lg border border-[#0D2327]/20 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[#0D2327]/60">Supplier / Mudarib</p>
                <p className="font-semibold text-sm">{printableDeal.supplierName}</p>
                <p>{printableDeal.originCity}</p>
              </div>
              <div>
                <p className="text-[#0D2327]/60">Buyer / Rab-ul-Maal Syndicate</p>
                <p className="font-semibold text-sm">{printableDeal.buyerName}</p>
                <p>{printableDeal.destinationCity}</p>
              </div>
              <div>
                <p className="text-[#0D2327]/60">Contract Value</p>
                <p className="font-mono-tabular font-bold text-sm">
                  PKR {printableDeal.dealValuePkr.toLocaleString('en-US')} (USD ${printableDeal.dealValueUsd.toLocaleString('en-US')})
                </p>
              </div>
              <div>
                <p className="text-[#0D2327]/60">Structure & Khufiya Sadaqah</p>
                <p className="font-semibold text-sm">
                  {printableDeal.mudarabahEquitySharePct > 0
                    ? `Mudarabah (${printableDeal.mudarabahEquitySharePct}% equity across ${printableDeal.syndicateMembers} partners)`
                    : `Cost-Plus Murabaha (${printableDeal.ujrahMarginPct}% fixed Ujrah)`}{' '}
                  · {printableDeal.khufiyaSadaqahPct}% Sadaqah
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#0D2327]/15 p-4 text-xs space-y-2">
              <p className="font-bold">Mandatory Shariah & Zero-Hype Disclosures</p>
              <p>
                <strong>1. Zero Riba Covenant:</strong> Both parties affirm zero interest, zero compounding late-payment penalties, and lawful Halal trade per Surah Al-Baqarah 2:275–282.
              </p>
              <p>
                <strong>2. Siddiq (RA) Defect Disclosure:</strong> {printableDeal.defectDisclosure}
              </p>
              <p>
                <strong>3. Physical Evidence:</strong> Warehouse GPS {printableDeal.warehouseProof.gpsCoords} · Unedited Video {printableDeal.warehouseProof.videoFileRef}
              </p>
              <p>
                <strong>4. ETO-2002 Electronic Attribution:</strong> Recognized as an authentic electronic record under Sections 3, 4, and 7 of the Electronic Transactions Ordinance 2002 (Pakistan).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="border-t border-[#0D2327]/25 pt-2">
                <p className="text-[#0D2327]/60">Otaq Majlis Witness 1 (Shahadah)</p>
                <p className="font-semibold mt-1">{printableDeal.otaqMajlisWitnesses.witness1 || '____________________________'}</p>
              </div>
              <div className="border-t border-[#0D2327]/25 pt-2">
                <p className="text-[#0D2327]/60">Otaq Majlis Witness 2 (Shahadah)</p>
                <p className="font-semibold mt-1">{printableDeal.otaqMajlisWitnesses.witness2 || '____________________________'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#0D2327]/70 pt-2 border-t border-[#0D2327]/10">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="break-all">SHA-256 Contract Seal: {printableDeal.contractHash}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
