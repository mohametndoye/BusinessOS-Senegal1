import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Wallet, FileText, Package, AlertTriangle, ChevronRight,
} from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Empty, fmtFCFA, fmtDate } from "../components/ui";

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

  if (loading) return <p className="text-[13.5px] text-[#8A8171]">Chargement du tableau de bord…</p>;

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
    { label: "Ventes aujourd'hui", value: fmtFCFA(revenueToday), sub: `${salesToday.length} transaction(s)`, icon: TrendingUp, color: "#0E7C7B" },
    { label: "Chiffre d'affaires du mois", value: fmtFCFA(revenueMonth), sub: `${salesThisMonth.length} vente(s)`, icon: Wallet, color: "#E4A83B" },
    { label: "Factures impayées", value: fmtFCFA(unpaidTotal), sub: `${unpaid.length} facture(s)`, icon: FileText, color: "#B5482F" },
    { label: "Valeur du stock", value: fmtFCFA(stockValue), sub: `${products.length} produit(s)`, icon: Package, color: "#16213A" },
  ];

  return (
    <div>
      <PageHeader eyebrow="Vue d'ensemble" title="Bonjour 👋 voici votre activité" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${k.color}1A` }}>
                <Icon size={16} color={k.color} />
              </div>
              <div className="font-mono text-[19px] font-semibold tracking-tight text-ink">{k.value}</div>
              <div className="text-[12px] mt-1 text-[#8A8171]">{k.label} · {k.sub}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-ink">Ventes récentes</h3>
            <Link to="/ventes" className="text-[12px] font-semibold flex items-center gap-0.5 text-baobab">
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
                      <div className="text-[11.5px] text-[#8A8171]">{fmtDate(s.date)} · {s.items.length} article(s)</div>
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
            <AlertTriangle size={15} color="#B5482F" />
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
