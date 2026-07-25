import bcrypt from "bcryptjs";
import cors from "cors";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import { db, initDB } from "./db.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import clientsRoutes from "./routes/clients.js";
import expensesRoutes from "./routes/expenses.js";
import invoicesRoutes from "./routes/invoices.js";
import paymentsRoutes from "./routes/payments.js";
import productsRoutes from "./routes/products.js";
import salesRoutes from "./routes/sales.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// On capture le corps brut de la requête (req.rawBody) afin de pouvoir
// vérifier les signatures des webhooks de paiement (Wave, PayDunya).
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString("utf8");
  },
}));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "BusinessOS Sénégal API", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin", adminRoutes);

// gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée." });
});

// gestion centralisée des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

/**
 * Crée automatiquement un compte administrateur au démarrage si les
 * variables ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD sont définies
 * (utile sur les hébergeurs sans accès shell, comme le plan gratuit
 * de Render : il suffit d'ajouter ces variables dans le tableau de
 * bord Render puis de redéployer).
 *
 * Si un compte existe déjà avec cet email, il est simplement promu
 * administrateur (sans écraser son mot de passe).
 */
async function seedAdminFromEnv() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  await db.read();
  const existing = db.data.users.find((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.active = true;
      await db.write();
      console.log(`✅ Compte "${ADMIN_EMAIL}" promu administrateur (amorçage au démarrage).`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  db.data.users.push({
    id: randomUUID(),
    businessName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    active: true,
    createdAt: new Date().toISOString(),
  });
  await db.write();
  console.log(`✅ Compte administrateur "${ADMIN_EMAIL}" créé automatiquement au démarrage.`);
}

initDB()
  .then(() => seedAdminFromEnv())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ BusinessOS Sénégal API démarrée sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Impossible d'initialiser la base de données :", err);
    process.exit(1);
  });