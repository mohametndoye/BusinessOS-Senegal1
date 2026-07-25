import jwt from "jsonwebtoken";
import { db } from "../db.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    // On revérifie l'état du compte à chaque requête (suspension éventuelle par un admin).
    await db.read();
    const user = db.data.users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: "Compte introuvable." });
    }
    if (user.active === false) {
      return res.status(403).json({ error: "Ce compte a été suspendu. Contactez le support BusinessOS Sénégal." });
    }

    req.user = { id: user.id, email: user.email, businessName: user.businessName, role: user.role || "owner" };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé aux administrateurs." });
  }
  next();
}
