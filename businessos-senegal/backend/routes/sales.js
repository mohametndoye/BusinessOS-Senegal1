import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  await db.read();
  const sales = db.data.sales
    .filter((s) => s.ownerId === req.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sales);
});

// POST /api/sales
// body: { clientId?: string, items: [{ productId, qty }], paidNow: boolean }
router.post("/", async (req, res) => {
  const { clientId, items, paidNow } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Ajoutez au moins un article à la vente." });
  }

  await db.read();

  const ownerProducts = db.data.products.filter((p) => p.ownerId === req.user.id);
  const resolvedItems = [];

  for (const raw of items) {
    const product = ownerProducts.find((p) => p.id === raw.productId);
    const qty = Number(raw.qty) || 0;
    if (!product) {
      return res.status(400).json({ error: "Produit introuvable dans le catalogue." });
    }
    if (qty <= 0) {
      return res.status(400).json({ error: `Quantité invalide pour "${product.name}".` });
    }
    if (product.stock < qty) {
      return res.status(409).json({ error: `Stock insuffisant pour "${product.name}" (disponible : ${product.stock}).` });
    }
    resolvedItems.push({ productId: product.id, name: product.name, qty, price: product.price });
  }

  if (clientId) {
    const client = db.data.clients.find((c) => c.id === clientId && c.ownerId === req.user.id);
    if (!client) return res.status(400).json({ error: "Client introuvable." });
  }

  // déduction du stock
  for (const item of resolvedItems) {
    const idx = db.data.products.findIndex((p) => p.id === item.productId);
    db.data.products[idx].stock -= item.qty;
  }

  const total = resolvedItems.reduce((a, it) => a + it.qty * it.price, 0);
  const saleId = randomUUID();

  const sale = {
    id: saleId,
    ownerId: req.user.id,
    clientId: clientId || null,
    items: resolvedItems,
    total,
    date: new Date().toISOString(),
  };
  db.data.sales.push(sale);

  const invoiceCount = db.data.invoices.filter((i) => i.ownerId === req.user.id).length;
  const invoice = {
    id: randomUUID(),
    ownerId: req.user.id,
    saleId,
    number: "FAC-" + String(invoiceCount + 1).padStart(4, "0"),
    clientId: clientId || null,
    total,
    status: paidNow ? "payée" : "impayée",
    date: new Date().toISOString(),
  };
  db.data.invoices.push(invoice);

  await db.write();
  res.status(201).json({ sale, invoice });
});

export default router;
