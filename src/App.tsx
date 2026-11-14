import React, { useState } from 'react';
import {
  Mic,
  ShieldAlert,
  ShieldCheck,
  Store,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MultiTenantKhataDesk } from './components/MultiTenantKhataDesk';
import { speakMultilingual } from './utils/ttsAndOffline';

type CleanTab = 'khata' | 'voice' | 'scam';

export default function App() {
  const [activeTab, setActiveTab] = useState<CleanTab>('khata');

  // Voice-to-Hisab state
  const [voiceNote, setVoiceNote] = useState('Muhammad Ali ko 14500 PKR chawal udhaar diya');
  const [voiceResult, setVoiceResult] = useState<Record<string, unknown> | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);

  // Anti-Scam Shield state
  const [scamText, setScamText] = useState('');
  const [scamResult, setScamResult] = useState<{
    decision: string;
    bayesianPosterior: number;
    alertUrdu: string;
    alertEnglish: string;
    triggers: string[];
  } | null>(null);
  const [scamBusy, setScamBusy] = useState(false);

  const handleVoiceParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceNote.trim()) return;
    setVoiceBusy(true);
    try {
      const res = await fetch('/api/ai/extract-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceNote }),
      });
      const data = await res.json();
      setVoiceResult(data);
    } finally {
      setVoiceBusy(false);
    }
  };

  const handleScanScam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scamText.trim()) return;
    setScamBusy(true);
    try {
      const res = await fetch('/api/scam-shield/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: scamText }),
      });
      const data = await res.json();
      setScamResult(data);
      if (data.decision !== 'SEALED' && data.alertUrdu) {
        speakMultilingual(data.alertUrdu, 'ur');
      }
    } finally {
      setScamBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#041017] text-[#F8F7F3]">
      {/* Clean Top App Bar */}
      <header className="border-b border-teal-500/25 bg-[#061822] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center font-display font-bold text-white text-lg">
              M
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-white leading-none">
                BolMizan Khata
              </div>
              <div className="text-[11px] text-teal-300 mt-0.5">
                Sakrand, Sindh • Zero-Riba Digital Ledger &amp; Raast QR
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 bg-[#030B10] p-1 rounded-xl border border-teal-500/20">
            <button
              type="button"
              onClick={() => setActiveTab('khata')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'khata'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>1. My Shop Khata</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('voice')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'voice'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>2. Voice AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scam')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'scam'
                  ? 'bg-rose-700 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>3. Anti-Scam</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {activeTab === 'khata' && <MultiTenantKhataDesk />}

        {activeTab === 'voice' && (
          <section className="rounded-xl border border-teal-500/30 bg-[#071B26] p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-teal-400">
                Gemini 2.5 Flash + Offline UTF-8 Fallback
              </p>
              <h2 className="font-display text-xl font-bold text-white mt-0.5">
                Urdu, Sindhi &amp; English Voice-to-Hisab
              </h2>
            </div>

            <form onSubmit={(e) => void handleVoiceParse(e)} className="space-y-3">
              <textarea
                rows={3}
                value={voiceNote}
                onChange={(e) => setVoiceNote(e.target.value)}
                placeholder="Type or dictate: e.g. Khadim Hussain ko 8500 PKR khad udhaar diya"
                className="w-full rounded-xl border border-teal-500/30 bg-[#030B10] p-3.5 text-sm text-white focus:border-teal-400 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={voiceBusy}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{voiceBusy ? 'Extracting...' : 'Extract Hisab Entry'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => speakMultilingual(voiceNote, 'ur')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-amber-400/40 text-amber-300 text-xs font-semibold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Aloud</span>
                </button>
              </div>
            </form>

            {voiceResult && (
              <pre className="rounded-xl border border-teal-500/25 bg-[#030B10] p-4 font-mono-tabular text-xs text-emerald-300 overflow-x-auto">
                {JSON.stringify(voiceResult, null, 2)}
              </pre>
            )}
          </section>
        )}

        {activeTab === 'scam' && (
          <section className="rounded-xl border border-rose-500/35 bg-[#071B26] p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-rose-400">
                Protects Shopkeepers from 8171, JazzCash, Easypaisa &amp; Fake Bank Calls
              </p>
              <h2 className="font-display text-xl font-bold text-white mt-0.5">
                SMS &amp; Call Anti-Scam Firewall
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setScamText(
                    '8171 Benazir Income Support: Aap ke Rs 25,000 nikle hain, fori apna OTP aur PIN code bhejein warna account block ho jayega.',
                  )
                }
                className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 text-xs text-rose-200"
              >
                Test Fake 8171 SMS
              </button>
              <button
                type="button"
                onClick={() =>
                  setScamText('Muhammad Ali ne 14,500 PKR chawal ka hisab SBP Raast se bhej diya hai.')
                }
                className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-xs text-emerald-200"
              >
                Test Genuine Payment SMS
              </button>
            </div>

            <form onSubmit={(e) => void handleScanScam(e)} className="space-y-3">
              <textarea
                rows={3}
                required
                value={scamText}
                onChange={(e) => setScamText(e.target.value)}
                placeholder="Paste suspicious SMS or what the caller is saying..."
                className="w-full rounded-xl border border-rose-500/30 bg-[#030B10] p-3.5 text-sm text-white focus:border-rose-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={scamBusy}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{scamBusy ? 'Scanning...' : 'Scan Message Now'}</span>
              </button>
            </form>

            {scamResult && (
              <div
                className={`rounded-xl border p-4 space-y-2 text-xs ${
                  scamResult.decision === 'SEALED'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                    : 'border-rose-500/50 bg-rose-950/50 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scamResult.decision === 'SEALED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
) : (

)}

{scamResult.decision === 'SEALED'
? 'SAFE: Genuine Transaction'
: DANGER (${Math.round(scamResult.bayesianPosterior * 100)}% Fraud Risk): Scam Blocked!}



{scamResult.alertUrdu}

{scamResult.alertEnglish}

)}
)}
BolMizan Khata • Sakrand, Shaheed Benazirabad, Sindh • 0% Riba Shariah Digital Ledger


);
}