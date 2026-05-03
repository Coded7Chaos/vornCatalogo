import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "../components/Logo";
import { Orb } from "../components/Orb";
import { toast } from "sonner";

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 py-3 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-0";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      toast.error("Enlace de recuperación inválido");
      navigate("/admin/login");
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Error al restablecer la contraseña");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(1200px 800px at 50% 20%, #ffffff 0%, #f4f5f7 45%, #e8eaee 100%)",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <Orb className="-top-24 -left-24" size={340} />
        <Orb className="top-[40%] -right-32" size={420} delay={3} />
        <Orb className="bottom-[-10%] left-[10%]" size={300} delay={6} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-4 w-full max-w-[400px]"
      >
        <div className="mb-10 flex flex-col items-center gap-3">
          <Logo className="h-7 w-auto text-neutral-900" />
          <div className="text-[10px] tracking-[0.38em] uppercase text-neutral-500">Nueva Contraseña</div>
        </div>

        <div
          className="rounded-3xl border border-white/60 p-8"
          style={{
            background: "rgba(255,255,255,0.68)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 24px 70px rgba(20,20,40,0.10)",
          }}
        >
          {success ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-[16px] font-medium text-neutral-900 mb-2">Contraseña actualizada</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed mb-6">
                Tu contraseña ha sido restablecida correctamente. Ya puedes acceder a tu cuenta.
              </p>
              <button
                onClick={() => navigate("/admin/login")}
                className="w-full rounded-xl bg-neutral-900 py-3.5 text-[11px] tracking-[0.25em] uppercase text-white transition hover:bg-neutral-700 flex items-center justify-center gap-2"
              >
                Iniciar sesión <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">Nueva Contraseña</label>
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pl-9 pr-4`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-neutral-900 py-3.5 text-[11px] tracking-[0.25em] uppercase text-white transition hover:bg-neutral-700 disabled:opacity-50"
              >
                {loading ? "Actualizando..." : "Restablecer contraseña"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
