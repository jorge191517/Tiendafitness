/**
 * Configuración SEO centralizada.
 * layout.tsx y las páginas consumen este archivo para generar metadata.
 */

import type { Metadata } from "next";
import { siteConfig } from "./site";

export const seoConfig: Metadata = {
  title: {
    default: `${siteConfig.name} - Tu Mejor Versión Empieza Aquí`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "tienda de deporte",
    "fitness",
    "equipamiento de gimnasio",
    "pádel",
    "ropa deportiva",
    "suplementos",
    "TiendaFitnessPro",
    "deporte online",
    "comprar deporte",
  ],
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: `${siteConfig.name} - Tu Mejor Versión Empieza Aquí`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Tu Mejor Versión Empieza Aquí`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};
