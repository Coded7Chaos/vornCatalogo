import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Logo } from "../components/Logo";
import { Orb } from "../components/Orb";
import { toast } from "sonner";

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 py-3 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-0";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Error al enviar el correo");
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
          <div className="text-[10px] tracking-[0.38em] uppercase text-neutral-500">Recuperar Acceso</div>
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
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-[16px] font-medium text-neutral-900 mb-2">Correo enviado</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed mb-6">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
              </p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-[12px] font-medium text-neutral-900 hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <p className="text-[13px] text-neutral-500 leading-relaxed text-center px-2">
                Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vorn.com"
                    className={`${inputClass} pl-9 pr-4`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-neutral-900 py-3.5 text-[11px] tracking-[0.25em] uppercase text-white transition hover:bg-neutral-700 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-7 text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-neutral-500 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
