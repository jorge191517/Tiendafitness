/**
 * Envío de emails del formulario de contacto vía Resend.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 * Si falla el envío, devuelve error para que el usuario pueda reintentar.
 *
 * El remitente técnico es EMAIL_FROM (no-reply@tiendafitnesspro.es).
 * Se usa replyTo con el email del cliente para poder responderle directamente.
 */

import { sendEmail, getContactEmailTo } from "./resend";

interface ContactEmailPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Genera el HTML del email de contacto.
 */
function renderContactMessageHtml(
  name: string,
  email: string,
  phone: string | undefined,
  message: string
): string {
  const phoneRow = phone
    ? `<tr>
        <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Tel&eacute;fono:</td>
        <td style="color: #ffffff; text-align: right;">${phone}</td>
      </tr>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0099FF; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px;">MENSAJE DE CONTACTO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Tienda Fitness Pro — Formulario de contacto</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">Se ha recibido un nuevo mensaje desde el formulario de contacto:</p>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Nombre:</td>
              <td style="color: #ffffff; font-weight: 600; text-align: right;">${name}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Email:</td>
              <td style="color: #0099FF; text-align: right;"><a href="mailto:${email}" style="color: #0099FF;">${email}</a></td>
            </tr>
            ${phoneRow}
          </table>
        </div>
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Mensaje</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.7; white-space: pre-wrap;">${message}</p>
        </div>
        <div style="text-align: center;">
          <a href="mailto:${email}?subject=Re: Tu mensaje a Tienda Fitness Pro"
             style="display: inline-block; background-color: #0099FF; color: #ffffff; font-weight: 700; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; letter-spacing: 0.5px;">
            Responder al cliente
          </a>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 24px;">Tienda Fitness Pro — Formulario de Contacto</p>
      </div>
    </div>`;
}

/**
 * Envía el email de contacto al equipo de Tienda Fitness Pro.
 *
 * - Remitente: EMAIL_FROM (no-reply@tiendafitnesspro.es)
 * - Destino: EMAIL_CONTACT_TO (contacto@tiendafitnesspro.es)
 * - ReplyTo: email del cliente (para responder directamente)
 *
 * @returns true si se envió, false si falló.
 */
export async function sendContactEmail(payload: ContactEmailPayload): Promise<boolean> {
  try {
    return await sendEmail({
      to: getContactEmailTo(),
      subject: `Mensaje de contacto de ${payload.name}`,
      html: renderContactMessageHtml(
        payload.name,
        payload.email,
        payload.phone,
        payload.message
      ),
      replyTo: payload.email,
    });
  } catch (err) {
    console.error("[Email] Error enviando mensaje de contacto:", err);
    return false;
  }
}
