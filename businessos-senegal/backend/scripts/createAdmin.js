/**
 * Crée un compte administrateur BusinessOS Sénégal.
 *
 * Usage :
 *   ADMIN_NAME="Équipe BusinessOS" ADMIN_EMAIL="admin@businessos.sn" ADMIN_PASSWORD="motdepasse-fort" node scripts/createAdmin.js
 *
 * Si le compte existe déjà (même email), il est simplement promu admin
 * (utile si vous avez d'abord créé un compte normal par erreur).
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { db, initDB } from "../db.js";

dotenv.config();

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error("❌ Merci de fournir ADMIN_NAME, ADMIN_EMAIL et ADMIN_PASSWORD en variables d'environnement.");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("❌ Le mot de passe doit contenir au moins 6 caractères.");
    process.exit(1);
  }

  await initDB();

  const existing = db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.role = "admin";
    existing.active = true;
    await db.write();
    console.log(`✅ Le compte existant "${email}" a été promu administrateur.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.data.users.push({
    id: randomUUID(),
    businessName: name,
    email,
    passwordHash,
    role: "admin",
    active: true,
    phone: "",
    address: "",
    createdAt: new Date().toISOString(),
  });
  await db.write();
  console.log(`✅ Compte administrateur créé pour "${email}". Vous pouvez maintenant vous connecter depuis l'application.`);
}

main().catch((err) => {
  console.error("Erreur lors de la création du compte admin :", err);
  process.exit(1);
});
