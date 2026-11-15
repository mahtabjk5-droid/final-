import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';
import halaKashiImg from '../assets/images/sindh_hala_kashi_1794737692970.jpg';
import { triggerApexHaptic } from '../utils/haptics';
import { BolMizanLogo, ResilientImage } from './SovereignArt';

interface AjrakSovereignGateProps {
  locked: boolean;
  onUnlock: () => void;
}

export const AjrakSovereignGate: React.FC<AjrakSovereignGateProps> = ({
  locked,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === '7860') {
      setPin('');
      setErr(null);
      triggerApexHaptic('authenticate', 'Sovereign Vault Unlocked');
      onUnlock();
    } else {
      setErr('Invalid Sovereign PIN (Default: 7860)');
      triggerApexHaptic('error', 'Vault Unlock Rejected');
    }
  };

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#030B10]/95 p-4"
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-[#F59E0B]/50 ajrak-moving-glass shadow-2xl"
          >
            <div className="relative h-28 overflow-hidden">
              <ResilientImage
                src={halaKashiImg}
                alt="Hala Kashi Security Chamber"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041016] via-[#041016]/50 to-transparent" />
              <div className="absolute bottom-2 inset-x-0 flex justify-center">
                <BolMizanLogo size="sm" />
              </div>
            </div>

            <div className="p-6 text-center space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B]">
                  <Lock className="w-3.5 h-3.5" /> Sovereign Command Vault Locked
                </div>
                <h2 className="font-display text-xl font-bold text-white mt-1">
                  Enter Sovereign PIN
                </h2>
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN (Default: 7860)"
                className="w-full text-center rounded-xl border border-[#F59E0B]/35 ajrak-well px-4 py-2.5 font-mono-tabular text-sm text-white"
              />
              {err && <p className="text-xs font-semibold text-rose-400">{err}</p>}
              <button
                type="submit"
                className="w-full kashi-btn inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] py-2.5 text-xs font-bold text-white"
              >
                <Unlock className="w-4 h-4" /> Unlock Sovereign OS
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
