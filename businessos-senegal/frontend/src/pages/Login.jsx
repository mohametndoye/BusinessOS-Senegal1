import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, CheckCircle2, ArrowRight } from "lucide-react";
import { Button, Field, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  "Ventes, stock et factures dans une seule application",
  "Encaissez par Wave ou Orange Money en un clic",
  "Factures PDF professionnelles, prêtes à imprimer",
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login(form.email, form.password);
      navigate(loggedUser?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-sand">
      {/* Panneau de marque */}
      <div className="hidden lg:flex lg:w-[46%] relative bg-ink-gradient text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 20% 15%, white 0.5px, transparent 0.5px)",
          backgroundSize: "18px 18px",
        }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-teal/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gold-gradient shadow-glow">
              <Store size={18} color="#12131C" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[16px] font-bold tracking-tight">BusinessOS</div>
              <div className="text-gold text-[10.5px] font-semibold tracking-[0.14em] uppercase">Sénégal</div>
            </div>
          </div>

          <h1 className="font-display text-[34px] leading-[1.15] font-bold tracking-tight mb-5 max-w-md">
            Le système d'exploitation de votre commerce.
          </h1>
          <p className="text-[14.5px] text-white/60 max-w-sm leading-relaxed">
            Ventes, stock, clients, factures et paiements mobiles réunis dans un seul outil, pensé pour les PME sénégalaises.
          </p>
        </div>

        <div className="relative space-y-3.5">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <CheckCircle2 size={17} className="text-gold shrink-0 mt-0.5" />
              <span className="text-[13.5px] text-white/75">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-ink shadow-glow">
              <Store size={18} color="#C99A3D" strokeWidth={2.5} />
            </div>
            <div className="leading-tight text-center">
              <div className="font-display text-[16px] font-bold tracking-tight text-ink">BusinessOS</div>
              <div className="text-gold text-[10.5px] font-semibold tracking-[0.14em] uppercase">Sénégal</div>
            </div>
          </div>

          <h2 className="font-display text-[24px] font-bold text-ink mb-1.5 tracking-tight">Bon retour</h2>
          <p className="text-[13.5px] text-muted mb-7">Connectez-vous pour gérer votre entreprise.</p>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email">
              <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@entreprise.com" />
            </Field>
            <Field label="Mot de passe">
              <Input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
            </Field>

            {error && (
              <div className="text-[12.5px] text-baobab font-medium bg-baobab/[0.06] border border-baobab/15 rounded-xl px-3 py-2.5">
                {error}
              </div>
            )}

            <Button type="submit" variant="accent" className="w-full justify-center py-2.5" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"} {!loading && <ArrowRight size={15} />}
            </Button>
          </form>

          <p className="text-center text-[12.5px] text-muted mt-7">
            Pas encore de compte ? <Link to="/inscription" className="font-semibold text-brand hover:underline">Créer mon entreprise</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
