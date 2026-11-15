import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Database,
  Lock,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Store,
} from 'lucide-react';
import QRCode from 'qrcode';
import { AjrakClothPattern, HalaKashiCornerOrnament } from './SovereignArt';

interface TenantProfile {
  id: string;
  phone: string;
  businessName: string;
  ownerName: string;
  city: string;
  raastIban: string;
}

interface TenantLedgerBlock {
  id: string;
  block_index: number;
  party_name: string;
  party_phone: string;
  entry_type: 'udhaar_given' | 'payment_received' | 'cash_sale';
  amount_pkr: number;
  items_summary: string;
  block_hash: string;
  created_at: string;
}

interface HealthConnectors {
  database: string;
  connectors: {
    geminiAi: boolean;
    whatsappCloudApi: boolean;
    jazzCashMerchant: boolean;
  };
  timestamp: string;
}

export const MultiTenantKhataDesk: React.FC = () => {
  const [phone, setPhone] = useState('03007860786');
  const [pin, setPin] = useState('7860');
  const [businessName, setBusinessName] = useState('Sakrand Sabzi & Mandi Store');
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [ledger, setLedger] = useState<TenantLedgerBlock[]>([]);
  const [chainIntact, setChainIntact] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [entryType, setEntryType] = useState<'udhaar_given' | 'payment_received' | 'cash_sale'>('udhaar_given');
  const [amountPkr, setAmountPkr] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [latestQrUrl, setLatestQrUrl] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthConnectors | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showGatewayPanel, setShowGatewayPanel] = useState(false);
  const [jcTxnRef, setJcTxnRef] = useState('T20261115001');
  const [jcAmount, setJcAmount] = useState('1450000');
  const [jcSecureHash, setJcSecureHash] = useState('SIMULATED_OR_MERCHANT_HMAC_SHA256');
  const [jcResult, setJcResult] = useState<{ ok: boolean; message: string } | null>(null);

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = (await res.json()) as HealthConnectors;
        setHealth(data);
      }
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  const handleShopLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/tenant/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, businessName }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setTenant(data.tenant);
      setLedger(data.ledger || []);
      setChainIntact(Boolean(data.chain?.intact ?? true));
    } finally {
      setBusy(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !partyName.trim() || !Number(amountPkr)) return;
    setBusy(true);
    setDeliveryStatus(null);
    setWaLink(null);
    try {
      const res = await fetch(`/api/tenant/${tenant.id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyName,
          partyPhone,
          entryType,
          amountPkr: Number(amountPkr),
          itemsSummary: itemsSummary || 'Mandi / Shop Goods',
          autoWhatsapp: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.block) {
        setLedger((prev) => [data.block, ...prev]);
        setChainIntact(Boolean(data.chain?.intact ?? true));
        if (data.raastQrPayload) {
          const qr = await QRCode.toDataURL(data.raastQrPayload, { width: 220, margin: 1 });
          setLatestQrUrl(qr);
        }
        if (data.whatsappDelivery) {
          if (data.whatsappDelivery.delivered) {
            setDeliveryStatus('WhatsApp Parchi sent automatically via Meta Cloud API!');
          } else if (data.whatsappDelivery.waLink) {
            setWaLink(data.whatsappDelivery.waLink);
            setDeliveryStatus('Offline/Fallback: WhatsApp Parchi link ready below.');
          }
        }
        setPartyName('');
        setPartyPhone('');
        setAmountPkr('');
        setItemsSummary('');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleTestJazzCash = async (e: React.FormEvent) => {
    e.preventDefault();
    setJcResult(null);
    try {
      const res = await fetch('/api/payments/jazzcash-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pp_TxnRefNo: jcTxnRef,
          pp_Amount: jcAmount,
          pp_ResponseCode: '000',
          pp_SecureHash: jcSecureHash,
        }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setJcResult({
          ok: true,
          message: `Verified authentic JazzCash HMAC-SHA256 callback for Txn ${data.txnRefNo}`,
        });
      } else {
        setJcResult({
          ok: false,
          message: data.error || 'Signature verification rejected (Fail-Closed).',
        });
      }
    } catch {
      setJcResult({ ok: false, message: 'Network error contacting /api/payments/jazzcash-webhook' });
    }
  };

  return (
    <section className="relative kashi-card rounded-xl overflow-hidden border border-[#14B8A6]/40 ajrak-moving-glass">
      <div className="ajrak-mosaic-band" />
      <AjrakClothPattern accentHex="#14B8A6" opacityClass="opacity-[0.075]" />
      <HalaKashiCornerOrnament className="absolute top-3 right-3 rotate-90 opacity-50" />
      <div className="relative z-10 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#5EEAD4]" />
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                ACID SQLite WAL · Strict Tenant Isolation · Real WhatsApp &amp; Raast QR
              </p>
              <h3 className="font-display text-xl font-bold text-[#F8F7F3]">
                Production Multi-Tenant Shopkeeper Khata Vault
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGatewayPanel((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-[#14B8A6]/35 text-xs font-semibold text-[#5EEAD4] hover:bg-[#14B8A6]/10 inline-flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{showGatewayPanel ? 'Hide Gateway Readiness' : 'Gateways & JazzCash HMAC'}</span>
            </button>

            {tenant && (
              <button
                type="button"
                onClick={() => {
                  setTenant(null);
                  setLedger([]);
                  setLatestQrUrl(null);
                  setWaLink(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#F59E0B]/35 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10"
              >
                Switch Shop ({tenant.phone})
              </button>
            )}
          </div>
        </div>

        {/* Connector Readiness & JazzCash HMAC-SHA256 Verifier */}
        {showGatewayPanel && (
          <div className="rounded-xl border border-[#14B8A6]/30 bg-[#04141A] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#FDE68A]">
                  Live Connector Readiness &amp; Payment Integrity
                </div>
                <div className="text-[11px] font-mono-tabular text-[#F8F7F3]/70">
                  {health ? health.database : 'Checking /api/health...'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void loadHealth()}
                disabled={healthLoading}
                className="inline-flex items-center gap-1 rounded border border-[#14B8A6]/30 px-2.5 py-1 text-[11px] font-semibold text-[#5EEAD4]"
              >
                <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
                <span>Probe /api/health</span>
              </button>
            </div>

            {health && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-lg border border-[#F59E0B]/15 ajrak-well px-3 py-2 flex items-center justify-between">
                  <span className="text-[#F8F7F3]/80">Gemini 2.5 AI</span>
                  <span className={`font-mono-tabular font-semibold ${health.connectors.geminiAi ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {health.connectors.geminiAi ? 'Live Key' : 'Offline Regex Mode'}
                  </span>
                </div>
                <div className="rounded-lg border border-[#F59E0B]/15 ajrak-well px-3 py-2 flex items-center justify-between">
                  <span className="text-[#F8F7F3]/80">WhatsApp Cloud API</span>
                  <span className={`font-mono-tabular font-semibold ${health.connectors.whatsappCloudApi ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {health.connectors.whatsappCloudApi ? 'Meta v21 Ready' : 'wa.me Fallback Ready'}
                  </span>
                </div>
                <div className="rounded-lg border border-[#F59E0B]/15 ajrak-well px-3 py-2 flex items-center justify-between">
                  <span className="text-[#F8F7F3]/80">JazzCash Merchant HMAC</span>
                  <span className={`font-mono-tabular font-semibold ${health.connectors.jazzCashMerchant ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {health.connectors.jazzCashMerchant ? 'Salt Configured' : 'Fail-Closed Guard'}
                  </span>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => void handleTestJazzCash(e)}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-[#14B8A6]/20"
            >
              <input
                type="text"
                value={jcTxnRef}
                onChange={(e) => setJcTxnRef(e.target.value)}
                placeholder="pp_TxnRefNo"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-xs text-white"
              />
              <input
                type="text"
                value={jcAmount}
                onChange={(e) => setJcAmount(e.target.value)}
                placeholder="pp_Amount (paisa)"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-xs text-white"
              />
              <input
                type="text"
                value={jcSecureHash}
                onChange={(e) => setJcSecureHash(e.target.value)}
                placeholder="pp_SecureHash"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-xs text-white"
              />
              <button
                type="submit"
                className="kashi-btn rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-bold text-white"
              >
                Verify JazzCash Webhook
              </button>
            </form>

            {jcResult && (
              <div
                className={`rounded-lg border px-3 py-2 text-xs flex items-center gap-2 ${
                  jcResult.ok
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/40 text-amber-200'
                }`}
              >
                {jcResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-300" />
                )}
                <span>{jcResult.message}</span>
              </div>
            )}
          </div>
        )}

        {!tenant ? (
          <form onSubmit={(e) => void handleShopLogin(e)} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Shop Mobile (0300...)"
              className="rounded-lg border border-[#F59E0B]/30 ajrak-well px-3.5 py-2.5 font-mono-tabular text-xs text-[#F8F7F3]"
            />
            <input
              type="password"
              inputMode="numeric"
              required
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Private 4-6 Digit PIN"
              className="rounded-lg border border-[#F59E0B]/30 ajrak-well px-3.5 py-2.5 font-mono-tabular text-xs text-[#F8F7F3]"
            />
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Shop Name (for new account)"
              className="rounded-lg border border-[#F59E0B]/30 ajrak-well px-3.5 py-2.5 text-xs text-[#F8F7F3]"
            />
            <button
              type="submit"
              disabled={busy}
              className="kashi-btn inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-xs font-bold text-white"
            >
              <Store className="w-4 h-4" />
              <span>{busy ? 'Opening Vault...' : 'Open My Isolated Khata'}</span>
            </button>
            {authError && (
              <p className="sm:col-span-4 text-xs font-semibold text-rose-400">{authError}</p>
            )}
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#14B8A6]/30 bg-[#04141A] px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#5EEAD4]" />
                <span className="font-bold text-white">{tenant.businessName}</span>
                <span className="text-[#F8F7F3]/60">({tenant.phone})</span>
              </div>
              <span className="inline-flex items-center gap-1 font-mono-tabular text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                {chainIntact ? 'SQLite SHA-256 Chain Verified' : 'Chain Alert'}
              </span>
            </div>

            <form onSubmit={(e) => void handleAddBlock(e)} className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
              <input
                type="text"
                required
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Customer Name"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-[#F8F7F3]"
              />
              <input
                type="tel"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
                placeholder="Customer WhatsApp (03...)"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-xs text-[#F8F7F3]"
              />
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as typeof entryType)}
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-[#F8F7F3]"
              >
                <option value="udhaar_given">Udhaar Diya (Receivable)</option>
                <option value="payment_received">Wasooli (Received)</option>
                <option value="cash_sale">Naqad Sale (Cash)</option>
              </select>
              <input
                type="number"
                required
                min={1}
                value={amountPkr}
                onChange={(e) => setAmountPkr(e.target.value)}
                placeholder="Amount PKR"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 font-mono-tabular text-xs text-[#F8F7F3]"
              />
              <input
                type="text"
                value={itemsSummary}
                onChange={(e) => setItemsSummary(e.target.value)}
                placeholder="Goods (e.g. 2 Mann Rice)"
                className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-3 py-2 text-xs text-[#F8F7F3]"
              />
              <button
                type="submit"
                disabled={busy}
                className="kashi-btn inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#F59E0B] px-3 py-2 text-xs font-bold text-[#05131B]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Seal &amp; Send</span>
              </button>
            </form>

            {deliveryStatus && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#14B8A6]/30 bg-[#04141A] px-3.5 py-2 text-xs text-[#5EEAD4]">
                <span>{deliveryStatus}</span>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-white font-semibold"
                  >
                    <MessageCircle className="w-3 h-3" /> Open WhatsApp
                  </a>
                )}
              </div>
            )}

            {latestQrUrl && (
              <div className="flex items-center gap-4 rounded-xl border border-[#F59E0B]/30 bg-[#04141A] p-4">
                <img src={latestQrUrl} alt="SBP Raast QR" className="w-28 h-28 rounded bg-white p-1" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-[#FDE68A] inline-flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>Live SBP Raast EMVCo CRC-16 Payment QR Ready</span>
                  </p>
                  <p className="text-[#F8F7F3]/75">
                    Customer can scan via Easypaisa, JazzCash, Meezan, HBL, or any Raast bank app (0% Fee).
                  </p>
                </div>
              </div>
            )}

            {/* Real-Time Shopkeeper Clarity Balance Strip */}
            {ledger.length > 0 && (() => {
              const totalReceivable = ledger
                .filter((b) => b.entry_type === 'udhaar_given')
                .reduce((sum, b) => sum + b.amount_pkr, 0);
              const totalCollected = ledger
                .filter((b) => b.entry_type !== 'udhaar_given')
                .reduce((sum, b) => sum + b.amount_pkr, 0);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-rose-500/25 bg-[#04141A] p-3">
                    <div className="text-[#F8F7F3]/65">Udhaar Receivable (To Collect)</div>
                    <div className="font-mono-tabular text-base font-bold text-rose-300 mt-0.5">
                      PKR {totalReceivable.toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-500/25 bg-[#04141A] p-3">
                    <div className="text-[#F8F7F3]/65">Wasooli &amp; Naqad Inflow</div>
                    <div className="font-mono-tabular text-base font-bold text-emerald-300 mt-0.5">
                      PKR {totalCollected.toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#F59E0B]/25 bg-[#04141A] p-3">
                    <div className="text-[#F8F7F3]/65">Verified Khata Blocks</div>
                    <div className="font-mono-tabular text-base font-bold text-[#FDE68A] mt-0.5">
                      {ledger.length} Blocks · 0% Riba
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              {ledger.length === 0 ? (
                <p className="text-xs text-[#F8F7F3]/60">
                  Your private SQLite khata is clean. Add your first customer entry above.
                </p>
              ) : (
                ledger.slice(0, 10).map((b) => {
                  const cleanDigits = (b.party_phone || '').replace(/\D/g, '');
                  const intl = cleanDigits.startsWith('0') ? `92${cleanDigits.slice(1)}` : cleanDigits;
                  const salamHref = intl
                    ? `https://wa.me/${intl}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum ${b.party_name} sahab, respectful reminder from ${tenant.businessName} regarding Parchi #${b.block_index} (${b.items_summary}) — PKR ${b.amount_pkr.toLocaleString('en-US')} (0% Riba). JazakAllah Khair.`,
                      )}`
                    : null;
                  return (
                    <div
                      key={b.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F59E0B]/20 bg-[#04141A] px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular text-[#5EEAD4]">#{b.block_index}</span>
                        <span className="font-bold text-white">{b.party_name}</span>
                        <span className="text-[#F8F7F3]/60">· {b.items_summary}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono-tabular">
                        <span
                          className={`font-bold ${
                            b.entry_type === 'udhaar_given' ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {b.entry_type === 'udhaar_given' ? '-' : '+'}PKR{' '}
                          {b.amount_pkr.toLocaleString('en-US')}
                        </span>
                        {b.entry_type === 'udhaar_given' && salamHref && (
                          <a
                            href={salamHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-[11px] font-semibold text-[#5EEAD4] hover:underline"
                          >
                            Polite Salam Reminder
                          </a>
                        )}
                        <span className="text-[#F8F7F3]/45">sha256:{b.block_hash.slice(0, 10)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};