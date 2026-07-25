import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

function ownersOnly(users) {
  return users.filter((u) => (u.role || "owner") !== "admin");
}

function businessSummary(owner) {
  const products = db.data.products.filter((p) => p.ownerId === owner.id);
  const clients = db.data.clients.filter((c) => c.ownerId === owner.id);
  const sales = db.data.sales.filter((s) => s.ownerId === owner.id);
  const invoices = db.data.invoices.filter((i) => i.ownerId === owner.id);
  const expenses = db.data.expenses.filter((e) => e.ownerId === owner.id);

  const revenue = invoices.filter((i) => i.status === "payée").reduce((a, i) => a + i.total, 0);
  const unpaid = invoices.filter((i) => i.status === "impayée").reduce((a, i) => a + i.total, 0);
  const lastSale = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return {
    id: owner.id,
    businessName: owner.businessName,
    email: owner.email,
    phone: owner.phone || "",
    address: owner.address || "",
    active: owner.active !== false,
    createdAt: owner.createdAt,
    counts: {
      products: products.length,
      clients: clients.length,
      sales: sales.length,
      invoices: invoices.length,
      expenses: expenses.length,
    },
    revenue,
    unpaid,
    lastActivity: lastSale ? lastSale.date : owner.createdAt,
  };
}

// GET /api/admin/overview — statistiques globales de la plateforme
router.get("/overview", async (req, res) => {
  await db.read();
  const owners = ownersOnly(db.data.users);

  const totalRevenue = db.data.invoices.filter((i) => i.status === "payée").reduce((a, i) => a + i.total, 0);
  const totalUnpaid = db.data.invoices.filter((i) => i.status === "impayée").reduce((a, i) => a + i.total, 0);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newBusinesses30d = owners.filter((o) => new Date(o.createdAt).getTime() >= thirtyDaysAgo).length;

  // série des 14 derniers jours : nombre de ventes + revenu par jour (toutes entreprises confondues)
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toDateString());
  }
  const series = days.map((dayKey) => {
    const daySales = db.data.sales.filter((s) => new Date(s.date).toDateString() === dayKey);
    return {
      date: dayKey,
      ventes: daySales.length,
      revenu: daySales.reduce((a, s) => a + s.total, 0),
    };
  });

  res.json({
    totalBusinesses: owners.length,
    activeBusinesses: owners.filter((o) => o.active !== false).length,
    suspendedBusinesses: owners.filter((o) => o.active === false).length,
    newBusinesses30d,
    totalRevenue,
    totalUnpaid,
    totalProducts: db.data.products.length,
    totalSales: db.data.sales.length,
    totalInvoices: db.data.invoices.length,
    series,
  });
});

// GET /api/admin/businesses — liste de toutes les entreprises inscrites
router.get("/businesses", async (req, res) => {
  await db.read();
  const owners = ownersOnly(db.data.users);
  const list = owners
    .map(businessSummary)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// GET /api/admin/businesses/:id — détail d'une entreprise
router.get("/businesses/:id", async (req, res) => {
  await db.read();
  const owner = db.data.users.find((u) => u.id === req.params.id && (u.role || "owner") !== "admin");
  if (!owner) return res.status(404).json({ error: "Entreprise introuvable." });

  const summary = businessSummary(owner);
  const sales = db.data.sales
    .filter((s) => s.ownerId === owner.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
  const products = db.data.products.filter((p) => p.ownerId === owner.id);
  const invoices = db.data.invoices
    .filter((i) => i.ownerId === owner.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.json({ ...summary, recentSales: sales, products, recentInvoices: invoices });
});

// PATCH /api/admin/businesses/:id/status — suspendre / réactiver une entreprise
router.patch("/businesses/:id/status", async (req, res) => {
  const { active } = req.body || {};
  if (typeof active !== "boolean") {
    return res.status(400).json({ error: "Le champ 'active' (booléen) est requis." });
  }

  await db.read();
  const idx = db.data.users.findIndex((u) => u.id === req.params.id && (u.role || "owner") !== "admin");
  if (idx === -1) return res.status(404).json({ error: "Entreprise introuvable." });

  db.data.users[idx].active = active;
  await db.write();
  res.json(businessSummary(db.data.users[idx]));
});

export default router;
