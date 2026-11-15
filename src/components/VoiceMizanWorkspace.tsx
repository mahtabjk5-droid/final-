import React, { useRef, useState } from 'react';
import { Mic, ReceiptText, ShieldCheck, Sparkles, Square, Volume2 } from 'lucide-react';
import type { QuickCommandDraft, VoiceExtractionResult } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { ApexHapticControlCard } from './ApexHapticControlCard';
import {
  AjrakClothPattern,
  AjrakLoomDivider,
  ChromaticKashiRule,
  HalaKashiCornerOrnament,
} from './SovereignArt';
import { VoiceBiometricChallenge } from './VoiceBiometricChallenge';

const LANGUAGE_PRESETS: Array<{ label: string; sample: string }> = [
  {
    label: 'Urdu اردو',
    sample: 'عمر فاروق کو 45000 روپے سکرنڈ باسمتی چاول ادھار دیے 0% سود',
  },
  {
    label: 'Sindhi سنڌي',
    sample: 'حاجي بلال کان 28500 رپيا کھجور وڪرو نقد وصول ڪيا سکرنڊ',
  },
  {
    label: 'Arabic العربية',
    sample: 'شراء 320000 روبية تمر خيربور تصدير جدة مرابحة حلال بدون فائدة',
  },
  {
    label: 'English',
    sample: 'Muhammad Ali ko 14500 PKR Sakrand Basmati Rice udhaar diya Murabaha 0% Riba',
  },
];

function speakUrdu(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ur-PK';
  window.speechSynthesis.speak(utter);
}

interface VoiceMizanWorkspaceProps {
  onSendToParchi?: (draft: Omit<QuickCommandDraft, 'id'>) => void;
}

export const VoiceMizanWorkspace: React.FC<VoiceMizanWorkspaceProps> = ({
  onSendToParchi,
}) => {
  const [voiceNote, setVoiceNote] = useState(LANGUAGE_PRESETS[3].sample);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceExtractionResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [advisorQ, setAdvisorQ] = useState(
    'How should Sakrand farmers structure a 25-ton Riyadh rice export under Murabaha without Riba?',
  );
  const [advisorBusy, setAdvisorBusy] = useState(false);
  const [advisorAns, setAdvisorAns] = useState<{
    engine: string;
    answer: string;
    references: string[];
  } | null>(null);

  const runExtract = async (payload: { text?: string; audioBase64?: string; mimeType?: string }) => {
    setVoiceBusy(true);
    setMicError(null);
    try {
      const res = await fetch('/api/ai/extract-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as VoiceExtractionResult;
        setVoiceResult(data);
        triggerApexHaptic('seal_minted', 'Voice-to-Hisab Extracted');
      }
    } finally {
      setVoiceBusy(false);
    }
  };

  const toggleMic = async () => {
    setMicError(null);
    if (isRecording && recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone unavailable in this browser. Select a language preset or type your note below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const str = String(reader.result || '');
          const base64 = str.includes(',') ? str.split(',')[1] : str;
          void runExtract({ audioBase64: base64, mimeType: blob.type || 'audio/webm', text: voiceNote });
        };
        reader.readAsDataURL(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch {
      setMicError('Microphone access denied. Select a language preset or type your note below.');
    }
  };

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQ.trim()) return;
    setAdvisorBusy(true);
    try {
      const res = await fetch('/api/ai/mizan-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: advisorQ, language: 'Urdu & English' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdvisorAns(data);
        triggerApexHaptic('sync_steady', 'Mizan-Advisor Guidance');
      }
    } finally {
      setAdvisorBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative kashi-card rounded-xl overflow-hidden border border-[#14B8A6]/35 ajrak-moving-glass">
        <ChromaticKashiRule />
        <AjrakClothPattern accentHex="#14B8A6" opacityClass="opacity-[0.085]" />
        <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-50" />
        <div className="relative z-10 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                Gemini 2.5 Flash Audio &amp; UTF-8 Fallback · Urdu / Sindhi / Arabic / English
              </p>
              <h2 className="font-display text-2xl font-bold text-white">
                Multilingual Voice-to-Hisab Ledger Parser
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void toggleMic()}
              className={`kashi-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold ${
                isRecording ? 'bg-rose-600 text-white' : 'bg-[#0F766E] text-white'
              }`}
            >
              {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Stop & Extract Audio' : 'Record Voice Note'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#F8F7F3]/65 font-medium">Quick Language Sample:</span>
            {LANGUAGE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setVoiceNote(preset.sample);
                  void runExtract({ text: preset.sample });
                }}
                className="px-2.5 py-1 rounded border border-[#14B8A6]/30 bg-[#04141A] text-[#5EEAD4] hover:border-[#F59E0B]/50 hover:text-[#FDE68A] transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {micError && (
            <p className="rounded-lg border border-amber-500/35 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
              {micError}
            </p>
          )}

          <textarea
            rows={3}
            value={voiceNote}
            onChange={(e) => setVoiceNote(e.target.value)}
            className="w-full rounded-xl border border-[#14B8A6]/30 ajrak-well p-3.5 text-sm text-white"
          />

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={voiceBusy}
              onClick={() => void runExtract({ text: voiceNote })}
              className="kashi-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F59E0B] text-[#05131B] text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{voiceBusy ? 'Extracting...' : 'Extract Structured Hisab'}</span>
            </button>
            <button
              type="button"
              onClick={() => speakUrdu(voiceNote)}
              className="kashi-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#F59E0B]/40 text-[#FDE68A] text-xs font-semibold"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Speak Urdu TTS</span>
            </button>
          </div>

          {voiceResult && (
            <div className="rounded-xl border border-emerald-500/35 ajrak-well p-4 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-emerald-300">
                <span>{voiceResult.summary}</span>
                <span className="font-mono-tabular text-[11px] text-[#5EEAD4]">
                  {voiceResult.engine} · {voiceResult.languageDetected}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="rounded-lg border border-[#14B8A6]/20 bg-[#04141A] p-2.5">
                  <div className="text-[10px] text-[#5EEAD4]">Party</div>
                  <div className="font-bold text-white truncate">{voiceResult.partyName}</div>
                </div>
                <div className="rounded-lg border border-[#14B8A6]/20 bg-[#04141A] p-2.5">
                  <div className="text-[10px] text-[#5EEAD4]">Amount PKR</div>
                  <div className="font-mono-tabular font-bold text-[#FDE68A]">
                    {voiceResult.amountPkr !== null
                      ? `PKR ${voiceResult.amountPkr.toLocaleString('en-US')}`
                      : 'N/A'}
                  </div>
                </div>
                <div className="rounded-lg border border-[#14B8A6]/20 bg-[#04141A] p-2.5">
                  <div className="text-[10px] text-[#5EEAD4]">Contract Type</div>
                  <div className="font-mono-tabular font-semibold text-white">
                    {voiceResult.transactionType}
                  </div>
                </div>
                <div className="rounded-lg border border-[#14B8A6]/20 bg-[#04141A] p-2.5">
                  <div className="text-[10px] text-[#5EEAD4]">Commodity</div>
                  <div className="font-semibold text-white truncate">{voiceResult.commodity}</div>
                </div>
                <div className="rounded-lg border border-[#14B8A6]/20 bg-[#04141A] p-2.5">
                  <div className="text-[10px] text-[#5EEAD4]">Riba Audit</div>
                  <div
                    className={`inline-flex items-center gap-1 font-semibold ${
                      voiceResult.ribaFlags.length === 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>
                      {voiceResult.ribaFlags.length === 0
                        ? '0% Riba Clean'
                        : `${voiceResult.ribaFlags.length} Flag(s)`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#F8F7F3]/65">
                  Send this parsed record straight into a printable Raast Parchi &amp; WhatsApp slip:
                </span>
                {onSendToParchi && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendToParchi({
                        customer: voiceResult.partyName || 'Walk-in Buyer',
                        item: voiceResult.commodity || voiceNote.slice(0, 40),
                        amountPkr: voiceResult.amountPkr ?? 14500,
                        entryType:
                          voiceResult.transactionType === 'Murabaha' ||
                          voiceResult.rawText.toLowerCase().includes('udhaar')
                            ? 'Udhaar (Credit)'
                            : 'Wasooli (Paid)',
                      });
                    }}
                    className="kashi-btn inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] hover:bg-[#14B8A6] px-3.5 py-2 text-xs font-bold text-white"
                  >
                    <ReceiptText className="w-3.5 h-3.5" />
                    <span>Stamp in Live Parchi</span>
                  </button>
                )}
              </div>

              <pre className="overflow-x-auto rounded-lg bg-[#030B10] p-3 font-mono-tabular text-[11px] text-slate-200">
                {JSON.stringify(voiceResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>

      <AjrakLoomDivider label="Mizan-Advisor & Biometric Identity" />

      <section className="relative kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/30 ajrak-moving-glass">
        <ChromaticKashiRule />
        <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.08]" />
        <div className="relative z-10 p-6 space-y-4">
          <div>
            <p className="text-xs font-medium text-[#F59E0B]">
              Quran 2:282 · Pakistan ETO-2002 · AAOIFI Shariah Advisory
            </p>
            <h3 className="font-display text-xl font-bold text-white">
              Mizan-Advisor Shariah &amp; Export Consultant
            </h3>
          </div>

          <form onSubmit={(e) => void handleAskAdvisor(e)} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={advisorQ}
              onChange={(e) => setAdvisorQ(e.target.value)}
              className="flex-1 rounded-lg border border-[#F59E0B]/30 ajrak-well px-3.5 py-2.5 text-xs text-white"
            />
            <button
              type="submit"
              disabled={advisorBusy}
              className="kashi-btn rounded-lg bg-[#0F766E] px-4 py-2.5 text-xs font-bold text-white"
            >
              {advisorBusy ? 'Consulting...' : 'Ask Mizan-Advisor'}
            </button>
          </form>

          {advisorAns && (
            <div className="rounded-xl border border-[#F59E0B]/25 ajrak-well p-4 space-y-2 text-xs">
              <p className="text-[#F8F7F3] leading-relaxed">{advisorAns.answer}</p>
              <p className="font-mono-tabular text-[11px] text-[#5EEAD4]">
                References: {advisorAns.references.join(' · ')} ({advisorAns.engine})
              </p>
            </div>
          )}
        </div>
      </section>

      <VoiceBiometricChallenge />

      <ApexHapticControlCard />
    </div>
  );
};
