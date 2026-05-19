"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  /** Mensaje predefinido para WhatsApp (opcional) */
  message?: string;
  /** Texto del botón */
  label?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante del botón */
  variant?: "default" | "outline" | "ghost";
}

/**
 * Botón de WhatsApp click-to-chat.
 *
 * Abre una conversación de WhatsApp en nueva pestaña con un mensaje predefinido.
 * Se usa en el footer, páginas de producto, checkout y contacto.
 */
export default function WhatsAppButton({
  message,
  label = "WhatsApp",
  className,
  variant = "default",
}: WhatsAppButtonProps) {
  const href = getWhatsAppLink(message);

  return (
    <Button
      variant={variant}
      asChild
      className={cn(
        variant === "default" &&
          "bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold shadow-[0_0_20px_rgba(37,211,102,0.25)] hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all duration-300",
        variant === "outline" &&
          "border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/60 hover:shadow-[0_0_15px_rgba(37,211,102,0.15)] transition-all duration-300",
        variant === "ghost" &&
          "text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#20BD5A] transition-all duration-300",
        className
      )}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4 mr-2" />
        {label}
      </a>
    </Button>
  );
}
