import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Card, PageHeader, Modal, Empty, Toast, fmtFCFA, fmtDate } from "../components/ui";
import { useToast } from "../hooks/useToast";

export default function Factures() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("toutes");
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const [inv, c, s] = await Promise.all([api.getInvoices(), api.getClients(), api.getSales()]);
    setInvoices(inv);
    setClients(c);
    setSales(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const list = invoices.filter((i) => filter === "toutes" || i.status === filter);

  const togglePaid = async (inv) => {
    const newStatus = inv.status === "payée" ? "impayée" : "payée";
    try {
      await api.updateInvoiceStatus(inv.id, newStatus);
      notify(newStatus === "payée" ? "Facture marquée payée." : "Facture marquée impayée.");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Documents commerciaux" title="Factures" />

      <div className="flex gap-2 mb-4">
        {["toutes", "payée", "impayée"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold capitalize border ${
              filter === f ? "bg-ink text-white border-ink" : "text-ink border-line"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-5 text-[13px] text-[#8A8171]">Chargement…</p>
        ) : list.length === 0 ? (
          <Empty text="Aucune facture à afficher." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["N° facture", "Date", "Client", "Total", "Statut", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[11px] tracking-wide uppercase text-[#8A8171]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((inv) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  const paid = inv.status === "payée";
                  return (
                    <tr key={inv.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium cursor-pointer text-ink" onClick={() => setView(inv)}>{inv.number}</td>
                      <td className="px-4 py-3 text-[#8A8171]">{fmtDate(inv.date)}</td>
                      <td className="px-4 py-3">{client ? client.name : "Client de passage"}</td>
                      <td className="px-4 py-3 font-semibold font-mono">{fmtFCFA(inv.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${paid ? "bg-teal/10 text-teal" : "bg-baobab/10 text-baobab"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => togglePaid(inv)} className="text-[12px] font-semibold text-ink">
                          Marquer {paid ? "impayée" : "payée"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {view && (
        <Modal title={`Facture ${view.number}`} onClose={() => setView(null)}>
          <InvoiceDetail invoice={view} sale={sales.find((s) => s.id === view.saleId)} client={clients.find((c) => c.id === view.clientId)} />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function InvoiceDetail({ invoice, sale, client }) {
  return (
    <div>
      <div className="flex justify-between text-[13px] mb-4">
        <div>
          <div className="text-[#8A8171]">Client</div>
          <div className="font-semibold text-ink">{client ? client.name : "Client de passage"}</div>
        </div>
        <div className="text-right">
          <div className="text-[#8A8171]">Date</div>
          <div className="font-semibold text-ink">{fmtDate(invoice.date)}</div>
        </div>
      </div>
      <div className="rounded-lg border border-line overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-sand">
              <th className="text-left px-3 py-2 font-semibold text-[#8A8171]">Article</th>
              <th className="text-right px-3 py-2 font-semibold text-[#8A8171]">Qté</th>
              <th className="text-right px-3 py-2 font-semibold text-[#8A8171]">P.U.</th>
              <th className="text-right px-3 py-2 font-semibold text-[#8A8171]">Total</th>
            </tr>
          </thead>
          <tbody>
            {(sale ? sale.items : []).map((it, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-3 py-2">{it.name}</td>
                <td className="px-3 py-2 text-right">{it.qty}</td>
                <td className="px-3 py-2 text-right">{fmtFCFA(it.price)}</td>
                <td className="px-3 py-2 text-right">{fmtFCFA(it.qty * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-line">
        <span className={`px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${invoice.status === "payée" ? "bg-teal/10 text-teal" : "bg-baobab/10 text-baobab"}`}>
          {invoice.status}
        </span>
        <div className="font-mono text-[19px] font-semibold text-ink">{fmtFCFA(invoice.total)}</div>
      </div>
    </div>
  );
}
