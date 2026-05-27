"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Award,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { brandingConfig } from "@/config/branding";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const featureIcons = [ShieldCheck, Truck, Award, Headphones];

export default function Hero() {
  const slogans = brandingConfig?.slogans ?? {};
  const cta = brandingConfig?.cta ?? {};
  const hero = slogans?.hero ?? {};
  const heroHeadline = hero?.headline ?? {};
  const features = slogans?.features ?? [];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero/hero-bg.png')" }}
      />

      {/* Gradient overlay — slate-toned */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/85 via-50% to-[#0f172a]/40" />

      {/* Subtle glow accents */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-electric/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-lime/6 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28 sm:py-32 md:py-0">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeInUp} className="mb-5 md:mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs md:text-sm font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-electric rounded-full animate-pulse" />
              {hero?.eyebrow ?? ''}
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tight mb-5 md:mb-6"
          >
            <span className="text-white">{heroHeadline?.line1 ?? ''}</span>
            <br />
            <span className="text-white">{heroHeadline?.line2Pre ?? ''}</span>
            <span className="text-electric glow-blue-text">{heroHeadline?.line2Highlight ?? ''}</span>
            <br />
            <span className="text-lime glow-lime-text">{heroHeadline?.line3 ?? ''}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg lg:text-xl text-white/65 max-w-lg mb-8 md:mb-8 leading-relaxed"
          >
            {hero?.subheadline ?? ''}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-3 md:gap-4 mb-10 md:mb-14"
          >
            <Button
              asChild
              className="bg-electric hover:bg-electric/90 text-white font-bold px-7 md:px-8 py-5 md:py-6 text-sm md:text-base rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider group"
            >
              <a href="#products">
                {cta?.shopNow ?? 'Comprar Ahora'}
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 hover:border-lime/50 text-white hover:text-lime font-bold px-7 md:px-8 py-5 md:py-6 text-sm md:text-base rounded-xl bg-white/5 hover:bg-lime/5 transition-all duration-300 uppercase tracking-wider"
            >
              <a href="#categories">{cta?.exploreCategories ?? 'Explorar Categorías'}</a>
            </Button>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-2.5 md:gap-3 group cursor-default"
                >
                  <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#1e293b] border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-electric/40 group-hover:bg-electric/10 group-hover:shadow-[0_0_15px_rgba(0,153,255,0.2)]">
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-white/60 group-hover:text-electric transition-colors duration-300" />
                  </div>
                  <span className="text-[11px] md:text-xs text-white/50 font-medium leading-tight group-hover:text-white/70 transition-colors duration-300">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade — slate */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep to-transparent" />
    </section>
  );
}
