import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  isWaveConfigured, createWaveCheckoutSession, verifyWaveSignature,
} from "../services/wave.js";
import {
  isPaydunyaConfigured, createPaydunyaInvoice, verifyPaydunyaHash,
} from "../services/paydunya.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function markInvoicePaid(invoiceId, method) {
  const idx = db.data.invoices.findIndex((i) => i.id === invoiceId);
  if (idx === -1) return null;
  db.data.invoices[idx].status = "payée";
  db.data.invoices[idx].paymentMethod = method;
  db.data.invoices[idx].paidAt = new Date().toISOString();
  return db.data.invoices[idx];
}

/* ---------- config public (aux utilisateurs connectés) ---------- */

router.get("/config", requireAuth, (req, res) => {
  res.json({
    wave: { configured: isWaveConfigured() },
    orangeMoney: { configured: isPaydunyaConfigured() },
  });
});

/* ---------- Wave ---------- */

router.post("/wave/checkout", requireAuth, async (req, res) => {
  const { invoiceId } = req.body || {};
  await db.read();
  const invoice = db.data.invoices.find((i) => i.id === invoiceId && i.ownerId === req.user.id);
  if (!invoice) return res.status(404).json({ error: "Facture introuvable." });
  if (invoice.status === "payée") return res.status(400).json({ error: "Cette facture est déjà payée." });

  try {
    const session = await createWaveCheckoutSession({
      amount: invoice.total,
      clientReference: invoice.id,
      successUrl: `${FRONTEND_URL}/factures?paiement=succes&facture=${invoice.id}`,
      errorUrl: `${FRONTEND_URL}/factures?paiement=echec&facture=${invoice.id}`,
    });

    const payment = {
      id: randomUUID(),
      ownerId: req.user.id,
      invoiceId: invoice.id,
      provider: "wave",
      providerSessionId: session.id,
      amount: invoice.total,
      status: "en_attente",
      demo: session.demo,
      createdAt: new Date().toISOString(),
    };
    db.data.payments.push(payment);
    await db.write();

    res.status(201).json({ paymentId: payment.id, url: session.wave_launch_url, demo: session.demo });
  } catch (err) {
    res.status(502).json({ error: err.message || "Erreur Wave." });
  }
});

// Webhook Wave — doit être monté avec express.json({verify}) pour capturer req.rawBody (voir server.js)
router.post("/wave/webhook", async (req, res) => {
  const signatureHeader = req.headers["wave-signature"];
  const secret = process.env.WAVE_WEBHOOK_SECRET;

  if (secret) {
    const valid = verifyWaveSignature({ rawBody: req.rawBody, signatureHeader, secret });
    if (!valid) return res.status(401).json({ error: "Signature invalide." });
  }

  const event = req.body;
  if (event?.type === "checkout.session.completed") {
    await db.read();
    const sessionId = event.data?.id;
    const payment = db.data.payments.find((p) => p.provider === "wave" && p.providerSessionId === sessionId);
    if (payment && payment.status !== "confirmé") {
      payment.status = "confirmé";
      markInvoicePaid(payment.invoiceId, "wave");
      await db.write();
    }
  }
  res.json({ received: true });
});

/* ---------- Orange Money (via PayDunya) ---------- */

router.post("/orange/checkout", requireAuth, async (req, res) => {
  const { invoiceId } = req.body || {};
  await db.read();
  const invoice = db.data.invoices.find((i) => i.id === invoiceId && i.ownerId === req.user.id);
  if (!invoice) return res.status(404).json({ error: "Facture introuvable." });
  if (invoice.status === "payée") return res.status(400).json({ error: "Cette facture est déjà payée." });

  const owner = db.data.users.find((u) => u.id === req.user.id);

  try {
    const invoiceSession = await createPaydunyaInvoice({
      amount: invoice.total,
      description: `Facture ${invoice.number}`,
      clientReference: invoice.id,
      businessName: owner?.businessName,
      returnUrl: `${FRONTEND_URL}/factures?paiement=succes&facture=${invoice.id}`,
      cancelUrl: `${FRONTEND_URL}/factures?paiement=echec&facture=${invoice.id}`,
      callbackUrl: `${process.env.BACKEND_URL || ""}/api/payments/orange/webhook`,
    });

    const payment = {
      id: randomUUID(),
      ownerId: req.user.id,
      invoiceId: invoice.id,
      provider: "orange_money",
      providerSessionId: invoiceSession.token,
      amount: invoice.total,
      status: "en_attente",
      demo: invoiceSession.demo,
      createdAt: new Date().toISOString(),
    };
    db.data.payments.push(payment);
    await db.write();

    res.status(201).json({ paymentId: payment.id, url: invoiceSession.url, demo: invoiceSession.demo });
  } catch (err) {
    res.status(502).json({ error: err.message || "Erreur Orange Money / PayDunya." });
  }
});

// IPN PayDunya — champs transmis en JSON ou x-www-form-urlencoded selon config du compte.
router.post("/orange/webhook", async (req, res) => {
  const body = req.body || {};
  const data = body.data || body;
  const hash = data.hash || body.hash;

  if (isPaydunyaConfigured() && !verifyPaydunyaHash(hash)) {
    return res.status(401).json({ error: "Notification non vérifiée." });
  }

  const status = data.status || data.response_text;
  const token = data.invoice?.token || data.token || body.token;
  const clientReference = data.custom_data?.client_reference;

  if (status === "completed" || status === "success") {
    await db.read();
    const payment = db.data.payments.find(
      (p) => p.provider === "orange_money" && (p.providerSessionId === token || p.invoiceId === clientReference)
    );
    if (payment && payment.status !== "confirmé") {
      payment.status = "confirmé";
      markInvoicePaid(payment.invoiceId, "orange_money");
      await db.write();
    }
  }
  res.json({ received: true });
});

/* ---------- Simulation (mode démonstration uniquement) ---------- */

router.post("/simulate/:paymentId", requireAuth, async (req, res) => {
  await db.read();
  const payment = db.data.payments.find((p) => p.id === req.params.paymentId && p.ownerId === req.user.id);
  if (!payment) return res.status(404).json({ error: "Paiement introuvable." });
  if (!payment.demo) {
    return res.status(400).json({ error: "La simulation n'est disponible qu'en mode démonstration (sans clé API réelle configurée)." });
  }
  if (payment.status === "confirmé") {
    return res.json({ status: "confirmé" });
  }

  payment.status = "confirmé";
  const method = payment.provider === "wave" ? "wave" : "orange_money";
  markInvoicePaid(payment.invoiceId, method);
  await db.write();

  res.json({ status: "confirmé" });
});

export default router;
