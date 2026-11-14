import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  Sparkles,
  Sun,
  Lock,
  Radio,
  FileCheck2,
  Repeat,
  Volume2,
} from 'lucide-react';
import { ChromaticKashiRule } from './SovereignArt';

interface ApexFrontierCommandStripProps {
  totalEstatePkr: number;
}

export const ApexFrontierCommandStrip: React.FC<ApexFrontierCommandStripProps> = ({
  totalEstatePkr,
}) => {
  const [apexOutput, setApexOutput] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const runEndpoint = async (title: string, url: string, body: Record<string, unknown>) => {
    setBusy(true);
    setActiveTitle(title);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`);
      }
      setApexOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setApexOutput(
        JSON.stringify(
          { error: err instanceof Error ? err.message : 'Network error calling Apex engine' },
          null,
          2,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  // Pure Web Audio API FSK Data-Over-Sound Acoustic Offline Sync Transmitter (Zero Internet)
  const transmitAcousticDataOverSound = () => {
    const packet = `BMZ*VTS-2026*${totalEstatePkr}PKR*SAKRAND*7860#`;
    setActiveTitle('FSK Data-Over-Sound Acoustic Modem (Zero-Internet Offline Sync)');
    setApexOutput(
      JSON.stringify(
        {
          mode: 'WEB-AUDIO-FSK-ACOUSTIC-MODEM',
          carrierFrequenciesHz: { markBit1: 1850, spaceBit0: 1350 },
          transmittedPacket: packet,
          internetRequired: false,
          status: 'AUDIO_BURST_BROADCASTED_TO_NEARBY_DEVICE',
        },
        null,
        2,
      ),
    );

    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);

    let t = ctx.currentTime;
    for (let i = 0; i < Math.min(packet.length, 24); i++) {
      const bit = packet.charCodeAt(i) % 2;
      osc.frequency.setValueAtTime(bit === 1 ? 1850 : 1350, t);
      t += 0.035;
    }

    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      if (ctx.state !== 'closed') {
        void ctx.close();
      }
    };
    osc.start();
    osc.stop(t + 0.06);
  };

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/35 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#5EEAD4]">
              v30.0 Apex Singularity & Out-of-the-Box Frontier Engines
            </p>
            <h3 className="font-display text-xl font-bold text-[#F8F7F3]">
              ZK Solvency, Sunnah Moisture, Solar Vouchers, Acoustic Modem & Wasiyyat-DAG
            </h3>
          </div>
          <span className="font-mono-tabular text-xs px-2.5 py-1 rounded border border-[#F59E0B]/30 bg-black/40 text-[#FDE68A]">
            POST-QUANTUM HYBRID SHA-512
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint('Zero-Knowledge Solvency Proof', '/api/apex/zk-solvency', {
                actualReservePkr: totalEstatePkr,
                requiredThresholdPkr: 5_000_000,
                verifierName: 'Al-Riyadh Import Bank KSA',
              })
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] text-white text-xs font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> ZK Proof of Solvency
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint(
                'Sunnah Sea-Transit Weight Calibrator (Quran 83:1-3)',
                '/api/apex/export-weight',
                {
                  cropType: 'Sakrand Super Kernel Basmati',
                  netDispatchedTons: 25,
                  initialMoisturePct: 12.8,
                  targetPortMoisturePct: 11.5,
                },
              )
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9B1C2E] text-white text-xs font-semibold"
          >
            <Scale className="w-3.5 h-3.5" /> Sunnah Transit Weight
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint(
                'Solar-kWh Physical Commodity Voucher',
                '/api/frontier/utility-voucher',
                {
                  plantLocation: 'Sakrand Solar & RO Plant #1',
                  assetType: 'SOLAR_KWH',
                  physicalUnits: 500,
                },
              )
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F59E0B] text-[#05131B] text-xs font-bold"
          >
            <Sun className="w-3.5 h-3.5" /> Mint 500 kWh Solar Voucher
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint(
                'Small-Shop Mandi Reverse Auction',
                '/api/frontier/reverse-auction',
                {
                  commodity: 'Super Kernel Basmati Rice',
                  shopOrdersKg: [120, 200, 150, 300],
                  retailPricePkrPerKg: 310,
                  winningMillBidPkrPerKg: 265,
                },
              )
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-400/40 bg-emerald-950/50 text-emerald-300 text-xs font-semibold"
          >
            <Repeat className="w-3.5 h-3.5" /> Mandi Reverse Auction
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint(
                'Wasiyyat-DAG Dead-Man Switch & Mirath Evaluator',
                '/api/apex/wasiyyat/evaluate',
                {
                  totalEstatePkr,
                  simulateElapsedDays: 0,
                },
              )
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#F59E0B]/40 text-[#FDE68A] text-xs font-semibold"
          >
            <Lock className="w-3.5 h-3.5" /> Wasiyyat-DAG Mirath
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint(
                'ETO-2002 Court Arbitration Evidence Dossier',
                '/api/apex/arbitration-dossier',
                {
                  contractRef: 'deal-sakrand-basmati-01',
                  creditor: 'BolMizan Global HQ (Sakrand)',
                  debtor: 'Najd Al-Barakah Foods LLC (Riyadh)',
                  amountPkr: 4_850_000,
                },
              )
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-sky-400/40 text-sky-300 text-xs font-semibold"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> ETO-2002 Court Dossier
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void runEndpoint('Ajrak Tile Steganography Vault', '/api/frontier/ajrak-stego', {
                secretText: `24K Gold & Sakrand Land Deeds | Estate PKR ${totalEstatePkr}`,
                passphrase: '7860',
              })
            }
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#5EEAD4]/40 text-[#5EEAD4] text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ajrak Stego Vault
          </button>

          <button
            type="button"
            onClick={transmitAcousticDataOverSound}
            className="kashi-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#9B1C2E] to-[#B91C32] border border-[#F59E0B]/40 text-white text-xs font-bold"
          >
            <Radio className="w-3.5 h-3.5" />
            <Volume2 className="w-3.5 h-3.5" /> Data-Over-Sound Sync
          </button>
        </div>

        {apexOutput && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono-tabular font-semibold text-[#FDE68A]">
              LIVE ENGINE OUTPUT // {activeTitle}
            </div>
            <pre className="rounded-lg ajrak-well border border-[#F59E0B]/25 p-4 font-mono-tabular text-xs text-emerald-300 overflow-x-auto max-h-64">
              {apexOutput}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
};
