"use client";

import { motion } from "framer-motion";
import { Search, ShieldCheck, TrendingDown, Sparkles } from "lucide-react";
import { fadeInUpShort } from "@/lib/animations";

const valueBlocks = [
  {
    icon: Search,
    title: "Selección de Productos",
    description:
      "Cada artículo es seleccionado por nuestro equipo buscando funcionalidad, diseño y durabilidad para tu entrenamiento.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad Revisada",
    description:
      "Todos los productos pasan por un proceso de verificación antes de llegar a tus manos para garantizar tu satisfacción.",
  },
  {
    icon: TrendingDown,
    title: "Precios Competitivos",
    description:
      "Trabajamos con proveedores internacionales seleccionados para ofrecerte las mejores relaciones calidad-precio del mercado.",
  },
  {
    icon: Sparkles,
    title: "Marca Propia en Desarrollo",
    description:
      "Estamos desarrollando nuestra propia línea de productos deportivos diseñados por y para deportistas como tú.",
  },
];

export default function PrivateLabel() {
  return (
    <section className="relative py-16 md:py-24 bg-deep">
      {/* Subtle glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-electric/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-electric/5 border border-electric/20 text-electric text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            Nuestro Compromiso
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
            Productos Seleccionados para tu{" "}
            <span className="text-electric">Rendimiento</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Trabajamos con proveedores especializados y productos seleccionados
            para ofrecer equipamiento deportivo funcional, moderno y competitivo.
          </p>
        </motion.div>

        {/* Value blocks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueBlocks.map((block, i) => {
            const Icon = block.icon;
            return (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl bg-white/[0.02] border border-white/5 hover:border-electric/30 transition-all duration-500 p-6 md:p-8 text-center"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-electric/0 group-hover:bg-electric/5 transition-colors duration-500" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-electric/10 flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:bg-electric/20 group-hover:shadow-[0_0_20px_rgba(0,153,255,0.2)]">
                    <Icon className="h-6 w-6 text-electric" />
                  </div>
                  <h3 className="text-white font-bold text-sm md:text-base mb-3">
                    {block.title}
                  </h3>
                  <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                    {block.description}
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
