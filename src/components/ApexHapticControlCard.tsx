import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Cpu, Radio, ShieldAlert, Vibrate, VolumeX } from 'lucide-react';
import {
  APEX_HAPTIC_PROFILES,
  isApexHapticsEnabled,
  isVibrationApiSupported,
  setApexHapticsEnabled,
  subscribeApexHaptic,
  triggerApexHaptic,
  type ApexHapticEvent,
  type SovereignHapticPattern,
} from '../utils/haptics';

interface ApexHapticControlCardProps {
  activeAgentTokenCount: number;
  killSwitchActive: boolean;
  isConnected: boolean;
}

const TEST_TRIGGERS: Array<{
  key: SovereignHapticPattern;
  shortLabel: string;
}> = [
  { key: 'security_violation', shortLabel: 'Security Violation (Rapid)' },
  { key: 'agi_agent_lockdown', shortLabel: 'AGI Agent Lockdown' },
  { key: 'truth_tamper', shortLabel: 'Riba / Tamper' },
  { key: 'sync_steady', shortLabel: 'Steady Sync (240ms)' },
];

export const ApexHapticControlCard: React.FC<ApexHapticControlCardProps> = ({
  activeAgentTokenCount,
  killSwitchActive,
  isConnected,
}) => {
  const [enabled, setEnabled] = useState<boolean>(() => isApexHapticsEnabled());
  const [lastEvent, setLastEvent] = useState<ApexHapticEvent | null>(null);
  const hardwareSupported = isVibrationApiSupported();

  useEffect(() => {
    return subscribeApexHaptic((evt) => {
      setLastEvent(evt);
    });
  }, []);

  const handleToggleEnabled = () => {
    const next = !enabled;
    setApexHapticsEnabled(next);
    setEnabled(next);
    if (next) {
      triggerApexHaptic('agi_agent_heartbeat', 'Apex Haptics Armed');
    }
  };

  const activeUrgency = lastEvent?.urgency ?? (killSwitchActive ? 'critical' : 'nominal');
  const activePattern =
    lastEvent?.msPattern ??
    (killSwitchActive
      ? APEX_HAPTIC_PROFILES.agi_agent_lockdown.pattern
      : APEX_HAPTIC_PROFILES.sync_steady.pattern);

  const urgencyStyles =
    activeUrgency === 'critical'
      ? {
          border: 'border-rose-500/40',
          badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/35',
          bar: 'bg-rose-400',
          label: 'CRITICAL',
        }
      : activeUrgency === 'elevated'
        ? {
            border: 'border-[#F59E0B]/45',
            badge: 'bg-[#F59E0B]/20 text-[#FDE68A] border border-[#F59E0B]/35',
            bar: 'bg-[#F59E0B]',
            label: 'ELEVATED',
          }
        : {
            border: 'border-[#14B8A6]/35',
            badge: 'bg-[#14B8A6]/20 text-[#5EEAD4] border border-[#14B8A6]/35',
            bar: 'bg-[#5EEAD4]',
            label: 'NOMINAL',
          };

  return (
    <section
      className={`rounded-xl border ${urgencyStyles.border} ajrak-moving-glass p-5 space-y-4 transition-colors`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#5EEAD4]">
            <Vibrate className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Apex Haptic Feedback Engine · W3C Vibration API</span>
            <span className={`px-2 py-0.5 rounded font-mono-tabular text-[10px] font-bold ${urgencyStyles.badge}`}>
              {urgencyStyles.label}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-[#F8F7F3]">
            AGI &amp; Autonomous Agent Shield Haptic Telemetry
          </h3>
          <p className="text-xs text-[#F8F7F3]/70">
            Distinct millisecond vibration waveforms dispatch automatically on security breaches, Riba/math tampering, AGI token lockouts, and WebSocket sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-1.5 text-[11px] font-mono-tabular flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span className="text-[#F8F7F3]/75">AGI Agents:</span>
            <strong className={killSwitchActive ? 'text-rose-300' : 'text-emerald-300'}>
              {killSwitchActive ? 'REVOKED (0)' : `${activeAgentTokenCount} GUARDED`}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`kashi-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap ${
              enabled
                ? 'border-[#14B8A6]/45 bg-[#07262B]/85 text-[#5EEAD4]'
                : 'border-rose-500/40 bg-rose-950/60 text-rose-200'
            }`}
          >
            {enabled ? <Vibrate className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{enabled ? 'Haptics Armed' : 'Haptics Muted'}</span>
          </button>
        </div>
      </div>

      {/* Live Pulse Sequence & Hardware Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center rounded-lg border border-[#F59E0B]/20 ajrak-well px-4 py-3 text-xs">
        <div className="lg:col-span-5 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-[#FDE68A]">
            {activeUrgency === 'critical' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
            )}
            <span className="truncate">
              {lastEvent
                ? `${lastEvent.label} (${lastEvent.source})`
                : isConnected
                  ? 'Steady Sync Active (Awaiting Shield Events)'
                  : 'Standby Telemetry Mode'}
            </span>
          </div>
          <p className="font-mono-tabular text-[11px] text-[#F8F7F3]/65">
            {hardwareSupported
              ? 'Hardware navigator.vibrate() Active'
              : 'Desktop Browser Visual Mirror (Mobile Vibration Ready)'}{' '}
            · Pattern: [{activePattern.join(', ')}] ms
          </p>
        </div>

        {/* Visual Millisecond Waveform Mirror */}
        <div
          key={lastEvent?.id ?? 'idle'}
          className="lg:col-span-3 flex items-center gap-1 h-7 px-2 rounded bg-[#041017]/80 border border-[#F8F7F3]/10 overflow-hidden"
          aria-label="Haptic vibration pulse envelope"
        >
          {activePattern.map((ms, idx) => {
            const isActivePulse = idx % 2 === 0;
            const widthPx = Math.max(4, Math.min(48, Math.round(ms / 5)));
            return isActivePulse ? (
              <motion.span
                key={`${idx}-${ms}`}
                initial={{ scaleY: 0.35, opacity: 0.45 }}
                animate={{ scaleY: [0.4, 1, 0.75], opacity: [0.5, 1, 0.85] }}
                transition={{ duration: 0.38, delay: idx * 0.04 }}
                className={`h-4 rounded-sm ${urgencyStyles.bar}`}
                style={{ width: `${widthPx}px` }}
              />
            ) : (
              <span
                key={`${idx}-${ms}`}
                className="h-1 bg-[#F8F7F3]/15 rounded-full"
                style={{ width: `${Math.max(3, Math.round(ms / 6))}px` }}
              />
            );
          })}
        </div>

        {/* Interactive Pattern Dispatchers for Exhibition / Hardware Test */}
        <div className="lg:col-span-4 flex flex-wrap items-center justify-start lg:justify-end gap-1.5">
          {TEST_TRIGGERS.map((btn) => (
            <button
              key={btn.key}
              type="button"
              disabled={!enabled}
              onClick={() => triggerApexHaptic(btn.key, 'Manual Shield Test')}
              className="px-2.5 py-1 rounded-md border border-[#F59E0B]/25 text-[11px] font-medium text-[#F8F7F3]/85 hover:border-[#F59E0B] hover:text-[#FDE68A] disabled:opacity-40 whitespace-nowrap inline-flex items-center gap-1"
            >
              <Cpu className="w-3 h-3 text-[#F59E0B]" />
              {btn.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
