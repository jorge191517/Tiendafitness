/**
 * Cliente de Nodemailer para envío de emails vía SMTP.
 *
 * ⛔ Este archivo SOLO debe importarse desde Server Actions o Server Components.
 * NUNCA debe importarse desde código de cliente (componentes con "use client").
 *
 * Si las variables SMTP no están configuradas, las funciones de email
 * devuelven silenciosamente sin error (no rompen el flujo principal).
 *
 * Variables de entorno necesarias:
 * - SMTP_HOST      → servidor SMTP (ej. smtp.ionos.es)
 * - SMTP_PORT      → puerto (ej. 587)
 * - SMTP_USER      → usuario SMTP
 * - SMTP_PASSWORD   → contraseña SMTP
 * - SMTP_FROM       → email remitente (ej. pedidos@tiendafitnesspro.es)
 * - EMAIL_ORDERS_TO → email para notificaciones de pedidos (ej. pedidos@tiendafitnesspro.es)
 * - EMAIL_CONTACT_TO→ email para mensajes de contacto (ej. contacto@tiendafitnesspro.es)
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporterInstance: Transporter | null = null;

/**
 * Verifica si el SMTP está configurado (todas las variables obligatorias presentes).
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  );
}

/**
 * Obtiene la instancia singleton del transporter de Nodemailer.
 * Solo se inicializa si el SMTP está configurado.
 */
export function createTransporter(): Transporter | null {
  if (transporterInstance) return transporterInstance;

  if (!isEmailConfigured()) {
    console.warn("[Nodemailer] SMTP no configurado. Los emails no se enviarán.");
    return null;
  }

 transporterInstance = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000,
});

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
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[Nodemailer] Email no enviado (SMTP no configurado):", params.subject);
    return false;
  }

  try {
    const fromEmail = getEmailFrom();

    console.log("[SMTP] sending:", {
      from: fromEmail,
      to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
      subject: params.subject,
    });

    await transporter.sendMail({
      from: fromEmail.includes("<")
  ? fromEmail
  : `Tienda Fitness Pro <${fromEmail}>`,
      to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });

    console.log("[SMTP] sent:", params.subject);
    return true;
  } catch (err) {
    console.error("[SMTP] error:", err);
    return false;
  }
}
