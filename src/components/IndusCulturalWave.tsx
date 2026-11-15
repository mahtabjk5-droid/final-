import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, HeartHandshake, Mic, ShieldCheck } from 'lucide-react';
import ajrakArtisanImg from '../assets/images/sindh_ajrak_artisan_1794737690544.jpg';
import mandiBazaarImg from '../assets/images/sindh_mandi_bazaar_1794737693302.jpg';
import otaqMajlisImg from '../assets/images/sindh_otaq_majlis_1794737693647.jpg';
import type { LocaleScript } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { ResilientImage } from './SovereignArt';

interface IndusCulturalWaveProps {
  onJumpToTab: (tab: 'treasury' | 'shields' | 'voice' | 'ledger') => void;
  totalSadaqahPkr: number;
  activeDealsCount: number;
  script: LocaleScript;
}

const HEADER_TRANSLATIONS: Record<
  LocaleScript,
  { kicker: string; title: string; corridors: string; sadaqah: string; dir: 'ltr' | 'rtl' }
> = {
  en: {
    kicker: 'Indus Cultural Wave · Human Dignity Beyond Numbers',
    title: 'Built for the Heartbeat of Sindh’s Bazaars & Orchards',
    corridors: 'Ethical Trade Corridors',
    sadaqah: 'Sadaqah Protected',
    dir: 'ltr',
  },
  ur: {
    kicker: 'انڈس کلچرل ویو · اعداد سے بڑھ کر انسانی وقار',
    title: 'سندھ کے بازاروں اور باغات کی دھڑکن کے لیے تیار کردہ',
    corridors: 'اخلاقی تجارتی راہداریاں',
    sadaqah: 'محفوظ خفیہ صدقہ',
    dir: 'rtl',
  },
  sd: {
    kicker: 'سنڌو ثقافتي لهر · انگن کان مٿانهون انساني وقار',
    title: 'سنڌ جي بازارن ۽ باغن جي دل جي ڌڙڪڻ لاءِ تيار ڪيل',
    corridors: 'اخلاقي واپاري رستا',
    sadaqah: 'محفوظ خفيه صدقو',
    dir: 'rtl',
  },
};

const CULTURAL_PILLARS = [
  {
    id: 'haq',
    kicker: 'Dignity of Labor · Sindhi & Islamic Ethos',
    title: 'Pay Before Sweat Dries',
    urduTitle: 'مزدور کی اجرت پسینہ خشک ہونے سے پہلے',
    sindhiTitle: 'مزدور جو حق پگهر سڪڻ کان اڳ',
    urduLine: 'مزدور جو حق پسينو سُڪڻ کان اڳ ادا ڪريو',
    story:
      'Every grain sorter, orchard picker, and solar technician across Sakrand receives full wages via Raast at 0% fee — paired automatically with discreet Khufiya Sadaqah.',
    cta: 'Open Wage Vault',
    tab: 'treasury' as const,
    icon: HeartHandshake,
    image: mandiBazaarImg,
  },
  {
    id: 'otaq',
    kicker: 'Otaq Majlis Honour · Quran 2:282',
    title: 'Trust Sealed by Community Elders',
    urduTitle: 'اوطاق مجلس کے دو گواہان کا بھروسہ',
    sindhiTitle: 'اوطاق مجلس جي بزرگن جي ساک',
    urduLine: 'اوطاق مجلس جي گواهي • بغير سود واپار',
    story:
      'Replacing 40% informal predatory debt with transparent Murabaha contracts, upfront defect honesty, and two respected village witnesses locked in SHA-256.',
    cta: 'Inspect Witnessed Deals',
    tab: 'ledger' as const,
    icon: ShieldCheck,
    image: otaqMajlisImg,
  },
  {
    id: 'voice',
    kicker: 'Mother-Tongue Empowerment · Sindhi & Urdu',
    title: 'A Shield Everyone Can Hear',
    urduTitle: 'مادری زبان میں تحفظ اور آواز کی پہچان',
    sindhiTitle: 'مادري ٻوليءَ ۾ آواز سان حفاظت',
    urduLine: 'سنڌي، اردو ۽ عربي ۾ آواز سان محفوظ حساب',
    story:
      'Whether you run a vegetable cart or a rice mill, speak naturally to record udhaar or detect 8171 & OTP scams instantly with clear spoken Urdu alerts.',
    cta: 'Try Voice & Shield',
    tab: 'voice' as const,
    icon: Mic,
    image: ajrakArtisanImg,
  },
];

export const IndusCulturalWave: React.FC<IndusCulturalWaveProps> = ({
  onJumpToTab,
  totalSadaqahPkr,
  activeDealsCount,
  script,
}) => {
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string>('haq');
  const hCopy = HEADER_TRANSLATIONS[script];

  const accentColor =
    activeId === 'otaq' ? '#9B1C2E' : activeId === 'voice' ? '#14B8A6' : '#F59E0B';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#061820] via-[#260812] to-[#07262A] p-6 sm:p-8 shadow-xl">
      {/* Dynamic SVG Ajrak Geometric Block-Print Tessellation (Low-Opacity Blend Layer) */}
      <motion.svg
        aria-hidden="true"
        animate={reduced ? undefined : { opacity: [0.1, 0.16, 0.1] }}
        transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_96%)]"
      >
        <defs>
          <pattern
            id={`ajrak-geo-${activeId}`}
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            {/* Outer Ajrak Diamond Frame */}
            <path
              d="M36 4 L68 36 L36 68 L4 36 Z"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.9"
              strokeOpacity="0.65"
            />
            {/* Inner 8-Pointed Chakri Rosette */}
            <path
              d="M36 14 L42 30 L58 36 L42 42 L36 58 L30 42 L14 36 L30 30 Z"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="0.8"
              strokeOpacity="0.55"
            />
            {/* Corner Lattice Stitches */}
            <circle cx="36" cy="36" r="3" fill={accentColor} fillOpacity="0.65" />
            <circle cx="0" cy="0" r="2.2" fill="#5EEAD4" fillOpacity="0.45" />
            <circle cx="72" cy="0" r="2.2" fill="#5EEAD4" fillOpacity="0.45" />
            <circle cx="0" cy="72" r="2.2" fill="#5EEAD4" fillOpacity="0.45" />
            <circle cx="72" cy="72" r="2.2" fill="#5EEAD4" fillOpacity="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#ajrak-geo-${activeId})`} />
      </motion.svg>

      {/* Animated Undulating Indus Cultural Wave SVG */}
      <svg
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full opacity-55"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="indus-wave-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9B1C2E" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="indus-wave-teal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
            <stop offset="55%" stopColor="#5EEAD4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <motion.path
          d="M0,115 C220,55 420,165 660,105 C900,45 1060,145 1200,95"
          fill="none"
          stroke="url(#indus-wave-gold)"
          strokeWidth="2.6"
          animate={reduced ? undefined : { y: [0, -7, 0] }}
          transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0,140 C260,175 500,75 760,130 C980,175 1100,90 1200,125"
          fill="none"
          stroke="url(#indus-wave-teal)"
          strokeWidth="1.8"
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={reduced ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <div className="relative z-10 space-y-6">
        <div
          dir={hCopy.dir}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F59E0B]/15 pb-5"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-medium text-[#5EEAD4]">{hCopy.kicker}</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-balance leading-tight">
              {hCopy.title}
            </h2>
          </div>

          <div
            dir="ltr"
            className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono-tabular text-[#FDE68A]"
          >
            <span>
              {activeDealsCount} {hCopy.corridors}
            </span>
            <span aria-hidden="true" className="text-[#F59E0B]/40">
              ·
            </span>
            <span>
              PKR {totalSadaqahPkr.toLocaleString('en-US')} {hCopy.sadaqah}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CULTURAL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activeId === pillar.id;
            const localizedTitle =
              script === 'ur'
                ? pillar.urduTitle
                : script === 'sd'
                  ? pillar.sindhiTitle
                  : pillar.title;
            return (
              <motion.div
                key={pillar.id}
                onMouseEnter={() => setActiveId(pillar.id)}
                onClick={() => {
                  setActiveId(pillar.id);
                  triggerApexHaptic('tap', `Selected ${pillar.title}`);
                }}
                whileHover={reduced ? undefined : { y: -3 }}
                transition={{ duration: 0.18 }}
                className={`rounded-xl border overflow-hidden transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#F59E0B]/65 bg-[#041219]/95 shadow-xl'
                    : 'border-[#F59E0B]/20 bg-[#030E14]/85 hover:border-[#F59E0B]/45'
                }`}
              >
                <div>
                  <div className="relative h-28 overflow-hidden">
                    <ResilientImage
                      src={pillar.image}
                      alt={pillar.title}
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#041219] via-[#041219]/45 to-transparent" />
                    <div className="absolute bottom-2 left-4 right-4 text-[11px] font-medium text-[#5EEAD4]">
                      {pillar.kicker}
                    </div>
                  </div>

                  <div className="p-5 pb-3 space-y-2.5">
                    <h3
                      dir={script === 'en' ? 'ltr' : 'rtl'}
                      className="font-display text-lg font-bold text-white"
                    >
                      {localizedTitle}
                    </h3>
                    <p dir="rtl" className="text-sm font-semibold text-[#FDE68A]/95">
                      {pillar.urduLine}
                    </p>
                    <p className="text-xs text-[#F8F7F3]/80 leading-relaxed">{pillar.story}</p>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <button
                    type="button"
                    onClick={() => onJumpToTab(pillar.tab)}
                    className="w-full inline-flex items-center justify-between pt-3 border-t border-[#F59E0B]/15 text-xs font-semibold text-[#FDE68A] hover:text-white transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#14B8A6]" />
                      <span>{pillar.cta}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
