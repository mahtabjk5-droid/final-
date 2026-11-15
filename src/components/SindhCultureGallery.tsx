import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Compass, Sparkles, X } from 'lucide-react';
import ajrakArtisanImg from '../assets/images/sindh_ajrak_artisan_1794737690544.jpg';
import halaKashiImg from '../assets/images/sindh_hala_kashi_1794737692970.jpg';
import otaqMajlisImg from '../assets/images/sindh_otaq_majlis_1794737693647.jpg';
import mandiBazaarImg from '../assets/images/sindh_mandi_bazaar_1794737693302.jpg';
import type { LocaleScript } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import {
  AjrakClothPattern,
  HalaKashiCornerOrnament,
  ResilientImage,
} from './SovereignArt';

interface HeritageFrame {
  id: string;
  city: string;
  title: string;
  sindhiLine: string;
  colorName: string;
  accentHex: string;
  caption: string;
  image: string;
}

const HERITAGE_FRAMES: HeritageFrame[] = [
  {
    id: 'ajrak-craft',
    city: 'Bhitshah & Matiari',
    title: 'Ajrak Woodblock Craft',
    sindhiLine: 'اجرڪ سنڌ جي عزت، سڃاڻپ ۽ محنت جو رنگ آهي',
    colorName: 'Kirmizi Crimson & Nil Indigo',
    accentHex: '#9B1C2E',
    caption:
      'Every carved acacia stamp presses centuries of patience and precision into breathable cotton — inspiring BolMizan’s immutable SHA-256 contract seals.',
    image: ajrakArtisanImg,
  },
  {
    id: 'hala-kashi',
    city: 'Hala Sharif, Sindh',
    title: 'Hala Kashi Glazed Geometry',
    sindhiLine: 'هالا جي ڪاشيءَ جھڙي مضبوط ۽ چمڪندڙ امانتداري',
    colorName: 'Ferozi Turquoise & Lajward Blue',
    accentHex: '#0F766E',
    caption:
      'Fired in river-clay kilns with Persian turquoise and cobalt blue, Hala Kashi symmetry guides our geometric ledger cards and circuit protections.',
    image: halaKashiImg,
  },
  {
    id: 'otaq-majlis',
    city: 'Sakrand Otaq Courtyard',
    title: 'Otaq Majlis Witnessing',
    sindhiLine: 'اوطاق ۾ بزرگن جي موجودگي سڀ کان وڏي ضمانت آهي',
    colorName: 'Ralli Vermilion & Lantern Gold',
    accentHex: '#F59E0B',
    caption:
      'Seated beside vibrant hand-stitched Ralli quilts and the brass Mizan scale, community elders witness fair agreements without hidden interest.',
    image: otaqMajlisImg,
  },
  {
    id: 'mandi-mizan',
    city: 'Sakrand & Khairpur Bazaars',
    title: 'Brass Mizan Dawn Trade',
    sindhiLine: 'پورو تور، سچي ڳالهه ۽ حلال رزق ۾ برڪت',
    colorName: 'Sonehri Harvest Gold',
    accentHex: '#D97706',
    caption:
      'At sunrise across Sindh’s orchards and sabzi mandis, honest measure on a balanced Mizan scale builds generational trust between farmer and buyer.',
    image: mandiBazaarImg,
  },
];

const AJRAK_PALETTE_SWATCHES = [
  { name: 'Kirmizi Crimson', hex: '#9B1C2E', role: 'Ajrak Cochineal Soul' },
  { name: 'Indus Deep Indigo', hex: '#0D2327', role: 'Night Sky & Cloth' },
  { name: 'Hala Kashi Teal', hex: '#0F766E', role: 'Glazed Trust Accent' },
  { name: 'Sonehri Gold', hex: '#F59E0B', role: 'Harvest & 24K Hedge' },
  { name: 'Kora Cotton Ivory', hex: '#FAF5E8', role: 'Handloom Parchi Paper' },
];

export const SindhCultureGallery: React.FC<{ script: LocaleScript }> = ({ script }) => {
  const [selectedFrame, setSelectedFrame] = useState<HeritageFrame | null>(null);
  const reduced = useReducedMotion();

  const sectionHeading =
    script === 'ur'
      ? 'سندھ کی ثقافت، اجرک کے رنگ اور بازار کی روح'
      : script === 'sd'
        ? 'سنڌ جي ثقافت، اجرڪ جا رنگ ۽ منڊيءَ جو روح'
        : 'Living Heritage of Sindh: Ajrak, Kashi Craft & Bazaar Soul';

  return (
    <section className="relative rounded-2xl overflow-hidden border border-[#F59E0B]/35 bg-gradient-to-br from-[#1B070E] via-[#071820] to-[#082428] shadow-2xl">
      <div className="ajrak-mosaic-band" />
      <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.08]" />
      <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-60" />

      <div className="relative z-10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#F59E0B]/20 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FDE68A]">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Visual Soul of Sindh · Click any portrait to open story</span>
            </div>
            <h2
              dir={script === 'en' ? 'ltr' : 'rtl'}
              className="font-display text-2xl sm:text-3xl font-bold text-white"
            >
              {sectionHeading}
            </h2>
          </div>

          {/* Interactive Heritage Pigment Palette Ribbon */}
          <div className="flex flex-wrap items-center gap-3">
            {AJRAK_PALETTE_SWATCHES.map((sw) => (
              <div key={sw.name} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-3.5 h-3.5 rounded-sm border border-white/30 shrink-0"
                  style={{ backgroundColor: sw.hex }}
                />
                <span className="text-[#F8F7F3]/85 font-medium whitespace-nowrap">{sw.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asymmetric Editorial Photography Showcase: Featured Tall Portrait + 3 Staggered Frames */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Featured Tall Portrait: Bhitshah Ajrak Craft */}
          {(() => {
            const heroFrame = HERITAGE_FRAMES[0];
            return (
              <motion.button
                type="button"
                onClick={() => {
                  setSelectedFrame(heroFrame);
                  triggerApexHaptic('seal_minted', `Opened ${heroFrame.title}`);
                }}
                whileHover={reduced ? undefined : { y: -3 }}
                transition={{ duration: 0.2 }}
                className="lg:col-span-5 group relative rounded-2xl overflow-hidden border border-[#F59E0B]/35 bg-[#041016] text-left min-h-[340px] lg:min-h-[420px] flex flex-col justify-end shadow-xl"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={reduced ? undefined : { scale: [1, 1.045, 1] }}
                  transition={reduced ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ResilientImage
                    src={heroFrame.image}
                    alt={`${heroFrame.title} — ${heroFrame.city}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#030B10] via-[#030B10]/55 to-transparent" />
                <div className="relative z-10 p-6 space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5EEAD4]">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{heroFrame.city}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#FDE68A] transition-colors">
                    {heroFrame.title}
                  </h3>
                  <p dir="rtl" className="text-sm font-semibold text-[#FDE68A]">
                    {heroFrame.sindhiLine}
                  </p>
                  <p className="text-xs text-[#F8F7F3]/85 leading-relaxed max-w-md">
                    {heroFrame.caption}
                  </p>
                </div>
              </motion.button>
            );
          })()}

          {/* Right 7 Columns: Wide Otaq Showcase + 2 Companion Portraits */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {HERITAGE_FRAMES.slice(1).map((frame, idx) => {
              const isWide = idx === 1; // Otaq Majlis spans full width on desktop top/bottom
              return (
                <motion.button
                  key={frame.id}
                  type="button"
                  onClick={() => {
                    setSelectedFrame(frame);
                    triggerApexHaptic('seal_minted', `Opened ${frame.title}`);
                  }}
                  whileHover={reduced ? undefined : { y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative rounded-2xl overflow-hidden border border-[#F59E0B]/25 bg-[#041016] text-left flex flex-col justify-end shadow-lg ${
                    isWide ? 'sm:col-span-2 min-h-[205px]' : 'min-h-[195px]'
                  }`}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
                    transition={reduced ? undefined : { duration: 15 + idx * 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ResilientImage
                      src={frame.image}
                      alt={`${frame.title} — ${frame.city}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030B10]/95 via-[#030B10]/55 to-transparent" />
                  <div className="relative z-10 p-4 sm:p-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#5EEAD4] font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        <span>{frame.city}</span>
                      </span>
                      <span className="text-[#FDE68A]/85">{frame.colorName}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#FDE68A] transition-colors">
                      {frame.title}
                    </h3>
                    <p dir="rtl" className="text-xs font-semibold text-[#FDE68A]/90">
                      {frame.sindhiLine}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Cultural Story Lightbox */}
      <AnimatePresence>
        {selectedFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setSelectedFrame(null)}
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl overflow-hidden border border-[#F59E0B]/50 bg-[#041016] shadow-2xl"
            >
              <div className="ajrak-mosaic-band" />
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <ResilientImage
                  src={selectedFrame.image}
                  alt={selectedFrame.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041016] via-[#041016]/30 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedFrame(null)}
                  className="absolute top-3 right-3 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80"
                  aria-label="Close heritage viewer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="text-xs font-semibold text-[#5EEAD4]">{selectedFrame.city}</div>
                  <h3 className="font-display text-2xl font-bold text-white mt-0.5">
                    {selectedFrame.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <p dir="rtl" className="text-base font-bold text-[#FDE68A]">
                  {selectedFrame.sindhiLine}
                </p>
                <p className="text-sm text-[#F8F7F3]/85 leading-relaxed">
                  {selectedFrame.caption}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-[#F59E0B]/15 text-xs">
                  <span className="text-[#5EEAD4] font-medium">
                    Pigment Signature: {selectedFrame.colorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFrame(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] font-semibold text-white"
                  >
                    Back to Command
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
