"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { siteConfig } from "@/config/site";
import { fadeInUp } from "@/lib/animations";
import { submitContactForm, type ContactResult } from "./actions";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactoPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const result: ContactResult = await submitContactForm({
        nombre,
        email,
        telefono: telefono || undefined,
        mensaje,
      });

      if (result.success) {
        setFormState("success");
        setNombre("");
        setEmail("");
        setTelefono("");
        setMensaje("");
      } else {
        setFormState("error");
        setErrorMessage(result.error ?? "Error desconocido.");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    } catch {
      setFormState("error");
      setErrorMessage("Error de conexión. Inténtalo de nuevo.");
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]?.[0];
  };

  return (
    <div className="min-h-screen bg-deep">
      {/* Header spacer */}
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Ponte en <span className="text-electric">Contacto</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            Escríbenos, llámanos o envíanos un WhatsApp.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info cards */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-4"
          >
            {/* WhatsApp */}
            <Card className="bg-mid-gray border-white/5 hover:border-green-500/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">WhatsApp</h3>
                    <p className="text-white/40 text-sm mb-3">
                      Respuesta rápida y directa.
                    </p>
                    <WhatsAppButton
                      label="Abrir WhatsApp"
                      variant="default"
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-mid-gray border-white/5 hover:border-electric/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-electric" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Email</h3>
                    <a
                      href={`mailto:${siteConfig.contactEmail}`}
                      className="text-white/50 text-sm hover:text-electric transition-colors"
                    >
                      {siteConfig.contactEmail}
                    </a>
                    <p className="text-white/40 text-xs mt-1">Consultas generales</p>
                    <div className="mt-2">
                      <a
                        href={`mailto:${siteConfig.ordersEmail}`}
                        className="text-white/50 text-sm hover:text-electric transition-colors"
                      >
                        {siteConfig.ordersEmail}
                      </a>
                      <p className="text-white/40 text-xs mt-0.5">Pedidos y envíos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="bg-mid-gray border-white/5 hover:border-electric/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-electric" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Teléfono</h3>
                    <span className="text-white/50 text-sm">{siteConfig.phone}</span>
                    <p className="text-white/40 text-xs mt-1">Lunes a Viernes, 9:00 – 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Online badge */}
            <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-lime/5 border border-lime/20">
              <span className="text-lime text-sm font-semibold">Atención Online</span>
              <span className="text-white/30 text-sm">— Sin tienda física</span>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3"
          >
            <Card className="bg-mid-gray border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Send className="h-5 w-5 text-electric" />
                  Envíanos un Mensaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Success state */}
                {formState === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-lime" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      ¡Mensaje Enviado!
                    </h3>
                    <p className="text-white/50 text-sm mb-6">
                      Hemos recibido tu mensaje. Te responderemos lo antes posible.
                    </p>
                    <Button
                      onClick={() => setFormState("idle")}
                      variant="outline"
                      className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    >
                      Enviar otro mensaje
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error general */}
                    {formState === "error" && errorMessage && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                        <p className="text-sm text-red-300">{errorMessage}</p>
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-white/70 text-sm">
                        Nombre completo *
                      </Label>
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Tu nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className={`bg-dark-gray border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20 ${
                          getFieldError("nombre") ? "border-red-500" : ""
                        }`}
                      />
                      {getFieldError("nombre") && (
                        <p className="text-xs text-red-400">{getFieldError("nombre")}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/70 text-sm">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`bg-dark-gray border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20 ${
                            getFieldError("email") ? "border-red-500" : ""
                          }`}
                        />
                        {getFieldError("email") && (
                          <p className="text-xs text-red-400">{getFieldError("email")}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-white/70 text-sm">
                          Teléfono
                          <span className="text-white/30 text-xs ml-1">(opcional)</span>
                        </Label>
                        <Input
                          id="telefono"
                          type="tel"
                          placeholder="633 000 000"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          className={`bg-dark-gray border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20 ${
                            getFieldError("telefono") ? "border-red-500" : ""
                          }`}
                        />
                        {getFieldError("telefono") && (
                          <p className="text-xs text-red-400">{getFieldError("telefono")}</p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="mensaje" className="text-white/70 text-sm">
                        Mensaje *
                      </Label>
                      <Textarea
                        id="mensaje"
                        placeholder="Escribe tu mensaje aquí..."
                        rows={5}
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        className={`bg-dark-gray border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20 resize-none ${
                          getFieldError("mensaje") ? "border-red-500" : ""
                        }`}
                      />
                      {getFieldError("mensaje") && (
                        <p className="text-xs text-red-400">{getFieldError("mensaje")}</p>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={
                        formState === "loading" ||
                        !nombre.trim() ||
                        !email.trim() ||
                        !mensaje.trim()
                      }
                      className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-6 text-base rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {formState === "loading" ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
