import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const AjrakPixelParticle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduced = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 32 32"
      className={`w-5 h-5 shrink-0 ${className}`}
      animate={reduced ? undefined : { rotate: [0, 90, 180, 270, 360] }}
      transition={reduced ? undefined : { duration: 18, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <polygon points="16,2 30,16 16,30 2,16" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
      <polygon points="16,8 24,16 16,24 8,16" fill="#9B1C2E" stroke="#14B8A6" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="2.2" fill="#FDE68A" />
    </motion.svg>
  );
};
