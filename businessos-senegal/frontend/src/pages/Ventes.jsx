import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Field, Input, Select, Modal, Empty, Toast, fmtFCFA, fmtDate } from "../components/ui";
import { useToast } from "../hooks/useToast";

export default function Ventes() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const [p, c, s] = await Promise.all([api.getProducts(), api.getClients(), api.getSales()]);
    setProducts(p);
    setClients(c);
    setSales(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createSale = async ({ clientId, items, paidNow }) => {
    if (items.length === 0) return notify("Ajoutez au moins un article.", "error");
    try {
      await api.createSale({
        clientId: clientId || null,
        items: items.map((it) => ({ productId: it.productId, qty: it.qty })),
        paidNow,
      });
      notify("Vente enregistrée et facture générée.");
      setModal(false);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Transactions"
        title="Ventes"
        action={<Button variant="accent" onClick={() => setModal(true)}><Plus size={15} /> Nouvelle vente</Button>}
      />

      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-5 text-[13px] text-[#8A8171]">Chargement…</p>
        ) : sales.length === 0 ? (
          <Empty text="Aucune vente pour le moment. Enregistrez votre première vente." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["Date", "Client", "Articles", "Total"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[11px] tracking-wide uppercase text-[#8A8171]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const client = clients.find((c) => c.id === s.clientId);
                  return (
                    <tr key={s.id} className="border-t border-line">
                      <td className="px-4 py-3 text-[#8A8171]">{fmtDate(s.date)}</td>
                      <td className="px-4 py-3 font-medium">{client ? client.name : "Client de passage"}</td>
                      <td className="px-4 py-3 text-[#8A8171]">{s.items.map((it) => it.name).join(", ")}</td>
                      <td className="px-4 py-3 font-semibold font-mono">{fmtFCFA(s.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title="Nouvelle vente" onClose={() => setModal(false)} wide>
          <SaleForm products={products} clients={clients} onSave={createSale} onCancel={() => setModal(false)} />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function SaleForm({ products, clients, onSave, onCancel }) {
  const [clientId, setClientId] = useState("");
  const [rows, setRows] = useState([{ productId: "", qty: 1 }]);
  const [paidNow, setPaidNow] = useState(true);

  const addRow = () => setRows((r) => [...r, { productId: "", qty: 1 }]);
  const updateRow = (i, patch) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const items = rows
    .filter((r) => r.productId)
    .map((r) => {
      const p = products.find((x) => x.id === r.productId);
      return p ? { productId: p.id, name: p.name, qty: Number(r.qty) || 0, price: p.price } : null;
    })
    .filter(Boolean);

  const total = items.reduce((a, it) => a + it.qty * it.price, 0);

  return (
    <div className="space-y-4">
      <Field label="Client (optionnel)">
        <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Client de passage</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </Field>

      <div>
        <span className="block text-[12px] font-semibold mb-2 text-ink">Articles</span>
        <div className="space-y-2">
          {rows.map((row, i) => {
            const prod = products.find((p) => p.id === row.productId);
            return (
              <div key={i} className="flex items-center gap-2">
                <Select value={row.productId} onChange={(e) => updateRow(i, { productId: e.target.value })} className="flex-1">
                  <option value="">Sélectionner un produit…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} — {fmtFCFA(p.price)} ({p.stock} en stock)</option>
                  ))}
                </Select>
                <Input type="number" min="1" max={prod ? prod.stock : undefined} value={row.qty} onChange={(e) => updateRow(i, { qty: e.target.value })} className="w-[72px]" />
                <button onClick={() => removeRow(i)} className="p-1.5 rounded-md hover:opacity-60 shrink-0"><Trash2 size={14} color="#B5482F" /></button>
              </div>
            );
          })}
        </div>
        <button onClick={addRow} className="mt-2 text-[12.5px] font-semibold flex items-center gap-1 text-baobab">
          <Plus size={13} /> Ajouter un article
        </button>
      </div>

      <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
        <input type="checkbox" checked={paidNow} onChange={(e) => setPaidNow(e.target.checked)} />
        Vente payée immédiatement
      </label>

      <div className="flex items-center justify-between pt-3 border-t border-line">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[#8A8171]">Total</div>
          <div className="font-mono text-[20px] font-semibold text-ink">{fmtFCFA(total)}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button variant="accent" onClick={() => onSave({ clientId, items, paidNow })} disabled={items.length === 0}>Enregistrer la vente</Button>
        </div>
      </div>
    </div>
  );
}
