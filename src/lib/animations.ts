/**
 * Presets de animaciones reutilizables con Framer Motion.
 * Centraliza variantes para evitar duplicación entre componentes.
 */

import type { Variants } from "framer-motion";

/** Fade in + slide up */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

/** Fade in + slide up (versión corta para secciones) */
export const fadeInUpShort: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

/** Stagger container — envolver hijos para que animen escalonadamente */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

/** Slide desde la izquierda */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay },
  }),
};

/** Slide desde la derecha */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

/** Scale on hover — usar como whileHover */
export const scaleOnHover = {
  scale: 1.05,
};

/** Glow hover en botones/pills de categoría */
export const glowHover = {
  scale: 1.05,
  boxShadow: "0 0 20px rgba(0, 153, 255, 0.3)",
};

/** Tap shrink */
export const tapShrink = {
  scale: 0.97,
};

/** Animación de entrada del header */
export const headerEntry: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

/** Animación del menú móvil */
export const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

/** Transición del menú móvil */
export const mobileMenuTransition = { duration: 0.3, ease: "easeInOut" as const };

/** Animación de entrada escalonada para items del menú */
export const mobileMenuItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05 },
  }),
};
