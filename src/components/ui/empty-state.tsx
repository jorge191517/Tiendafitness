"use client";

import { motion } from "framer-motion";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { fadeInUp } from "@/lib/animations";

interface EmptyStateProps {
  /** Título principal */
  title?: string;
  /** Texto descriptivo */
  description?: string;
  /** Texto del botón principal */
  primaryAction?: string;
  /** Href del botón principal */
  primaryHref?: string;
  /** Mostrar botón de WhatsApp */
  showWhatsApp?: boolean;
  /** Mensaje personalizado de WhatsApp */
  whatsappMessage?: string;
  /** Etiqueta del botón de WhatsApp */
  whatsAppLabel?: string;
}

/**
 * Estado vacío reutilizable.
 *
 * Se usa cuando no hay productos, categorías o contenido.
 * Diseño premium con glassmorphism, animaciones suaves y CTAs útiles.
 * Solo debe mostrarse cuando products.length === 0.
 */
export default function EmptyState({
  title = "Sin Resultados",
  description = "No se encontraron productos en esta sección. Explora otras categorías o contáctanos para encontrar lo que buscas.",
  primaryAction = "Volver al Inicio",
  primaryHref = "/",
  showWhatsApp = true,
  whatsappMessage = "Hola, estoy buscando un producto que no aparece en la tienda. ¿Podéis ayudarme?",
  whatsAppLabel = "Consultar por WhatsApp",
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 md:py-24"
    >
      <div className="max-w-md w-full text-center rounded-2xl border border-electric/20 bg-electric/[0.03] backdrop-blur-sm p-8 md:p-10">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto mb-6">
          <Package className="h-8 w-8 text-electric" />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            asChild
            className="bg-electric hover:bg-electric/90 text-white font-bold py-5 text-sm rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider"
          >
            <a href={primaryHref}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {primaryAction}
            </a>
          </Button>

          {showWhatsApp && (
            <WhatsAppButton
              message={whatsappMessage}
              label={whatsAppLabel}
              variant="outline"
              className="py-5 text-sm rounded-xl"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
