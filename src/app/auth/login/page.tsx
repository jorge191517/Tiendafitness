"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fadeInUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Traducir errores comunes de Supabase al español
        const errorMessages: Record<string, string> = {
          "Invalid login credentials":
            "Credenciales de inicio de sesión inválidas",
          "Email not confirmed": "Credenciales inválidas. Verifica tu correo y contraseña.",
          "Too many requests": "Demasiados intentos. Intenta de nuevo más tarde",
          "User not found": "Usuario no encontrado",
          "Invalid password": "Contraseña incorrecta",
        };
        setError(
          errorMessages[authError.message] ||
            "Error al iniciar sesión. Inténtalo de nuevo."
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep px-4 py-12 relative w-full">
      {/* Fondo decorativo — radial-gradient (no blur filter = no overflow) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(0,153,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(170,255,0,0.05) 0%, transparent 50%)" }}
      />

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Card glassmorphism */}
        <div className="bg-mid-gray/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
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
              Iniciar Sesión
            </h1>
            <p className="text-white/50 text-sm mt-2">
              Accede a tu cuenta para continuar comprando
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
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-white/70 text-sm font-medium"
                >
                  Contraseña
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-electric hover:text-electric/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-electric focus-visible:ring-electric/30 h-11"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-electric hover:bg-electric/90 text-white font-semibold text-base shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.4)] transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-mid-gray/80 px-3 text-white/40">o</span>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-white/50">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="text-electric hover:text-electric/80 font-semibold transition-colors"
            >
              Regístrate aquí
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
