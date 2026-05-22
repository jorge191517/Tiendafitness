/**
 * Server Action para enviar email de bienvenida al usuario.
 *
 * ⛔ Este archivo se ejecuta SOLO en el servidor ("use server").
 * Nunca se expone al cliente, por lo que la API key permanece segura.
 *
 * El envío es fire-and-forget: si falla, no afecta al registro.
 */

"use server";

import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

export async function sendWelcomeEmailAction(
  userName: string,
  userEmail: string
): Promise<void> {
  console.log("[WELCOME_EMAIL] Enviando a:", userEmail);

  try {
    await sendWelcomeEmail({ userName, userEmail });
    console.log("[WELCOME_EMAIL] Enviado a:", userEmail);
  } catch (err) {
    console.error("[WELCOME_EMAIL] Error:", err);
    // No lanzar — el registro ya se completó correctamente
  }
}
