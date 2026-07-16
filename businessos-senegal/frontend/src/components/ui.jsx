import React from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-line bg-card ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", type = "button", className = "", disabled }) {
  const variants = {
    primary: "bg-ink text-white",
    accent: "bg-baobab text-white",
    ghost: "bg-transparent text-ink border border-line",
    danger: "bg-transparent text-baobab border border-line",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold mb-1 text-ink">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full border border-line bg-white rounded-lg px-2.5 py-2 text-[13.5px] text-charcoal outline-none focus:ring-2 focus:ring-gold/50";

export function Input(props) {
  return <input {...props} className={`${inputClass} ${props.className || ""}`} />;
}

export function Select(props) {
  return <select {...props} className={`${inputClass} ${props.className || ""}`} />;
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-1 text-baobab">{eyebrow}</div>
        <h1 className="font-display text-[26px] md:text-[30px] font-semibold tracking-tight text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(22,33,58,0.55)]">
      <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-2xl overflow-hidden bg-card`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display text-[17px] font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:opacity-60">
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
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-[13px] font-medium text-white ${isErr ? "bg-baobab" : "bg-teal"}`}>
        {isErr ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {toast.msg}
      </div>
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="py-14 text-center">
      <p className="text-[13.5px] text-[#8A8171]">{text}</p>
    </div>
  );
}

export function WaxStrip() {
  const c = ["#B5482F", "#E4A83B", "#0E7C7B", "#F6F0E2"];
  return (
    <div className="w-full h-1.5 flex">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{ background: c[i % c.length], flex: 1 }} />
      ))}
    </div>
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
