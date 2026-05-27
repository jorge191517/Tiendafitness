"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brandingConfig } from "@/config/branding";
import { fadeInUp, slideLeft } from "@/lib/animations";

export default function PromoBanner() {
  const { slogans, cta } = brandingConfig;

  return (
    <section id="offers" className="relative py-16 md:py-24 bg-deep w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[400px] flex items-center w-full"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#002b59] via-[#003c7d] to-[#002b59]" />

          {/* Neon glow effects — radial-gradient (no blur filter = no overflow) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 25% 0%, rgba(0,153,255,0.12) 0%, transparent 50%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 75% 100%, rgba(170,255,0,0.12) 0%, transparent 50%)" }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Decorative diagonal lines */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-electric to-transparent"
                style={{
                  top: `${i * 14}%`,
                  left: "-20%",
                  right: "-20%",
                  transform: "rotate(-30deg)",
                }}
              />
            ))}
          </div>

          {/* Border glow */}
          <div className="absolute inset-0 rounded-3xl border border-electric/25 neon-border" />

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 lg:px-16 py-10 md:py-16 max-w-2xl">
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.2}
              className="flex items-center gap-2 mb-4 md:mb-6"
            >
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-lime fill-lime" />
              <span className="text-lime font-bold text-xs md:text-sm uppercase tracking-widest">
                {slogans.promo.eyebrow}
              </span>
            </motion.div>

            <motion.h2
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.3}
              className="text-3xl md:text-4xl lg:text-6xl font-black text-white uppercase leading-tight mb-4 md:mb-6"
            >
              {slogans.promo.headline.line1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-lime">
                {slogans.promo.headline.line2}
              </span>
            </motion.h2>

            <motion.p
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.4}
              className="text-white/75 text-sm md:text-lg mb-6 md:mb-8 max-w-md"
            >
              {slogans.promo.description}
            </motion.p>

            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.5}
            >
              <Button
                asChild
                className="bg-gradient-to-r from-electric to-electric/80 hover:from-electric/90 hover:to-electric/70 text-white font-bold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.4)] hover:shadow-[0_0_50px_rgba(0,153,255,0.6)] transition-all duration-300 uppercase tracking-wider group"
              >
                <a href="#products">
                  {cta.shopNow}
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
