import 'dotenv/config';
import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { productionDb } from './server/realDatabase.ts';
import {
  buildRealSbpRaastQr,
  sendRealWhatsappMessage,
  verifyJazzCashReturnHash,
} from './server/realGateways.ts';
import { verifyIntentCognitiveFirewall } from './server/sovereignEngine.ts';
import { askMizanAdvisor, extractMultilingualVoiceOrText } from './server/voiceAndAi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startProductionServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(express.json({ limit: '8mb' }));

  const apiLimiter = rateLimit({
    windowMs: 60_000,
    max: 240,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a minute.' },
  });
  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many PIN attempts. Wait 60 seconds.' },
  });
  app.use('/api', apiLimiter);

  // 1. Health & Connector Readiness Check
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'BolMizan Production Khata & Anti-Scam OS',
      database: 'SQLite WAL Multi-Tenant Active',
      connectors: {
        geminiAi: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
        whatsappCloudApi: Boolean(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
        jazzCashMerchant: Boolean(process.env.JAZZCASH_INTEGRITY_SALT),
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Multi-Tenant Shopkeeper Login / Registration (Strict Tenant Isolation)
  app.post('/api/tenant/auth', authLimiter, (req, res) => {
    const { phone, pin, businessName, ownerName, city, raastIban } = req.body ?? {};
    if (typeof phone !== 'string' || typeof pin !== 'string') {
      res.status(400).json({ error: 'Mobile number and 4-6 digit PIN are required.' });
      return;
    }
    const result = productionDb.registerOrLoginShop({
      phone,
      pin,
      businessName,
      ownerName,
      city,
      raastIban,
    });
    if (!result.ok) {
      res.status(401).json({ error: result.error });
      return;
    }
    const ledger = productionDb.getTenantLedger(result.tenant.id);
    const chain = productionDb.verifyTenantChain(result.tenant.id);
    res.json({ ok: true, isNew: result.isNew, tenant: result.tenant, ledger, chain });
  });

  // 3. Get Isolated Shopkeeper Ledger
  app.get('/api/tenant/:tenantId/ledger', (req, res) => {
    const tenant = productionDb.getTenantById(req.params.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Shopkeeper account not found.' });
      return;
    }
    const ledger = productionDb.getTenantLedger(tenant.id);
    const chain = productionDb.verifyTenantChain(tenant.id);
    res.json({ tenant, ledger, chain });
  });

  // 4. Append Zero-Riba Entry + Generate SBP Raast EMVCo QR + Auto-Send WhatsApp Parchi
  app.post('/api/tenant/:tenantId/ledger', async (req, res) => {
    const tenant = productionDb.getTenantById(req.params.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Shopkeeper account not found.' });
      return;
    }
    const { partyName, partyPhone, entryType, amountPkr, itemsSummary, autoWhatsapp } = req.body ?? {};
    if (!partyName || !Number(amountPkr) || Number(amountPkr) <= 0) {
      res.status(400).json({ error: 'Customer name and positive PKR amount are required.' });
      return;
    }

    const block = productionDb.appendTenantBlock({
      tenantId: tenant.id,
      partyName: String(partyName),
      partyPhone: String(partyPhone || ''),
      entryType:
        entryType === 'payment_received' || entryType === 'cash_sale' ? entryType : 'udhaar_given',
      amountPkr: Number(amountPkr),
      itemsSummary: String(itemsSummary || 'Mandi / Shop Trade Goods'),
    });

    const raastQrPayload = buildRealSbpRaastQr({
      merchantName: tenant.businessName,
      city: tenant.city,
      raastIdOrIban: tenant.raastIban || process.env.DEFAULT_RAAST_IBAN || tenant.phone,
      amountPkr: block.amount_pkr,
      reference: `BLK-${block.block_index}`,
    });

    let whatsappDelivery = null;
    if (autoWhatsapp && block.party_phone) {
      const label =
        block.entry_type === 'payment_received'
          ? 'Wasooli (Payment Received)'
          : block.entry_type === 'cash_sale'
            ? 'Naqad Sale'
            : 'Udhaar (Credit)';
      const receiptText = `${tenant.businessName} (${tenant.city})\nParchi #${block.block_index}: ${label}\nCustomer: ${block.party_name}\nAmount: PKR ${block.amount_pkr.toLocaleString('en-US')} (0% Riba)\nGoods: ${block.items_summary}\nSHA-256: ${block.block_hash.slice(0, 16)}`;
      whatsappDelivery = await sendRealWhatsappMessage({
        recipientPhone: block.party_phone,
        messageText: receiptText,
      });
    }

    res.status(201).json({
      block,
      raastQrPayload,
      whatsappDelivery,
      chain: productionDb.verifyTenantChain(tenant.id),
    });
  });

  // 5. Real JazzCash Merchant Return Webhook Verifier
  app.post('/api/payments/jazzcash-webhook', (req, res) => {
    const valid = verifyJazzCashReturnHash(req.body ?? {});
    if (!valid) {
      res.status(401).json({ error: 'Invalid JazzCash HMAC-SHA256 pp_SecureHash signature.' });
      return;
    }
    res.json({ verified: true, txnRefNo: req.body.pp_TxnRefNo });
  });

  // 6. Anti-Scam Cognitive Firewall (Blocks Fake 8171 / Bank / OTP Calls & SMS)
  app.post('/api/scam-shield/scan', (req, res) => {
    const transcript = String(req.body?.transcript || '').trim();
    if (!transcript) {
      res.status(400).json({ error: 'Paste SMS or call transcript to scan.' });
      return;
    }
    const result = verifyIntentCognitiveFirewall({
      transcript,
      keystrokeIntervalsMs: Array.isArray(req.body?.keystrokeIntervalsMs)
        ? req.body.keystrokeIntervalsMs
        : [],
      actionContext: 'shopkeeper_scam_shield',
    });
    res.json(result);
  });

  // 7. Gemini 2.5 Flash Voice-to-Hisab & Mizan Shariah Advisor
  app.post('/api/ai/extract-voice', async (req, res) => {
    const { text, audioBase64, mimeType } = req.body ?? {};
    if (!text && !audioBase64) {
      res.status(400).json({ error: 'Provide voice audio or text note.' });
      return;
    }
    const result = await extractMultilingualVoiceOrText({ text, audioBase64, mimeType });
    res.json(result);
  });

  app.post('/api/ai/mizan-advisor', async (req, res) => {
    const question = String(req.body?.question || '').trim();
    if (!question) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }
    const result = await askMizanAdvisor({
      question,
      language: String(req.body?.language || 'Urdu'),
    });
    res.json(result);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  const server = http.createServer(app);
  server.listen(port, '0.0.0.0', () => {
    console.log(`BolMizan Production Khata OS listening on http://0.0.0:${port}`);
  });
}

startProductionServer().catch((err) => {
  console.error('Failed to start BolMizan Production server:', err);
  process.exit(1);
});
