/**
 * Envío de emails relacionados con pedidos vía Resend.
 *
 * ⛔ Solo usar desde Server Actions, Server Components o API Routes.
 * Si falla el envío, NO rompe el flujo de creación del pedido.
 *
 * Las imágenes de productos se incluyen cuando hay image_url disponible.
 * Las URLs relativas (ej: /images/products/...) se convierten a absolutas
 * usando NEXT_PUBLIC_SITE_URL para que funcionen en los emails.
 */

import { sendEmail } from "@/lib/email/resend";

// ─── Site URL helper ────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tiendafitnesspro.es";

/** Convierte una URL relativa a absoluta para usar en emails */
function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  if (url.startsWith("http")) return url;
  return null;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderEmailItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image_url?: string | null;
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
  preparing: "En preparacion",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusSubject: Record<string, string> = {
  pending: "Confirmacion de pedido",
  confirmed: "Tu pedido ha sido confirmado",
  preparing: "Tu pedido esta en preparacion",
  processing: "Tu pedido esta en proceso",
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
    .map((item) => {
      const imgUrl = toAbsoluteUrl(item.image_url);
      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 12px; flex-shrink: 0;" />`
        : "";
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px 16px; color: #ffffff;">
            <div style="display: flex; align-items: center;">
              ${imgHtml}
              <span>${item.name}</span>
            </div>
          </td>
          <td style="padding: 10px 8px; color: rgba(255,255,255,0.6); text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.subtotal.toFixed(2)} &euro;</td>
        </tr>`;
    })
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
      <span style="font-size: 24px; font-weight: 800; color: #ffffff;">${total.toFixed(2)} &euro;</span>
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
    <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #AAFF00;">Datos de Envio</h2>
    <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 14px;">
        ${payload.shippingCompany ? `<tr><td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Empresa:</td><td style="color: #ffffff; font-weight: 600; text-align: right;">${payload.shippingCompany}</td></tr>` : ""}
        ${payload.trackingNumber ? `<tr><td style="color: rgba(255,255,255,0.5); padding: 4px 0;">N. Seguimiento:</td><td style="color: #AAFF00; font-weight: 700; text-align: right;">${payload.trackingNumber}</td></tr>` : ""}
      </table>
      ${trackingButton}
    </div>`;
}

function renderFooterBlock(): string {
  return `
    <div style="background-color: rgba(0,153,255,0.08); border-left: 3px solid #0099FF; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">
        Recibiras notificaciones por email cuando tu pedido cambie de estado.
        Si tienes cualquier duda, escribenos a
        <a href="mailto:pedidos@tiendafitnesspro.es" style="color: #0099FF;">pedidos@tiendafitnesspro.es</a>
        o por WhatsApp al <span style="color: #25D366;">633 184 354</span>.
      </p>
    </div>
    <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Tienda Fitness Pro - Tu Mejor Version Empieza Aqui</p>`;
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
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Confirmacion de pedido</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #ffffff; margin-bottom: 8px;">Hola <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">Gracias por tu compra! Tu pedido ha sido registrado correctamente.</p>
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
    .map((item) => {
      const imgUrl = toAbsoluteUrl(item.image_url);
      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 12px; flex-shrink: 0;" />`
        : "";
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px 16px; color: #ffffff;">
            <div style="display: flex; align-items: center;">
              ${imgHtml}
              <span>${item.name}</span>
            </div>
          </td>
          <td style="padding: 10px 8px; color: rgba(255,255,255,0.6); text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; color: rgba(255,255,255,0.6); text-align: right;">${item.unit_price.toFixed(2)} &euro;</td>
          <td style="padding: 10px 16px; color: #ffffff; text-align: right; font-weight: 600;">${item.subtotal.toFixed(2)} &euro;</td>
        </tr>`;
    })
    .join("");

  const addressHtml = shippingAddress
    ? `
        <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0099FF;">Direccion de Envio</h2>
        <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.8;">
            ${shippingAddress.street}<br/>
            ${shippingAddress.city}, ${shippingAddress.province}<br/>
            ${shippingAddress.postal_code} - ${shippingAddress.country}
          </p>
        </div>`
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #AAFF00; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #000000;">NUEVO PEDIDO</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(0,0,0,0.6);">Notificacion de pedido recibido</p>
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
              <td style="color: rgba(255,255,255,0.5); padding: 4px 0;">Telefono:</td>
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
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 24px;">Tienda Fitness Pro - Panel de Administracion</p>
      </div>
    </div>`;
}

// ─── Status change email HTML ───────────────────────────────────────────────

function renderStatusChangeHtml(payload: StatusEmailPayload): string {
  const sc = statusColor(payload.status);
  const label = statusLabel[payload.status] ?? payload.status;
  const subject = statusSubject[payload.status] ?? "Actualizacion de pedido";
  const introMap: Record<string, string> = {
    confirmed: "Tu pedido ha sido confirmado y pronto comenzaremos a prepararlo.",
    preparing: "Estamos preparando tu pedido con mucho cuidado. En breve estara listo para el envio.",
    processing: "Tu pedido esta en proceso de preparacion.",
    shipped: "Tu pedido esta en camino! A continuacion encontraras los datos de seguimiento.",
    delivered: "Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.",
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
 * Envia el email de confirmacion de pedido al cliente.
 * Si falla, registra el error pero no lanza excepcion.
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL_CLIENT] Enviando confirmacion a:", payload.customerEmail);
  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: "Confirmacion de pedido - Tienda Fitness Pro",
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
 * Envia el email de notificacion de nuevo pedido al admin.
 * Si falla, registra el error pero no lanza excepcion.
 */
export async function sendNewOrderAdminEmail(payload: OrderEmailPayload): Promise<void> {
  console.log("[ORDER_EMAIL_ADMIN] Enviando notificacion admin para pedido:", payload.orderId);
  try {
    const adminEmail = process.env.EMAIL_ORDERS_TO ?? "pedidos@tiendafitnesspro.es";
    await sendEmail({
      to: adminEmail,
      subject: `Nuevo pedido recibido - #${payload.orderId}`,
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
 * Envia email al cliente cuando cambia el estado de su pedido.
 * Solo envia para estados que requieren notificacion.
 */
export async function sendOrderStatusEmail(payload: StatusEmailPayload): Promise<boolean> {
  // No enviar email para pending (ya se envio la confirmacion inicial)
  if (payload.status === "pending") return false;

  console.log("[ORDER_STATUS_EMAIL] Enviando:", payload.status, "a:", payload.customerEmail);
  try {
    const subject = `${statusSubject[payload.status] ?? "Actualizacion de pedido"} - Tienda Fitness Pro`;
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
