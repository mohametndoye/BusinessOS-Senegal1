import React, { useEffect, useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Field, Input, Modal, Empty, Toast, fmtFCFA, fmtDate } from "../components/ui";
import { useToast } from "../hooks/useToast";

export default function Finances() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const [inv, ex] = await Promise.all([api.getInvoices(), api.getExpenses()]);
    setInvoices(inv);
    setExpenses(ex);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const revenue = invoices.filter((i) => i.status === "payée").reduce((a, i) => a + i.total, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const profit = revenue - totalExpenses;

  const addExpense = async (data) => {
    if (!data.label.trim() || !Number(data.amount)) return notify("Libellé et montant requis.", "error");
    try {
      await api.createExpense(data);
      notify("Dépense enregistrée.");
      setModal(false);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const removeExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Suivi financier" title="Finances" action={<Button variant="accent" onClick={() => setModal(true)}><Plus size={15} /> Ajouter une dépense</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={15} color="#0E7C7B" /><span className="text-[12px] font-semibold text-[#8A8171]">Revenus encaissés</span></div>
          <div className="font-mono text-[20px] font-semibold text-teal">{fmtFCFA(revenue)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={15} color="#B5482F" /><span className="text-[12px] font-semibold text-[#8A8171]">Dépenses</span></div>
          <div className="font-mono text-[20px] font-semibold text-baobab">{fmtFCFA(totalExpenses)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2"><Wallet size={15} color="#16213A" /><span className="text-[12px] font-semibold text-[#8A8171]">Bénéfice net</span></div>
          <div className="font-mono text-[20px] font-semibold text-ink">{fmtFCFA(profit)}</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <h3 className="text-[14px] font-semibold text-ink">Dépenses enregistrées</h3>
        </div>
        {loading ? (
          <p className="p-5 text-[13px] text-[#8A8171]">Chargement…</p>
        ) : expenses.length === 0 ? (
          <Empty text="Aucune dépense enregistrée." />
        ) : (
          <div className="divide-y divide-line">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] font-medium text-charcoal">{e.label}</div>
                  <div className="text-[11.5px] text-[#8A8171]">{e.category} · {fmtDate(e.date)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-semibold text-baobab">-{fmtFCFA(e.amount)}</span>
                  <button onClick={() => removeExpense(e.id)} className="p-1 rounded-md hover:opacity-60"><Trash2 size={13} color="#8A8171" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal && (
        <Modal title="Nouvelle dépense" onClose={() => setModal(false)}>
          <ExpenseForm onSave={addExpense} onCancel={() => setModal(false)} />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function ExpenseForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ label: "", amount: "", category: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-3.5">
      <Field label="Libellé"><Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Ex: Transport marchandises" /></Field>
      <Field label="Montant (FCFA)"><Input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} /></Field>
      <Field label="Catégorie"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Ex: Logistique" /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button variant="accent" onClick={() => onSave(form)}>Enregistrer</Button>
      </div>
    </div>
  );
}
