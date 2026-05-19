"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { fadeInUpShort } from "@/lib/animations";

export default function ComingSoon() {
  return (
    <section className="relative py-16 md:py-24 bg-deep">
      {/* Glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-electric/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-lime/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center rounded-2xl border border-electric/20 bg-electric/[0.03] backdrop-blur-sm p-8 md:p-12"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-electric" />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
            Próximamente <span className="text-electric">Más Productos</span>
          </h2>

          {/* Description */}
          <p className="text-white/50 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-8">
            Estamos preparando el catálogo de TiendaFitnessPro. Nuevos productos
            deportivos estarán disponibles pronto: equipamiento de fitness,
            pádel, accesorios y mucho más.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-electric hover:bg-electric/90 text-white font-bold px-8 py-5 text-sm rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider"
            >
              <a href="/productos">
                <Sparkles className="h-4 w-4 mr-2" />
                Explorar Catálogo
              </a>
            </Button>
            <WhatsAppButton
              label="Solicitar un Producto"
              variant="outline"
              className="px-8 py-5 text-sm rounded-xl uppercase tracking-wider"
              message="Hola, me gustaría saber cuándo estarán disponibles más productos en TiendaFitnessPro."
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
