/**
 * Utilidades para WhatsApp click-to-chat.
 *
 * Genera enlaces wa.me con mensajes predefinidos.
 * El número internacional se configura en siteConfig.whatsappNumberInternational.
 */

import { siteConfig } from "@/config/site";

/**
 * Genera un enlace de WhatsApp click-to-chat.
 *
 * @param message — Mensaje predefinido (opcional).
 *                 Si no se proporciona, usa un mensaje por defecto.
 * @returns URL de WhatsApp con el mensaje codificado.
 *
 * @example
 * getWhatsAppLink() // → "https://wa.me/34633184354?text=Hola%2C%20estoy%20interesado%20en%20productos%20de%20Tienda%20Fitness%20Pro."
 * getWhatsAppLink("Hola, necesito info sobre X") // → "https://wa.me/34633184354?text=Hola%2C%20necesito%20info%20sobre%20X"
 */
export function getWhatsAppLink(message?: string): string {
  const defaultMessage = "Hola, estoy interesado en productos de Tienda Fitness Pro.";
  const finalMessage = message ?? defaultMessage;
  const encoded = encodeURIComponent(finalMessage);
  return `https://wa.me/${siteConfig.whatsappNumberInternational}?text=${encoded}`;
}

/**
 * Genera un enlace de WhatsApp para consulta sobre un producto específico.
 *
 * @param productName — Nombre del producto.
 * @returns URL de WhatsApp con mensaje que incluye el nombre del producto.
 */
export function getProductWhatsAppLink(productName: string): string {
  return getWhatsAppLink(`Hola, estoy interesado en este producto: ${productName}`);
}

/**
 * Genera un enlace de WhatsApp para ayuda con un pedido.
 *
 * @returns URL de WhatsApp con mensaje de ayuda con pedido.
 */
export function getOrderHelpWhatsAppLink(): string {
  return getWhatsAppLink("Hola, necesito ayuda con mi pedido en Tienda Fitness Pro.");
}
