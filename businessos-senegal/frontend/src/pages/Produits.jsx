import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Field, Input, Select, Modal, Empty, Toast, fmtFCFA } from "../components/ui";
import { useToast } from "../hooks/useToast";

const SUGGESTED_CATEGORIES = [
  "Alimentation",
  "Boissons",
  "Hygiène & Beauté",
  "Textile & Habillement",
  "Électronique",
  "Quincaillerie",
  "Cosmétiques",
  "Divers",
];

export default function Produits() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast, notify } = useToast();

  const load = async () => {
    const data = await api.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const knownCategories = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...SUGGESTED_CATEGORIES, ...fromProducts])).sort();
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || (p.category || "").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "Toutes" || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <Input placeholder="Rechercher un produit…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>

        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full max-w-[220px]">
          <option value="Toutes">Toutes les catégories</option>
          {knownCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <p className="p-5 text-[13px] text-[#6B7280]">Chargement…</p>
        ) : filtered.length === 0 ? (
          <Empty text="Aucun produit trouvé." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-sand">
                  {["Produit", "Catégorie", "Prix vente", "Stock", "Seuil", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[11px] tracking-wide uppercase text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const low = p.stock <= p.threshold;
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-charcoal">{p.name}</td>
                      <td className="px-4 py-3 text-[#6B7280]">
                        {p.category ? (
                          <span className="px-2 py-0.5 rounded-full text-[11.5px] font-medium bg-ink/5 text-ink">{p.category}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono">{fmtFCFA(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${low ? "bg-baobab/10 text-baobab" : "bg-teal/10 text-teal"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">{p.threshold}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:opacity-60 mr-1"><Pencil size={14} /></button>
                        <button onClick={() => remove(p.id)} className="p-1.5 rounded-md hover:opacity-60"><Trash2 size={14} color="#DC2626" /></button>
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
          <ProductForm data={modal.data} categories={knownCategories} onSave={save} onCancel={() => setModal(null)} />
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function ProductForm({ data, categories, onSave, onCancel }) {
  const [form, setForm] = useState(data);
  const isCustomInitially = data.category && !categories.includes(data.category);
  const [customCategory, setCustomCategory] = useState(isCustomInitially);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCategorySelect = (value) => {
    if (value === "__custom__") {
      setCustomCategory(true);
      set("category", "");
    } else {
      setCustomCategory(false);
      set("category", value);
    }
  };

  return (
    <div className="space-y-3.5">
      <Field label="Nom du produit"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Riz brisé 25kg" /></Field>

      <Field label="Catégorie">
        {customCategory ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Nom de la nouvelle catégorie"
            />
            {categories.length > 0 && (
              <Button variant="ghost" onClick={() => { setCustomCategory(false); set("category", categories[0]); }}>
                Liste
              </Button>
            )}
          </div>
        ) : (
          <Select value={form.category || ""} onChange={(e) => handleCategorySelect(e.target.value)}>
            <option value="" disabled>Sélectionner une catégorie…</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__custom__">+ Nouvelle catégorie…</option>
          </Select>
        )}
      </Field>

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
