"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromoBanner() {
  return (
    <section id="offers" className="relative py-16 md:py-24 bg-deep overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[400px] flex items-center"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a33] via-[#002244] to-[#001a33]" />

          {/* Neon glow effects */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-electric/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-lime/8 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-electric/15 rounded-full blur-[60px]" />

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
          <div className="absolute inset-0 rounded-3xl border border-electric/20 neon-border" />

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 lg:px-16 py-10 md:py-16 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 mb-4 md:mb-6"
            >
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-lime fill-lime" />
              <span className="text-lime font-bold text-xs md:text-sm uppercase tracking-widest">
                Limited Time Offer
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-6xl font-black text-white uppercase leading-tight mb-4 md:mb-6"
            >
              Train Like a
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-lime">
                Professional
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white/50 text-sm md:text-lg mb-6 md:mb-8 max-w-md"
            >
              Get up to 40% off on professional-grade equipment. Elevate your
              training with gear trusted by champions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                asChild
                className="bg-gradient-to-r from-electric to-electric/80 hover:from-electric/90 hover:to-electric/70 text-white font-bold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.4)] hover:shadow-[0_0_50px_rgba(0,153,255,0.6)] transition-all duration-300 uppercase tracking-wider group"
              >
                <a href="#products">
                  Shop Now
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
