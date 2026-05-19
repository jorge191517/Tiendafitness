/**
 * Server Action para el formulario de contacto.
 *
 * Valida los campos con Zod y envía un email a contacto@tiendafitnesspro.es.
 * Si falla el envío, devuelve error para que el usuario pueda reintentar.
 */

"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email/send-contact-email";

/** Esquema de validación del formulario de contacto */
const contactSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  email: z
    .string()
    .email("Introduce un email válido."),
  telefono: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s()-]{6,20}$/.test(val),
      "Introduce un teléfono válido."
    ),
  mensaje: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(2000, "El mensaje no puede superar los 2000 caracteres."),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export interface ContactResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Procesa el formulario de contacto.
 *
 * 1. Valida los campos con Zod
 * 2. Envía email a contacto@tiendafitnesspro.es
 * 3. Devuelve resultado (éxito o error)
 */
export async function submitContactForm(data: ContactFormData): Promise<ContactResult> {
  // 1. Validar con Zod
  const parsed = contactSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field) {
        fieldErrors[field] = fieldErrors[field] ?? [];
        fieldErrors[field].push(issue.message);
      }
    }
    return { success: false, fieldErrors };
  }

  // 2. Enviar email
  const emailSent = await sendContactEmail({
    name: parsed.data.nombre,
    email: parsed.data.email,
    phone: parsed.data.telefono,
    message: parsed.data.mensaje,
  });

  if (!emailSent) {
    return {
      success: false,
      error: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde o escríbenos a contacto@tiendafitnesspro.es",
    };
  }

  // 3. Éxito
  return { success: true };
}
