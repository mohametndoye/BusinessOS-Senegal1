import React from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card shadow-card transition-shadow ${
        hover ? "hover:shadow-lift" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", type = "button", className = "", disabled }) {
  const variants = {
    primary: "bg-ink text-white shadow-soft hover:shadow-card",
    accent: "bg-brand-gradient text-white shadow-glow hover:brightness-105",
    gold: "bg-gold-gradient text-ink shadow-soft hover:brightness-105",
    ghost: "bg-white text-ink border border-line shadow-soft hover:border-ink/20",
    danger: "bg-white text-baobab border border-line shadow-soft hover:border-baobab/40",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold mb-1.5 text-ink tracking-tight">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full border border-line bg-white rounded-xl px-3 py-2.5 text-[13.5px] text-charcoal outline-none shadow-soft transition-shadow focus:ring-2 focus:ring-gold/40 focus:border-gold/60";

export function Input(props) {
  return <input {...props} className={`${inputClass} ${props.className || ""}`} />;
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`${inputClass} bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%236B7280"><path d="M5.5 7.5l4.5 5 4.5-5" stroke="%236B7280" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-9 appearance-none ${props.className || ""}`}
    />
  );
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[11px] font-bold tracking-[0.16em] uppercase mb-1.5 text-brand flex items-center gap-1.5">
          <span className="w-4 h-[2px] rounded-full bg-brand-gradient" />
          {eyebrow}
        </div>
        <h1 className="font-display text-[27px] md:text-[32px] font-bold tracking-tight text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(14,22,38,0.6)] backdrop-blur-[2px]">
      <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-2xl overflow-hidden bg-card shadow-panel border border-white/10`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display text-[17px] font-bold text-ink tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.kind === "error";
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-[fadeIn_0.2s_ease-out]">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-panel text-[13px] font-semibold text-white ${isErr ? "bg-baobab-gradient" : "bg-teal"}`}>
        {isErr ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {toast.msg}
      </div>
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="py-14 text-center">
      <p className="text-[13.5px] text-muted">{text}</p>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-ink/[0.06] text-ink",
    success: "bg-teal/10 text-teal",
    danger: "bg-baobab/10 text-baobab",
    gold: "bg-gold/15 text-goldDeep",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${tones[tone]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone === "success" ? "bg-teal" : tone === "danger" ? "bg-baobab" : tone === "gold" ? "bg-goldDeep" : "bg-ink/50"}`} />
      {children}
    </span>
  );
}

export function fmtFCFA(n) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + " FCFA";
}

export function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
