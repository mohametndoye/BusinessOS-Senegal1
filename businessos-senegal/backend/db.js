import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultData = {
  users: [],
  products: [],
  clients: [],
  sales: [],
  invoices: [],
  expenses: [],
  payments: [],
};

/**
 * Adaptateur Postgres compatible avec l'API lowdb (read/write).
 * L'ensemble des données de l'application est conservé dans une seule
 * ligne JSONB — ce qui permet de réutiliser exactement les mêmes accès
 * `db.data.produits`, etc. utilisés partout ailleurs dans le code, sans
 * avoir à réécrire chaque route en requêtes SQL.
 *
 * Adapté aux volumes d'une PME/V1 de SaaS. Pour une montée en charge
 * importante, une vraie modélisation relationnelle sera préférable.
 */
class PostgresAdapter {
  constructor(connectionString) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    this.ready = this.pool.query(
      "CREATE TABLE IF NOT EXISTS businessos_store (id SMALLINT PRIMARY KEY, data JSONB NOT NULL)"
    );
  }

  async read() {
    await this.ready;
    const { rows } = await this.pool.query("SELECT data FROM businessos_store WHERE id = 1");
    return rows[0] ? rows[0].data : null;
  }

  async write(data) {
    await this.ready;
    await this.pool.query(
      `INSERT INTO businessos_store (id, data) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET data = $1`,
      [JSON.stringify(data)]
    );
  }
}

const usingPostgres = Boolean(process.env.DATABASE_URL);

const adapter = usingPostgres
  ? new PostgresAdapter(process.env.DATABASE_URL)
  : new JSONFile(path.join(__dirname, "data", "db.json"));

export const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;
  // s'assure que toutes les collections existent (mise à jour de schéma sûre)
  for (const key of Object.keys(defaultData)) {
    if (!Array.isArray(db.data[key])) db.data[key] = [];
  }
  await db.write();

  console.log(
    usingPostgres
      ? "💾 Stockage : PostgreSQL (persistant — DATABASE_URL détectée)"
      : "💾 Stockage : fichier JSON local (non persistant en production — voir README)"
  );
}