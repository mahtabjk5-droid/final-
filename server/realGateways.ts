import crypto from 'node:crypto';

// 1. REAL META WHATSAPP BUSINESS CLOUD API (Automatic Server-to-Phone Dispatch)
export async function sendRealWhatsappMessage(params: {
  recipientPhone: string;
  messageText: string;
}): Promise<{
  delivered: boolean;
  provider: 'meta_cloud_api' | 'fallback_link';
  messageId?: string;
  waLink?: string;
}> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const cleanDigits = params.recipientPhone.replace(/[^\d]/g, '');
  const intlPhone = cleanDigits.startsWith('03') ? `92${cleanDigits.slice(1)}` : cleanDigits;

  if (token && phoneNumberId) {
    try {
      const res = await fetch(`https://facebook.com{phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: intlPhone,
          type: 'text',
          text: { body: params.messageText },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { messages?: Array<{ id: string }> };
        return {
          delivered: true,
          provider: 'meta_cloud_api',
          messageId: data.messages?.[0]?.id,
        };
      }
    } catch {
      // Fall back to wa.me deep link if Graph API is unreachable
    }
  }

  return {
    delivered: false,
    provider: 'fallback_link',
    waLink: `https://wa.me{intlPhone}?text=${encodeURIComponent(params.messageText)}`,
  };
}

// 2. REAL JAZZCASH MERCHANT RETURN HMAC-SHA256 SIGNATURE VERIFIER
export function verifyJazzCashReturnHash(fields: Record<string, string>): boolean {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
  if (!integritySalt || !fields.pp_SecureHash) return false;

  const sortedKeys = Object.keys(fields)
    .filter((k) => k.startsWith('pp_') && k !== 'pp_SecureHash' && fields[k] !== '')
    .sort();

  const rawString = `${integritySalt}&${sortedKeys.map((k) => fields[k]).join('&')}`;
  const computed = crypto
    .createHmac('sha256', integritySalt)
    .update(rawString, 'utf8')
    .digest('hex')
    .toUpperCase();

  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(fields.pp_SecureHash.toUpperCase(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// 3. REAL SBP RAAST EMVCo CRC-16 DYNAMIC QR GENERATOR (Zero-Custody Direct P2P)
function emvTag(id: string, value: string): string {
  const len = String(Buffer.byteLength(value, 'utf8')).padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  const bytes = Buffer.from(input, 'utf8');
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildRealSbpRaastQr(params: {
  merchantName: string;
  city: string;
  raastIdOrIban: string;
  amountPkr: number;
  reference: string;
}): string {
  const merchantAccountInfo =
    emvTag('00', 'pk.gov.sbp.raast') + emvTag('01', params.raastIdOrIban.slice(0, 34));
  const additionalData = emvTag('01', params.reference.slice(0, 25));

  const bodyWithoutCrc =
    emvTag('00', '01') +
    emvTag('01', '12') +
    emvTag('26', merchantAccountInfo) +
    emvTag('52', '5411') +
    emvTag('53', '586') +
    emvTag('54', Math.max(1, Math.round(params.amountPkr)).toFixed(0)) +
    emvTag('58', 'PK') +
    emvTag('59', params.merchantName.slice(0, 25)) +
    emvTag('60', params.city.slice(0, 15)) +
    emvTag('62', additionalData) +
    '6304';

  const crc = crc16CcittFalse(bodyWithoutCrc);
  return `${bodyWithoutCrc}${crc}`;
}
