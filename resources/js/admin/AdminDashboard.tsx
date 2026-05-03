import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  BarChart2,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Orb } from "../components/Orb";
import { useAdmin } from "./AdminStore";
import { AdminProducts } from "./AdminProducts";

/* ─── Sidebar item ─── */
function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-black/5 hover:text-neutral-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ─── Main Dashboard ─── */
export function AdminDashboard() {
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div
      className="relative min-h-[100svh] w-full"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% 20%, #ffffff 0%, #f4f5f7 45%, #e8eaee 100%)",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Background orbs (subtle, smaller than catalog) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <Orb className="-top-24 -left-24" size={260} />
        <Orb className="top-[40%] -right-32" size={340} delay={3} />
        <Orb className="bottom-[-10%] left-[30%]" size={260} delay={6} />
      </div>

      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col z-40"
        style={{
          background: "rgba(255,255,255,0.62)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          borderRight: "1px solid rgba(255,255,255,0.65)",
          boxShadow: "1px 0 0 rgba(0,0,0,0.03)",
        }}
      >
        {/* Logo */}
        <div className="p-6 pb-3">
          <Logo className="h-5 w-auto text-neutral-900" />
          <div className="mt-1.5 text-[9px] tracking-[0.35em] uppercase text-neutral-400">
            Admin Panel
          </div>
        </div>

        <div className="mx-5 h-px bg-neutral-900/6" />

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4">
          <SidebarItem
            icon={<Package className="h-4 w-4" />}
            label="Productos"
            active={true}
          />
        </nav>

        {/* Bottom nav */}
        <div className="p-3 pb-6 flex flex-col gap-0.5">
          <div className="mx-2 mb-2 h-px bg-neutral-900/6" />
          <SidebarItem
            icon={<ArrowLeft className="h-4 w-4" />}
            label="Ver tienda"
            onClick={() => navigate("/")}
          />
          <SidebarItem
            icon={<LogOut className="h-4 w-4" />}
            label="Cerrar sesión"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 px-3 pt-3">
        <div
          className="flex items-center justify-between rounded-2xl border border-white/50 px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            boxShadow: "0 8px 30px rgba(20,20,40,0.08)",
          }}
        >
          <Logo className="h-4 w-auto text-neutral-900" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mr-1">Productos</span>
            <button
              onClick={() => navigate("/")}
              className="rounded-lg p-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-900 transition flex items-center gap-1.5"
              title="Ver tienda"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 md:ml-56">
        <div className="min-h-[100svh] px-4 pt-[76px] pb-6 md:p-8 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <AdminProducts />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
