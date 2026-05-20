/**
 * Server Action para enviar email de bienvenida al usuario.
 *
 * ⛔ Este archivo se ejecuta SOLO en el servidor ("use server").
 * Nunca se expone al cliente, por lo que las credenciales SMTP permanecen seguras.
 *
 * El envío es fire-and-forget: si falla, no afecta al registro.
 */

"use server";

import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

export async function sendWelcomeEmailAction(
  userName: string,
  userEmail: string
): Promise<void> {
  console.log("[WELCOME_EMAIL] Intentando enviar bienvenida a:", userEmail);

  try {
    await sendWelcomeEmail({ userName, userEmail });
    console.log("[WELCOME_EMAIL] Acción completada para:", userEmail);
  } catch (err) {
    console.warn("[WELCOME_EMAIL] Error:", err);
    // No lanzar — el registro ya se completó correctamente
  }
}
