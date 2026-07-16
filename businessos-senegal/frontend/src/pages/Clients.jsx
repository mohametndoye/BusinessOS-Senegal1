import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Field, Input, Modal, Empty, Toast, fmtFCFA } from "../components/ui";
import { useToast } from "../hooks/useToast";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const [c, s] = await Promise.all([api.getClients(), api.getSales()]);
    setClients(c);
    setSales(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setModal({ mode: "new", data: { name: "", phone: "", address: "" } });
  const openEdit = (c) => setModal({ mode: "edit", data: { ...c } });

  const save = async (data) => {
    if (!data.name.trim()) return notify("Le nom du client est requis.", "error");
    try {
      if (modal.mode === "new") {
        await api.createClient(data);
        notify("Client ajouté.");
      } else {
        await api.updateClient(data.id, data);
        notify("Client mis à jour.");
      }
      setModal(null);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteClient(id);
      notify("Client supprimé.", "error");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Répertoire" title="Clients" action={<Button variant="accent" onClick={openNew}><Plus size={15} /> Ajouter un client</Button>} />

      {loading ? (
        <p className="text-[13px] text-[#8A8171]">Chargement…</p>
      ) : clients.length === 0 ? (
        <Card><Empty text="Aucun client enregistré." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {clients.map((c) => {
            const total = sales.filter((s) => s.clientId === c.id).reduce((a, s) => a + s.total, 0);
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold bg-gold/15">
                    <span className="text-ink">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:opacity-60"><Pencil size={13} /></button>
                    <button onClick={() => remove(c.id)} className="p-1.5 rounded-md hover:opacity-60"><Trash2 size={13} color="#B5482F" /></button>
                  </div>
                </div>
                <div className="font-semibold text-[14px] text-ink">{c.name}</div>
                <div className="text-[12px] mt-0.5 text-[#8A8171]">{c.phone}</div>
                <div className="text-[12px] text-[#8A8171]">{c.address}</div>
                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide text-[#8A8171]">Total achats</span>
                  <span className="font-mono text-[13px] font-semibold text-teal">{fmtFCFA(total)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === "new" ? "Nouveau client" : "Modifier le client"} onClose={() => setModal(null)}>
          <ClientForm data={modal.data} onSave={save} onCancel={() => setModal(null)} />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function ClientForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState(data);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-3.5">
      <Field label="Nom"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Boutique Awa" /></Field>
      <Field label="Téléphone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="77 000 00 00" /></Field>
      <Field label="Adresse"><Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Quartier, ville" /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button variant="accent" onClick={() => onSave(form)}>Enregistrer</Button>
      </div>
    </div>
  );
}
