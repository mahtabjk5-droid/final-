import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Smartphone, Volume2 } from 'lucide-react';
import {
  APEX_HAPTIC_PROFILES,
  isApexHapticsEnabled,
  isSindhiSoundFxEnabled,
  isVibrationApiSupported,
  setApexHapticsEnabled,
  setSindhiSoundFxEnabled,
  subscribeApexHaptic,
  triggerApexHaptic,
  type ApexHapticEvent,
  type SovereignHapticPattern,
} from '../utils/haptics';

const ALL_PATTERNS: SovereignHapticPattern[] = [
  'sync_steady',
  'seal_minted',
  'agi_agent_heartbeat',
  'authenticate',
  'truth_tamper',
  'error',
  'signOut',
  'security_violation',
  'agi_agent_lockdown',
];

export const ApexHapticControlCard: React.FC = () => {
  const [enabled, setEnabled] = useState(() => isApexHapticsEnabled());
  const [soundFx, setSoundFx] = useState(() => isSindhiSoundFxEnabled());
  const [events, setEvents] = useState<ApexHapticEvent[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const supported = isVibrationApiSupported();

  useEffect(() => {
    return subscribeApexHaptic((evt) => {
      setEvents((prev) => [evt, ...prev].slice(0, 6));
      setPulseKey((k) => k + 1);
    });
  }, []);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setApexHapticsEnabled(next);
    if (next) triggerApexHaptic('tap', 'Apex Haptics Enabled');
  };

  const toggleSoundFx = () => {
    const next = !soundFx;
    setSoundFx(next);
    setSindhiSoundFxEnabled(next);
    if (next) triggerApexHaptic('seal_minted', 'Sindhi Acoustic Chimes Enabled');
  };

  const latest = events[0];

  return (
    <section className="kashi-card rounded-xl border border-[#F59E0B]/30 ajrak-moving-glass p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#5EEAD4]">
            W3C Vibration API + Web Audio Sindhi Sitar/Woodblock Chimes
          </p>
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#F59E0B]" />
            <span>Apex Hardware Haptic &amp; Acoustic Shield</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono-tabular text-[11px] text-[#F8F7F3]/70">
            {supported ? 'Vibration Ready' : 'Desktop Acoustic + Visual'}
          </span>
          <button
            type="button"
            onClick={toggleSoundFx}
            className={`px-3 py-1.5 rounded-lg font-semibold ${
              soundFx
                ? 'bg-[#F59E0B] text-[#05131B]'
                : 'border border-[#F59E0B]/30 text-[#F8F7F3]/70'
            }`}
          >
            {soundFx ? 'Motion Sound ON' : 'Motion Sound OFF'}
          </button>
          <button
            type="button"
            onClick={toggleEnabled}
            className={`px-3 py-1.5 rounded-lg font-semibold ${
              enabled
                ? 'bg-[#0F766E] text-white'
                : 'border border-[#F59E0B]/30 text-[#F8F7F3]/70'
            }`}
          >
            {enabled ? 'Haptics ON' : 'Haptics OFF'}
          </button>
        </div>
      </div>

      {/* Live Pulse Mirror Bar */}
      <motion.div
        key={pulseKey}
        initial={{ opacity: 0.45, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={`rounded-lg border px-3.5 py-2 text-xs flex items-center justify-between ${
          latest?.urgency === 'critical'
            ? 'border-rose-500/45 bg-rose-950/40 text-rose-200'
            : latest?.urgency === 'elevated'
              ? 'border-amber-500/45 bg-amber-950/40 text-amber-200'
              : 'border-[#14B8A6]/30 bg-[#04141A] text-[#5EEAD4]'
        }`}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>
            {latest ? `Latest Pulse: ${latest.label}` : 'Click any Sovereign Haptic pattern below to test'}
          </span>
        </span>
        {latest && (
          <span className="font-mono-tabular text-[11px]">[{latest.msPattern.join(', ')}ms]</span>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ALL_PATTERNS.map((key) => {
          const prof = APEX_HAPTIC_PROFILES[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => triggerApexHaptic(key, 'Manual Sovereign Test')}
              className={`kashi-btn flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold border text-left ${
                prof.urgency === 'critical'
                  ? 'border-rose-500/40 bg-rose-950/45 text-rose-200'
                  : prof.urgency === 'elevated'
                    ? 'border-amber-500/40 bg-amber-950/35 text-amber-200'
                    : 'border-teal-500/40 bg-teal-950/35 text-teal-200'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 truncate">
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{prof.label.split(' (')[0]}</span>
              </span>
              <span className="font-mono-tabular text-[10px] opacity-75 shrink-0">
                {prof.urgency.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {events.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F59E0B]/15 ajrak-well px-3 py-1.5 text-[11px] font-mono-tabular"
            >
              <span className="inline-flex items-center gap-1.5 text-[#FDE68A]">
                <Activity className="w-3 h-3 text-[#5EEAD4]" />
                {ev.label}
              </span>
              <span className="text-[#F8F7F3]/65">
                [{ev.msPattern.join(',')}ms] · {ev.source}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
