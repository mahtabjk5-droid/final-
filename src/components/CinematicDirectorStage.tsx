import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Film, Play, ShieldCheck, X } from 'lucide-react';
import solarImg from '../assets/images/indus_solar_water_1794637624566.jpg';
import basmatiImg from '../assets/images/sakrand_basmati_mizan_1794637623859.jpg';
import sakrandKashiImg from '../assets/images/sakrand_kashi_command_1794637623349.jpg';
import ajrakArtisanImg from '../assets/images/sindh_ajrak_artisan_1794737690544.jpg';
import halaKashiImg from '../assets/images/sindh_hala_kashi_1794737692970.jpg';
import mandiBazaarImg from '../assets/images/sindh_mandi_bazaar_1794737693302.jpg';
import otaqMajlisImg from '../assets/images/sindh_otaq_majlis_1794737693647.jpg';
import { triggerApexHaptic } from '../utils/haptics';
import { AjrakPixelParticle } from './AjrakPixelParticle';
import { ResilientImage } from './SovereignArt';

interface CinematicDirectorStageProps {
  open: boolean;
  onClose: () => void;
}

const SCENES = [
  {
    id: 'ajrak-craft',
    title: 'Scene 1 — Bhitshah & Matiari Ajrak Block Craft',
    caption: 'Hand-carved acacia woodblocks pressing crimson, indigo, and ivory heritage onto every ledger seal.',
    image: ajrakArtisanImg,
    badge: 'Sindhi Ajrak Heritage',
  },
  {
    id: 'otaq-majlis',
    title: 'Scene 2 — Sakrand Otaq Majlis Elder Witnessing',
    caption: 'Seated beside vibrant Ralli patchwork and brass Mizan scales, elders attest fair zero-Riba deals.',
    image: otaqMajlisImg,
    badge: 'Quran 2:282 Two-Witness',
  },
  {
    id: 'mandi-dawn',
    title: 'Scene 3 — Sunrise Mandi & Brass Mizan Honesty',
    caption: 'Growers and vendors weighing mangoes, dates, and basmati rice with instant Raast & WhatsApp Parchis.',
    image: mandiBazaarImg,
    badge: 'Sakrand Mandi Pulse',
  },
  {
    id: 'hala-kashi',
    title: 'Scene 4 — Hala Kashi Glazed Geometric Symmetry',
    caption: 'Persian turquoise, cobalt indigo, and harvest gold ceramics inspiring our visual shield architecture.',
    image: halaKashiImg,
    badge: 'Hala Kashi Geometry',
  },
  {
    id: 'basmati',
    title: 'Scene 5 — Zero-Capital Sakrand-to-Gulf Basmati Export',
    caption: 'Disclosed supplier costs, upfront Siddiq (RA) defect transparency, and 24K Gold hedging.',
    image: basmatiImg || sakrandKashiImg,
    badge: 'Murabaha Export Lot #1',
  },
  {
    id: 'solar',
    title: 'Scene 6 — Ameen Solar Micro-Grid & Clean RO Water',
    caption: '32-Shop Sakrand Syndicate Mudarabah equity powering off-grid rural commerce.',
    image: solarImg,
    badge: '120kW Off-Grid Solar',
  },
];

export const CinematicDirectorStage: React.FC<CinematicDirectorStageProps> = ({
  open,
  onClose,
}) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const reduced = useReducedMotion();
  const scene = SCENES[sceneIdx];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-3xl rounded-2xl border border-[#F59E0B]/45 bg-[#041016] overflow-hidden shadow-2xl"
          >
            <div className="anamorphic-lens-flare" />
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F59E0B]/20">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FDE68A]">
                <Film className="w-4 h-4 text-[#F59E0B]" />
                <span>BolMizan Sindhi Heritage &amp; Director Showcase</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10"
                aria-label="Close Showcase"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-72 sm:h-80 overflow-hidden bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0.4, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.4 }}
                  transition={{ duration: 0.45 }}
                  className="w-full h-full"
                >
                  <ResilientImage
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#041016] via-[#041016]/35 to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-lg bg-[#041016]/85 border border-[#F59E0B]/40 px-3 py-1.5 text-xs font-semibold text-[#5EEAD4]">
                <AjrakPixelParticle />
                <span>{scene.badge}</span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 space-y-1">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {scene.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#F8F7F3]/85">{scene.caption}</p>
              </div>
            </div>

            <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-[#030B10]">
              <div className="flex flex-wrap gap-1.5">
                {SCENES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSceneIdx(idx);
                      triggerApexHaptic('tap', `Showcase ${s.badge}`);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      idx === sceneIdx
                        ? 'bg-[#F59E0B] text-[#041016]'
                        : 'border border-[#F59E0B]/25 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3" /> {idx + 1}
                  </button>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono-tabular text-emerald-300">
                <ShieldCheck className="w-4 h-4" /> VERITAS-SOVEREIGN v30.0
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
