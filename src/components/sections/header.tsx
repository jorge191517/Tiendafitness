"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Inicio", href: "#" },
  { name: "Productos", href: "#products" },
  { name: "Categorías", href: "#categories" },
  { name: "Ofertas", href: "#offers" },
  { name: "Contacto", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-electric rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,153,255,0.5)]">
                <span className="text-white font-black text-sm md:text-lg">TF</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm md:text-lg tracking-tight leading-none">
                TiendaFitness
                <span className="text-electric">Pro</span>
              </span>
              <span className="text-[10px] md:text-xs text-white/40 tracking-widest uppercase">
                Tienda Deportiva
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-electric rounded-full transition-all duration-300 group-hover:w-6 group-hover:shadow-[0_0_10px_rgba(0,153,255,0.5)]" />
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
            >
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 bg-electric rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,153,255,0.5)]">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden glass overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                >
                  {link.name}
                </motion.a>
              ))}
              <div className="pt-2 border-t border-white/10 mt-2">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                >
                  <User className="h-5 w-5" />
                  Iniciar Sesión / Registrarse
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
