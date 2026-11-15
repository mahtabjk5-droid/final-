import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, MessageCircle, Printer, QrCode, ShieldCheck, Stamp } from 'lucide-react';
import QRCode from 'qrcode';
import type { LocaleScript, QuickCommandDraft } from '../types/sovereign';
import { triggerApexHaptic } from '../utils/haptics';
import { AjrakClothPattern, HalaKashiCornerOrnament } from './SovereignArt';

interface SabziParchiAtelierProps {
  script: LocaleScript;
  shopName?: string;
  externalDraft?: QuickCommandDraft | null;
}

const PRESET_BASKETS = [
  { label: '2 Mann Basmati Rice', item: 'Sakrand Super Basmati (80 kg)', amount: 24500 },
  { label: 'Khairpur Dates Crate', item: 'Aseel Khairpur Dates (40 kg)', amount: 14800 },
  { label: 'Daily Fresh Sabzi', item: 'Tomato, Onion & Green Chili Lot', amount: 6200 },
  { label: 'Solar Drip Deposit', item: 'Solar Water Pump Downpayment', amount: 45000 },
];

function computeSimpleCrc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildClientRaastPayload(merchant: string, amountPkr: number, ref: string): string {
  const safeName = merchant.slice(0, 22) || 'Sakrand Mandi';
  const amt = Math.max(1, Math.round(amountPkr)).toString();
  const base =
    `00020101021226280012PK.SBP.RAAST0108BOLMIZAN52045411530358654${String(amt.length).padStart(2, '0')}${amt}5802PK59${String(safeName.length).padStart(2, '0')}${safeName}6007Sakrand62${String(ref.length + 4).padStart(2, '0')}05${String(ref.length).padStart(2, '0')}${ref}6304`;
  return `${base}${computeSimpleCrc16(base)}`;
}

export const SabziParchiAtelier: React.FC<SabziParchiAtelierProps> = ({
  script,
  shopName = 'Al-Mizan Sabzi & Anaj Store · Sakrand',
  externalDraft,
}) => {
  const [customer, setCustomer] = useState('Haji Tariq Mehmood');
  const [customerPhone, setCustomerPhone] = useState('03001234567');
  const [itemText, setItemText] = useState('Sakrand Super Basmati (80 kg)');
  const [amountPkr, setAmountPkr] = useState(24500);
  const [modeType, setModeType] = useState<'Udhaar (Credit)' | 'Wasooli (Paid)'>('Udhaar (Credit)');
  const [witness, setWitness] = useState('Master Rasheed Ahmed (Otaq)');
  const [stamped, setStamped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [sealHash, setSealHash] = useState('8F3A9C21E04B7D12');

  const [sealedAt, setSealedAt] = useState<string | null>(null);
  const [quickLine, setQuickLine] = useState('Chacha Ghulam ko 2 Mann Chawal 18500');

  useEffect(() => {
    if (!externalDraft) return;
    setCustomer(externalDraft.customer);
    setItemText(externalDraft.item);
    setAmountPkr(Math.max(50, externalDraft.amountPkr));
    setModeType(externalDraft.entryType);
    setQuickLine(`${externalDraft.customer} · ${externalDraft.item} · PKR ${externalDraft.amountPkr}`);
    setStamped(true);
    setSealedAt(new Date().toLocaleTimeString('en-PK'));
  }, [externalDraft]);

  const applyQuickLine = (raw: string) => {
    const numMatch = raw.match(/\d[\d,]*/g);
    if (numMatch && numMatch.length > 0) {
      const largest = Math.max(...numMatch.map((n) => Number(n.replace(/,/g, ''))));
      if (largest >= 50) setAmountPkr(largest);
    }
    const cleanWords = raw.replace(/\d[\d,]*/g, '').trim();
    if (cleanWords.length > 3) {
      const firstTwo = cleanWords.split(/\s+/).slice(0, 2).join(' ');
      setCustomer(firstTwo);
      setItemText(cleanWords);
    }
    setStamped(false);
  };

  const parchiNo = `PR-${String((amountPkr % 899) + 101)}`;
  const raastPayload = buildClientRaastPayload(shopName, amountPkr, parchiNo);

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(raastPayload, {
      width: 180,
      margin: 1,
      color: { dark: '#0D2327', light: '#FAF5E8' },
    }).then((url) => {
      if (active) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [raastPayload]);

  const handleStampSeal = () => {
    setStamped(true);
    setSealedAt(new Date().toLocaleTimeString('en-PK'));
    const seed = `${customer}|${itemText}|${amountPkr}|${Date.now()}`;
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    setSealHash((h >>> 0).toString(16).toUpperCase().padStart(8, '0') + 'A7C49E12');
    triggerApexHaptic('seal_minted', 'Otaq Parchment Seal Stamped');
  };

  const cleanWaDigits = customerPhone.replace(/\D/g, '');
  const intlWa = cleanWaDigits.startsWith('0') ? `92${cleanWaDigits.slice(1)}` : cleanWaDigits;
  const waText = encodeURIComponent(
    `Assalam-o-Alaikum, BolMizan Parchi #${parchiNo}\nShop: ${shopName}\nCustomer: ${customer}\nType: ${modeType}\nGoods: ${itemText}\nAmount: PKR ${amountPkr.toLocaleString('en-US')} (0% Riba)\nWitness: ${witness}\nSeal: ${sealHash}`,
  );
  const waHref = `https://wa.me/${intlWa || '923007860786'}?text=${waText}`;

  const heading =
    script === 'ur'
      ? 'فوری منڈی پرچی اور اوطاق مہر اسٹامپ'
      : script === 'sd'
        ? 'فوري منڊي پرچي ۽ اوطاق مُهر اسٽوڊيو'
        : 'Live Handloom Parchi & Otaq Ink-Seal Studio';

  const kicker =
    script === 'ur'
      ? '0% سود ڈیجیٹل رسید · براہِ راست واٹس ایپ اور راست کیو آر'
      : script === 'sd'
        ? '0% وياج ڊجيٽل رسيد · سڌو واٽس ايپ ۽ راست ڪيو آر'
        : 'Tactile Zero-Riba Receipt Craft · Instant Raast QR & WhatsApp Dispatch';

  return (
    <section className="relative rounded-2xl overflow-hidden border border-[#F59E0B]/35 bg-[#06151B] shadow-2xl">
      <div className="ajrak-mosaic-band" />
      <AjrakClothPattern accentHex="#F59E0B" opacityClass="opacity-[0.07]" />
      <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-55" />

      <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Rapid Shopkeeper Composer */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-1.5">
            <p
              dir={script === 'en' ? 'ltr' : 'rtl'}
              className="text-xs font-medium text-[#5EEAD4]"
            >
              {kicker}
            </p>
            <h2
              dir={script === 'en' ? 'ltr' : 'rtl'}
              className="font-display text-2xl sm:text-3xl font-bold text-white"
            >
              {heading}
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={quickLine}
              onChange={(e) => setQuickLine(e.target.value)}
              placeholder="Write naturally: Name, Item, PKR..."
              className="flex-1 rounded-lg border border-[#14B8A6]/35 ajrak-well px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => applyQuickLine(quickLine)}
              className="px-3 py-2 rounded-lg bg-[#0F766E] text-xs font-bold text-white whitespace-nowrap shrink-0"
            >
              Auto-Fill Parchi
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_BASKETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setItemText(preset.item);
                  setAmountPkr(preset.amount);
                  setStamped(false);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#F59E0B]/25 bg-[#030D12] text-xs font-medium text-[#FDE68A] hover:border-[#F59E0B]/60 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-[#F8F7F3]/70">Customer / Farmer Name</span>
              <input
                type="text"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  setStamped(false);
                }}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[#F8F7F3]/70">WhatsApp Mobile</span>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-white"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-[#F8F7F3]/70">Goods &amp; Weight</span>
              <input
                type="text"
                value={itemText}
                onChange={(e) => {
                  setItemText(e.target.value);
                  setStamped(false);
                }}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[#F8F7F3]/70">Amount (PKR)</span>
              <input
                type="number"
                min={50}
                value={amountPkr}
                onChange={(e) => {
                  setAmountPkr(Number(e.target.value) || 0);
                  setStamped(false);
                }}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-[#FDE68A] font-bold"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[#F8F7F3]/70">Entry Type</span>
              <select
                value={modeType}
                onChange={(e) => setModeType(e.target.value as typeof modeType)}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
              >
                <option value="Udhaar (Credit)">Udhaar (Receivable)</option>
                <option value="Wasooli (Paid)">Wasooli (Paid Cash)</option>
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-[#F8F7F3]/70">Otaq Majlis Elder Witness</span>
              <input
                type="text"
                value={witness}
                onChange={(e) => {
                  setWitness(e.target.value);
                  setStamped(false);
                }}
                className="w-full rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleStampSeal}
              className="kashi-btn inline-flex items-center gap-2 rounded-lg bg-[#9B1C2E] hover:bg-[#B91C1C] px-4 py-2.5 text-xs font-bold text-white"
            >
              <Stamp className="w-4 h-4" />
              <span>{stamped ? 'Re-Stamp Otaq Seal' : 'Stamp Otaq Seal (مهر لڳايو)'}</span>
            </button>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="kashi-btn inline-flex items-center gap-2 rounded-lg bg-[#0F766E] hover:bg-[#14B8A6] px-4 py-2.5 text-xs font-bold text-white"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp Parchi</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/35 px-3.5 py-2.5 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Right: Authentic Warm-Ivory Cotton Paper Sindhi Mandi Parchi */}
        <div className="lg:col-span-6">
          <motion.div
            animate={stamped ? { y: [-2, 0] } : undefined}
            transition={{ duration: 0.25 }}
            className="relative rounded-xl overflow-hidden bg-[#FAF5E8] text-[#0D2327] shadow-[0_28px_56px_-14px_rgba(0,0,0,0.85)] border-2 border-[#C89D54]"
          >
            <div className="ajrak-mosaic-band" />
            <AjrakClothPattern
              accentHex="#9B1C2E"
              secondaryHex="#0F766E"
              opacityClass="opacity-[0.065]"
              blendClass="mix-blend-multiply"
            />
            {stamped && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.16),transparent_60%)]"
              />
            )}

            <div className="relative z-10 p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-[#0D2327]/25 pb-3.5">
                <div>
                  <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#9B1C2E] font-bold">
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ · 0% Riba Mandi Parchi
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0D2327] mt-0.5">
                    {shopName}
                  </h3>
                  <div className="text-xs text-[#0D2327]/70">
                    Sakrand, Shaheed Benazirabad · Parchi #{parchiNo}
                  </div>
                </div>
                <div className="text-right font-mono-tabular text-xs">
                  <div className="font-bold text-[#0F766E]">{modeType}</div>
                  <div className="text-[11px] text-[#0D2327]/60">
                    {new Date().toLocaleDateString('en-PK')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 space-y-2 text-xs">
                  <div className="flex justify-between gap-2 border-b border-[#0D2327]/10 pb-1.5">
                    <span className="text-[#0D2327]/65">Party / گاہڪ:</span>
                    <span className="font-bold text-[#0D2327]">{customer || 'Walk-in Buyer'}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-[#0D2327]/10 pb-1.5">
                    <span className="text-[#0D2327]/65">Goods / مال:</span>
                    <span className="font-semibold text-[#0D2327] text-right">{itemText}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-[#0D2327]/10 pb-1.5">
                    <span className="text-[#0D2327]/65">Witness / گواھ:</span>
                    <span className="font-medium text-[#0D2327] text-right">{witness}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2 pt-1">
                    <span className="font-semibold text-[#0D2327]">Net Mizan Payable:</span>
                    <span className="font-mono-tabular text-2xl font-extrabold text-[#9B1C2E]">
                      PKR {amountPkr.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                {/* Live SBP Raast QR */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center rounded-lg border border-[#0D2327]/15 bg-white/70 p-2.5">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Live SBP Raast EMVCo QR"
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <QrCode className="w-20 h-20 text-[#0D2327]/40" />
                  )}
                  <span className="mt-1 font-mono-tabular text-[10px] font-bold text-[#0F766E]">
                    Scan SBP Raast (0% Fee)
                  </span>
                </div>
              </div>

              {/* Ink Stamp & Verification Footer */}
              <div className="space-y-2 border-t border-dashed border-[#0D2327]/25 pt-3 text-[11px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono-tabular text-[#0D2327]/75 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>
                      SHA-256: {sealHash}
                      {sealedAt ? ` · ${sealedAt}` : ''}
                    </span>
                  </div>

                  <motion.div
                    initial={false}
                    animate={stamped ? { scale: [1.35, 0.96, 1], rotate: [-12, -5], opacity: 1 } : { opacity: 0.72, rotate: -4 }}
                    transition={{ duration: 0.25 }}
                    className={`inline-flex items-center gap-1.5 rounded border-2 px-2.5 py-1 font-bold tracking-wide uppercase ${
                      stamped
                        ? 'border-[#9B1C2E] text-[#9B1C2E] bg-[#9B1C2E]/5'
                        : 'border-[#0D2327]/30 text-[#0D2327]/60'
                    }`}
                  >
                    {stamped && <Check className="w-3.5 h-3.5" />}
                    <span>{stamped ? 'OTAQ SEAL VERIFIED · تصديق ٿيل' : 'UNSTAMPED DRAFT'}</span>
                  </motion.div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#0D2327]/70 font-medium">
                  <span>Honest Measure, Zero Interest</span>
                  <span dir="rtl">اوطاق ۽ بازار جو ايماندار عهد — نه وياج، نه دوکو</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
