/**
 * Envío de emails relacionados con pedidos vía Resend.
 *
 * ⛔ Solo usar desde Server Actions, Server Components o API Routes.
 * Si falla el envío, NO rompe el flujo de creación del pedido.
 */

import { sendEmail } from "@/lib/email/resend";

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

interface StatusEmailPayload extends OrderEmailPayload {
  status: string;
  shippingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

// ─── Status labels ──────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusSubject: Record<string, string> = {
  pending: "Confirmación de pedido",
  confirmed: "Tu pedido ha sido confirmado",
  preparing: "Tu pedido está en preparación",
  processing: "Tu pedido está en proceso",
  shipped: "Tu pedido ha sido enviado",
  delivered: "Tu pedido ha sido entregado",
  cancelled: "Tu pedido ha sido cancelado",
};

// ─── Status color helpers ───────────────────────────────────────────────────

function statusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "pending": return { bg: "rgba(255,193,7,0.15)", text: "#FFC107" };
    case "confirmed": return { bg: "rgba(0,153,255,0.15)", text: "#0099FF" };
    case "preparing": return { bg: "rgba(0,153,255,0.15)", text: "#0099FF" };
    case "processing": return { bg: "rgba(0,153,255,0.15)", text: "#0099FF" };
    case "shipped": return { bg: "rgba(170,255,0,0.15)", text: "#AAFF00" };
    case "delivered": return { bg: "rgba(76,175,80,0.15)", text: "#4CAF50" };
    case "cancelled": return { bg: "rgba(244,67,54,0.15)", text: "#F44336" };
    default: return { bg: "rgba(255,255,255,0.1)", text: "#ffffff" };
  }
}

// ─── HTML renderers ─────────────────────────────────────────────────────────

function renderItemRows(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px 16px; color: #ffffff;">${item.name}</td>
          <td style="padding: 10px 8px; color: rgba(255,255,255,0.6); text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.total.toFixed(2)} \u20AC</td>
        </tr>`
    )
    .join("");
}

function renderItemsTable(items: OrderEmailItem[]): string {
  return `
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
        <tbody>${renderItemRows(items)}</tbody>
      </table>
    </div>`;
}

function renderTotalBlock(total: number): string {
  return `
    <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: right;">
      <span style="font-size: 16px; color: rgba(255,255,255,0.6);">Total: </span>
      <span style="font-size: 24px; font-weight: 800; color: #ffffff;">${total.toFixed(2)} \u20AC</span>
    </div>`;
}

function renderTrackingBlock(payload: StatusEmailPayload): string {
  if (!payload.shippingCompany && !payload.trackingNumber && !payload.trackingUrl) return "";
  const trackingButton = payload.trackingUrl
    ? `<div style="text-align: center; margin-top: 16px;">
        <a href="${payload.trackingUrl}" target="_blank"
           style="display: inline-block; background-color: #AAFF00; color: #000000; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px;">
          VER SEGUIMIENTO
        </a>
      </div>`
    : "";
  return `
    <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #AAFF00;">Datos de Env\u00edo</h2>
    <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 14px;">
        ${payload.shippingCompany ? `<tr><td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Empresa:</td><td style="color: #ffffff; font-weight: 600; text-align: right;">${payload.shippingCompany}</td></tr>` : ""}
        ${payload.trackingNumber ? `<tr><td style="color: rgba(255,255,255,0.5); padding: 4px 0;">N\u00ba Seguimiento:</td><td style="color: #AAFF00; font-weight: 700; text-align: right;">${payload.trackingNumber}</td></tr>` : ""}
      </table>
      ${trackingButton}
    </div>`;
}

function renderFooterBlock(): string {
  return `
    <div style="background-color: rgba(0,153,255,0.08); border-left: 3px solid #0099FF; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
        Recibir\u00e1s notificaciones por email cuando tu pedido cambie de estado.
        Si tienes cualquier duda, escr\u00edbenos a
        <a href="mailto:pedidos@tiendafitnesspro.es" style="color: #0099FF;">pedidos@tiendafitnesspro.es</a>
        o por WhatsApp al <span style="color: #25D366;">633 184 354</span>.
      </p>
    </div>
    <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Tienda Fitness Pro \u2014 Tu Mejor Versi\u00f3n Empieza Aqu\u00ed</p>`;
}

// ─── Order confirmation HTML (client) ───────────────────────────────────────

function renderOrderConfirmationHtml(
  customerName: string,
  orderId: string,
  items: OrderEmailItem[],
  total: number,
  status: string
): string {
  const sc = statusColor(status);
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0099FF; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">TIENDA FITNESS PRO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Confirmaci\u00f3n de pedido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 8px;">Hola <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">\u00a1Gracias por tu compra! Tu pedido ha sido registrado correctamente.</p>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Pedido:</td>
              <td style="color: #ffffff; font-weight: 600; text-align: right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Estado:</td>
              <td style="text-align: right;">
                <span style="background-color: ${sc.bg}; color: ${sc.text}; padding: 2px 10px; border-radius: 4px; font-size: 13px; font-weight: 600;">${statusLabel[status] ?? status}</span>
              </td>
            </tr>
          </table>
        </div>
        ${renderItemsTable(items)}
        ${renderTotalBlock(total)}
        ${renderFooterBlock()}
      </div>
    </div>`;
}

// ─── New order admin HTML ───────────────────────────────────────────────────

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
          <td style="padding: 10px 16px; color: rgba(255,255,255,0.6); text-align: right;">${item.unit_price.toFixed(2)} \u20AC</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.total.toFixed(2)} \u20AC</td>
        </tr>`
    )
    .join("");

  const addressHtml = shippingAddress
    ? `
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Direcci\u00f3n de Env\u00edo</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.8;">
            ${shippingAddress.street}<br/>
            ${shippingAddress.city}, ${shippingAddress.province}<br/>
            ${shippingAddress.postal_code} \u2014 ${shippingAddress.country}
          </p>
        </div>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #AAFF00; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #000000;">NUEVO PEDIDO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(0,0,0,0.6);">Notificaci\u00f3n de pedido recibido</p>
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
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Tel\u00e9fono:</td>
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
          <span style="font-size: 24px; font-weight: 800; color: #AAFF00;">${total.toFixed(2)} \u20AC</span>
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 24px;">Tienda Fitness Pro \u2014 Panel de Administraci\u00f3n</p>
      </div>
    </div>`;
}

// ─── Status change email HTML ───────────────────────────────────────────────

function renderStatusChangeHtml(payload: StatusEmailPayload): string {
  const sc = statusColor(payload.status);
  const label = statusLabel[payload.status] ?? payload.status;
  const subject = statusSubject[payload.status] ?? "Actualizaci\u00f3n de pedido";
  const introMap: Record<string, string> = {
    confirmed: "Tu pedido ha sido confirmado y pronto comenzaremos a prepararlo.",
    preparing: "Estamos preparando tu pedido con mucho cuidado. En breve estar\u00e1 listo para el env\u00edo.",
    processing: "Tu pedido est\u00e1 en proceso de preparaci\u00f3n.",
    shipped: "\u00a1Tu pedido est\u00e1 en camino! A continuaci\u00f3n encontrar\u00e1s los datos de seguimiento.",
    delivered: "\u00a1Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.",
    cancelled: "Tu pedido ha sido cancelado. Si crees que es un error, contacta con nosotros.",
  };
  const intro = introMap[payload.status] ?? "El estado de tu pedido ha sido actualizado.";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0099FF; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">TIENDA FITNESS PRO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${subject}</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 8px;">Hola <strong>${payload.customerName}</strong>,</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">${intro}</p>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Pedido:</td>
              <td style="color: #ffffff; font-weight: 600; text-align: right;">#${payload.orderId}</td>
            </tr>
            <tr>
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Estado:</td>
              <td style="text-align: right;">
                <span style="background-color: ${sc.bg}; color: ${sc.text}; padding: 2px 10px; border-radius: 4px; font-size: 13px; font-weight: 600;">${label}</span>
              </td>
            </tr>
          </table>
        </div>
        ${renderTrackingBlock(payload)}
        ${renderItemsTable(payload.items)}
        ${renderTotalBlock(payload.total)}
        ${renderFooterBlock()}
      </div>
    </div>`;
}

// ─── Public functions ───────────────────────────────────────────────────────

/**
 * Env\u00eda el email de confirmaci\u00f3n de pedido al cliente.
 * Si falla, registra el error pero no lanza excepci\u00f3n.
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL_CLIENT] Enviando confirmaci\u00f3n a:", payload.customerEmail);
  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: "Confirmaci\u00f3n de pedido - Tienda Fitness Pro",
      html: renderOrderConfirmationHtml(
        payload.customerName,
        payload.orderId,
        payload.items,
        payload.total,
        "pending"
      ),
    });
    console.log("[ORDER_EMAIL_CLIENT] Enviado a:", payload.customerEmail);
  } catch (err) {
    console.error("[ORDER_EMAIL_CLIENT] Error:", err);
  }
}

/**
 * Env\u00eda el email de notificaci\u00f3n de nuevo pedido al admin.
 * Si falla, registra el error pero no lanza excepci\u00f3n.
 */
export async function sendNewOrderAdminEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL_ADMIN] Enviando notificaci\u00f3n admin para pedido:", payload.orderId);
  try {
    const adminEmail = process.env.EMAIL_ORDERS_TO ?? "pedidos@tiendafitnesspro.es";
    await sendEmail({
      to: adminEmail,
      subject: `Nuevo pedido recibido \u2014 #${payload.orderId}`,
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
    console.log("[ORDER_EMAIL_ADMIN] Enviado para pedido:", payload.orderId);
  } catch (err) {
    console.error("[ORDER_EMAIL_ADMIN] Error:", err);
  }
}

/**
 * Env\u00eda email al cliente cuando cambia el estado de su pedido.
 * Solo env\u00eda para estados que requieren notificaci\u00f3n.
 */
export async function sendOrderStatusEmail(payload: StatusEmailPayload): Promise<boolean> {
  // No enviar email para pending (ya se envi\u00f3 la confirmaci\u00f3n inicial)
  if (payload.status === "pending") return false;

  console.log("[ORDER_STATUS_EMAIL] Enviando:", payload.status, "a:", payload.customerEmail);
  try {
    const subject = `${statusSubject[payload.status] ?? "Actualizaci\u00f3n de pedido"} - Tienda Fitness Pro`;
    await sendEmail({
      to: payload.customerEmail,
      subject,
      html: renderStatusChangeHtml(payload),
    });
    console.log("[ORDER_STATUS_EMAIL] Enviado:", payload.status, "a:", payload.customerEmail);
    return true;
  } catch (err) {
    console.error("[ORDER_STATUS_EMAIL] Error:", err);
    return false;
  }
}
