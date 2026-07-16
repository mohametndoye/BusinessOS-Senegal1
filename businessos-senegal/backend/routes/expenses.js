import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  await db.read();
  const expenses = db.data.expenses
    .filter((e) => e.ownerId === req.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(expenses);
});

router.post("/", async (req, res) => {
  const { label, amount, category } = req.body || {};
  if (!label || !label.trim() || !Number(amount)) {
    return res.status(400).json({ error: "Libellé et montant valides requis." });
  }

  await db.read();
  const expense = {
    id: randomUUID(),
    ownerId: req.user.id,
    label: label.trim(),
    amount: Number(amount),
    category: category || "Général",
    date: new Date().toISOString(),
  };
  db.data.expenses.push(expense);
  await db.write();
  res.status(201).json(expense);
});

router.delete("/:id", async (req, res) => {
  await db.read();
  const before = db.data.expenses.length;
  db.data.expenses = db.data.expenses.filter((e) => !(e.id === req.params.id && e.ownerId === req.user.id));
  if (db.data.expenses.length === before) {
    return res.status(404).json({ error: "Dépense introuvable." });
  }
  await db.write();
  res.status(204).end();
});

export default router;
