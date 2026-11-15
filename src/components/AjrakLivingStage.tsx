import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Film, Lock, MapPin, RotateCcw, Sparkles } from 'lucide-react';
import datesMangoesImg from '../assets/images/khairpur_dates_mangoes_1794637623124.jpg';
import heroKashiImg from '../assets/images/sakrand_kashi_command_1794637623349.jpg';
import ajrakArtisanImg from '../assets/images/sindh_ajrak_artisan_1794737690544.jpg';
import halaKashiImg from '../assets/images/sindh_hala_kashi_1794737692970.jpg';
import mandiBazaarImg from '../assets/images/sindh_mandi_bazaar_1794737693302.jpg';
import otaqMajlisImg from '../assets/images/sindh_otaq_majlis_1794737693647.jpg';
import type {
  AjrakDyeTheme,
  AudienceMode,
  FXUnit,
  LocaleScript,
  SovereignSystemState,
} from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { AmbientAjrakAudio } from './AmbientAjrakAudio';
import {
  AjrakBlockBorder,
  AjrakClothPattern,
  HalaKashiCornerOrnament,
  LivingMizanScale,
  ResilientImage,
} from './SovereignArt';

interface AjrakLivingStageProps {
  state: SovereignSystemState;
  mode: AudienceMode;
  onModeChange: (mode: AudienceMode) => void;
  script: LocaleScript;
  onScriptChange: (script: LocaleScript) => void;
  dyeTheme: AjrakDyeTheme;
  onDyeThemeChange: (theme: AjrakDyeTheme) => void;
  fxUnit: FXUnit;
  onFxUnitChange: (unit: FXUnit) => void;
  onUniversalCommand: (commandText: string) => void;
  mizanTilt: number;
  onReplayWelcome?: () => void;
  onOpenDirector?: () => void;
  onLockVault?: () => void;
}

const CORRIDOR_NODES = [
  {
    id: 'sakrand',
    label: 'Sakrand Mandi',
    rx: 0.13,
    ry: 0.62,
    color: '#F59E0B',
    commodity: 'Morning Produce & Basmati Mizan',
    metric: '142 Growers · Otaq Witnessed',
    image: mandiBazaarImg,
  },
  {
    id: 'hala',
    label: 'Hala Craft',
    rx: 0.34,
    ry: 0.40,
    color: '#14B8A6',
    commodity: 'Ajrak Block Print & Hala Kashi Tiles',
    metric: 'Artisan Co-Op · 0% Fee Raast',
    image: halaKashiImg,
  },
  {
    id: 'khairpur',
    label: 'Khairpur',
    rx: 0.53,
    ry: 0.68,
    color: '#38BDF8',
    commodity: 'Aseel Dates & Sindhri Mangoes',
    metric: '0% Riba Mudarabah Cold-Chain',
    image: datesMangoesImg,
  },
  {
    id: 'otaq',
    label: 'Otaq & Karachi',
    rx: 0.72,
    ry: 0.44,
    color: '#F59E0B',
    commodity: 'Elder Witness Escrow & Export Port',
    metric: 'Quran 2:282 Written Seal',
    image: otaqMajlisImg,
  },
  {
    id: 'riyadh',
    label: 'Gulf & Riyadh',
    rx: 0.88,
    ry: 0.28,
    color: '#9B1C2E',
    commodity: 'GCC Ajrak Heritage & Grain Gate',
    metric: '24K Gold Benchmarked Reserve',
    image: ajrakArtisanImg || heroKashiImg,
  },
] as const;

const HERO_COPY: Record<
  LocaleScript,
  {
    kicker: string;
    greeting: string;
    headline: string;
    sabziSub: string;
    enterpriseSub: string;
    dir: 'ltr' | 'rtl';
  }
> = {
  en: {
    kicker: 'Sakrand, Sindh HQ · Sindhi Ajrak & Hala Kashi Command · 0% Riba Standard',
    greeting: 'ڀلي ڪري آيا — جتي محنت، ايمان ۽ سچائي جو ميزان هڪ ٿئي',
    headline: 'Where Every Farmer’s Sweat & Every Shopkeeper’s Trust Become Unbreakable',
    sabziSub:
      'Sabzi-Wala Easy Mode: Speak naturally in Sindhi or Urdu to create live Raast QR Parchis, send instant WhatsApp receipts, and block 8171 or OTP scams.',
    enterpriseSub:
      'From Sakrand mandis to Dubai and Riyadh ports — unify zero-Riba multi-tenant khata ledgers, Otaq Majlis two-witness contracts, circular debt clearing, and 21-rail emergency protection.',
    dir: 'ltr',
  },
  ur: {
    kicker: 'سکرنڈ، سندھ ہیڈکوارٹر · اجرک و ہالہ کاشی کمانڈ · 0% سود شریعت معیار',
    greeting: 'خوش آمدید — جہاں محنت، امانت اور سچائی کا میزان ایک ہو',
    headline: 'جہاں ہر کسان کی محنت اور ہر دکاندار کا بھروسہ غیر متزلزل بنے',
    sabziSub:
      'سبزی والا آسان موڈ: اردو یا سندھی میں بول کر فوری کھاتہ لکھیں، راست کیو آر والی واٹس ایپ پرچی بھیجیں اور 8171 فراڈ کالز کو روکیں۔',
    enterpriseSub:
      'سکرنڈ منڈی سے دبئی اور ریاض تک — بغیر سود ملٹی ٹیننٹ کھاتہ، اوطاق مجلس گواہی معاہدے، مقاصہ کلیئرنگ اور 21 پیمنٹ ریلز کی مکمل حفاظت۔',
    dir: 'rtl',
  },
  sd: {
    kicker: 'سڪرنڊ، سنڌ هيڊڪوارٽر · سنڌي اجرڪ ۽ هالا ڪاشي ڪمانڊ · 0% وياج معيار',
    greeting: 'ڀلي ڪري آيا — جتي محنت، ايمان ۽ سچائي جو ميزان هڪ ٿئي',
    headline: 'جتي هر هاريءَ جو پگهر ۽ هر دڪاندار جو ڀروسو اٽوٽ بڻجي وڃي',
    sabziSub:
      'سبزي وارو آسان موڊ: سنڌي يا اردو ۾ ڳالهائي کاتو لکو، راست ڪيو آر سان واٽس ايپ پرچي موڪليو ۽ 8171 يا او ٽي پي ٺڳي روڪيو.',
    enterpriseSub:
      'سڪرنڊ منڊي کان دبئي ۽ رياض تائين — بغير وياج کاتو، اوطاق مجلس ٻن شاهدن جا معاهدا، مقاصه قرض صفائي ۽ 21 ريلز جي فوري حفاظت.',
    dir: 'rtl',
  },
};

export const AjrakLivingStage: React.FC<AjrakLivingStageProps> = ({
  state,
  mode,
  onModeChange,
  script,
  onScriptChange,
  dyeTheme,
  onDyeThemeChange,
  fxUnit,
  onFxUnitChange,
  onUniversalCommand,
  mizanTilt,
  onReplayWelcome,
  onOpenDirector,
  onLockVault,
}) => {
  const [welcomeKey, setWelcomeKey] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sakrand');
  const [universalInput, setUniversalInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSabziMode = mode === 'sabzi-wala';
  const copy = HERO_COPY[script];
  const activeNode = CORRIDOR_NODES.find((n) => n.id === selectedNodeId) ?? CORRIDOR_NODES[0];

  // Flowing Sindhi Indus Cultural Wave + Sakrand -> Riyadh Interactive Constellation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let t = 0;
    let lastFrameTime = 0;

    const render = (now = 0) => {
      if (!prefersReduced) rafId = window.requestAnimationFrame(render);
      if (now - lastFrameTime < 42) return;
      lastFrameTime = now;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(300, Math.floor(rect.width));
      const h = Math.max(160, Math.floor(rect.height));
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const frozen = state.killSwitch.active;

      const waveConfigs = [
        { amp: 10, freq: 0.016, speed: 0.05, yBase: 0.78, color: frozen ? 'rgba(155, 28, 46, 0.55)' : 'rgba(20, 184, 166, 0.55)' },
        { amp: 7, freq: 0.022, speed: 0.035, yBase: 0.84, color: frozen ? 'rgba(155, 28, 46, 0.35)' : 'rgba(245, 158, 11, 0.45)' },
      ];

      for (const wc of waveConfigs) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y = h * wc.yBase + Math.sin(x * wc.freq + t * wc.speed) * wc.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wc.color;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      for (let i = 0; i < CORRIDOR_NODES.length - 1; i++) {
        const a = CORRIDOR_NODES[i];
        const b = CORRIDOR_NODES[i + 1];
        const ax = a.rx * w;
        const ay = a.ry * h;
        const bx = b.rx * w;
        const by = b.ry * h;
        const cx = (ax + bx) / 2;
        const cy = Math.min(ay, by) - 34;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx, cy, bx, by);
        ctx.strokeStyle = frozen ? 'rgba(155, 28, 46, 0.45)' : 'rgba(245, 158, 11, 0.58)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!frozen) {
          const u = (((t * 0.012 + i * 0.27) % 1) + 1) % 1;
          const hx = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * cx + u * u * bx;
          const hy = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * cy + u * u * by;
          ctx.beginPath();
          ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE68A';
          ctx.fill();
        }
      }

      CORRIDOR_NODES.forEach((n, idx) => {
        const x = n.rx * w;
        const y = n.ry * h;
        const isFocus = n.id === selectedNodeId;
        const pulse = (isFocus ? 13 : 8) + Math.sin(t * 0.1 + idx) * 2.5;

        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = frozen
          ? 'rgba(155, 28, 46, 0.65)'
          : isFocus
            ? 'rgba(253, 230, 138, 0.95)'
            : 'rgba(253, 230, 138, 0.45)';
        ctx.lineWidth = isFocus ? 2 : 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, isFocus ? 6.2 : 4.4, 0, Math.PI * 2);
        ctx.fillStyle = frozen ? '#9B1C2E' : n.color;
        ctx.fill();

        ctx.font = `${isFocus ? '700' : '600'} 10.5px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isFocus ? '#FDE68A' : 'rgba(248, 247, 243, 0.92)';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, x, y + 20);
      });

      ctx.restore();
      t += 1;
    };

    render();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [state.killSwitch.active, selectedNodeId]);

  return (
    <section className="rounded-2xl overflow-hidden border border-[#F59E0B]/30 bg-gradient-to-br from-[#0B1E23] via-[#102930] to-[#2B0C14] text-[#F8F7F3] shadow-xl">
      <AjrakBlockBorder />

      <div className="relative p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <AjrakClothPattern
          accentHex={dyeTheme === 'crimson' ? '#9B1C2E' : dyeTheme === 'kashi' ? '#14B8A6' : '#F59E0B'}
          opacityClass="opacity-[0.1]"
        />
        <HalaKashiCornerOrnament className="absolute top-3 left-3 opacity-75" />
        <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-75" />

        {/* Left Story & Control Column */}
        <div className="lg:col-span-7 relative z-10 flex flex-col justify-between gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-${welcomeKey}-${script}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              dir={copy.dir}
              className="space-y-4"
            >
              <div className="text-xs text-[#5EEAD4] font-medium">
                {copy.kicker}
              </div>

              <div dir="rtl" className="text-lg sm:text-xl font-semibold text-[#FDE68A]">
                {copy.greeting}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white text-balance leading-[1.14]">
                {copy.headline}
              </h1>

              <p className="text-sm sm:text-[15px] text-[#F8F7F3]/85 max-w-2xl leading-relaxed">
                {isSabziMode ? copy.sabziSub : copy.enterpriseSub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Universal Natural-Language Finance Command Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!universalInput.trim()) return;
              onUniversalCommand(universalInput.trim());
              setUniversalInput('');
            }}
            className="space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={universalInput}
                onChange={(e) => setUniversalInput(e.target.value)}
                placeholder="Type any financial command: 'Haji Bilal 2 mann chawal 18500' · '8171 OTP check' · 'Hedge $25M in Gold'"
                className="flex-1 rounded-xl border border-[#F59E0B]/35 bg-[#041219]/90 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#F8F7F3]/45 focus:outline-none focus:border-[#F59E0B]"
              />
              <button
                type="submit"
                className="kashi-btn inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-4 py-2.5 text-xs font-bold text-[#05131B] whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Solve Instantly</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-[#F8F7F3]/55">Quick Solve:</span>
              {[
                { label: 'Write Mandi Parchi (PKR 18,500)', cmd: 'Chacha Ghulam 2 Mann Chawal 18500 udhaar' },
                { label: 'Scan 8171 / OTP Scam', cmd: '8171 Benazir scam alert check' },
                { label: 'Hedge $10M Export Treasury', cmd: 'How to structure 10M USD export zero Riba 24K gold hedge?' },
              ].map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => onUniversalCommand(q.cmd)}
                  className="text-[#5EEAD4] hover:text-[#FDE68A] underline underline-offset-2 whitespace-nowrap shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </form>

          {/* Integrated Workspace Controls: Scale + Currency + Language + Dye */}
          <div className="space-y-3 pt-2 border-t border-[#F59E0B]/15">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label="Scale Switcher"
                  className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#F59E0B]/25 bg-[#061317]"
                >
                  <button
                    type="button"
                    onClick={() => onModeChange('sabzi-wala')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      isSabziMode
                        ? 'bg-[#9B1C2E] text-white'
                        : 'text-[#F8F7F3]/75 hover:text-white'
                    }`}
                  >
                    Bazaar (Sabzi-Wala)
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeChange('enterprise')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      !isSabziMode
                        ? 'bg-[#F59E0B] text-[#0D2327]'
                        : 'text-[#F8F7F3]/75 hover:text-white'
                    }`}
                  >
                    Global Sovereign
                  </button>
                </div>

                {/* Live Reporting Currency Switcher */}
                <div
                  role="group"
                  aria-label="Reporting Currency"
                  className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#F59E0B]/25 bg-[#061317]"
                >
                  {(['PKR', 'USD', 'SAR', 'GOLD'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => onFxUnitChange(unit)}
                      className={`px-2 py-1.5 rounded-lg font-mono-tabular text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                        fxUnit === unit
                          ? 'bg-[#0F766E] text-white'
                          : 'text-[#F8F7F3]/70 hover:text-white'
                      }`}
                    >
                      {unit === 'GOLD' ? '24K Au' : unit}
                    </button>
                  ))}
                </div>

                {/* Live Script Selector: English / Urdu / Sindhi */}
                <div
                  role="group"
                  aria-label="Cultural Language Switcher"
                  className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#14B8A6]/30 bg-[#061317]"
                >
                  {([
                    { id: 'en', label: 'EN' },
                    { id: 'ur', label: 'اردو' },
                    { id: 'sd', label: 'سنڌي' },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onScriptChange(item.id)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        script === item.id
                          ? 'bg-[#0F766E] text-white'
                          : 'text-[#F8F7F3]/75 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Natural Ajrak Dye Switcher */}
                <div
                  role="group"
                  aria-label="Ajrak Natural Dye Theme"
                  className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#F59E0B]/25 bg-[#061317]"
                >
                  {([
                    { id: 'indigo', label: 'Indigo', swatch: 'bg-[#0F4C5C]' },
                    { id: 'crimson', label: 'Kirmizi', swatch: 'bg-[#9B1C2E]' },
                    { id: 'kashi', label: 'Hala', swatch: 'bg-[#0F766E]' },
                  ] as const).map((dye) => (
                    <button
                      key={dye.id}
                      type="button"
                      onClick={() => onDyeThemeChange(dye.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        dyeTheme === dye.id
                          ? 'bg-[#F59E0B] text-[#05131B]'
                          : 'text-[#F8F7F3]/75 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dye.swatch} border border-white/40`} />
                      <span>{dye.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <LivingMizanScale tiltDeg={mizanTilt} frozen={state.killSwitch.active} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AmbientAjrakAudio />
              {onOpenDirector && (
                <button
                  type="button"
                  onClick={onOpenDirector}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F59E0B]/25 bg-[#041219] text-xs font-semibold text-[#FDE68A] hover:border-[#F59E0B]/55 whitespace-nowrap shrink-0"
                >
                  <Film className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Heritage Film</span>
                </button>
              )}
                <button
                  type="button"
                  onClick={() => {
                    setWelcomeKey((k) => k + 1);
                    onReplayWelcome?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14B8A6]/25 bg-[#041219] text-xs font-semibold text-[#5EEAD4] hover:border-[#14B8A6]/55 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Greeting</span>
                </button>
                {onLockVault && (
                  <button
                    type="button"
                    onClick={onLockVault}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-[#041219] text-xs font-semibold text-rose-200 hover:bg-rose-950/40 whitespace-nowrap shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Vault</span>
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Right Interactive Indus-to-Gulf Corridor Monitor */}
        <div className="lg:col-span-5 relative z-10 flex flex-col">
          <div className="flex-1 min-h-[340px] rounded-2xl overflow-hidden border border-[#F59E0B]/35 bg-[#041015] relative flex flex-col justify-between shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0.25, scale: 1.05 }}
                animate={{ opacity: 0.65, scale: 1 }}
                exit={{ opacity: 0.2 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <ResilientImage
                  src={activeNode.image}
                  alt={`${activeNode.label} — ${activeNode.commodity}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#030B10] via-[#030B10]/40 to-[#030B10]/55" />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Top Interactive Node Switcher */}
            <div className="relative z-10 p-3 flex flex-wrap gap-1.5 border-b border-[#F59E0B]/15 bg-[#030B10]/70">
              {CORRIDOR_NODES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setSelectedNodeId(n.id);
                    triggerApexHaptic('tap', `Corridor: ${n.label}`);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    selectedNodeId === n.id
                      ? 'bg-[#F59E0B] text-[#05131B]'
                      : 'text-[#F8F7F3]/85 hover:text-white'
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>

            {/* Bottom Active Node Story Strip */}
            <div className="relative z-10 px-4 py-3.5 border-t border-[#F59E0B]/15 bg-[#030B10]/85 space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#FDE68A]">
                  <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
                  <span>{activeNode.label}: {activeNode.commodity}</span>
                </span>
                <span className="font-mono-tabular text-[11px] text-[#5EEAD4]">
                  {state.killSwitch.rails.filter((r) => !r.frozen).length}/
                  {state.killSwitch.rails.length} Rails
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#F8F7F3]/75 font-mono-tabular">
                <span>{activeNode.metric}</span>
                <span>PKR {(state.totals.activeDealsPkr / 1_000_000).toFixed(2)}M Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
