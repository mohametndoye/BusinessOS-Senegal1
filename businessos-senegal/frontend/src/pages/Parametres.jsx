import React, { useState } from "react";
import { Save, Lock } from "lucide-react";
import { api } from "../api";
import { Card, PageHeader, Button, Field, Input, Toast } from "../components/ui";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";

export default function Parametres() {
  const { user, refreshUser } = useAuth();
  const { toast, notify } = useToast();

  const [profile, setProfile] = useState({
    businessName: user?.businessName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile(profile);
      await refreshUser();
      notify("Profil de l'entreprise mis à jour.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await api.changePassword(pwd);
      setPwd({ currentPassword: "", newPassword: "" });
      notify("Mot de passe mis à jour.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Compte" title="Paramètres" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-1">Profil de l'entreprise</h3>
          <p className="text-[12px] text-[#6B7280] mb-4">Ces informations apparaissent sur vos factures PDF.</p>
          <form onSubmit={saveProfile} className="space-y-3.5">
            <Field label="Nom de l'entreprise">
              <Input value={profile.businessName} onChange={(e) => setProfile((f) => ({ ...f, businessName: e.target.value }))} />
            </Field>
            <Field label="Téléphone">
              <Input value={profile.phone} onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))} placeholder="77 000 00 00" />
            </Field>
            <Field label="Adresse">
              <Input value={profile.address} onChange={(e) => setProfile((f) => ({ ...f, address: e.target.value }))} placeholder="Quartier, ville" />
            </Field>
            <Field label="Email (non modifiable)">
              <Input value={user?.email || ""} disabled className="opacity-60" />
            </Field>
            <Button type="submit" variant="accent" disabled={savingProfile}>
              <Save size={14} /> {savingProfile ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-ink mb-1">Sécurité</h3>
          <p className="text-[12px] text-[#6B7280] mb-4">Changez votre mot de passe régulièrement.</p>
          <form onSubmit={savePassword} className="space-y-3.5">
            <Field label="Mot de passe actuel">
              <Input type="password" value={pwd.currentPassword} onChange={(e) => setPwd((f) => ({ ...f, currentPassword: e.target.value }))} />
            </Field>
            <Field label="Nouveau mot de passe">
              <Input type="password" minLength={6} value={pwd.newPassword} onChange={(e) => setPwd((f) => ({ ...f, newPassword: e.target.value }))} />
            </Field>
            <Button type="submit" variant="ghost" disabled={savingPwd}>
              <Lock size={14} /> {savingPwd ? "Mise à jour…" : "Changer le mot de passe"}
            </Button>
          </form>
        </Card>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
