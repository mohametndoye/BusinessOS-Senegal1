import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { db } from "../db.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, businessName: user.businessName },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register — crée le compte de l'entreprise (une seule fois en général)
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

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me — pratique pour valider un token côté frontend
router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Non authentifié." });

  try {
    const jwtLib = await import("jsonwebtoken");
    const payload = jwtLib.default.verify(token, process.env.JWT_SECRET || "dev-secret");
    res.json({ user: payload });
  } catch {
    res.status(401).json({ error: "Session invalide ou expirée." });
  }
});

export default router;
