"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Box,
  Truck,
  CircleCheck,
  XCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Loader2,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────

interface OrderItemData {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string | null;
  product_slug: string | null;
  color_name: string | null;
  size: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

interface OrderData {
  id: string;
  user_id: string | null;
  order_number: string | null;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null;
  shipping_company: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  order_items: OrderItemData[];
}

// ─── Timeline config ───────────────────────────────────────────────────

const timelineSteps = [
  { key: "pending", label: "Pedido Recibido", icon: Package },
  { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { key: "processing", label: "En Preparación", icon: Box },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CircleCheck },
];

const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];

const statusColors: Record<string, string> = {
  pending: "#FFB800",
  confirmed: "#0099FF",
  processing: "#FF8C00",
  shipped: "#00D4FF",
  delivered: "#00CC66",
  cancelled: "#FF4444",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En Preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

// ─── Page Component ────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const supabase = createClient();

        // Fetch order by order_number (NOT by id)
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("order_number", orderNumber)
          .single();

        if (error || !data) {
          console.error("[ORDER TRACKING] Error fetching order:", error);
          setNotFound(true);
          return;
        }

        // If the user is authenticated, optionally verify ownership
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const isOwner =
            data.user_id === userData.user.id ||
            data.customer_email === userData.user.email;
          // Allow viewing even if not owner (direct link), but log it
          if (!isOwner) {
            console.log("[ORDER TRACKING] User viewing order that may not be theirs:", orderNumber);
          }
        }

        setOrder(data as OrderData);
      } catch (err) {
        console.error("[ORDER TRACKING] Unexpected error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  // ─── Loading State ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#0099FF] animate-spin" />
          <p className="text-white/60 text-sm">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  // ─── Not Found State ───────────────────────────────────────────────

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120]">
        <div className="h-20" />
        <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6"
          >
            <Package className="h-12 w-12 text-white/30" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">
            Pedido no encontrado
          </h1>
          <p className="text-white/50 mb-8 max-w-md">
            No hemos podido encontrar un pedido con ese número. Verifica que el enlace es correcto.
          </p>
          <Button
            asChild
            className="bg-[#0099FF] hover:bg-[#0099FF]/90 text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.3)]"
          >
            <Link href="/mis-pedidos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Pedidos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Computed values ───────────────────────────────────────────────

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = isCancelled
    ? -1
    : statusOrder.indexOf(order.status);
  const statusColor = statusColors[order.status] || "#0099FF";
  const statusLabel = statusLabels[order.status] || order.status;

  const formattedDate = new Date(order.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = order.order_items?.reduce((sum, item) => sum + Number(item.total), 0) ?? Number(order.total);

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120]">
      <div className="h-20" />

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full shrink-0"
            asChild
          >
            <Link href="/mis-pedidos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Seguimiento de <span className="text-[#0099FF]">Pedido</span>
            </h1>
            <p className="text-sm text-white/40 truncate">
              {order.order_number ?? orderNumber}
            </p>
          </div>
        </motion.div>

        {/* ─── Cancelled Banner ────────────────────────────────────── */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-[#FF4444]/10 border border-[#FF4444]/20"
          >
            <XCircle className="h-5 w-5 text-[#FF4444] shrink-0" />
            <p className="text-sm text-[#FF4444]/90">
              Este pedido ha sido cancelado. Si tienes dudas,{" "}
              <Link href="/contacto" className="underline font-semibold hover:text-[#FF4444]">
                contáctanos
              </Link>
              .
            </p>
          </motion.div>
        )}

        {/* ─── Timeline ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-[#0099FF]" />
                Estado del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status badge */}
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${statusColor}15`,
                    color: statusColor,
                    border: `1px solid ${statusColor}30`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  {statusLabel}
                </span>
                {order.order_number && (
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {order.order_number}
                  </span>
                )}
              </div>

              {/* Timeline */}
              <div className="relative">
                {timelineSteps.map((step, index) => {
                  const isCompleted = !isCancelled && index <= currentStepIndex;
                  const isCurrent = !isCancelled && index === currentStepIndex;
                  const isPending = isCancelled || index > currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      {/* Dot + Line column */}
                      <div className="flex flex-col items-center">
                        {/* Dot */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15 * index, duration: 0.3 }}
                          className={`
                            w-4 h-4 rounded-full shrink-0 flex items-center justify-center relative z-10
                            ${isCurrent ? "shadow-[0_0_12px_rgba(0,153,255,0.6)]" : ""}
                          `}
                          style={{
                            backgroundColor: isCompleted
                              ? isCurrent
                                ? "#0099FF"
                                : "#00CC66"
                              : "transparent",
                            border: isPending
                              ? "2px solid rgba(255,255,255,0.2)"
                              : isCurrent
                                ? "2px solid #0099FF"
                                : "2px solid #00CC66",
                          }}
                        >
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.15 * index + 0.1 }}
                              className="w-1.5 h-1.5 rounded-full bg-white"
                            />
                          )}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: "#0099FF" }}
                              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>

                        {/* Connecting line */}
                        {index < timelineSteps.length - 1 && (
                          <div className="w-0.5 h-10 relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full" />
                            {isCompleted && index < currentStepIndex && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                transition={{ delay: 0.15 * index + 0.2, duration: 0.3 }}
                                className="absolute inset-x-0 bottom-0 rounded-full"
                                style={{
                                  backgroundColor: index < currentStepIndex ? "#00CC66" : "#0099FF",
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Label column */}
                      <div className="pb-8 last:pb-0">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-4 w-4"
                            style={{
                              color: isCompleted
                                ? isCurrent
                                  ? "#0099FF"
                                  : "#00CC66"
                                : "rgba(255,255,255,0.2)",
                            }}
                          />
                          <span
                            className={`text-sm font-semibold ${
                              isCurrent
                                ? "text-white"
                                : isCompleted
                                  ? "text-white/80"
                                  : "text-white/30"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {isCurrent && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs text-white/40 mt-0.5 ml-6"
                          >
                            Estado actual
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Order Details ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0099FF]" />
                Detalles del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Número de pedido</p>
                  <p className="text-sm font-semibold text-white">
                    {order.order_number ?? orderNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Fecha</p>
                  <p className="text-sm font-semibold text-white">{formattedDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Estado</p>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${statusColor}15`,
                      color: statusColor,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    {statusLabel}
                  </span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Customer info */}
              <div className="space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                  Datos del Cliente
                </p>
                {order.customer_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm w-20 shrink-0">Nombre</span>
                    <span className="text-sm text-white">{order.customer_name}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-white/30 shrink-0" />
                    <span className="text-sm text-white/70">{order.customer_email}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-white/30 shrink-0" />
                    <span className="text-sm text-white/70">{order.customer_phone}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                    Dirección de Envío
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                    <div className="text-sm text-white/70 leading-relaxed">
                      <p>{order.shipping_address.street}</p>
                      <p>
                        {order.shipping_address.postal_code} {order.shipping_address.city},{" "}
                        {order.shipping_address.province}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking info */}
              {(order.shipping_company || order.tracking_number) && (
                <>
                  <Separator className="bg-white/10" />
                  <div className="space-y-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                      Seguimiento de Envío
                    </p>
                    {order.shipping_company && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-[#00D4FF] shrink-0" />
                        <span className="text-sm text-white/70">
                          Transportista: <span className="text-white font-semibold">{order.shipping_company}</span>
                        </span>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-white/30 shrink-0" />
                        <span className="text-sm text-white/70">
                          Nº seguimiento: <span className="text-white font-mono font-semibold">{order.tracking_number}</span>
                        </span>
                      </div>
                    )}
                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#0099FF] hover:text-[#0099FF]/80 font-semibold transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Rastrear envío
                      </a>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Items ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Box className="h-5 w-5 text-[#0099FF]" />
                Productos del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item, idx) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-4 py-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/5">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name ?? "Producto"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">
                          {item.product_name ?? "Producto"}
                        </p>
                        {(item.color_name || item.size) && (
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.color_name && (
                              <span className="text-xs text-white/40">{item.color_name}</span>
                            )}
                            {item.color_name && item.size && (
                              <span className="text-white/20 text-xs">·</span>
                            )}
                            {item.size && (
                              <span className="text-xs text-white/40">Talla {item.size}</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-white/30 mt-1">
                          {item.quantity} × {Number(item.unit_price).toFixed(2)} €
                        </p>
                      </div>

                      {/* Line total */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">
                          {Number(item.total).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    {idx < order.order_items.length - 1 && (
                      <Separator className="bg-white/5" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/40 py-4">
                  No hay productos asociados a este pedido.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Order Summary ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Envío</span>
                <span className="text-[#AAFF00] font-semibold">Gratis</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-baseline">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-2xl font-black text-white">
                  {Number(order.total).toFixed(2)} €
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Help CTA ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center pb-8"
        >
          <p className="text-xs text-white/30 mb-3">
            ¿Tienes alguna pregunta sobre tu pedido?
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              asChild
              variant="outline"
              className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <Link href="/contacto">
                <Mail className="h-4 w-4 mr-2" />
                Contactar
              </Link>
            </Button>
            <Button
              asChild
              className="bg-[#0099FF] hover:bg-[#0099FF]/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.3)]"
            >
              <Link href="/mis-pedidos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Mis Pedidos
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
