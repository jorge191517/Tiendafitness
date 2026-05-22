/**
 * Cliente de Resend para envío de emails transaccionales.
 *
 * ⛔ Este archivo SOLO debe importarse desde Server Actions o Server Components.
 * NUNCA debe importarse desde código de cliente (componentes con "use client").
 *
 * Variables de entorno necesarias:
 * - RESEND_API_KEY   → API key de Resend (re_xxx)
 * - EMAIL_FROM       → email remitente verificado en Resend (ej. Tienda Fitness Pro <no-reply@tiendafitnesspro.es>)
 * - EMAIL_ORDERS_TO  → email para notificaciones de pedidos admin
 * - EMAIL_CONTACT_TO → email para mensajes de contacto
 */

import { Resend } from "resend";

// ─── Singleton Client ──────────────────────────────────────────────────────

let resendInstance: Resend | null = null;

/**
 * Obtiene la instancia singleton del cliente de Resend.
 * Solo se inicializa si RESEND_API_KEY está configurada.
 */
function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  if (!process.env.RESEND_API_KEY) {
    console.warn("[RESEND] RESEND_API_KEY no configurada. Los emails no se enviarán.");
    return null;
  }

  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
}

// ─── Config Helpers ─────────────────────────────────────────────────────────

/**
 * Verifica si Resend está configurado (API key presente).
 */
export function isEmailConfigured(): boolean {
  const configured = !!process.env.RESEND_API_KEY;
  console.log("[RESEND] Config:", {
    apiKey: process.env.RESEND_API_KEY ? "***configurada***" : "no configurada",
    emailFrom: getEmailFrom(),
    configured,
  });
  return configured;
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

// ─── Send Helper ────────────────────────────────────────────────────────────

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envía un email usando Resend.
 *
 * Si la API key no está configurada, registra un warning y devuelve false
 * para no romper el flujo principal (ej. creación de pedidos).
 *
 * @param params — Parámetros del email
 * @returns true si se envió correctamente, false si falló o no estaba configurado.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  console.log("[RESEND] sending email...", {
    to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
    subject: params.subject,
  });

  const resend = getResendClient();

  if (!resend) {
    console.warn("[RESEND] Email NO enviado (API key no configurada):", params.subject);
    return false;
  }

  try {
    const from = getEmailFrom();

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });

    if (error) {
      console.error("[RESEND] error:", {
        subject: params.subject,
        to: params.to,
        error: error.message,
      });
      return false;
    }

    console.log("[RESEND] success:", {
      subject: params.subject,
      to: params.to,
      id: data?.id,
    });
    return true;
  } catch (err) {
    console.error("[RESEND] error:", {
      subject: params.subject,
      to: params.to,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
