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
  title: "TiendaFitnessPro - Your Best Version Starts Here",
  description:
    "Premium sports store. High-quality sports products for every workout, every match, and every goal. Shop fitness equipment, sportswear, supplements, and accessories.",
  keywords: [
    "sports store",
    "fitness",
    "gym equipment",
    "padel",
    "sportswear",
    "supplements",
    "TiendaFitnessPro",
  ],
  authors: [{ name: "TiendaFitnessPro" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TiendaFitnessPro - Your Best Version Starts Here",
    description:
      "Premium sports store. High-quality sports products for every workout, every match, and every goal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-deep text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
