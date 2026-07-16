import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Wallet, Store, LogOut,
} from "lucide-react";
import { WaxStrip } from "./ui";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/produits", label: "Produits & Stock", icon: Package },
  { to: "/ventes", label: "Ventes", icon: ShoppingCart },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/factures", label: "Factures", icon: FileText },
  { to: "/finances", label: "Finances", icon: Wallet },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion");
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col text-white bg-ink">
        <div className="px-5 pt-6 pb-5 flex items-center gap-2 border-b border-white/10">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-gold">
            <Store size={17} color="#16213A" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-tight">BusinessOS</div>
            <div className="text-gold text-[11px] font-medium tracking-wide">SÉNÉGAL</div>
          </div>
        </div>
        <WaxStrip />
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                    isActive ? "bg-gold/15 text-gold" : "text-white/75 hover:bg-white/5"
                  }`
                }
              >
                <Icon size={16} strokeWidth={2.2} />
                {n.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-[12.5px] font-semibold truncate">{user?.businessName}</div>
          <div className="text-[11px] text-white/50 truncate mb-3">{user?.email}</div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white">
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around py-2 bg-ink">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className="flex flex-col items-center gap-0.5 px-2 py-1">
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? "#E4A83B" : "rgba(255,255,255,0.6)"} />
                  <span className={`text-[9px] ${isActive ? "text-gold" : "text-white/50"}`}>{n.label.split(" ")[0]}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 bg-sand">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
