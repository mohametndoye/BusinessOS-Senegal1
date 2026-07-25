import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import clientsRoutes from "./routes/clients.js";
import salesRoutes from "./routes/sales.js";
import invoicesRoutes from "./routes/invoices.js";
import expensesRoutes from "./routes/expenses.js";
import paymentsRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

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

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ BusinessOS Sénégal API démarrée sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Impossible d'initialiser la base de données :", err);
    process.exit(1);
  });
