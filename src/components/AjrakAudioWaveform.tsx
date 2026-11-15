import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const AjrakAudioWaveform: React.FC<{ active: boolean }> = ({ active }) => {
  const reduced = useReducedMotion();
  const bars = [0.45, 0.9, 0.65, 1.0, 0.55, 0.8];

  return (
    <span className="inline-flex items-end gap-0.5 h-3.5" aria-hidden="true">
      {bars.map((scale, i) => (
        <motion.span
          key={i}
          className={`w-0.5 rounded-full ${active ? 'bg-[#FDE68A]' : 'bg-[#5EEAD4]/50'}`}
          animate={
            active && !reduced
              ? { height: ['4px', `${Math.round(scale * 14)}px`, '5px'] }
              : { height: active ? `${Math.round(scale * 12)}px` : '4px' }
          }
          transition={
            active && !reduced
              ? { duration: 0.7 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
};
