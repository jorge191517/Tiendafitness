"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Award,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: ShieldCheck, label: "Guaranteed Quality" },
  { icon: Truck, label: "Fast Shipping" },
  { icon: Award, label: "Premium Brands" },
  { icon: Headphones, label: "Personalized Support" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      {/* Gradient overlay - dark from left, transparent on right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-50% to-black/30" />

      {/* Subtle blue glow accent */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-electric/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-lime/5 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 md:py-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="mb-4 md:mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs md:text-sm font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-electric rounded-full animate-pulse" />
              New Collection 2026
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tight mb-4 md:mb-6"
          >
            <span className="text-white">YOUR BEST</span>
            <br />
            <span className="text-white">VERSION </span>
            <span className="text-electric glow-blue-text">STARTS</span>
            <br />
            <span className="text-lime glow-lime-text">HERE</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg lg:text-xl text-white/60 max-w-lg mb-6 md:mb-8 leading-relaxed"
          >
            High-quality sports products for every workout, every match, and
            every goal.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3 md:gap-4 mb-10 md:mb-14"
          >
            <Button
              asChild
              className="bg-electric hover:bg-electric/90 text-white font-bold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider group"
            >
              <a href="#products">
                Shop Now
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 hover:border-lime/50 text-white hover:text-lime font-bold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base rounded-xl bg-white/5 hover:bg-lime/5 transition-all duration-300 uppercase tracking-wider"
            >
              <a href="#categories">Explore Categories</a>
            </Button>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
          >
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 md:gap-3 group cursor-default"
              >
                <div className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-electric/40 group-hover:bg-electric/10 group-hover:shadow-[0_0_15px_rgba(0,153,255,0.2)]">
                  <feature.icon className="h-4 w-4 md:h-5 md:w-5 text-white/60 group-hover:text-electric transition-colors duration-300" />
                </div>
                <span className="text-[11px] md:text-xs text-white/40 font-medium leading-tight group-hover:text-white/70 transition-colors duration-300">
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep to-transparent" />
    </section>
  );
}
