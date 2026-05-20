/**
 * Envío de email de bienvenida a nuevos usuarios vía Nodemailer.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 * Si falla el envío, NO rompe el flujo de registro (fire-and-forget).
 */

import { sendMail } from "./nodemailer";

interface WelcomeEmailPayload {
  userName: string;
  userEmail: string;
}

/**
 * Genera el HTML del email de bienvenida con branding de TiendaFitnessPro.
 */
function renderWelcomeEmailHtml(userName: string): string {
  const displayName = userName || "atleta";

  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
    <!-- Header con logo -->
    <div style="background-color: #0099FF; padding: 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">TIENDA FITNESS PRO</h1>
            <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.85); letter-spacing: 1px;">Tu Mejor Versión Empieza Aquí</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Cuerpo del mensaje -->
    <div style="padding: 40px 32px;">
      <!-- Saludo -->
      <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px;">
        ¡Bienvenido, ${displayName}!
      </h2>
      <p style="font-size: 15px; color: rgba(255,255,255,0.7); margin: 0 0 28px; line-height: 1.6;">
        Gracias por crear tu cuenta en <strong style="color: #0099FF;">Tienda Fitness Pro</strong>.
        Estamos encantados de que formes parte de nuestra comunidad de deportistas comprometidos con su rendimiento y bienestar.
      </p>

      <!-- Beneficios -->
      <div style="background-color: #111111; border-radius: 10px; padding: 24px; margin-bottom: 28px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #AAFF00; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
          Lo que tienes como miembro
        </h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 10px 0; color: #AAFF00; font-size: 16px; vertical-align: top; width: 28px;">&#10003;</td>
            <td style="padding: 10px 0; color: rgba(255,255,255,0.85); line-height: 1.5;">
              <strong style="color: #ffffff;">Acceso completo al catálogo</strong> — Explora nuestra selección de ropa deportiva y accesorios premium para tu entrenamiento.
            </td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 10px 0; color: #AAFF00; font-size: 16px; vertical-align: top; width: 28px;">&#10003;</td>
            <td style="padding: 10px 0; color: rgba(255,255,255,0.85); line-height: 1.5;">
              <strong style="color: #ffffff;">Proceso de compra rápido</strong> — Realiza tus pedidos de forma ágil con tus datos guardados.
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #AAFF00; font-size: 16px; vertical-align: top; width: 28px;">&#10003;</td>
            <td style="padding: 10px 0; color: rgba(255,255,255,0.85); line-height: 1.5;">
              <strong style="color: #ffffff;">Seguimiento de pedidos</strong> — Consulta el estado de tus compras en cualquier momento desde tu cuenta.
            </td>
          </tr>
        </table>
      </div>

      <!-- Botón CTA -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="https://tiendafitnesspro.es/productos"
           style="display: inline-block; background-color: #AAFF00; color: #000000; font-size: 16px; font-weight: 700; padding: 14px 36px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px; box-shadow: 0 0 20px rgba(170,255,0,0.25);">
          EXPLORAR PRODUCTOS
        </a>
      </div>

      <!-- Texto adicional -->
      <div style="background-color: rgba(0,153,255,0.06); border-left: 3px solid #0099FF; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.7;">
          Si tienes cualquier pregunta sobre nuestros productos o necesitas asesoramiento, no dudes en contactarnos en
          <a href="mailto:contacto@tiendafitnesspro.es" style="color: #0099FF; text-decoration: none;">contacto@tiendafitnesspro.es</a>
          o por WhatsApp al <span style="color: #25D366; font-weight: 600;">633 184 354</span>. Estamos aquí para ayudarte.
        </p>
      </div>

      <!-- Firma -->
      <p style="font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; line-height: 1.7;">
        ¡Que disfrutes entrenando!<br/>
        <strong style="color: #ffffff;">El equipo de Tienda Fitness Pro</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid rgba(255,255,255,0.06); padding: 20px 32px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.25);">
        Tienda Fitness Pro — Tu Mejor Versión Empieza Aquí<br/>
        <a href="https://tiendafitnesspro.es" style="color: rgba(255,255,255,0.35); text-decoration: none;">tiendafitnesspro.es</a>
      </p>
    </div>
  </div>`;
}

/**
 * Envía el email de bienvenida al usuario recién registrado.
 * Fire-and-forget: si falla, no lanza excepción, solo registra un warning.
 */
export async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
  try {
    await sendMail({
      to: payload.userEmail,
      subject: "Bienvenido a TiendaFitnessPro",
      html: renderWelcomeEmailHtml(payload.userName),
    });
  } catch (err) {
    console.warn("[Email] No se pudo enviar el email de bienvenida:", err);
    // No lanzar — el registro ya se completó correctamente
  }
}
