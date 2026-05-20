/**
 * Compatibilidad: re-exporta desde nodemailer.ts.
 *
 * Antes este archivo usaba Resend. Ahora usa Nodemailer vía SMTP.
 * Los imports existentes (sendEmail, getEmailFrom, etc.) siguen funcionando.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 */

export {
  createTransporter,
  sendMail as sendEmail,
  isEmailConfigured,
  getEmailFrom,
  getContactEmailTo,
  getOrdersEmailTo,
} from "./nodemailer";
