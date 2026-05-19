"use client";

import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
} from "lucide-react";

const footerLinks = {
  navigation: [
    { name: "Inicio", href: "#" },
    { name: "Productos", href: "#products" },
    { name: "Categorías", href: "#categories" },
    { name: "Ofertas", href: "#offers" },
    { name: "Contacto", href: "#contact" },
  ],
  categories: [
    { name: "Fitness y Gym", href: "#" },
    { name: "Pádel", href: "#" },
    { name: "Ropa Deportiva", href: "#" },
    { name: "Accesorios", href: "#" },
    { name: "Suplementos", href: "#" },
  ],
  socials: [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
  ],
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative bg-[#030303] border-t border-white/5">
      {/* Electric blue glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-electric rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,153,255,0.3)]">
                <span className="text-white font-black text-sm">TF</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">
                  TiendaFitness<span className="text-electric">Pro</span>
                </span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              Tu destino premium para equipamiento deportivo, ropa y
              suplementos. Eleva tu rendimiento con las mejores marcas.
            </p>
            <div className="flex items-center gap-3">
              {footerLinks.socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-electric hover:border-electric/40 hover:bg-electric/10 hover:shadow-[0_0_15px_rgba(0,153,255,0.2)] transition-all duration-300"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Navigation column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-electric rounded-full" />
              Navegación
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors duration-300 hover:pl-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-lime rounded-full" />
              Categorías
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors duration-300 hover:pl-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-electric rounded-full" />
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-sm">
                  Av. del Deporte 123, Madrid, España
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-sm">+34 900 123 456</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-sm">
                  info@tiendafitnesspro.com
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs md:text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} TiendaFitnessPro. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Términos de Servicio
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Cookies
            </a>
          </div>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-electric hover:border-electric/40 hover:bg-electric/10 hover:shadow-[0_0_15px_rgba(0,153,255,0.2)] transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
