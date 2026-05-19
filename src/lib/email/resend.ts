/**
 * Cliente de Resend para envío de emails.
 *
 * ⛔ Este archivo SOLO debe importarse desde Server Actions o Server Components.
 * NUNCA debe importarse desde código de cliente (componentes con "use client").
 *
 * Si RESEND_API_KEY no está configurada, las funciones de email
 * devuelven silenciosamente sin error (no rompen el flujo principal).
 */

import { Resend } from "resend";

let resendInstance: Resend | null = null;

/**
 * Obtiene la instancia singleton de Resend.
 * Solo se inicializa si RESEND_API_KEY está configurada.
 */
function getResend(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY no configurada. Los emails no se enviarán.");
    return null;
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

/** Email "from" configurado desde variable de entorno */
export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM ??
    "Tienda Fitness Pro <no-reply@tiendafitnesspro.es>"
  );
}

/** Email de destino para mensajes de contacto */
export function getContactEmailTo(): string {
  return (
    process.env.EMAIL_CONTACT_TO ??
    "contacto@tiendafitnesspro.es"
  );
}

/** Email de destino para notificaciones de pedidos (admin) */
export function getOrdersEmailTo(): string {
  return (
    process.env.EMAIL_ORDERS_TO ??
    "pedidos@tiendafitnesspro.es"
  );
}

/**
 * Envía un email usando Resend.
 *
 * Si Resend no está configurado, registra un warning y devuelve éxito
 * para no romper el flujo principal (ej. creación de pedidos).
 *
 * @param params — Parámetros del email (to, subject, html, react, etc.)
 * @returns true si se envió correctamente, false si falló o no estaba configurado.
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
}): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    console.warn("[Resend] Email no enviado (API key no configurada):", params.subject);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: params.to,
      subject: params.subject,
      ...(params.react ? { react: params.react } : { html: params.html ?? "" }),
    });

    if (error) {
      console.error("[Resend] Error enviando email:", error);
      return false;
    }

    console.log("[Resend] Email enviado correctamente:", params.subject);
    return true;
  } catch (err) {
    console.error("[Resend] Excepción enviando email:", err);
    return false;
  }
}
