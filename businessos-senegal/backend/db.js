import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "data", "db.json");

const defaultData = {
  users: [],
  products: [],
  clients: [],
  sales: [],
  invoices: [],
  expenses: [],
  payments: [],
};

const adapter = new JSONFile(file);
export const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;
  // s'assure que toutes les collections existent (mise à jour de schéma sûre)
  for (const key of Object.keys(defaultData)) {
    if (!Array.isArray(db.data[key])) db.data[key] = [];
  }
  await db.write();
}
