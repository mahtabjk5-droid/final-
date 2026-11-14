import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'bolmizan_production.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency (500+ simultaneous users without locking)
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    city TEXT DEFAULT 'Sakrand, Sindh',
    pin_salt TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    raast_iban TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ledger_blocks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    block_index INTEGER NOT NULL,
    party_name TEXT NOT NULL,
    party_phone TEXT DEFAULT '',
    entry_type TEXT NOT NULL,
    amount_pkr INTEGER NOT NULL,
    items_summary TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    prev_hash TEXT NOT NULL,
    block_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(tenant_id) REFERENCES tenants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON ledger_blocks(tenant_id, block_index DESC);
`);

export interface TenantProfile {
  id: string;
  phone: string;
  businessName: string;
  ownerName: string;
  city: string;
  raastIban: string;
  createdAt: string;
}

export interface TenantLedgerBlock {
  id: string;
  tenant_id: string;
  block_index: number;
  party_name: string;
  party_phone: string;
  entry_type: 'udhaar_given' | 'payment_received' | 'cash_sale';
  amount_pkr: number;
  items_summary: string;
  status: string;
  prev_hash: string;
  block_hash: string;
  created_at: string;
}

export function hashPin(pin: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(pin, salt, 100_000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPin(pin: string, salt: string, expectedHash: string): boolean {
  const derived = crypto.pbkdf2Sync(pin, salt, 100_000, 64, 'sha512');
  const expected = Buffer.from(expectedHash, 'hex');
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

export function normalizePkPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('923') && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

export const productionDb = {
  registerOrLoginShop(params: {
    phone: string;
    pin: string;
    businessName?: string;
    ownerName?: string;
    city?: string;
    raastIban?: string;
  }): { ok: true; tenant: TenantProfile; isNew: boolean } | { ok: false; error: string } {
    const cleanPhone = normalizePkPhone(params.phone);
    if (cleanPhone.length < 10) {
      return { ok: false, error: 'Enter a valid 11-digit mobile number (e.g. 03007860786).' };
    }
    if (!/^\d{4,6}$/.test(params.pin.trim())) {
      return { ok: false, error: 'PIN must be 4 to 6 numeric digits.' };
    }

    const existing = db.prepare('SELECT * FROM tenants WHERE phone = ?').get(cleanPhone) as
      | Record<string, string>
      | undefined;

    if (existing) {
      const ok = verifyPin(params.pin.trim(), existing.pin_salt, existing.pin_hash);
      if (!ok) {
        return { ok: false, error: 'Incorrect PIN for this mobile number.' };
      }
      return {
        ok: true,
        isNew: false,
        tenant: {
          id: existing.id,
          phone: existing.phone,
          businessName: existing.business_name,
          ownerName: existing.owner_name,
          city: existing.city,
          raastIban: existing.raast_iban,
          createdAt: existing.created_at,
        },
      };
    }

    const id = `tn_${crypto.randomBytes(6).toString('hex')}`;
    const { salt, hash } = hashPin(params.pin.trim());
    const now = new Date().toISOString();
    const businessName = params.businessName?.trim() || `Sakrand Shop ${cleanPhone.slice(-4)}`;
    const ownerName = params.ownerName?.trim() || 'Shop Owner';
    const city = params.city?.trim() || 'Sakrand, Sindh';
    const raastIban = params.raastIban?.trim() || cleanPhone;

    db.prepare(
      `INSERT INTO tenants (id, phone, business_name, owner_name, city, pin_salt, pin_hash, raast_iban, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, cleanPhone, businessName, ownerName, city, salt, hash, raastIban, now);

    return {
      ok: true,
      isNew: true,
      tenant: { id, phone: cleanPhone, businessName, ownerName, city, raastIban, createdAt: now },
    };
  },

  getTenantById(tenantId: string): TenantProfile | null {
    const row = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId) as
      | Record<string, string>
      | undefined;
    if (!row) return null;
    return {
      id: row.id,
      phone: row.phone,
      businessName: row.business_name,
      ownerName: row.owner_name,
      city: row.city,
      raastIban: row.raast_iban,
      createdAt: row.created_at,
    };
  },

  // Strictly isolated per-tenant query (Shop A can NEVER see Shop B's ledger)
  getTenantLedger(tenantId: string): TenantLedgerBlock[] {
    return db
      .prepare('SELECT * FROM ledger_blocks WHERE tenant_id = ? ORDER BY block_index DESC LIMIT 250')
      .all(tenantId) as unknown as TenantLedgerBlock[];
  },

  appendTenantBlock(params: {
    tenantId: string;
    partyName: string;
    partyPhone: string;
    entryType: 'udhaar_given' | 'payment_received' | 'cash_sale';
    amountPkr: number;
    itemsSummary: string;
  }): TenantLedgerBlock {
    const last = db
      .prepare('SELECT block_index, block_hash FROM ledger_blocks WHERE tenant_id = ? ORDER BY block_index DESC LIMIT 1')
      .get(params.tenantId) as { block_index: number; block_hash: string } | undefined;

    const blockIndex = last ? last.block_index + 1 : 0;
    const prevHash = last ? last.block_hash : '0'.repeat(64);
    const createdAt = new Date().toISOString();
    const id = `blk_${crypto.randomBytes(6).toString('hex')}`;
    const safeAmount = Math.max(1, Math.round(params.amountPkr));

    const blockHash = crypto
      .createHash('sha256')
      .update(`${params.tenantId}|${blockIndex}|${prevHash}|${params.partyName}|${safeAmount}|${createdAt}`)
      .digest('hex');

    db.prepare(
      `INSERT INTO ledger_blocks
       (id, tenant_id, block_index, party_name, party_phone, entry_type, amount_pkr, items_summary, status, prev_hash, block_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)`,
    ).run(
      id,
      params.tenantId,
      blockIndex,
      params.partyName.trim(),
      params.partyPhone.trim(),
      params.entryType,
      safeAmount,
      params.itemsSummary.trim(),
      prevHash,
      blockHash,
      createdAt,
    );

    return {
      id,
      tenant_id: params.tenantId,
      block_index: blockIndex,
      party_name: params.partyName.trim(),
      party_phone: params.partyPhone.trim(),
      entry_type: params.entryType,
      amount_pkr: safeAmount,
      items_summary: params.itemsSummary.trim(),
      status: 'open',
      prev_hash: prevHash,
      block_hash: blockHash,
      created_at: createdAt,
    };
  },

  verifyTenantChain(tenantId: string) {
    const rows = db
      .prepare('SELECT * FROM ledger_blocks WHERE tenant_id = ? ORDER BY block_index ASC')
      .all(tenantId) as unknown as TenantLedgerBlock[];

    let expectedPrev = '0'.repeat(64);
    for (const row of rows) {
      const recomputed = crypto
        .createHash('sha256')
        .update(`${row.tenant_id}|${row.block_index}|${expectedPrev}|${row.party_name}|${row.amount_pkr}|${row.created_at}`)
        .digest('hex');
      if (row.prev_hash !== expectedPrev || row.block_hash !== recomputed) {
        return { intact: false, totalBlocks: rows.length, brokenAt: row.block_index };
      }
      expectedPrev = row.block_hash;
    }
    return { intact: true, totalBlocks: rows.length, brokenAt: null };
  },
};
