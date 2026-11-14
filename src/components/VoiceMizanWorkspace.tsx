import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mic, MicOff, MessageSquare, Sparkles } from 'lucide-react';
import { AjrakAudioWaveform } from './AjrakAudioWaveform';
import { ChromaticKashiRule } from './SovereignArt';
import { VoiceBiometricChallenge } from './VoiceBiometricChallenge';
import { triggerSovereignHaptic } from '../utils/haptics';
import type { VoiceExtractionResult } from '../types/sovereign';

const SAMPLE_NOTES = [
  { label: 'Urdu (اردو)', text: 'سکرنڈ رائس مل سے 25 ٹن باسمتی چاول ریاض برآمد، کل رقم 45 لاکھ روپے، مزدوروں کو فوری راس ادائیگی۔' },
  { label: 'Sindhi (سنڌي)', text: 'خيرپور مان 15 لک رپين جي اصيل کجور دبئي موڪلڻ لاءِ مضاربت معاهدو، ٻه شاهد موجود.' },
  { label: 'Arabic (العربية)', text: 'توريد ٢٠ طن أرز بسمتي من سكرند إلى الرياض بمبلغ ١٥٠ ألف ريال مرابحة بدون ربا.' },
  { label: 'English', text: 'Sakrand solar micro-grid 22% Mudarabah syndicate deal PKR 9,600,000 with Haq-e-Mazdoor priority.' },
];

export const VoiceMizanWorkspace: React.FC = () => {
  const [voiceText, setVoiceText] = useState(SAMPLE_NOTES[0].text);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extraction, setExtraction] = useState<VoiceExtractionResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeMicStream, setActiveMicStream] = useState<MediaStream | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const activeMicStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  activeMicStreamRef.current = activeMicStream;

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      activeMicStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const [advisorQuestion, setAdvisorQuestion] = useState(
    'How do we structure a 22% Mudarabah solar micro-grid syndicate in Sakrand compliant with Quran 2:282 and ETO-2002?',
  );
  const [advisorLang, setAdvisorLang] = useState('English');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [advisorResult, setAdvisorResult] = useState<{
    engine: string;
    answer: string;
    references: string[];
  } | null>(null);

  const handleExtractText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voiceText.trim()) return;
    setExtractLoading(true);
    setExtractError(null);
    try {
      const res = await fetch('/api/ai/extract-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceText }),
      });
      const data = (await res.json()) as VoiceExtractionResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Extraction failed (HTTP ${res.status})`);
      }
      setExtraction(data);
      triggerSovereignHaptic('authenticate');
    } catch (err) {
      triggerSovereignHaptic('error');
      setExtractError(err instanceof Error ? err.message : 'Unable to extract deal metadata.');
    } finally {
      setExtractLoading(false);
    }
  };

  const toggleRecording = async () => {
    setRecordingError(null);
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError('Microphone recording is unavailable in this browser context; use text extraction below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setActiveMicStream(stream);
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setActiveMicStream(null);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = String(reader.result || '').split(',')[1] || '';
          setExtractLoading(true);
          setExtractError(null);
          try {
            const res = await fetch('/api/ai/extract-voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64,
                mimeType: blob.type || 'audio/webm',
                text: voiceText,
              }),
            });
            const data = (await res.json()) as VoiceExtractionResult & { error?: string };
            if (!res.ok) {
              throw new Error(data.error || `Audio extraction failed (HTTP ${res.status})`);
            }
            setExtraction(data);
            triggerSovereignHaptic('authenticate');
          } catch (err) {
            triggerSovereignHaptic('error');
            setExtractError(err instanceof Error ? err.message : 'Audio extraction failed.');
          } finally {
            setExtractLoading(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      triggerSovereignHaptic('tap');
      setIsRecording(true);
    } catch {
      triggerSovereignHaptic('error');
      setActiveMicStream(null);
      setRecordingError('Microphone permission denied or unavailable; paste Urdu/Sindhi/Arabic/English text instead.');
    }
  };

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuestion.trim()) return;
    setAdvisorLoading(true);
    setAdvisorError(null);
    try {
      const res = await fetch('/api/ai/mizan-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: advisorQuestion, language: advisorLang }),
      });
      const data = (await res.json()) as {
        engine: string;
        answer: string;
        references: string[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || `Advisor unavailable (HTTP ${res.status})`);
      }
      setAdvisorResult(data);
      triggerSovereignHaptic('authenticate');
    } catch (err) {
      triggerSovereignHaptic('error');
      setAdvisorError(err instanceof Error ? err.message : 'Unable to reach Mizan-Advisor.');
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleCopyExtractionJson = async () => {
    if (!extraction) return;
    triggerSovereignHaptic('tap');
    await navigator.clipboard.writeText(JSON.stringify(extraction, null, 2));
    setCopiedJson(true);
    window.setTimeout(() => setCopiedJson(false), 1800);
  };

  const handleConsultAdvisorFromExtraction = () => {
    if (!extraction) return;
    triggerSovereignHaptic('tap');
    const amountNote = extraction.amountPkr
      ? `PKR ${extraction.amountPkr.toLocaleString('en-US')}`
      : 'unspecified PKR value';
    const qtyNote =
      extraction.quantity !== null ? `${extraction.quantity} ${extraction.unit}` : 'lot';
    setAdvisorQuestion(
      `Review this extracted ${extraction.transactionType} deal for Shariah (Quran 2:282 & AAOIFI) and Pakistan ETO-2002 compliance: ${qtyNote} of ${extraction.commodity} with ${extraction.partyName} valued at ${amountNote}. Check for Riba/Gharar clauses and Haq-e-Mazdoor priorities.`,
    );
  };

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Multimodal Audio & UTF-8 Extraction */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <ChromaticKashiRule />
        <div className="p-6 space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#9B1C2E] dark:text-[#F59E0B]">
            Gemini 2.5 Flash Multimodal + UTF-8 Offline Regex Fallback
          </p>
          <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
            Urdu, Sindhi, Arabic & English Voice Ledger Extractor
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => setVoiceText(sample.text)}
              className="px-3 py-1.5 rounded-md border border-[#0D2327]/15 dark:border-[#F8F7F3]/20 text-xs font-medium hover:bg-[#0D2327]/5 dark:hover:bg-white/5 whitespace-nowrap shrink-0"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => void handleExtractText(e)} className="space-y-4">
          <textarea
            rows={4}
            dir="auto"
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3.5 py-2.5 text-sm leading-relaxed"
          />

          {recordingError && (
            <p className="text-xs text-[#9B1C2E] dark:text-rose-400">{recordingError}</p>
          )}

          <AjrakAudioWaveform stream={activeMicStream} isRecording={isRecording} />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={extractLoading}
              className="kashi-btn px-4 py-2.5 rounded-lg bg-[#0D2327] dark:bg-[#F59E0B] text-white dark:text-[#0D2327] text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px]"
            >
              {extractLoading ? 'Extracting...' : 'Extract Deal Metadata'}
            </button>
            <button
              type="button"
              onClick={() => void toggleRecording()}
              className={`kashi-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 min-h-[40px] ${
                isRecording
                  ? 'bg-[#9B1C2E] text-white'
                  : 'border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 text-[#0D2327] dark:text-[#F8F7F3]'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop & Extract Audio' : 'Record Voice Note'}
            </button>
          </div>
        </form>

        {extractError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/45 bg-rose-950/60 px-3.5 py-2 text-xs text-rose-200"
          >
            {extractError}
          </div>
        )}

        {extraction && (
          <div className="rounded-lg border border-[#0D2327]/12 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-[#0D2327] dark:text-[#F8F7F3]">
                {extraction.transactionType} · {extraction.commodity}
              </span>
              <span className="font-mono-tabular text-[#9B1C2E] dark:text-[#F59E0B] font-semibold">
                {extraction.engine} · {extraction.languageDetected}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <p className="text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Counterparty</p>
                <p className="font-semibold">{extraction.partyName}</p>
              </div>
              <div>
                <p className="text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Quantity</p>
                <p className="font-mono-tabular font-semibold">
                  {extraction.quantity ?? '—'} {extraction.unit}
                </p>
              </div>
              <div>
                <p className="text-[#0D2327]/60 dark:text-[#F8F7F3]/60">Amount (PKR)</p>
                <p className="font-mono-tabular font-semibold">
                  {extraction.amountPkr ? `PKR ${extraction.amountPkr.toLocaleString('en-US')}` : '—'}
                </p>
              </div>
            </div>
            <p className="text-[#0D2327]/80 dark:text-[#F8F7F3]/80">{extraction.summary}</p>
            {extraction.ribaFlags.length > 0 && (
              <p className="text-[#9B1C2E] dark:text-rose-400 font-semibold">
                {extraction.ribaFlags.join(' · ')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F8F7F3]/10">
              <button
                type="button"
                onClick={() => void handleCopyExtractionJson()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#F59E0B]/30 text-[11px] font-semibold text-[#FDE68A] hover:bg-white/5"
              >
                {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedJson ? 'Copied JSON' : 'Copy JSON'}
              </button>
              <button
                type="button"
                onClick={handleConsultAdvisorFromExtraction}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F766E]/80 text-white text-[11px] font-semibold hover:bg-[#0F766E]"
              >
                <Sparkles className="w-3 h-3" />
                Consult Advisor About This Deal
              </button>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Mizan-Advisor Shariah & Trade Counsel */}
      <section className="kashi-card rounded-xl overflow-hidden border border-[#0D2327]/12 dark:border-[#F8F7F3]/15 ajrak-moving-glass border-[#F59E0B]/25">
        <ChromaticKashiRule />
        <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#0D2327]/60 dark:text-[#F8F7F3]/60">
              Quran 2:282 · AAOIFI · Pakistan ETO-2002
            </p>
            <h2 className="font-display text-xl font-bold text-[#0D2327] dark:text-[#F8F7F3]">
              Mizan-Advisor Shariah & Export Counsel
            </h2>
          </div>
          <MessageSquare className="w-5 h-5 text-[#9B1C2E] dark:text-[#F59E0B] shrink-0" />
        </div>

        <form onSubmit={(e) => void handleAskAdvisor(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Response Language</label>
            <select
              value={advisorLang}
              onChange={(e) => setAdvisorLang(e.target.value)}
              className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3 py-2 text-sm"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Sindhi">Sindhi (سنڌي)</option>
              <option value="Arabic">Arabic (العربية)</option>
            </select>
          </div>

          <textarea
            rows={4}
            value={advisorQuestion}
            onChange={(e) => setAdvisorQuestion(e.target.value)}
            className="w-full rounded-lg border border-[#0D2327]/20 dark:border-[#F8F7F3]/20 ajrak-well text-[#F8F7F3] px-3.5 py-2.5 text-sm"
          />

          <button
            type="submit"
            disabled={advisorLoading}
            className="kashi-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#9B1C2E] text-white text-xs font-semibold hover:bg-[#7F1524] whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {advisorLoading ? 'Consulting Mizan-Advisor...' : 'Ask Mizan-Advisor'}
          </button>
        </form>

        {advisorError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/45 bg-rose-950/60 px-3.5 py-2 text-xs text-rose-200"
          >
            {advisorError}
          </div>
        )}

        {advisorResult && (
          <div className="rounded-lg border border-[#0D2327]/12 dark:border-[#F8F7F3]/12 ajrak-well text-[#F8F7F3] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Mizan-Advisor Guidance</span>
              <span className="font-mono-tabular text-[#9B1C2E] dark:text-[#F59E0B]">{advisorResult.engine}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#0D2327]/90 dark:text-[#F8F7F3]/90">
              {advisorResult.answer}
            </p>
            <p className="text-[#0D2327]/65 dark:text-[#F8F7F3]/65">
              Sources: {advisorResult.references.join(' · ')}
            </p>
          </div>
        )}
        </div>
      </section>
    </div>

    <VoiceBiometricChallenge />
    </div>
  );
};
