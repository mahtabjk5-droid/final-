import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Lock,
  MessageCircle,
  Plus,
  QrCode,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { renderQrDataUrl } from '../utils/ttsAndOffline';
import { ChromaticKashiRule } from './SovereignArt';

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

export const MultiTenantKhataDesk: React.FC = () => {
  const [phone, setPhone] = useState('03007860786');
  const [pin, setPin] = useState('7860');
  const [businessName, setBusinessName] = useState('Sakrand Sabzi & Mandi Store');
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [ledger, setLedger] = useState<TenantLedgerBlock[]>([]);
  const [chainIntact, setChainIntact] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // New isolated ledger entry state
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [entryType, setEntryType] = useState<'udhaar_given' | 'payment_received' | 'cash_sale'>('udhaar_given');
  const [amountPkr, setAmountPkr] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [autoWhatsapp, setAutoWhatsapp] = useState(true);
  const [latestQrUrl, setLatestQrUrl] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);

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
          autoWhatsapp,
        }),
      });
      const data = await res.json();
      if (res.ok && data.block) {
        setLedger((prev) => [data.block, ...prev]);
        setChainIntact(Boolean(data.chain?.intact ?? true));
        if (data.raastQrPayload) {
          const qr = await renderQrDataUrl(data.raastQrPayload);
          setLatestQrUrl(qr);
        }
        if (data.whatsappDelivery) {
          if (data.whatsappDelivery.delivered) {
            setDeliveryStatus('WhatsApp Parchi sent automatically via Meta Cloud API!');
          } else if (data.whatsappDelivery.waLink) {
            setDeliveryStatus('Offline/Fallback: WhatsApp Parchi link ready below.');
            window.open(data.whatsappDelivery.waLink, '_blank', 'noopener,noreferrer');
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

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#14B8A6]/40 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#5EEAD4]" />
            <div>
              <p className="text-xs font-medium text-[#5EEAD4]">
                ACID SQLite WAL • Strict Tenant Isolation • Real WhatsApp &amp; Raast QR
              </p>
              <h3 className="font-display text-xl font-bold text-[#F8F7F3]">
                Production Multi-Tenant Shopkeeper Khata Vault
              </h3>
            </div>
          </div>
          {tenant && (
            <button
              type="button"
              onClick={() => {
                setTenant(null);
                setLedger([]);
                setLatestQrUrl(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#F59E0B]/35 text-xs font-semibold text-[#FDE68A] hover:bg-[#F59E0B]/10"
            >
              Switch Shop ({tenant.phone})
            </button>
          )}
        </div>

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

Seal & Send

{deliveryStatus && {deliveryStatus}}
{latestQrUrl && (





Live SBP Raast EMVCo CRC-16 Payment QR Ready


Customer can scan via Easypaisa, JazzCash, Meezan, HBL, or any Raast bank app (0% Fee).



)}
{ledger.length === 0 ? (

Your private SQLite khata is clean. Add your first customer entry above.

) : (
ledger.slice(0, 10).map((b) => (



#{b.block_index}
{b.party_name}
• {b.items_summary}


<span
className={font-bold ${ b.entry_type === 'udhaar_given' ? 'text-rose-400' : 'text-emerald-400' }}
>
{b.entry_type === 'udhaar_given' ? '-' : '+'}PKR {b.amount_pkr.toLocaleString('en-US')}

sha256:{b.block_hash.slice(0, 10)}


))
)}


)}

);
};