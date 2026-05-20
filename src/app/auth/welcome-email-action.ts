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
  // Ejecutar en background sin bloquear la respuesta al cliente
  // Si falla, el error se captura dentro de sendWelcomeEmail (solo log warning)
  sendWelcomeEmail({ userName, userEmail }).catch((err) => {
    console.warn("[Auth] Error enviando email de bienvenida (no bloqueante):", err);
  });
}
