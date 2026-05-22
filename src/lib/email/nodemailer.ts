/**
 * Cliente de Nodemailer para envío de emails vía SMTP.
 *
 * ⛔ Este archivo SOLO debe importarse desde Server Actions o Server Components.
 * NUNCA debe importarse desde código de cliente (componentes con "use client").
 *
 * Variables de entorno necesarias:
 * - SMTP_HOST      → servidor SMTP (ej. smtp.ionos.es)
 * - SMTP_PORT      → puerto (ej. 587)
 * - SMTP_USER      → usuario SMTP
 * - SMTP_PASSWORD   → contraseña SMTP
 * - SMTP_FROM       → email remitente (ej. pedidos@tiendafitnesspro.es)
 * - EMAIL_ORDERS_TO → email para notificaciones de pedidos
 * - EMAIL_CONTACT_TO→ email para mensajes de contacto
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporterInstance: Transporter | null = null;

/**
 * Verifica si el SMTP está configurado (todas las variables obligatorias presentes).
 */
export function isEmailConfigured(): boolean {
  const configured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  );

  console.log("[SMTP CONFIG]", {
    host: process.env.SMTP_HOST || "❌ NO CONFIGURADO",
    port: process.env.SMTP_PORT || "❌ NO CONFIGURADO",
    user: process.env.SMTP_USER || "❌ NO CONFIGURADO",
    pass: process.env.SMTP_PASSWORD ? "***configurado***" : "❌ NO CONFIGURADO",
    from: process.env.SMTP_FROM || "❌ NO CONFIGURADO",
    configured,
  });

  return configured;
}

/**
 * Obtiene la instancia singleton del transporter de Nodemailer.
 * Solo se inicializa si el SMTP está configurado.
 * Incluye verificación de conexión al crear la instancia.
 */
export async function createTransporter(): Promise<Transporter | null> {
  if (transporterInstance) return transporterInstance;

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
    console.warn("[Nodemailer] SMTP no configurado. Los emails no se enviarán.");
    return null;
  }

  const port = Number(process.env.SMTP_PORT) || 587;

  console.log("[SMTP] Creando transporter...", {
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    user: process.env.SMTP_USER,
  });

  transporterInstance = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // true para puerto 465, false para 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Verificar conexión al crear
  try {
    console.log("[SMTP] Verificando conexión...");
    await transporterInstance.verify();
    console.log("[SMTP SUCCESS] Conexión verificada correctamente. El servidor SMTP está listo.");
  } catch (verifyErr) {
    console.error("[SMTP ERROR] Falló la verificación de conexión SMTP:", verifyErr);
    // Resetear instancia para reintentar
    transporterInstance = null;
    return null;
  }

  return transporterInstance;
}

/** Email "from" configurado desde variable de entorno */
export function getEmailFrom(): string {
  return (
    process.env.SMTP_FROM ??
    "Tienda Fitness Pro <pedidos@tiendafitnesspro.es>"
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
 * Envía un email usando Nodemailer.
 *
 * Si el SMTP no está configurado, registra un warning y devuelve éxito
 * para no romper el flujo principal (ej. creación de pedidos).
 *
 * @param params — Parámetros del email
 * @returns true si se envió correctamente, false si falló o no estaba configurado.
 */
export async function sendMail(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  console.log("[SMTP SEND] Preparando envío...", {
    to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
    subject: params.subject,
  });

  const transporter = await createTransporter();

  if (!transporter) {
    console.warn("[SMTP] Email NO enviado (SMTP no configurado o falló verificación):", params.subject);
    return false;
  }

  try {
    const fromEmail = getEmailFrom();

    const result = await transporter.sendMail({
      from: `Tienda Fitness Pro <${fromEmail}>`,
      to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });

    console.log("[SMTP SUCCESS] Email enviado correctamente:", {
      subject: params.subject,
      to: params.to,
      messageId: result.messageId,
    });
    return true;
  } catch (err) {
    console.error("[SMTP ERROR] Error enviando email:", {
      subject: params.subject,
      to: params.to,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
