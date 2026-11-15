import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const GoldDustOverlay: React.FC = () => {
  const reduced = useReducedMotion();
  const motes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 5) % 96}%`,
        top: `${(i * 23 + 9) % 92}%`,
        size: (i % 3) + 2,
        duration: 7 + (i % 5) * 2,
        delay: (i % 4) * 0.8,
      })),
    [],
  );

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
    >
      {motes.map((m) => (
        <motion.span
          key={m.id}
          initial={{ opacity: 0.1, y: 0 }}
          animate={{
            opacity: [0.1, 0.55, 0.15],
            y: [-14, 14, -14],
            x: [-6, 8, -6],
          }}
          transition={{
            duration: m.duration,
            repeat: Infinity,
            delay: m.delay,
            ease: 'easeInOut',
          }}
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
          }}
          className="absolute rounded-full bg-[#FDE68A] shadow-[0_0_8px_rgba(245,158,11,0.55)]"
        />
      ))}
    </div>
  );
};
