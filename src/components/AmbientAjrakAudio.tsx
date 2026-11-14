import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { triggerSovereignHaptic } from '../utils/haptics';

export type AmbientWorkspaceTab = 'shields' | 'treasury' | 'advisor';

interface AmbientAjrakAudioProps {
  activeTab: AmbientWorkspaceTab;
  frozen?: boolean;
}

interface TabSoundProfile {
  label: string;
  droneHz: number;
  harmonicHz: number;
  windCenterHz: number;
  windQ: number;
  lfoHz: number;
}

const TAB_PROFILES: Record<AmbientWorkspaceTab, TabSoundProfile> = {
  shields: {
    label: 'Sentinel Wind',
    droneHz: 110.0, // A2 grounded desert night stillness
    harmonicHz: 164.81, // E3 fifth
    windCenterHz: 185,
    windQ: 2.4,
    lfoHz: 0.08,
  },
  treasury: {
    label: 'Caravan Brass',
    droneHz: 130.81, // C3 warm caravan resonance
    harmonicHz: 196.0, // G3 fifth
    windCenterHz: 245,
    windQ: 2.8,
    lfoHz: 0.11,
  },
  advisor: {
    label: 'Hala Acoustic',
    droneHz: 146.83, // D3 meditative counsel focus
    harmonicHz: 220.0, // A3 fifth
    windCenterHz: 310,
    windQ: 3.1,
    lfoHz: 0.065,
  },
};

interface AudioEngineNodes {
  ctx: AudioContext;
  masterGain: GainNode;
  droneOsc: OscillatorNode;
  harmonicOsc: OscillatorNode;
  windFilter: BiquadFilterNode;
  lfoOsc: OscillatorNode;
  lfoGain: GainNode;
}

function createBrownNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.025 * white) / 1.025;
    data[i] = lastOut * 3.2;
  }
  return buffer;
}

export const AmbientAjrakAudio: React.FC<AmbientAjrakAudioProps> = ({
  activeTab,
  frozen = false,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);
  const engineRef = useRef<AudioEngineNodes | null>(null);

  const initOrResumeAudio = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) {
      setPermissionNote('Web Audio unavailable');
      return false;
    }

    if (!engineRef.current) {
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Filtered brown/pink desert-wind noise loop
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = createBrownNoiseBuffer(ctx, 3);
      noiseSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(TAB_PROFILES[activeTab].windCenterHz, ctx.currentTime);
      windFilter.Q.setValueAtTime(TAB_PROFILES[activeTab].windQ, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.45, ctx.currentTime);

      // Slow LFO modulating wind gust sweep
      const lfoOsc = ctx.createOscillator();
      lfoOsc.type = 'sine';
      lfoOsc.frequency.setValueAtTime(TAB_PROFILES[activeTab].lfoHz, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(65, ctx.currentTime);
      lfoOsc.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      // Subtle low-frequency harmonic drone pair
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(TAB_PROFILES[activeTab].droneHz, ctx.currentTime);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.28, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);

      const harmonicOsc = ctx.createOscillator();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(TAB_PROFILES[activeTab].harmonicHz, ctx.currentTime);

      const harmonicFilter = ctx.createBiquadFilter();
      harmonicFilter.type = 'lowpass';
      harmonicFilter.frequency.setValueAtTime(340, ctx.currentTime);

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.09, ctx.currentTime);

      harmonicOsc.connect(harmonicFilter);
      harmonicFilter.connect(harmonicGain);
      harmonicGain.connect(masterGain);

      noiseSource.start();
      lfoOsc.start();
      droneOsc.start();
      harmonicOsc.start();

      engineRef.current = {
        ctx,
        masterGain,
        droneOsc,
        harmonicOsc,
        windFilter,
        lfoOsc,
        lfoGain,
      };
    }

    const { ctx } = engineRef.current;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        setPermissionNote('Tap to allow audio');
        return false;
      }
    }

    if (ctx.state !== 'running') {
      setPermissionNote('Audio blocked by browser');
      return false;
    }

    setPermissionNote(null);
    return true;
  };

  const handleToggle = async () => {
    triggerSovereignHaptic('tap');

    if (enabled) {
      setEnabled(false);
      const engine = engineRef.current;
      if (engine) {
        const now = engine.ctx.currentTime;
        engine.masterGain.gain.cancelScheduledValues(now);
        engine.masterGain.gain.setTargetAtTime(0.0001, now, 0.12);
      }
      return;
    }

    const ready = await initOrResumeAudio();
    if (!ready || !engineRef.current) return;

    const { ctx, masterGain } = engineRef.current;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(0.055, now, 0.28);
    setEnabled(true);
  };

  // Smoothly morph soundscape frequencies when active workspace tab or kill-switch changes
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const profile = TAB_PROFILES[activeTab];
    const now = engine.ctx.currentTime;
    const targetDrone = frozen ? 82.41 : profile.droneHz;
    const targetHarmonic = frozen ? 123.47 : profile.harmonicHz;
    const targetWindHz = frozen ? 140 : profile.windCenterHz;
    const targetWindQ = frozen ? 1.5 : profile.windQ;
    const targetLfo = frozen ? 0.04 : profile.lfoHz;

    engine.droneOsc.frequency.setTargetAtTime(targetDrone, now, 0.45);
    engine.harmonicOsc.frequency.setTargetAtTime(targetHarmonic, now, 0.45);
    engine.windFilter.frequency.setTargetAtTime(targetWindHz, now, 0.55);
    engine.windFilter.Q.setTargetAtTime(targetWindQ, now, 0.45);
    engine.lfoOsc.frequency.setTargetAtTime(targetLfo, now, 0.45);
  }, [activeTab, frozen]);

  // Clean up Web Audio context on unmount
  useEffect(() => {
    return () => {
      const engine = engineRef.current;
      if (engine) {
        engine.ctx.close().catch(() => {});
        engineRef.current = null;
      }
    };
  }, []);

  const currentProfile = TAB_PROFILES[activeTab];

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? `Mute Ambient Ajrak Desert Wind (${currentProfile.label})`
          : 'Enable Ambient Ajrak Desert Wind Soundscape'
      }
      title={
        permissionNote ??
        (enabled
          ? `Playing ${currentProfile.label} (${Math.round(currentProfile.droneHz)}Hz synthetic wind)`
          : 'Enable subtle desert-wind ambient audio')
      }
      className={`kashi-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
        enabled
          ? 'border-[#14B8A6]/60 bg-[#082E33]/85 text-[#5EEAD4]'
          : 'border-[#F59E0B]/30 bg-[#041017]/80 text-[#FDE68A]/85 hover:border-[#F59E0B]'
      }`}
    >
      {enabled ? (
        <Volume2 className="w-3.5 h-3.5 text-[#5EEAD4]" />
      ) : (
        <VolumeX className="w-3.5 h-3.5 text-[#F59E0B]" />
      )}
      <span>
        {permissionNote
          ? permissionNote
          : enabled
            ? `Wind: ${currentProfile.label}`
            : 'Desert Wind Audio'}
      </span>
    </button>
  );
};
