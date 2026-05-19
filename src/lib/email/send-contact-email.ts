/**
 * Envío de emails del formulario de contacto.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 * Si falla el envío, devuelve error para que el usuario pueda reintentar.
 */

import React from "react";
import { sendEmail, getContactEmailTo } from "./resend";
import { ContactMessageEmail } from "./templates/contact-message";

interface ContactEmailPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Envía el email de contacto al equipo de Tienda Fitness Pro.
 * A diferencia de los emails de pedido, aquí sí propagamos el error
 * para que el usuario vea si falló y pueda reintentar.
 *
 * @returns true si se envió, false si falló.
 */
export async function sendContactEmail(payload: ContactEmailPayload): Promise<boolean> {
  try {
    return await sendEmail({
      to: getContactEmailTo(),
      subject: `Mensaje de contacto de ${payload.name}`,
      react: React.createElement(ContactMessageEmail, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
      }),
    });
  } catch (err) {
    console.error("[Email] Error enviando mensaje de contacto:", err);
    return false;
  }
}
