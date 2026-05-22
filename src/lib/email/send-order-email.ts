/**
 * Envío de emails relacionados con pedidos vía Resend.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 * Si falla el envío, NO rompe el flujo de creación del pedido.
 *
 * Emails enviados:
 * 1. Confirmación de compra al cliente (con imágenes, resumen, tracking)
 * 2. Notificación de nuevo pedido al admin
 * 3. Actualización de estado del pedido al cliente
 */

import { sendEmail, getOrdersEmailTo } from "./resend";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderEmailItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
  image?: string;
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

// ─── HTML Renderers ─────────────────────────────────────────────────────────

/**
 * Genera el HTML del email de confirmación de pedido para el cliente.
 * Diseño premium dark con imágenes de productos y link de seguimiento.
 */
function renderOrderConfirmationHtml(
  customerName: string,
  orderId: string,
  items: OrderEmailItem[],
  total: number,
  status: string,
  shippingAddress?: OrderEmailPayload["shippingAddress"]
): string {
  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En proceso",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const statusColor: Record<string, string> = {
    pending: "#FFB800",
    confirmed: "#0099FF",
    processing: "#FF8C00",
    shipped: "#00D4FF",
    delivered: "#00CC66",
    cancelled: "#FF4444",
  };

  const itemsRows = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 12px 8px; vertical-align: middle;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;" />` : '<div style="width: 48px; height: 48px; background: #1a1a1a; border-radius: 6px;"></div>'}
          </td>
          <td style="padding: 12px 12px; color: #ffffff; font-size: 14px;">${item.name}</td>
          <td style="padding: 12px 8px; color: rgba(255,255,255,0.6); text-align: center; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 12px 12px; color: #ffffff; text-align: right; font-weight: 600; font-size: 14px;">${item.total.toFixed(2)} &euro;</td>
        </tr>`
    )
    .join("");

  const addressHtml = shippingAddress
    ? `
        <h2 style="font-size: 15px; font-weight: 700; margin: 0 0 12px; color: #0099FF;">Direcci&oacute;n de Env&iacute;o</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.7;">
            ${shippingAddress.street}<br/>
            ${shippingAddress.city}, ${shippingAddress.province}<br/>
            ${shippingAddress.postal_code} &mdash; ${shippingAddress.country}
          </p>
        </div>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0099FF; padding: 28px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">TIENDA FITNESS PRO</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Confirmaci&oacute;n de pedido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 8px;">Hola <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">&iexcl;Gracias por tu compra! Tu pedido ha sido registrado correctamente.</p>

        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Pedido:</td>
              <td style="color: #ffffff; font-weight: 600; text-align: right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Estado:</td>
              <td style="text-align: right;">
                <span style="background-color: ${statusColor[status] ?? '#FFB800'}22; color: ${statusColor[status] ?? '#FFB800'}; padding: 2px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">${statusLabel[status] ?? status}</span>
              </td>
            </tr>
          </table>
        </div>

        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Productos</h2>
        <div style="background-color: #111111; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <th style="padding: 10px 8px;"></th>
                <th style="text-align: left; padding: 10px 12px; color: rgba(255,255,255,0.5); font-weight: 500;">Producto</th>
                <th style="text-align: center; padding: 10px 8px; color: rgba(255,255,255,0.5); font-weight: 500;">Cant.</th>
                <th style="text-align: right; padding: 10px 12px; color: rgba(255,255,255,0.5); font-weight: 500;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </div>

        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: right;">
          <span style="font-size: 16px; color: rgba(255,255,255,0.6);">Total: </span>
          <span style="font-size: 24px; font-weight: 800; color: #ffffff;">${total.toFixed(2)} &euro;</span>
        </div>

        ${addressHtml}

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://tiendafitnesspro.es/pedido/${orderId}"
             style="display: inline-block; background-color: #0099FF; color: #ffffff; font-size: 15px; font-weight: 700; padding: 12px 32px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px; box-shadow: 0 0 20px rgba(0,153,255,0.3);">
            SEGUIR MI PEDIDO
          </a>
        </div>

        <div style="background-color: rgba(0,153,255,0.08); border-left: 3px solid #0099FF; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
            Recibir&aacute;s notificaciones por email cuando tu pedido cambie de estado.
            Si tienes cualquier duda, escr&iacute;benos a
            <a href="mailto:pedidos@tiendafitnesspro.es" style="color: #0099FF;">pedidos@tiendafitnesspro.es</a>
            o por WhatsApp al <span style="color: #25D366;">633 184 354</span>.
          </p>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Tienda Fitness Pro &mdash; Tu Mejor Versi&oacute;n Empieza Aqu&iacute;</p>
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
          <td style="padding: 10px 16px; color: rgba(255,255,255,0.6); text-align: right;">${item.unit_price.toFixed(2)} &euro;</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.total.toFixed(2)} &euro;</td>
        </tr>`
    )
    .join("");

  const addressHtml = shippingAddress
    ? `
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Direcci&oacute;n de Env&iacute;o</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.8;">
            ${shippingAddress.street}<br/>
            ${shippingAddress.city}, ${shippingAddress.province}<br/>
            ${shippingAddress.postal_code} &mdash; ${shippingAddress.country}
          </p>
        </div>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #AAFF00; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #000000;">NUEVO PEDIDO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(0,0,0,0.6);">Notificaci&oacute;n de pedido recibido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 24px;">Se ha recibido un nuevo pedido en la tienda.</p>
        <div style="background-color: #111111; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 13px; color: rgba(255,255,255,0.5);">Pedido: </span>
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
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Tel&eacute;fono:</td>
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
          <span style="font-size: 24px; font-weight: 800; color: #AAFF00;">${total.toFixed(2)} &euro;</span>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://tiendafitnesspro.es/admin/pedidos"
             style="display: inline-block; background-color: #AAFF00; color: #000000; font-size: 14px; font-weight: 700; padding: 10px 24px; border-radius: 8px; text-decoration: none;">
            GESTIONAR PEDIDO
          </a>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 24px;">Tienda Fitness Pro &mdash; Panel de Administraci&oacute;n</p>
      </div>
    </div>`;
}

// ─── Email Sending Functions ────────────────────────────────────────────────

/**
 * Envía el email de confirmación de pedido al cliente.
 * Si falla, registra el error pero no lanza excepción.
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL] Enviando confirmación al cliente:", payload.customerEmail);
  try {
    const result = await sendEmail({
      to: payload.customerEmail,
      subject: `Confirmación de pedido #${payload.orderId} — Tienda Fitness Pro`,
      html: renderOrderConfirmationHtml(
        payload.customerName,
        payload.orderId,
        payload.items,
        payload.total,
        "pending",
        payload.shippingAddress
      ),
    });
    if (result) {
      console.log("[ORDER_EMAIL] Confirmación enviada correctamente a:", payload.customerEmail);
    } else {
      console.warn("[ORDER_EMAIL] No se pudo enviar confirmación a:", payload.customerEmail);
    }
  } catch (err) {
    console.error("[ORDER_EMAIL] Error enviando confirmación al cliente:", err);
  }
}

/**
 * Envía el email de notificación de nuevo pedido al admin (pedidos@tiendafitnesspro.es).
 * Si falla, registra el error pero no lanza excepción.
 */
export async function sendNewOrderAdminEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL] Enviando notificación al admin");
  try {
    const result = await sendEmail({
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
      console.log("[ORDER_EMAIL] Notificación admin enviada correctamente");
    } else {
      console.warn("[ORDER_EMAIL] No se pudo enviar notificación al admin");
    }
  } catch (err) {
    console.error("[ORDER_EMAIL] Error enviando notificación al admin:", err);
  }
}

/**
 * Envía un email al cliente cuando cambia el estado de su pedido.
 */
export async function sendOrderStatusUpdateEmail(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  newStatus: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingCompany?: string;
}): Promise<void> {
  console.log("[ORDER_EMAIL] Enviando actualización de estado a:", params.customerEmail, "- Estado:", params.newStatus);

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En preparación",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const trackingHtml = params.trackingNumber ? `
    <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #0099FF;">Informaci&oacute;n de Env&iacute;o</h3>
      ${params.shippingCompany ? `<p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.7);">Transportista: <strong style="color: #ffffff;">${params.shippingCompany}</strong></p>` : ""}
      <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.7);">N&uacute;mero de seguimiento: <strong style="color: #ffffff;">${params.trackingNumber}</strong></p>
      ${params.trackingUrl ? `<a href="${params.trackingUrl}" style="display: inline-block; margin-top: 8px; background-color: #0099FF; color: #ffffff; font-size: 13px; font-weight: 600; padding: 8px 20px; border-radius: 6px; text-decoration: none;">RASTREAR ENV&Iacute;O</a>` : ""}
    </div>` : "";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0099FF; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px;">TIENDA FITNESS PRO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Actualizaci&oacute;n de pedido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 8px;">Hola <strong>${params.customerName}</strong>,</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">El estado de tu pedido ha sido actualizado.</p>

        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.5);">Pedido #${params.orderId}</p>
          <p style="margin: 0; font-size: 20px; font-weight: 800;">
            ${statusLabel[params.newStatus] ?? params.newStatus}
          </p>
        </div>

        ${trackingHtml}

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://tiendafitnesspro.es/pedido/${params.orderId}"
             style="display: inline-block; background-color: #0099FF; color: #ffffff; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
            VER SEGUIMIENTO
          </a>
        </div>

        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Tienda Fitness Pro &mdash; Tu Mejor Versi&oacute;n Empieza Aqu&iacute;</p>
      </div>
    </div>`;

  try {
    await sendEmail({
      to: params.customerEmail,
      subject: `Pedido #${params.orderId} — ${statusLabel[params.newStatus] ?? params.newStatus}`,
      html,
    });
    console.log("[ORDER_EMAIL] Email de actualización de estado enviado correctamente");
  } catch (err) {
    console.error("[ORDER_EMAIL] Error enviando actualización de estado:", err);
  }
}
