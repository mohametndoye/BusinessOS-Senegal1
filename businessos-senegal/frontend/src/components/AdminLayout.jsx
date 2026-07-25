import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/entreprises", label: "Entreprises", icon: Building2 },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion");
  };

  return (
    <div className="min-h-screen w-full flex">
      <aside className="w-64 shrink-0 hidden md:flex flex-col text-white bg-ink-gradient relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle at 20% 15%, white 0.5px, transparent 0.5px)",
          backgroundSize: "16px 16px",
        }} />

        <div className="px-6 pt-7 pb-6 flex items-center gap-2.5 relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-teal to-[#0A5E5D] shadow-lg">
            <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[16px] font-bold tracking-tight">BusinessOS</div>
            <div className="text-teal text-[10.5px] font-semibold tracking-[0.14em] uppercase">Administration</div>
          </div>
        </div>

        <div className="px-6"><div className="h-px bg-white/10" /></div>

        <nav className="flex-1 px-4 py-5 space-y-0.5 relative">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold tracking-tight transition-all ${
                    isActive ? "bg-white/[0.08] text-white" : "text-white/55 hover:text-white/85 hover:bg-white/[0.04]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-teal" />}
                    <Icon size={16.5} strokeWidth={2.2} className={isActive ? "text-teal" : ""} />
                    {n.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-6"><div className="h-px bg-white/10" /></div>

        <div className="px-5 py-5 relative">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[12.5px] font-bold shrink-0">
              {(user?.businessName || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold truncate">{user?.businessName}</div>
              <div className="text-[11px] text-white/45 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-1.5 justify-center text-[12px] font-semibold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg py-2 transition-colors">
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-ink-gradient shadow-panel">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-teal" />
          <span className="text-[13px] font-semibold">Administration</span>
        </div>
        <button onClick={handleLogout} className="text-[12px] font-semibold text-white/70">Déconnexion</button>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around py-2 bg-ink-gradient shadow-panel">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className="flex flex-col items-center gap-0.5 px-2 py-1">
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-teal" : "text-white/50"} />
                  <span className={`text-[9px] font-medium ${isActive ? "text-teal" : "text-white/45"}`}>{n.label.split(" ")[0]}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <main className="flex-1 min-w-0 pb-20 md:pb-0 pt-14 md:pt-0 bg-sand">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
