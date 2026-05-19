"use client";

import { motion } from "framer-motion";
import {
  PackageSearch,
  Headphones,
  Truck,
  BadgePercent,
} from "lucide-react";
import { fadeInUpShort } from "@/lib/animations";

const reasons = [
  {
    icon: PackageSearch,
    title: "Productos Seleccionados",
    description:
      "Cada artículo de nuestro catálogo ha sido cuidadosamente elegido entre proveedores internacionales para asegurar funcionalidad y durabilidad en cada entrenamiento.",
  },
  {
    icon: Headphones,
    title: "Atención Personalizada",
    description:
      "Nuestro equipo está disponible por WhatsApp y email para resolver cualquier duda sobre productos, tallajes, envíos o recomendaciones adaptadas a ti.",
  },
  {
    icon: Truck,
    title: "Envíos Rápidos",
    description:
      "Recibe tus pedidos en tu domicilio sin complicaciones. Trabajamos para que el tiempo de entrega sea lo más breve posible en toda la península.",
  },
  {
    icon: BadgePercent,
    title: "Precios Competitivos",
    description:
      "Al trabajar directamente con proveedores seleccionados, podemos ofrecerte equipamiento de calidad a precios que se ajustan a todos los presupuestos.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-16 md:py-24 bg-[#030303]">
      {/* Glow line separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-lime/5 border border-lime/20 text-lime text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            Nuestra Diferencia
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
            ¿Por qué elegir{" "}
            <span className="text-lime">TiendaFitnessPro</span>?
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
            Más que una tienda online, somos tu aliado en el rendimiento deportivo.
          </p>
        </motion.div>

        {/* Reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-lime/20 transition-all duration-500"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center transition-all duration-500 group-hover:bg-lime/20 group-hover:shadow-[0_0_20px_rgba(170,255,0,0.15)]">
                  <Icon className="h-6 w-6 text-lime" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm md:text-base mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
