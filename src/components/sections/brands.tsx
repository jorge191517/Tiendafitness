"use client";

import { motion } from "framer-motion";
import { Dumbbell, Zap, Shirt, Trophy, Flame, Target } from "lucide-react";
import { fadeInUpShort, scaleOnHover } from "@/lib/animations";

const categories = [
  { name: "Fuerza", icon: Dumbbell, color: "text-electric" },
  { name: "Rendimiento", icon: Zap, color: "text-lime" },
  { name: "Ropa Deportiva", icon: Shirt, color: "text-yellow-400" },
  { name: "Competicion", icon: Trophy, color: "text-orange-400" },
  { name: "Resistencia", icon: Flame, color: "text-red-400" },
  { name: "Precisión", icon: Target, color: "text-purple-400" },
];

export default function Brands() {
  return (
    <section className="relative py-16 md:py-24 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1e293b] border border-white/10 text-white/50 text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            Equipamiento para cada objetivo
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Productos para <span className="text-electric">cada deporte</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.a
                key={cat.name}
                href="/productos"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={scaleOnHover}
                className="group flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl bg-[#1e293b] border border-white/[0.06] hover:border-electric/30 transition-all duration-500 cursor-pointer shadow-md shadow-black/10"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#111827] flex items-center justify-center mb-3 transition-all duration-500 group-hover:bg-electric/10 group-hover:shadow-[0_0_20px_rgba(0,153,255,0.2)] border border-white/[0.06]">
                  <Icon className={`h-6 w-6 md:h-7 md:w-7 text-white/30 group-hover:${cat.color} transition-colors duration-500`} />
                </div>
                <span className="text-[10px] md:text-xs text-white/40 group-hover:text-white/70 transition-colors duration-500 font-semibold tracking-wider uppercase">
                  {cat.name}
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
