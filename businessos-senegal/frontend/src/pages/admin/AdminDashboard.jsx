import React, { useEffect, useState } from "react";
import { Building2, Wallet, AlertTriangle, TrendingUp, Package2, Receipt } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../../api";
import { Card, PageHeader, fmtFCFA } from "../../components/ui";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink text-white text-[12px] px-3 py-2 rounded-lg shadow-lg">
      <div className="font-semibold mb-0.5">{label}</div>
      <div>{payload[0].payload.ventes} vente(s) · {fmtFCFA(payload[0].payload.revenu)}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAdminOverview()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[13.5px] text-[#6B7280]">Chargement…</p>;
  if (error) return <p className="text-[13.5px] text-baobab">{error}</p>;

  const series = data.series.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
  }));

  const kpis = [
    { label: "Entreprises inscrites", value: data.totalBusinesses, sub: `${data.newBusinesses30d} nouvelles (30j)`, icon: Building2, color: "#12131C" },
    { label: "Revenus encaissés (plateforme)", value: fmtFCFA(data.totalRevenue), sub: `${data.totalSales} vente(s) au total`, icon: Wallet, color: "#0F9D74" },
    { label: "Factures impayées", value: fmtFCFA(data.totalUnpaid), sub: `${data.totalInvoices} facture(s) émises`, icon: AlertTriangle, color: "#DC2626" },
    { label: "Produits catalogués", value: data.totalProducts, sub: "tous marchands confondus", icon: Package2, color: "#C99A3D" },
  ];

  return (
    <div>
      <PageHeader eyebrow="Administration BusinessOS Sénégal" title="Vue d'ensemble de la plateforme" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${k.color}1A` }}>
                <Icon size={16} color={k.color} />
              </div>
              <div className="font-mono text-[19px] font-semibold tracking-tight text-ink">{k.value}</div>
              <div className="text-[12px] mt-1 text-[#6B7280]">{k.label} · {k.sub}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-ink">Activité plateforme — 14 derniers jours</h3>
          <div className="flex items-center gap-3 text-[11.5px] text-[#6B7280]">
            <span className="flex items-center gap-1"><Receipt size={13} /> {data.activeBusinesses} entreprise(s) active(s)</span>
            {data.suspendedBusinesses > 0 && (
              <span className="flex items-center gap-1 text-baobab"><AlertTriangle size={13} /> {data.suspendedBusinesses} suspendue(s)</span>
            )}
          </div>
        </div>
        <div className="h-[200px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="platformRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F9D74" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0F9D74" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E4E6EF" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenu" stroke="#0F9D74" strokeWidth={2} fill="url(#platformRevenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
        <TrendingUp size={14} />
        Ces chiffres agrègent l'ensemble des entreprises inscrites sur BusinessOS Sénégal.
      </div>
    </div>
  );
}
