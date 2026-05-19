/**
 * Envío de emails relacionados con pedidos.
 *
 * ⛔ Solo usar desde Server Actions o Server Components.
 * Si falla el envío, NO rompe el flujo de creación del pedido.
 */

import { sendEmail, getOrdersEmailTo } from "./resend";
import { OrderConfirmationEmail } from "./templates/order-confirmation";
import { NewOrderAdminEmail } from "./templates/new-order-admin";

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
 * Envía el email de confirmación de pedido al cliente.
 * Si falla, registra el error pero no lanza excepción.
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  try {
    await sendEmail({
      to: payload.customerEmail,
      subject: "Confirmación de pedido - Tienda Fitness Pro",
      react: React.createElement(OrderConfirmationEmail, {
        customerName: payload.customerName,
        orderId: payload.orderId,
        items: payload.items,
        total: payload.total,
        status: "pending",
      }),
    });
  } catch (err) {
    console.error("[Email] Error enviando confirmación al cliente:", err);
    // No lanzar — el pedido ya se creó
  }
}

/**
 * Envía el email de notificación de nuevo pedido al admin.
 * Si falla, registra el error pero no lanza excepción.
 */
export async function sendNewOrderAdminEmail(payload: OrderEmailPayload): Promise<void> {
  try {
    await sendEmail({
      to: getOrdersEmailTo(),
      subject: `Nuevo pedido recibido — #${payload.orderId}`,
      react: React.createElement(NewOrderAdminEmail, {
        orderId: payload.orderId,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        items: payload.items,
        total: payload.total,
        shippingAddress: payload.shippingAddress,
      }),
    });
  } catch (err) {
    console.error("[Email] Error enviando notificación al admin:", err);
    // No lanzar — el pedido ya se creó
  }
}
