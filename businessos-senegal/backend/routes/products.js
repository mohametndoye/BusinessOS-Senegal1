import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/products
router.get("/", async (req, res) => {
  await db.read();
  const items = db.data.products.filter((p) => p.ownerId === req.user.id);
  res.json(items);
});

// POST /api/products
router.post("/", async (req, res) => {
  const { name, category, price, cost, stock, threshold } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Le nom du produit est requis." });
  }

  await db.read();
  const product = {
    id: randomUUID(),
    ownerId: req.user.id,
    name: name.trim(),
    category: category || "",
    price: Number(price) || 0,
    cost: Number(cost) || 0,
    stock: Number(stock) || 0,
    threshold: Number(threshold) || 0,
    createdAt: new Date().toISOString(),
  };
  db.data.products.push(product);
  await db.write();
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  await db.read();
  const idx = db.data.products.findIndex((p) => p.id === req.params.id && p.ownerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Produit introuvable." });

  const { name, category, price, cost, stock, threshold } = req.body || {};
  const current = db.data.products[idx];
  db.data.products[idx] = {
    ...current,
    name: name ?? current.name,
    category: category ?? current.category,
    price: price !== undefined ? Number(price) : current.price,
    cost: cost !== undefined ? Number(cost) : current.cost,
    stock: stock !== undefined ? Number(stock) : current.stock,
    threshold: threshold !== undefined ? Number(threshold) : current.threshold,
  };
  await db.write();
  res.json(db.data.products[idx]);
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  await db.read();
  const before = db.data.products.length;
  db.data.products = db.data.products.filter((p) => !(p.id === req.params.id && p.ownerId === req.user.id));
  if (db.data.products.length === before) {
    return res.status(404).json({ error: "Produit introuvable." });
  }
  await db.write();
  res.status(204).end();
});

export default router;
