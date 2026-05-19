/**
 * Configuración de navegación.
 * Centraliza todos los links de navegación del sitio.
 */

export interface NavLink {
  label: string;
  href: string;
}

/** Navegación principal del header */
export const navigationLinks: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Categorías", href: "/productos" },
  { label: "Ofertas", href: "/productos" },
  { label: "Contacto", href: "/contacto" },
];

/** Links del footer — navegación */
export const footerNavigationLinks: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Categorías", href: "/productos" },
  { label: "Ofertas", href: "/productos" },
  { label: "Contacto", href: "/contacto" },
];

/** Links del footer — legales */
export const footerLegalLinks: NavLink[] = [
  { label: "Política de Privacidad", href: "/privacidad" },
  { label: "Términos de Servicio", href: "/terminos" },
  { label: "Cookies", href: "/cookies" },
];
