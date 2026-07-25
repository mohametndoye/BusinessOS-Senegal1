import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Printer, Smartphone, Wallet, Banknote, X, Loader2 } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Modal, Empty, Toast, fmtFCFA, fmtDate } from "../components/ui";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";

const PAYMENT_LABELS = {
  espèces: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
};

export default function Factures() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("toutes");
  const [view, setView] = useState(null);
  const [payModal, setPayModal] = useState(null); // invoice en cours de paiement
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    const [inv, c, s] = await Promise.all([api.getInvoices(), api.getClients(), api.getSales()]);
    setInvoices(inv);
    setClients(c);
    setSales(s);
    setLoading(false);
    return inv;
  };

  useEffect(() => { load(); }, []);

  // Retour depuis une redirection de paiement (Wave / Orange Money via PayDunya)
  useEffect(() => {
    const statut = searchParams.get("paiement");
    if (!statut) return;
    (async () => {
      const inv = await load();
      const factureId = searchParams.get("facture");
      const facture = inv.find((i) => i.id === factureId);
      if (statut === "succes" && facture?.status === "payée") {
        notify("Paiement confirmé, la facture est maintenant payée.");
      } else if (statut === "succes") {
        notify("Paiement en cours de confirmation. Actualisez dans quelques instants si besoin.", "error");
      } else {
        notify("Le paiement a été annulé ou a échoué.", "error");
      }
      searchParams.delete("paiement");
      searchParams.delete("facture");
      setSearchParams(searchParams, { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = invoices.filter((i) => filter === "toutes" || i.status === filter);

  const markPaidManually = async (inv) => {
    try {
      await api.updateInvoiceStatus(inv.id, "payée", "espèces");
      notify("Facture marquée payée (espèces).");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const markUnpaid = async (inv) => {
    try {
      await api.updateInvoiceStatus(inv.id, "impayée");
      notify("Facture marquée impayée.");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const business = user ? { businessName: user.businessName, email: user.email, phone: user.phone, address: user.address } : {};

  const handleDownload = async (inv) => {
    const sale = sales.find((s) => s.id === inv.saleId);
    const client = clients.find((c) => c.id === inv.clientId);
    try {
      const { downloadInvoicePdf } = await import("../lib/invoicePdf");
      downloadInvoicePdf({ invoice: inv, sale, client, business });
    } catch (err) {
      notify("Impossible de générer le PDF pour le moment.", "error");
    }
  };

  const handlePrint = async (inv) => {
    const sale = sales.find((s) => s.id === inv.saleId);
    const client = clients.find((c) => c.id === inv.clientId);
    try {
      const { openInvoicePdf } = await import("../lib/invoicePdf");
      openInvoicePdf({ invoice: inv, sale, client, business });
    } catch (err) {
      notify("Impossible de générer le PDF pour le moment.", "error");
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
          <p className="p-5 text-[13px] text-[#6B7280]">Chargement…</p>
        ) : list.length === 0 ? (
          <Empty text="Aucune facture à afficher." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["N° facture", "Date", "Client", "Total", "Statut", "Paiement", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[11px] tracking-wide uppercase text-[#6B7280]">{h}</th>
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
                      <td className="px-4 py-3 text-[#6B7280]">{fmtDate(inv.date)}</td>
                      <td className="px-4 py-3">{client ? client.name : "Client de passage"}</td>
                      <td className="px-4 py-3 font-semibold font-mono">{fmtFCFA(inv.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${paid ? "bg-teal/10 text-teal" : "bg-baobab/10 text-baobab"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">
                        {paid ? (PAYMENT_LABELS[inv.paymentMethod] || inv.paymentMethod || "—") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button title="Télécharger le PDF" onClick={() => handleDownload(inv)} className="p-1.5 rounded-md hover:opacity-60"><Download size={14} /></button>
                          <button title="Imprimer" onClick={() => handlePrint(inv)} className="p-1.5 rounded-md hover:opacity-60"><Printer size={14} /></button>
                          {!paid ? (
                            <button onClick={() => setPayModal(inv)} className="text-[12px] font-semibold text-brand ml-1">
                              Encaisser
                            </button>
                          ) : (
                            <button onClick={() => markUnpaid(inv)} className="text-[12px] font-semibold text-ink ml-1">
                              Annuler paiement
                            </button>
                          )}
                        </div>
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
          <InvoiceDetail
            invoice={view}
            sale={sales.find((s) => s.id === view.saleId)}
            client={clients.find((c) => c.id === view.clientId)}
            onDownload={() => handleDownload(view)}
            onPrint={() => handlePrint(view)}
          />
        </Modal>
      )}

      {payModal && (
        <Modal title={`Encaisser ${payModal.number}`} onClose={() => setPayModal(null)}>
          <PaymentOptions
            invoice={payModal}
            onManual={() => { markPaidManually(payModal); setPayModal(null); }}
            onDone={() => { setPayModal(null); load(); }}
            notify={notify}
          />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function InvoiceDetail({ invoice, sale, client, onDownload, onPrint }) {
  return (
    <div>
      <div className="flex justify-between text-[13px] mb-4">
        <div>
          <div className="text-[#6B7280]">Client</div>
          <div className="font-semibold text-ink">{client ? client.name : "Client de passage"}</div>
        </div>
        <div className="text-right">
          <div className="text-[#6B7280]">Date</div>
          <div className="font-semibold text-ink">{fmtDate(invoice.date)}</div>
        </div>
      </div>
      <div className="rounded-lg border border-line overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-sand">
              <th className="text-left px-3 py-2 font-semibold text-[#6B7280]">Article</th>
              <th className="text-right px-3 py-2 font-semibold text-[#6B7280]">Qté</th>
              <th className="text-right px-3 py-2 font-semibold text-[#6B7280]">P.U.</th>
              <th className="text-right px-3 py-2 font-semibold text-[#6B7280]">Total</th>
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
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" onClick={onDownload} className="flex-1 justify-center"><Download size={14} /> Télécharger PDF</Button>
        <Button variant="ghost" onClick={onPrint} className="flex-1 justify-center"><Printer size={14} /> Imprimer</Button>
      </div>
    </div>
  );
}

function PaymentOptions({ invoice, onManual, onDone, notify }) {
  const [config, setConfig] = useState(null);
  const [session, setSession] = useState(null); // { provider, paymentId, url, demo }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPaymentsConfig().then(setConfig).catch(() => setConfig({ wave: { configured: false }, orangeMoney: { configured: false } }));
  }, []);

  const start = async (provider) => {
    setBusy(true);
    try {
      const create = provider === "wave" ? api.createWaveCheckout : api.createOrangeCheckout;
      const result = await create(invoice.id);
      setSession({ provider, ...result });
      if (result.url) {
        window.open(result.url, "_blank", "noopener");
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const simulate = async () => {
    setBusy(true);
    try {
      await api.simulatePayment(session.paymentId);
      notify("Paiement simulé confirmé — facture marquée payée.");
      onDone();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (session) {
    const providerLabel = session.provider === "wave" ? "Wave" : "Orange Money";
    return (
      <div className="space-y-4 text-center py-2">
        {session.demo ? (
          <>
            <div className="mx-auto w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center">
              <Smartphone size={20} color="#C99A3D" />
            </div>
            <p className="text-[13px] text-ink font-medium">Mode démonstration — aucune clé {providerLabel} n'est configurée côté serveur.</p>
            <p className="text-[12px] text-[#6B7280]">Vous pouvez simuler la réception du paiement pour tester le parcours complet.</p>
            <Button variant="accent" onClick={simulate} disabled={busy} className="w-full justify-center">
              {busy ? <Loader2 size={14} className="animate-spin" /> : null} Simuler le paiement reçu
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto w-11 h-11 rounded-full bg-teal/15 flex items-center justify-center">
              <Loader2 size={20} color="#0F9D74" className="animate-spin" />
            </div>
            <p className="text-[13px] text-ink font-medium">Une fenêtre {providerLabel} s'est ouverte pour finaliser le paiement.</p>
            <p className="text-[12px] text-[#6B7280]">Une fois le paiement confirmé par le client, cette facture passera automatiquement à "payée".</p>
            <Button variant="ghost" onClick={onDone} className="w-full justify-center">Fermer et vérifier plus tard</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="font-mono text-[22px] font-semibold text-ink">{fmtFCFA(invoice.total)}</div>
        <div className="text-[12px] text-[#6B7280]">à encaisser pour la facture {invoice.number}</div>
      </div>

      <button
        onClick={() => start("wave")}
        disabled={busy || !config}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-line hover:bg-sand transition-colors text-left disabled:opacity-50"
      >
        <div className="w-9 h-9 rounded-lg bg-[#1BA0E2]/10 flex items-center justify-center shrink-0">
          <Wallet size={17} color="#1BA0E2" />
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold text-ink">Wave</div>
          <div className="text-[11.5px] text-[#6B7280]">{config?.wave?.configured ? "Paiement en direct" : "Mode démonstration"}</div>
        </div>
      </button>

      <button
        onClick={() => start("orange")}
        disabled={busy || !config}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-line hover:bg-sand transition-colors text-left disabled:opacity-50"
      >
        <div className="w-9 h-9 rounded-lg bg-[#FF6600]/10 flex items-center justify-center shrink-0">
          <Smartphone size={17} color="#FF6600" />
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold text-ink">Orange Money</div>
          <div className="text-[11.5px] text-[#6B7280]">{config?.orangeMoney?.configured ? "Paiement en direct" : "Mode démonstration"}</div>
        </div>
      </button>

      <div className="flex items-center gap-2 py-1">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-[#6B7280]">ou</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <button
        onClick={onManual}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-line hover:bg-sand transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-ink/5 flex items-center justify-center shrink-0">
          <Banknote size={17} color="#12131C" />
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold text-ink">Espèces / autre moyen</div>
          <div className="text-[11.5px] text-[#6B7280]">Marquer comme payée manuellement</div>
        </div>
      </button>
    </div>
  );
}
