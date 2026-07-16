import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Field, Input, Modal, Empty, Toast, fmtFCFA } from "../components/ui";
import { useToast } from "../hooks/useToast";

export default function Produits() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const data = await api.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || (p.category || "").toLowerCase().includes(query.toLowerCase())
  );

  const openNew = () => setModal({ mode: "new", data: { name: "", category: "", price: "", cost: "", stock: "", threshold: "5" } });
  const openEdit = (p) => setModal({ mode: "edit", data: { ...p } });

  const save = async (data) => {
    if (!data.name.trim()) return notify("Le nom du produit est requis.", "error");
    try {
      if (modal.mode === "new") {
        await api.createProduct(data);
        notify("Produit ajouté au catalogue.");
      } else {
        await api.updateProduct(data.id, data);
        notify("Produit mis à jour.");
      }
      setModal(null);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteProduct(id);
      notify("Produit supprimé.", "error");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Produits & Stock"
        action={<Button variant="accent" onClick={openNew}><Plus size={15} /> Ajouter un produit</Button>}
      />

      <div className="mb-4 flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8171]" />
          <Input placeholder="Rechercher un produit ou une catégorie…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-5 text-[13px] text-[#8A8171]">Chargement…</p>
        ) : filtered.length === 0 ? (
          <Empty text="Aucun produit trouvé." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["Produit", "Catégorie", "Prix vente", "Stock", "Seuil", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[11px] tracking-wide uppercase text-[#8A8171]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const low = p.stock <= p.threshold;
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-charcoal">{p.name}</td>
                      <td className="px-4 py-3 text-[#8A8171]">{p.category || "—"}</td>
                      <td className="px-4 py-3 font-mono">{fmtFCFA(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${low ? "bg-baobab/10 text-baobab" : "bg-teal/10 text-teal"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8A8171]">{p.threshold}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:opacity-60 mr-1"><Pencil size={14} /></button>
                        <button onClick={() => remove(p.id)} className="p-1.5 rounded-md hover:opacity-60"><Trash2 size={14} color="#B5482F" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal.mode === "new" ? "Nouveau produit" : "Modifier le produit"} onClose={() => setModal(null)}>
          <ProductForm data={modal.data} onSave={save} onCancel={() => setModal(null)} />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function ProductForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState(data);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-3.5">
      <Field label="Nom du produit"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Riz brisé 25kg" /></Field>
      <Field label="Catégorie"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Ex: Alimentation" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prix de vente (FCFA)"><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="Coût d'achat (FCFA)"><Input type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stock actuel"><Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></Field>
        <Field label="Seuil d'alerte"><Input type="number" value={form.threshold} onChange={(e) => set("threshold", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button variant="accent" onClick={() => onSave(form)}>Enregistrer</Button>
      </div>
    </div>
  );
}
