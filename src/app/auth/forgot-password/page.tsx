"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fadeInUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      );

      if (authError) {
        const errorMessages: Record<string, string> = {
          "Email not found": "No existe una cuenta con este correo electrónico",
          "Too many requests":
            "Demasiados intentos. Intenta de nuevo más tarde",
          "Invalid email": "Correo electrónico no válido",
        };
        setError(
          errorMessages[authError.message] ||
            "Error al enviar el email. Inténtalo de nuevo."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime/5 rounded-full blur-[100px]" />
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-electric" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Email enviado
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Te hemos enviado un enlace para restablecer tu contraseña a{" "}
              <span className="text-electric font-medium">{email}</span>.
              Revisa también tu carpeta de spam.
            </p>
            <Button
              onClick={() => (window.location.href = "/auth/login")}
              className="w-full h-11 bg-electric hover:bg-electric/90 text-white font-semibold shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.4)] transition-all duration-300 cursor-pointer"
            >
              Volver a Iniciar Sesión
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-12 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-electric/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-lime/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/2 w-[500px] h-[500px] bg-electric/3 rounded-full blur-[150px]" />
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
              Recuperar Contraseña
            </h1>
            <p className="text-white/50 text-sm mt-2">
              Introduce tu email y te enviaremos un enlace para restablecer tu
              contraseña
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

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-electric hover:bg-electric/90 text-white font-semibold text-base shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.4)] transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                "Enviar Enlace de Recuperación"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
          </div>

          {/* Back to login */}
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-electric transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
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
