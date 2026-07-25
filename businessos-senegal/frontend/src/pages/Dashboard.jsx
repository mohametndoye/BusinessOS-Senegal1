import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Wallet, FileText, Package, AlertTriangle, ChevronRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api";
import { Card, PageHeader, Empty, fmtFCFA, fmtDate } from "../components/ui";

function buildLast14DaysSeries(sales) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days.map((d) => {
    const key = d.toDateString();
    const daySales = sales.filter((s) => new Date(s.date).toDateString() === key);
    return {
      label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      revenu: daySales.reduce((a, s) => a + s.total, 0),
    };
  });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink text-white text-[12px] px-3 py-2 rounded-lg shadow-lg">
      <div className="font-semibold mb-0.5">{label}</div>
      <div>{fmtFCFA(payload[0].value)}</div>
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, c, s, inv] = await Promise.all([
        api.getProducts(),
        api.getClients(),
        api.getSales(),
        api.getInvoices(),
      ]);
      setProducts(p);
      setClients(c);
      setSales(s);
      setInvoices(inv);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-[13.5px] text-[#6B7280]">Chargement du tableau de bord…</p>;

  const lowStock = products.filter((p) => p.stock <= p.threshold);
  const todayKey = new Date().toDateString();
  const salesToday = sales.filter((s) => new Date(s.date).toDateString() === todayKey);
  const revenueToday = salesToday.reduce((a, s) => a + s.total, 0);

  const now = new Date();
  const salesThisMonth = sales.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const revenueMonth = salesThisMonth.reduce((a, s) => a + s.total, 0);

  const unpaid = invoices.filter((i) => i.status === "impayée");
  const unpaidTotal = unpaid.reduce((a, i) => a + i.total, 0);
  const stockValue = products.reduce((a, p) => a + p.price * p.stock, 0);
  const recentSales = [...sales].slice(0, 6);

  const kpis = [
    { label: "Ventes aujourd'hui", value: fmtFCFA(revenueToday), sub: `${salesToday.length} transaction(s)`, icon: TrendingUp, from: "#14b88a", to: "#0F9D74" },
    { label: "Chiffre d'affaires du mois", value: fmtFCFA(revenueMonth), sub: `${salesThisMonth.length} vente(s)`, icon: Wallet, from: "#DDB35C", to: "#A67D2E" },
    { label: "Factures impayées", value: fmtFCFA(unpaidTotal), sub: `${unpaid.length} facture(s)`, icon: FileText, from: "#EF4444", to: "#B91C1C" },
    { label: "Valeur du stock", value: fmtFCFA(stockValue), sub: `${products.length} produit(s)`, icon: Package, from: "#5B4FE0", to: "#332AA3" },
  ];

  return (
    <div>
      <PageHeader eyebrow="Vue d'ensemble" title="Bonjour 👋 voici votre activité" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} hover className="p-4.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3.5 shadow-soft"
                style={{ background: `linear-gradient(135deg, ${k.from}, ${k.to})` }}
              >
                <Icon size={16} color="#fff" strokeWidth={2.2} />
              </div>
              <div className="font-mono text-[20px] font-bold tracking-tight text-ink">{k.value}</div>
              <div className="text-[12px] mt-1.5 text-muted font-medium">{k.label} · {k.sub}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[14.5px] font-bold text-ink tracking-tight">Chiffre d'affaires — 14 derniers jours</h3>
        </div>
        <div className="h-[180px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buildLast14DaysSeries(sales)} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4338CA" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4338CA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E4E6EF" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenu" stroke="#4338CA" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-ink">Ventes récentes</h3>
            <Link to="/ventes" className="text-[12px] font-semibold flex items-center gap-0.5 text-brand">
              Nouvelle vente <ChevronRight size={13} />
            </Link>
          </div>
          {recentSales.length === 0 ? (
            <Empty text="Aucune vente enregistrée pour l'instant." />
          ) : (
            <div className="space-y-2.5">
              {recentSales.map((s) => {
                const client = clients.find((c) => c.id === s.clientId);
                return (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                    <div>
                      <div className="text-[13px] font-medium text-charcoal">{client ? client.name : "Client de passage"}</div>
                      <div className="text-[11.5px] text-[#6B7280]">{fmtDate(s.date)} · {s.items.length} article(s)</div>
                    </div>
                    <div className="font-mono text-[13px] font-semibold">{fmtFCFA(s.total)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} color="#DC2626" />
            <h3 className="text-[14px] font-semibold text-ink">Stock faible</h3>
          </div>
          {lowStock.length === 0 ? (
            <Empty text="Tous les stocks sont à un bon niveau." />
          ) : (
            <div className="space-y-2.5">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <div className="text-[13px] font-medium text-charcoal">{p.name}</div>
                  <div className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-baobab/10 text-baobab">
                    {p.stock} restant(s)
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
