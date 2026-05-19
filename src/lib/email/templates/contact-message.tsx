/**
 * Template de email para mensajes del formulario de contacto.
 *
 * Se envía a contacto@tiendafitnesspro.es cuando un usuario
 * envía un mensaje desde la página de contacto.
 */

import React from "react";

interface ContactMessageProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export function ContactMessageEmail({
  name,
  email,
  phone,
  message,
}: ContactMessageProps) {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 600, margin: "0 auto", backgroundColor: "#0a0a0a", color: "#ffffff", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0099FF", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>
          MENSAJE DE CONTACTO
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>
          Tienda Fitness Pro — Formulario de contacto
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "32px" }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
          Se ha recibido un nuevo mensaje desde el formulario de contacto:
        </p>

        {/* Sender info */}
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <table style={{ width: "100%", fontSize: 14 }}>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Nombre:</td>
              <td style={{ color: "#ffffff", fontWeight: 600, textAlign: "right" }}>{name}</td>
            </tr>
            <tr>
              <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Email:</td>
              <td style={{ color: "#0099FF", textAlign: "right" }}>
                <a href={`mailto:${email}`} style={{ color: "#0099FF" }}>{email}</a>
              </td>
            </tr>
            {phone && (
              <tr>
                <td style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>Teléfono:</td>
                <td style={{ color: "#ffffff", textAlign: "right" }}>{phone}</td>
              </tr>
            )}
          </table>
        </div>

        {/* Message */}
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#0099FF" }}>
          Mensaje
        </h2>
        <div style={{ backgroundColor: "#111111", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {message}
          </p>
        </div>

        {/* Reply CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href={`mailto:${email}?subject=Re: Tu mensaje a Tienda Fitness Pro`}
            style={{
              display: "inline-block",
              backgroundColor: "#0099FF",
              color: "#ffffff",
              fontWeight: 700,
              padding: "12px 32px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
              letterSpacing: 0.5,
            }}
          >
            Responder al cliente
          </a>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 24 }}>
          Tienda Fitness Pro — Formulario de Contacto
        </p>
      </div>
    </div>
  );
}
