/**
 * Configuración global del sitio.
 * Centraliza nombre, dominio, descripción y datos de contacto.
 */

export const siteConfig = {
  /** Nombre visible del sitio */
  name: "TiendaFitnessPro",
  /** Marca corta para el logo */
  brandShort: "TF",
  /** Subtítulo bajo el logo */
  tagline: "Tienda Deportiva",
  /** Dominio de producción */
  url: "https://tiendafitnesspro.es",
  /** Descripción general del sitio */
  description:
    "Tienda premium de deporte. Productos deportivos de alta calidad para cada entrenamiento, cada partido y cada objetivo. Equipamiento de fitness, ropa deportiva, suplementos y accesorios.",
  /** Email de contacto general */
  contactEmail: "contacto@tiendafitnesspro.es",
  /** Email para pedidos */
  ordersEmail: "pedidos@tiendafitnesspro.es",
  /** Email legado (compatibilidad) */
  email: "contacto@tiendafitnesspro.es",
  /** Teléfono de contacto (WhatsApp) */
  phone: "633 184 354",
  /** Número WhatsApp en formato internacional (sin +) */
  whatsappNumberInternational: "34633184354",
  /** Modelo de negocio (sin tienda física) */
  businessModel: "Tienda online" as const,
  /** Redes sociales */
  socials: {
    instagram: "https://instagram.com/tiendafitnesspro",
    twitter: "https://twitter.com/tiendafitnesspro",
    facebook: "https://facebook.com/tiendafitnesspro",
    youtube: "https://youtube.com/@tiendafitnesspro",
  },
  /** Moneda */
  currency: "EUR",
  /** Símbolo de moneda */
  currencySymbol: "€",
  /** Locale principal */
  locale: "es-ES",
} as const;
