import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button, Field, Input, WaxStrip } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.businessName, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-9 h-9 rounded-md flex items-center justify-center bg-ink">
            <Store size={18} color="#E4A83B" strokeWidth={2.5} />
          </div>
          <div className="leading-tight text-center">
            <div className="font-display text-[17px] font-semibold tracking-tight text-ink">BusinessOS</div>
            <div className="text-baobab text-[11px] font-semibold tracking-wide">SÉNÉGAL</div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card overflow-hidden">
          <WaxStrip />
          <form onSubmit={submit} className="p-6 space-y-4">
            <h1 className="font-display text-[20px] font-semibold text-ink mb-1">Créer mon entreprise</h1>
            <p className="text-[12.5px] text-[#8A8171] mb-4">Démarrez la gestion de vos ventes, stock et finances.</p>

            <Field label="Nom de l'entreprise">
              <Input required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Ex: Boutique Awa" />
            </Field>
            <Field label="Email">
              <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@entreprise.com" />
            </Field>
            <Field label="Mot de passe">
              <Input type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="6 caractères minimum" />
            </Field>

            {error && <p className="text-[12.5px] text-baobab font-medium">{error}</p>}

            <Button type="submit" variant="accent" className="w-full justify-center" disabled={loading}>
              {loading ? "Création…" : "Créer mon compte"}
            </Button>
          </form>
        </div>

        <p className="text-center text-[12.5px] text-[#8A8171] mt-5">
          Déjà un compte ? <Link to="/connexion" className="font-semibold text-baobab">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
