"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Zap, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
// Welcome email se envía vía API route (/api/auth/welcome-email), no mediante Server Action directo
import { fadeInUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError("El nombre completo es obligatorio");
      return false;
    }
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        console.warn("[REGISTER] Error de Supabase:", authError.message);
        const errorMessages: Record<string, string> = {
          "User already registered":
            "Este correo electrónico ya está registrado. Inicia sesión o usa otro correo.",
          "Password should be at least 6 characters":
            "La contraseña debe tener al menos 6 caracteres",
          "Email not valid": "Correo electrónico no válido",
          "Too many requests": "Demasiados intentos. Intenta de nuevo más tarde",
          "Signup requires a valid email":
            "Se requiere un correo electrónico válido",
        };
        setError(
          errorMessages[authError.message] ||
            "Error al crear la cuenta. Inténtalo de nuevo."
        );
        return;
      }

      // Registro exitoso
      console.log("[REGISTER] Usuario creado:", email);

      // Enviar email de bienvenida vía API route (fire-and-forget, no bloquea el registro)
      if (data.user?.email) {
        const welcomeName = data.user.user_metadata?.full_name || fullName;
        const welcomeEmail = data.user.email;
        console.log("[REGISTER] Solicitando email bienvenida para:", welcomeEmail);
        fetch("/api/auth/welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: welcomeName, userEmail: welcomeEmail }),
        })
          .then(async (res) => {
            const result = await res.json();
            console.log("[REGISTER] Respuesta email bienvenida:", result.ok ? "OK" : "FALLÓ", result);
          })
          .catch((err) => {
            console.warn("[REGISTER] Error fetch email bienvenida:", err);
          });
      }

      // Siempre mostrar la pantalla de éxito, sin importar si hay sesión o no.
      // El usuario pulsa los botones manualmente para navegar.
      setSuccess(true);
    } catch (err) {
      console.error("[REGISTER] Error inesperado:", err);
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito después del registro
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-electric/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-lime/3 rounded-full blur-[120px]" />
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            {/* Icono de éxito */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-lime/30"
            >
              <CheckCircle2 className="h-10 w-10 text-lime" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-3">
              ¡Cuenta creada correctamente!
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Gracias por registrarte en TiendaFitnessPro. Ya puedes iniciar
              sesión con el correo y contraseña que acabas de crear.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full h-12 bg-electric hover:bg-electric/90 text-white font-semibold text-base shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.4)] transition-all duration-300 cursor-pointer"
              >
                Iniciar sesión
              </Button>
              <Button
                onClick={() => router.push("/productos")}
                variant="outline"
                className="w-full h-12 border-lime/40 text-lime hover:bg-lime/10 font-semibold text-base transition-all duration-300 cursor-pointer"
              >
                Ver productos
              </Button>
            </div>

            <p className="text-white/30 text-xs mt-6">
              Te hemos enviado un email de bienvenida a{" "}
              <span className="text-white/50">{email}</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-12 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lime/3 rounded-full blur-[150px]" />
      </div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Card glassmorphism */}
        <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-electric rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,153,255,0.5)]">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold text-lg tracking-tight leading-none">
                  TiendaFitness
                  <span className="text-electric">Pro</span>
                </span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mt-6">
              Crear Cuenta
            </h1>
            <p className="text-white/50 text-sm mt-2">
              Únete a la comunidad deportiva premium
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-white/70 text-sm font-medium"
              >
                Nombre completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-electric focus-visible:ring-electric/30 h-11"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-white/70 text-sm font-medium"
              >
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-electric focus-visible:ring-electric/30 h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-white/70 text-sm font-medium"
              >
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-electric focus-visible:ring-electric/30 h-11"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-white/70 text-sm font-medium"
              >
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-electric focus-visible:ring-electric/30 h-11"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-lime hover:bg-lime/90 text-deep font-semibold text-base shadow-[0_0_30px_rgba(170,255,0,0.2)] hover:shadow-[0_0_40px_rgba(170,255,0,0.3)] transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1e293b]/90 px-3 text-white/40">o</span>
            </div>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-white/50">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-electric hover:text-electric/80 font-semibold transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Volver al inicio */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
