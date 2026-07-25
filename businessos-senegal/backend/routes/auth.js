import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, businessName: user.businessName, role: user.role || "owner" },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register — crée le compte de l'entreprise (rôle "owner" par défaut)
router.post("/register", async (req, res) => {
  const { businessName, email, password } = req.body || {};

  if (!businessName || !email || !password) {
    return res.status(400).json({ error: "Nom de l'entreprise, email et mot de passe requis." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  await db.read();
  const exists = db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    businessName,
    email,
    passwordHash,
    role: "owner",
    active: true,
    phone: "",
    address: "",
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  await db.read();
  const user = db.data.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }
  if (user.active === false) {
    return res.status(403).json({ error: "Ce compte a été suspendu. Contactez le support BusinessOS Sénégal." });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me — profil à jour (rôle, statut, coordonnées)
router.get("/me", requireAuth, async (req, res) => {
  await db.read();
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Compte introuvable." });
  res.json({ user: publicUser(user) });
});

// PATCH /api/auth/me — mise à jour du profil entreprise (nom, téléphone, adresse)
router.patch("/me", requireAuth, async (req, res) => {
  const { businessName, phone, address } = req.body || {};
  await db.read();
  const idx = db.data.users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Compte introuvable." });

  db.data.users[idx] = {
    ...db.data.users[idx],
    businessName: businessName ?? db.data.users[idx].businessName,
    phone: phone ?? db.data.users[idx].phone,
    address: address ?? db.data.users[idx].address,
  };
  await db.write();
  res.json({ user: publicUser(db.data.users[idx]) });
});

// PATCH /api/auth/me/password — changer son mot de passe
router.patch("/me/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau mot de passe (6 caractères min.) requis." });
  }

  await db.read();
  const idx = db.data.users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Compte introuvable." });

  const valid = await bcrypt.compare(currentPassword, db.data.users[idx].passwordHash);
  if (!valid) return res.status(401).json({ error: "Mot de passe actuel incorrect." });

  db.data.users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
  await db.write();
  res.json({ ok: true });
});

export default router;
