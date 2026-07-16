import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  await db.read();
  const invoices = db.data.invoices
    .filter((i) => i.ownerId === req.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(invoices);
});

router.get("/:id", async (req, res) => {
  await db.read();
  const invoice = db.data.invoices.find((i) => i.id === req.params.id && i.ownerId === req.user.id);
  if (!invoice) return res.status(404).json({ error: "Facture introuvable." });
  const sale = db.data.sales.find((s) => s.id === invoice.saleId);
  res.json({ ...invoice, sale });
});

// PATCH /api/invoices/:id  body: { status: "payée" | "impayée" }
router.patch("/:id", async (req, res) => {
  const { status } = req.body || {};
  if (!["payée", "impayée"].includes(status)) {
    return res.status(400).json({ error: "Statut invalide." });
  }

  await db.read();
  const idx = db.data.invoices.findIndex((i) => i.id === req.params.id && i.ownerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Facture introuvable." });

  db.data.invoices[idx].status = status;
  await db.write();
  res.json(db.data.invoices[idx]);
});

export default router;
