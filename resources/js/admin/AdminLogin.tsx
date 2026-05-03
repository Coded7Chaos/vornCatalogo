import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { Logo } from "../components/Logo";
import { Orb } from "../components/Orb";
import { useAdmin } from "./AdminStore";

/* Shared glass input style */
const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 py-3 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-0";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Pequeña espera para feedback visual de la carga
      await new Promise((r) => setTimeout(r, 600));
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% 20%, #ffffff 0%, #f4f5f7 45%, #e8eaee 100%)",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <Orb className="-top-24 -left-24" size={340} />
        <Orb className="top-[40%] -right-32" size={420} delay={3} />
        <Orb className="bottom-[-10%] left-[10%]" size={300} delay={6} />
      </div>

      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-4 w-full max-w-[400px]"
      >
        {/* Logo + title */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <Logo className="h-7 w-auto text-neutral-900" />
          <div className="text-[10px] tracking-[0.38em] uppercase text-neutral-500">
            Administrator Access
          </div>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl border border-white/60 p-8"
          style={{
            background: "rgba(255,255,255,0.68)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.9) inset, 0 24px 70px rgba(20,20,40,0.10)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className={`${inputClass} pl-9 pr-4`}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-9 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-2.5 text-[12px] text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-neutral-900 py-3.5 text-[11px] tracking-[0.25em] uppercase text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verificando
                </span>
              ) : (
                "Acceder al Dashboard"
              )}
            </button>
            
            <div className="text-center mt-2">
              <Link
                to="/admin/forgot-password"
                className="text-[11px] text-neutral-400 hover:text-neutral-600 transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        {/* Back to store */}
        <div className="mt-7 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-neutral-500 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver a la tienda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
