/**
 * Template de email de notificación de nuevo pedido para el ADMIN.
 *
 * Se envía a pedidos@tiendafitnesspro.es cuando se crea un nuevo pedido.
 * Contiene: datos del cliente, productos, total y ID del pedido.
 */

import React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image_url?: string | null;
}

interface NewOrderAdminProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
}

export function NewOrderAdminEmail({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  items,
  total,
  shippingAddress,
}: NewOrderAdminProps) {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 600, margin: "0 auto", backgroundColor: "#0a0a0a", color: "#ffffff", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#AAFF00", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 1, color: "#000000" }}>
          NUEVO PEDIDO
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
          Notificación de pedido recibido
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "32px" }}>
        <p style={{ fontSize: 16, color: "#ffffff", marginBottom: 24 }}>
          Se ha recibido un nuevo pedido en la tienda.
        </p>

        {/* Order ID */}
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 16, marginBottom: 24, textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>ID del pedido: </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#AAFF00" }}>#{orderId}</span>
        </div>

        {/* Customer info */}
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#0099FF" }}>
          Datos del Cliente
        </h2>
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <table style={{ width: "100%", fontSize: 14 }}>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Nombre:</td>
              <td style={{ color: "#ffffff", fontWeight: 600, textAlign: "right" }}>{customerName}</td>
            </tr>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Email:</td>
              <td style={{ color: "#0099FF", textAlign: "right" }}>{customerEmail}</td>
            </tr>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Teléfono:</td>
              <td style={{ color: "#ffffff", textAlign: "right" }}>{customerPhone}</td>
            </tr>
          </table>
        </div>

        {/* Shipping address */}
        {shippingAddress && (
          <>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#0099FF" }}>
              Dirección de Envío
            </h2>
            <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 14, color: "#ffffff", lineHeight: 1.8 }}>
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.province}<br />
                {shippingAddress.postal_code} — {shippingAddress.country}
              </p>
            </div>
          </>
        )}

        {/* Products */}
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#0099FF" }}>
          Productos del Pedido
        </h2>
        <div style={{ backgroundColor: "#111111", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Producto</th>
                <th style={{ textAlign: "center", padding: "10px 8px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Cant.</th>
                <th style={{ textAlign: "right", padding: "10px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Precio</th>
                <th style={{ textAlign: "right", padding: "10px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <td style={{ padding: "10px 16px", color: "#ffffff" }}>{item.name}</td>
                  <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.6)", textAlign: "right" }}>{item.unit_price.toFixed(2)} €</td>
                  <td style={{ padding: "10px 16px", color: "#ffffff", textAlign: "right", fontWeight: 600 }}>{item.subtotal.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, textAlign: "right" }}>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>Total del pedido: </span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#AAFF00" }}>{total.toFixed(2)} €</span>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 24 }}>
          Tienda Fitness Pro — Panel de Administración
        </p>
      </div>
    </div>
  );
}
