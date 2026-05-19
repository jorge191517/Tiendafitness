"use client";

import { motion } from "framer-motion";
import { categories, categoryIcons } from "@/data/categories";
import { fadeInUpShort, glowHover, tapShrink } from "@/lib/animations";

export default function CategoryBar() {
  return (
    <section id="categories" className="relative py-8 md:py-12 bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
        >
          {categories.map((category, i) => {
            const Icon = categoryIcons[category.slug];
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={glowHover}
                whileTap={tapShrink}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-electric/50 hover:bg-electric/10 transition-all duration-300 cursor-pointer font-medium text-sm md:text-base"
              >
                {Icon && <Icon className="h-4 w-4 md:h-5 md:w-5" />}
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
