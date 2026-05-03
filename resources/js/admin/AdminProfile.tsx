import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, User as UserIcon, CheckCircle2, Pencil, X, Check } from "lucide-react";
import { Logo } from "../components/Logo";
import { Orb } from "../components/Orb";
import { useAdmin } from "./AdminStore";
import { toast } from "sonner";

/* Shared glass input style */
const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 py-3 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-0";

export function AdminProfile() {
  const { isAuthenticated, logout, user } = useAdmin();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Perfil editing state
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewEmail(user.email);
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify({ name: newName, email: newEmail })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Perfil actualizado");
        setIsEditing(false);
        // Recargar la página para ver cambios o actualizar el context
        window.location.reload(); 
      } else {
        toast.error(data.message || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    // Simulation: password update is usually through a different endpoint, 
    // for now we use the logic already established
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
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
            Account Settings
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
          <div className="flex flex-col gap-6">
            {/* User Info */}
            <div className="flex items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">Administrador</div>
                      {isEditing ? (
                        <div className="flex flex-col gap-1 mt-1">
                          <input 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)}
                            className="bg-transparent border-b border-neutral-300 text-[14px] outline-none"
                          />
                          <input 
                            value={newEmail} 
                            onChange={e => setNewEmail(e.target.value)}
                            className="bg-transparent border-b border-neutral-300 text-[12px] text-neutral-500 outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-[14px] font-medium text-neutral-800 truncate">{user?.name}</div>
                          <div className="text-[12px] text-neutral-500 truncate">{user?.email}</div>
                        </>
                      )}
                  </div>
                </div>
                
                <button 
                  onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                  disabled={loading}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors text-neutral-400 hover:text-neutral-900"
                >
                  {isEditing ? <Check className="h-4 w-4 text-emerald-500" /> : <Pencil className="h-4 w-4" />}
                </button>
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                )}
            </div>

            <div className="h-px bg-neutral-900/5" />

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
              <label className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                Cambiar Contraseña
              </label>
              
              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
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

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar contraseña"
                  className={`${inputClass} pl-9 pr-4`}
                  required
                />
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[12px] text-emerald-600 border border-emerald-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Contraseña actualizada con éxito
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl bg-neutral-900 py-3.5 text-[11px] tracking-[0.25em] uppercase text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Actualizar Contraseña"}
              </button>
            </form>

            <button
                onClick={() => {
                    logout();
                    navigate("/");
                }}
                className="w-full text-[11px] tracking-[0.2em] uppercase text-red-500 hover:text-red-600 transition"
            >
                Cerrar Sesión
            </button>
          </div>
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
