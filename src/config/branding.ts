/**
 * Configuración de branding.
 * Centraliza colores, slogans y textos reutilizables del sitio.
 */

export const brandingConfig = {
  /** Colores principales (coinciden con Tailwind custom colors) */
  colors: {
    electric: "#0099FF",
    lime: "#AAFF00",
    deep: "#050505",
    darkGray: "#111111",
    midGray: "#1A1A1A",
  },

  /** Slogans y textos de marketing */
  slogans: {
    hero: {
      eyebrow: "Nueva Colección 2026",
      headline: {
        line1: "TU MEJOR",
        line2Pre: "VERSIÓN ",
        line2Highlight: "EMPIEZA",
        line3: "AQUÍ",
      },
      subheadline:
        "Productos deportivos de alta calidad para cada entrenamiento, cada partido y cada objetivo.",
    },
    promo: {
      eyebrow: "Oferta por Tiempo Limitado",
      headline: {
        line1: "Entrena Como un",
        line2: "Profesional",
      },
      description:
        "Hasta un 40% de descuento en equipamiento profesional. Eleva tu entrenamiento con material de confianza para campeones.",
    },
    products: {
      eyebrow: "Productos Destacados",
      title: "Lo Mejor de la Semana",
      description:
        "Selección curada del mejor equipamiento deportivo y suplementos para un rendimiento máximo.",
    },
    brands: {
      eyebrow: "La Confianza de los Mejores",
      title: "Marcas Premium",
    },
    features: [
      { label: "Calidad Garantizada" },
      { label: "Envío Rápido" },
      { label: "Marcas Premium" },
      { label: "Soporte Personalizado" },
    ],
  },

  /** Textos de botones CTA */
  cta: {
    shopNow: "Comprar Ahora",
    exploreCategories: "Explorar Categorías",
    addToCart: "Añadir al Carrito",
    login: "Iniciar Sesión / Registrarse",
    scrollToTop: "Volver arriba",
  },
} as const;
