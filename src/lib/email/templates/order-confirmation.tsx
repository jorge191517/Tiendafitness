/**
 * Template de email de confirmación de pedido para el CLIENTE.
 *
 * Se envía al cliente después de crear un pedido correctamente.
 * Contiene: resumen del pedido, productos, total y estado.
 */

import React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  status: string;
}

export function OrderConfirmationEmail({
  customerName,
  orderId,
  items,
  total,
  status,
}: OrderConfirmationProps) {
  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En proceso",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 600, margin: "0 auto", backgroundColor: "#0a0a0a", color: "#ffffff", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0099FF", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
          TIENDA FITNESS PRO
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>
          Confirmación de pedido
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "32px" }}>
        <p style={{ fontSize: 16, color: "#ffffff", marginBottom: 8 }}>
          Hola <strong>{customerName}</strong>,
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>
          ¡Gracias por tu compra! Tu pedido ha sido registrado correctamente.
        </p>

        {/* Order info */}
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <table style={{ width: "100%", fontSize: 14 }}>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Pedido:</td>
              <td style={{ color: "#ffffff", fontWeight: 600, textAlign: "right" }}>#{orderId}</td>
            </tr>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Estado:</td>
              <td style={{ textAlign: "right" }}>
                <span style={{ backgroundColor: "rgba(170,255,0,0.15)", color: "#AAFF00", padding: "2px 10px", borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
                  {statusLabel[status] ?? status}
                </span>
              </td>
            </tr>
          </table>
        </div>

        {/* Products */}
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#0099FF" }}>
          Productos
        </h2>
        <div style={{ backgroundColor: "#111111", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Producto</th>
                <th style={{ textAlign: "center", padding: "10px 8px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Cant.</th>
                <th style={{ textAlign: "right", padding: "10px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <td style={{ padding: "10px 16px", color: "#ffffff" }}>{item.name}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "10px 16px", color: "#ffffff", textAlign: "right", fontWeight: 600 }}>{item.total.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, marginBottom: 24, textAlign: "right" }}>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>Total: </span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffff" }}>{total.toFixed(2)} €</span>
        </div>

        {/* Footer message */}
        <div style={{ backgroundColor: "rgba(0,153,255,0.08)", borderLeft: "3px solid #0099FF", padding: "16px 20px", borderRadius: "0 8px 8px 0", marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Recibirás notificaciones por email cuando tu pedido cambie de estado.
            Si tienes cualquier duda, escríbenos a{" "}
            <a href="mailto:pedidos@tiendafitnesspro.es" style={{ color: "#0099FF" }}>pedidos@tiendafitnesspro.es</a>{" "}
            o por WhatsApp al <span style={{ color: "#25D366" }}>633 184 354</span>.
          </p>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          Tienda Fitness Pro — Tu Mejor Versión Empieza Aquí
        </p>
      </div>
    </div>
  );
}
