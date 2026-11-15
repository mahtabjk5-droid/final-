import React, { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';

export const AjrakCursorTrail: React.FC = () => {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 260, damping: 24 });
  const y = useSpring(rawY, { stiffness: 260, damping: 24 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX - 16);
      rawY.set(e.clientY - 16);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [rawX, rawY, reduced]);

  if (reduced || !visible) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        className="fixed top-0 left-0 -ml-36 -mt-36 w-80 h-80 rounded-full pointer-events-none z-10 hidden md:block mix-blend-screen"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.13)_0%,rgba(20,184,166,0.06)_38%,transparent_72%)]" />
      </motion.div>
    </>
  );
};
