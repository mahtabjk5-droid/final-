import { GoogleGenAI, Type } from '@google/genai';
import type { VoiceExtractionResult } from '../src/types/sovereign.ts';

const GEMINI_MODEL = 'gemini-2.5-flash';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function detectLanguageUtf8(text: string): VoiceExtractionResult['languageDetected'] {
  const hasSindhiChars = /[\u067B\u067D\u067F\u0680\u0683\u0684\u068A\u068D\u068F\u0699\u06A6\u06AA\u06B3\u06BB\u06FD\u06FE]/.test(text);
  const hasUrduChars = /[\u0679\u067E\u0686\u0688\u0691\u0698\u06AF\u06BA\u06BE\u06C1\u06CC\u06D2]/.test(text);
  const hasArabicBlock = /[\u0600-\u06FF]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);

  if (hasSindhiChars && hasLatin) return 'Multilingual';
  if (hasSindhiChars) return 'Sindhi';
  if (hasUrduChars && hasLatin) return 'Multilingual';
  if (hasUrduChars) return 'Urdu';
  if (hasArabicBlock && !hasLatin) return 'Arabic';
  if (hasArabicBlock && hasLatin) return 'Multilingual';
  return 'English';
}

function normalizeArabicIndicDigits(input: string): string {
  const urduDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const uIdx = urduDigits.indexOf(ch);
    if (uIdx >= 0) return String(uIdx);
    const aIdx = arabicDigits.indexOf(ch);
    if (aIdx >= 0) return String(aIdx);
    return ch;
  });
}

export function offlineUtf8RegexExtract(rawText: string): VoiceExtractionResult {
  const normalized = normalizeArabicIndicDigits(rawText.trim());
  const languageDetected = detectLanguageUtf8(normalized);

  let amountPkr: number | null = null;
  const croreMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr|کروڑ)/i);
  const lakhMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|لاکھ|لک)/i);
  const thousandMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k|ہزار)/i);
  const directAmountMatch = normalized.match(/(?:PKR|Rs\.?|روپے)?\s*(\d{1,3}(?:,\d{3})+|\d{3,10})(?:\s*(?:PKR|Rs\.?|روپے))?/i);

  if (croreMatch) {
    amountPkr = Math.round(parseFloat(croreMatch[1]) * 10_000_000);
  } else if (lakhMatch) {
    amountPkr = Math.round(parseFloat(lakhMatch[1]) * 100_000);
  } else if (thousandMatch) {
    amountPkr = Math.round(parseFloat(thousandMatch[1]) * 1_000);
  } else if (directAmountMatch) {
    amountPkr = parseInt(directAmountMatch[1].replace(/,/g, ''), 10);
  }

  let quantity: number | null = null;
  let unit = 'kg';
  const qtyMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(ton|tons|tonne|kg|kilogram|maund|mann|bag|bags|من|بوری)/i);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1]);
    unit = qtyMatch[2];
  }

  const commodityLexicon: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /(basmati|rice|چاول|چانور|أرز)/i, label: 'Sakrand Basmati Rice' },
    { pattern: /(aseel|dates|کھجور|کجور|تمر)/i, label: 'Khairpur Aseel Dates' },
    { pattern: /(sindhri|mango|آم|انب)/i, label: 'Sindhri Mangoes' },
    { pattern: /(solar|microgrid|شمسی|سولر)/i, label: 'Off-Grid Solar Micro-Grid' },
    { pattern: /(water|ro plant|پانی|پاڻي)/i, label: 'Clean RO Water' },
  ];
  const matchedCommodity = commodityLexicon.find((entry) => entry.pattern.test(normalized));
  const commodity = matchedCommodity ? matchedCommodity.label : 'General Halal Trade';

  const partyMatch = normalized.match(/(?:from|to|with|party|supplier|buyer|کو|سے)\s+([A-Za-z\u0600-\u06FF\s]{2,32})/i);
  const partyName = partyMatch ? partyMatch[1].trim() : 'Sakrand Counterparty';

  let transactionType: VoiceExtractionResult['transactionType'] = 'General';
  if (/(mudarabah|مضاربہ|syndicate)/i.test(normalized)) transactionType = 'Mudarabah';
  else if (/(murabaha|مرابحہ)/i.test(normalized)) transactionType = 'Murabaha';
  else if (/(wage|labor|mazdoor|مزدور)/i.test(normalized)) transactionType = 'Haq-e-Mazdoor';
  else if (/(sadaqah|charity|صدقہ)/i.test(normalized)) transactionType = 'Sadaqah';
  else if (/(ujrah|commission|اجرت)/i.test(normalized)) transactionType = 'Ujrah';

  const ribaFlags: string[] = [];
  if (/(interest|riba|markup|سود|late fee)/i.test(normalized)) {
    ribaFlags.push('Potential Riba / interest terminology detected in UTF-8 scan');
  }

  return {
    engine: 'utf8-offline-regex',
    languageDetected,
    partyName,
    commodity,
    quantity,
    unit,
    amountPkr,
    transactionType,
    ribaFlags,
    summary: `Offline UTF-8 verified (${languageDetected}): ${transactionType} • ${commodity}${amountPkr ? ` • PKR ${amountPkr.toLocaleString('en-US')}` : ''}`,
    rawText: normalized,
  };
}

export async function extractMultilingualVoiceOrText(params: {
  text?: string;
  audioBase64?: string;
  mimeType?: string;
}): Promise<VoiceExtractionResult> {
  const ai = getGeminiClient();
  const fallbackInput = params.text?.trim() || 'Voice note audio buffer';
  if (!ai) {
    return offlineUtf8RegexExtract(fallbackInput);
  }

  try {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    if (params.audioBase64 && params.mimeType) {
      parts.push({
        inlineData: {
          mimeType: params.mimeType,
          data: params.audioBase64,
        },
      });
    }
    parts.push({
      text: `You are BolMizan VERITAS-SOVEREIGN OS v30.0 multimodal parser (Sakrand, Sindh). Extract structured trade, wage, or Shariah contract metadata from the audio or text in Urdu (اردو), Sindhi (سنڌي), Arabic (العربية), or English. Text input: ${params.text || '(see attached audio)'}`,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            languageDetected: { type: Type.STRING },
            partyName: { type: Type.STRING },
            commodity: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            amountPkr: { type: Type.NUMBER },
            transactionType: { type: Type.STRING },
            ribaFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summary: { type: Type.STRING },
            rawText: { type: Type.STRING },
          },
          required: ['languageDetected', 'partyName', 'commodity', 'unit', 'transactionType', 'ribaFlags', 'summary', 'rawText'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as Partial<VoiceExtractionResult>;
    const validLanguages = new Set(['Urdu', 'Sindhi', 'Arabic', 'English', 'Multilingual']);
    const validTypes = new Set(['Mudarabah', 'Murabaha', 'Ujrah', 'Haq-e-Mazdoor', 'Sadaqah', 'General']);

    return {
      engine: 'gemini-2.5-flash',
      languageDetected: validLanguages.has(parsed.languageDetected ?? '')
        ? (parsed.languageDetected as VoiceExtractionResult['languageDetected'])
        : detectLanguageUtf8(parsed.rawText || fallbackInput),
      partyName: parsed.partyName || 'Sakrand Counterparty',
      commodity: parsed.commodity || 'General Halal Trade',
      quantity: typeof parsed.quantity === 'number' ? parsed.quantity : null,
      unit: parsed.unit || 'kg',
      amountPkr: typeof parsed.amountPkr === 'number' ? parsed.amountPkr : null,
      transactionType: validTypes.has(parsed.transactionType ?? '')
        ? (parsed.transactionType as VoiceExtractionResult['transactionType'])
        : 'General',
      ribaFlags: Array.isArray(parsed.ribaFlags) ? parsed.ribaFlags : [],
      summary: parsed.summary || 'Extracted via Gemini 2.5 Flash',
      rawText: parsed.rawText || fallbackInput,
    };
  } catch {
    return offlineUtf8RegexExtract(fallbackInput);
  }
}

export async function askMizanAdvisor(params: {
  question: string;
  language?: string;
}): Promise<{ engine: 'gemini-2.5-flash' | 'utf8-offline-regex'; answer: string; references: string[] }> {
  const ai = getGeminiClient();
  if (!ai) {
    const q = params.question.toLowerCase();
    const isRiba = /riba|interest|سود|penalty|late/.test(q);
    return {
      engine: 'utf8-offline-regex',
      answer: isRiba
        ? 'Shariah Compliance Guidance (Offline Mizan Engine): Under Quran 2:275–282 and AAOIFI standards, fixed time-based interest or compounding late-payment penalties constitute Riba. Replace interest clauses with transparent Cost-Plus Murabaha (disclosed supplier cost + fixed Ujrah) or Mudarabah profit-sharing (10%–30% net profit share), witnessed by 2 Otaq Majlis witnesses.'
        : 'Mizan-Advisor (Offline Shariah & Trade Core): Ensure all Sakrand-to-Gulf deals pass the 4-point Niyat Gate, disclose any >=1% quality variance upfront (Sadiq-o-Ameen Zero-Hype Protocol), attach live unedited warehouse GPS video, allocate 5%–10% Khufiya Sadaqah, and settle Haq-e-Mazdoor wages at 0% fee via Raast before sunset.',
      references: ['Quran 2:282 (Kitabat al-Dayn)', 'Pakistan ETO-2002 §7', 'AAOIFI Shariah Standard No. 8 (Murabaha)'],
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: params.question,
      config: {
        systemInstruction: `You are Mizan-Advisor inside BolMizan VERITAS-SOVEREIGN OS v30.0 (headquartered in Sakrand, Sindh, Pakistan). Provide concise, strictly authentic Shariah-compliant trade, Quran 2:282 documentation, Pakistan ETO-2002 electronic contract, and zero-capital Sakrand-to-Gulf arbitrage guidance in ${params.language || 'the user language'}. Never recommend Riba, hidden fees, or speculative Gharar.`,
      },
    });

    return {
      engine: 'gemini-2.5-flash',
      answer: response.text?.trim() || 'Consult Otaq Majlis 2-witness verification before sealing.',
      references: ['Quran 2:282', 'Pakistan ETO-2002', 'Sadiq-o-Ameen Zero-Hype Protocol'],
    };
  } catch {
    return {
      engine: 'utf8-offline-regex',
      answer: 'Mizan-Advisor Fallback: Verify zero Riba, disclose all physical defects upfront, record 2 Otaq Majlis witnesses, and route laborer Haq-e-Mazdoor wages at 0% fee before sunset.',
      references: ['Quran 2:282', 'Pakistan ETO-2002'],
    };
  }
}
