import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button, Field, Input, WaxStrip } from "../components/ui";
import { useAuth } from "../context/AuthContext";

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
      await login(form.email, form.password);
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
            <h1 className="font-display text-[20px] font-semibold text-ink mb-1">Connexion</h1>
            <p className="text-[12.5px] text-[#8A8171] mb-4">Accédez à la gestion de votre entreprise.</p>

            <Field label="Email">
              <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@entreprise.com" />
            </Field>
            <Field label="Mot de passe">
              <Input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
            </Field>

            {error && <p className="text-[12.5px] text-baobab font-medium">{error}</p>}

            <Button type="submit" variant="accent" className="w-full justify-center" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="text-center text-[12.5px] text-[#8A8171] mt-5">
          Pas encore de compte ? <Link to="/inscription" className="font-semibold text-baobab">Créer mon entreprise</Link>
        </p>
      </div>
    </div>
  );
}
