"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "Nike", letter: "N" },
  { name: "Adidas", letter: "A" },
  { name: "Puma", letter: "P" },
  { name: "Under Armour", letter: "UA" },
  { name: "Reebok", letter: "R" },
  { name: "New Balance", letter: "NB" },
];

export default function Brands() {
  return (
    <section className="relative py-16 md:py-24 bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            Trusted By The Best
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Premium <span className="text-electric">Brands</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.05 }}
              className="group flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-electric/30 transition-all duration-500 cursor-pointer"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/5 flex items-center justify-center mb-3 transition-all duration-500 group-hover:bg-electric/10 group-hover:shadow-[0_0_20px_rgba(0,153,255,0.2)] grayscale group-hover:grayscale-0">
                <span className="text-xl md:text-2xl font-black text-white/30 group-hover:text-electric transition-colors duration-500">
                  {brand.letter}
                </span>
              </div>
              <span className="text-[10px] md:text-xs text-white/30 group-hover:text-white/70 transition-colors duration-500 font-semibold tracking-wider uppercase">
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
