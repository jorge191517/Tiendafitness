/**
 * Envío de emails relacionados con pedidos vía Nodemailer.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 * Si falla el envío, NO rompe el flujo de creación del pedido.
 */

import { sendMail, getOrdersEmailTo } from "./nodemailer";

interface OrderEmailItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderEmailItem[];
  total: number;
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
}

/**
 * Genera el HTML del email de confirmación de pedido para el cliente.
 */
function renderOrderConfirmationHtml(
  customerName: string,
  orderId: string,
  items: OrderEmailItem[],
  total: number,
  status: string
): string {
  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En proceso",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const itemsRows = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px 16px; color: #ffffff;">${item.name}</td>
          <td style="padding: 10px 8px; color: rgba(255,255,255,0.6); text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.total.toFixed(2)} €</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0099FF; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">TIENDA FITNESS PRO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Confirmación de pedido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 8px;">Hola <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">¡Gracias por tu compra! Tu pedido ha sido registrado correctamente.</p>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Pedido:</td>
              <td style="color: #ffffff; font-weight: 600; text-align: right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Estado:</td>
              <td style="text-align: right;">
                <span style="background-color: rgba(170,255,0,0.15); color: #AAFF00; padding: 2px 10px; border-radius: 4px; font-size: 13px; font-weight: 600;">${statusLabel[status] ?? status}</span>
              </td>
            </tr>
          </table>
        </div>
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Productos</h2>
        <div style="background-color: #111111; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <th style="text-align: left; padding: 10px 16px; color: rgba(255,255,255,0.5); font-weight: 500;">Producto</th>
                <th style="text-align: center; padding: 10px 8px; color: rgba(255,255,255,0.5); font-weight: 500;">Cant.</th>
                <th style="text-align: right; padding: 10px 16px; color: rgba(255,255,255,0.5); font-weight: 500;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </div>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: right;">
          <span style="font-size: 16px; color: rgba(255,255,255,0.6);">Total: </span>
          <span style="font-size: 24px; font-weight: 800; color: #ffffff;">${total.toFixed(2)} €</span>
        </div>
        <div style="background-color: rgba(0,153,255,0.08); border-left: 3px solid #0099FF; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
            Recibirás notificaciones por email cuando tu pedido cambie de estado.
            Si tienes cualquier duda, escríbenos a
            <a href="mailto:pedidos@tiendafitnesspro.es" style="color: #0099FF;">pedidos@tiendafitnesspro.es</a>
            o por WhatsApp al <span style="color: #25D366;">633 184 354</span>.
          </p>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Tienda Fitness Pro — Tu Mejor Versión Empieza Aquí</p>
      </div>
    </div>`;
}

/**
 * Genera el HTML del email de notificación de nuevo pedido para el admin.
 */
function renderNewOrderAdminHtml(
  orderId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: OrderEmailItem[],
  total: number,
  shippingAddress?: OrderEmailPayload["shippingAddress"]
): string {
  const itemsRows = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px 16px; color: #ffffff;">${item.name}</td>
          <td style="padding: 10px 8px; color: rgba(255,255,255,0.6); text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; color: rgba(255,255,255,0.6); text-align: right;">${item.unit_price.toFixed(2)} €</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.total.toFixed(2)} €</td>
        </tr>`
    )
    .join("");

  const addressHtml = shippingAddress
    ? `
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Dirección de Envío</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.8;">
            ${shippingAddress.street}<br/>
            ${shippingAddress.city}, ${shippingAddress.province}<br/>
            ${shippingAddress.postal_code} — ${shippingAddress.country}
          </p>
        </div>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #AAFF00; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #000000;">NUEVO PEDIDO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(0,0,0,0.6);">Notificación de pedido recibido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 24px;">Se ha recibido un nuevo pedido en la tienda.</p>
        <div style="background-color: #111111; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 13px; color: rgba(255,255,255,0.5);">ID del pedido: </span>
          <span style="font-size: 18px; font-weight: 800; color: #AAFF00;">#${orderId}</span>
        </div>
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Datos del Cliente</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Nombre:</td>
              <td style="color: #ffffff; font-weight: 600; text-align: right;">${customerName}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Email:</td>
              <td style="color: #0099FF; text-align: right;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Teléfono:</td>
              <td style="color: #ffffff; text-align: right;">${customerPhone}</td>
            </tr>
          </table>
        </div>
        ${addressHtml}
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Productos del Pedido</h2>
        <div style="background-color: #111111; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <th style="text-align: left; padding: 10px 16px; color: rgba(255,255,255,0.5); font-weight: 500;">Producto</th>
                <th style="text-align: center; padding: 10px 8px; color: rgba(255,255,255,0.5); font-weight: 500;">Cant.</th>
                <th style="text-align: right; padding: 10px 16px; color: rgba(255,255,255,0.5); font-weight: 500;">Precio</th>
                <th style="text-align: right; padding: 10px 16px; color: rgba(255,255,255,0.5); font-weight: 500;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </div>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; text-align: right;">
          <span style="font-size: 16px; color: rgba(255,255,255,0.6);">Total del pedido: </span>
          <span style="font-size: 24px; font-weight: 800; color: #AAFF00;">${total.toFixed(2)} €</span>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 24px;">Tienda Fitness Pro — Panel de Administración</p>
      </div>
    </div>`;
}

/**
 * Envía el email de confirmación de pedido al cliente.
 * Si falla, registra el error pero no lanza excepción.
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL_CLIENT] sending to:", payload.customerEmail);
  try {
    const result = await sendMail({
      to: payload.customerEmail,
      subject: "Confirmación de pedido - Tienda Fitness Pro",
      html: renderOrderConfirmationHtml(
        payload.customerName,
        payload.orderId,
        payload.items,
        payload.total,
        "pending"
      ),
    });
    if (result) {
      console.log("[ORDER_EMAIL_CLIENT] sent to:", payload.customerEmail);
    } else {
      console.warn("[ORDER_EMAIL_CLIENT] sendMail returned false (SMTP not configured or failed) for:", payload.customerEmail);
    }
  } catch (err) {
    console.error("[ORDER_EMAIL_CLIENT] error:", err);
    // No lanzar — el pedido ya se creó
  }
}

/**
 * Envía el email de notificación de nuevo pedido al admin (pedidos@tiendafitnesspro.es).
 * Si falla, registra el error pero no lanza excepción.
 */
export async function sendNewOrderAdminEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL_ADMIN] sending");
  try {
    const result = await sendMail({
      to: getOrdersEmailTo(),
      subject: `Nuevo pedido recibido — #${payload.orderId}`,
      html: renderNewOrderAdminHtml(
        payload.orderId,
        payload.customerName,
        payload.customerEmail,
        payload.customerPhone,
        payload.items,
        payload.total,
        payload.shippingAddress
      ),
    });
    if (result) {
      console.log("[ORDER_EMAIL_ADMIN] sent");
    } else {
      console.warn("[ORDER_EMAIL_ADMIN] sendMail returned false (SMTP not configured or failed)");
    }
  } catch (err) {
    console.error("[ORDER_EMAIL_ADMIN] error:", err);
    // No lanzar — el pedido ya se creó
  }
}
