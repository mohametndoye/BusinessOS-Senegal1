import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldOff, ShieldCheck, ChevronRight } from "lucide-react";
import { api } from "../../api";
import { Card, PageHeader, Input, Empty, Toast, fmtFCFA, fmtDate } from "../../components/ui";
import { useToast } from "../../hooks/useToast";

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const data = await api.getAdminBusinesses();
    setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => businesses.filter(
      (b) => b.businessName.toLowerCase().includes(query.toLowerCase()) || b.email.toLowerCase().includes(query.toLowerCase())
    ),
    [businesses, query]
  );

  const toggleStatus = async (b) => {
    try {
      await api.setBusinessStatus(b.id, !b.active);
      notify(b.active ? `"${b.businessName}" a été suspendue.` : `"${b.businessName}" a été réactivée.`, b.active ? "error" : "success");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Entreprises inscrites" />

      <div className="mb-4 relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <Input placeholder="Rechercher une entreprise ou un email…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-5 text-[13px] text-[#6B7280]">Chargement…</p>
        ) : filtered.length === 0 ? (
          <Empty text="Aucune entreprise trouvée." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["Entreprise", "Inscrite le", "Produits", "Ventes", "Revenus", "Statut", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[11px] tracking-wide uppercase text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link to={`/admin/entreprises/${b.id}`} className="font-medium text-ink hover:text-brand">{b.businessName}</Link>
                      <div className="text-[11.5px] text-[#6B7280]">{b.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{fmtDate(b.createdAt)}</td>
                    <td className="px-4 py-3">{b.counts.products}</td>
                    <td className="px-4 py-3">{b.counts.sales}</td>
                    <td className="px-4 py-3 font-mono">{fmtFCFA(b.revenue)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${b.active ? "bg-teal/10 text-teal" : "bg-baobab/10 text-baobab"}`}>
                        {b.active ? "Active" : "Suspendue"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus(b)}
                          title={b.active ? "Suspendre" : "Réactiver"}
                          className="p-1.5 rounded-md hover:opacity-60"
                        >
                          {b.active ? <ShieldOff size={14} color="#DC2626" /> : <ShieldCheck size={14} color="#0F9D74" />}
                        </button>
                        <Link to={`/admin/entreprises/${b.id}`} className="p-1.5 rounded-md hover:opacity-60">
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </td>
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
