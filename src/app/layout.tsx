import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TiendaFitnessPro - Tu Mejor Versión Empieza Aquí",
  description:
    "Tienda premium de deporte. Productos deportivos de alta calidad para cada entrenamiento, cada partido y cada objetivo. Equipamiento de fitness, ropa deportiva, suplementos y accesorios.",
  keywords: [
    "tienda de deporte",
    "fitness",
    "equipamiento de gimnasio",
    "pádel",
    "ropa deportiva",
    "suplementos",
    "TiendaFitnessPro",
  ],
  authors: [{ name: "TiendaFitnessPro" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TiendaFitnessPro - Tu Mejor Versión Empieza Aquí",
    description:
      "Tienda premium de deporte. Productos deportivos de alta calidad para cada entrenamiento, cada partido y cada objetivo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-deep text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
