import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.clients.filter((c) => c.ownerId === req.user.id));
});

router.post("/", async (req, res) => {
  const { name, phone, address } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Le nom du client est requis." });
  }

  await db.read();
  const client = {
    id: randomUUID(),
    ownerId: req.user.id,
    name: name.trim(),
    phone: phone || "",
    address: address || "",
    createdAt: new Date().toISOString(),
  };
  db.data.clients.push(client);
  await db.write();
  res.status(201).json(client);
});

router.put("/:id", async (req, res) => {
  await db.read();
  const idx = db.data.clients.findIndex((c) => c.id === req.params.id && c.ownerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Client introuvable." });

  const { name, phone, address } = req.body || {};
  const current = db.data.clients[idx];
  db.data.clients[idx] = {
    ...current,
    name: name ?? current.name,
    phone: phone ?? current.phone,
    address: address ?? current.address,
  };
  await db.write();
  res.json(db.data.clients[idx]);
});

router.delete("/:id", async (req, res) => {
  await db.read();
  const before = db.data.clients.length;
  db.data.clients = db.data.clients.filter((c) => !(c.id === req.params.id && c.ownerId === req.user.id));
  if (db.data.clients.length === before) {
    return res.status(404).json({ error: "Client introuvable." });
  }
  await db.write();
  res.status(204).end();
});

export default router;
