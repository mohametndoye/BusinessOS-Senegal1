import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShieldOff, ShieldCheck, Phone, MapPin, Mail } from "lucide-react";
import { api } from "../../api";
import { Card, PageHeader, Button, Empty, Toast, fmtFCFA, fmtDate } from "../../components/ui";
import { useToast } from "../../hooks/useToast";

export default function AdminBusinessDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast, notify } = useToast();

  const load = async () => {
    try {
      const d = await api.getAdminBusiness(id);
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const toggleStatus = async () => {
    try {
      await api.setBusinessStatus(data.id, !data.active);
      notify(data.active ? "Entreprise suspendue." : "Entreprise réactivée.");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (loading) return <p className="text-[13.5px] text-[#6B7280]">Chargement…</p>;
  if (error) return <p className="text-[13.5px] text-baobab">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <Link to="/admin/entreprises" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#6B7280] hover:text-ink mb-4">
        <ArrowLeft size={14} /> Retour aux entreprises
      </Link>

      <PageHeader
        eyebrow="Fiche entreprise"
        title={data.businessName}
        action={
          <Button variant={data.active ? "danger" : "accent"} onClick={toggleStatus}>
            {data.active ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
            {data.active ? "Suspendre ce compte" : "Réactiver ce compte"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-[#6B7280] mb-1">Revenus encaissés</div>
          <div className="font-mono text-[18px] font-semibold text-teal">{fmtFCFA(data.revenue)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-[#6B7280] mb-1">Factures impayées</div>
          <div className="font-mono text-[18px] font-semibold text-baobab">{fmtFCFA(data.unpaid)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-[#6B7280] mb-1">Produits</div>
          <div className="font-mono text-[18px] font-semibold text-ink">{data.counts.products}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-[#6B7280] mb-1">Ventes</div>
          <div className="font-mono text-[18px] font-semibold text-ink">{data.counts.sales}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-3">Coordonnées</h3>
          <div className="space-y-2.5 text-[13px]">
            <div className="flex items-center gap-2 text-charcoal"><Mail size={14} color="#6B7280" /> {data.email}</div>
            <div className="flex items-center gap-2 text-charcoal"><Phone size={14} color="#6B7280" /> {data.phone || "—"}</div>
            <div className="flex items-center gap-2 text-charcoal"><MapPin size={14} color="#6B7280" /> {data.address || "—"}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-line text-[11.5px] text-[#6B7280]">
            Inscrite le {fmtDate(data.createdAt)}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-3">Ventes récentes</h3>
          {data.recentSales.length === 0 ? (
            <Empty text="Aucune vente enregistrée." />
          ) : (
            <div className="space-y-2">
              {data.recentSales.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <div className="text-[12.5px] text-[#6B7280]">{fmtDate(s.date)} · {s.items.length} article(s)</div>
                  <div className="font-mono text-[13px] font-semibold">{fmtFCFA(s.total)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <h3 className="text-[14px] font-semibold text-ink mb-3">Catalogue produits</h3>
        {data.products.length === 0 ? (
          <Empty text="Aucun produit enregistré." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["Produit", "Catégorie", "Prix", "Stock"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-[11px] tracking-wide uppercase text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-[#6B7280]">{p.category || "—"}</td>
                    <td className="px-3 py-2 font-mono">{fmtFCFA(p.price)}</td>
                    <td className="px-3 py-2">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Toast toast={toast} />
    </div>
  );
}
