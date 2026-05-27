"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Package, Truck, MapPin, CheckCircle2, Clock, AlertCircle, ExternalLink, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_name: string | null;
  product_slug: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  color_name: string | null;
  size: string | null;
}

interface Order {
  id: string;
  user_id?: string;
  order_number: string | null;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  shipping_address: Record<string, string> | null;
  shipping_company: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  order_items: OrderItem[];
}

// ─── Timeline config ────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: "pending", label: "Pedido recibido", icon: Clock },
  { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { key: "preparing", label: "En preparación", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: MapPin },
];

function getTimelineIndex(status: string): number {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  if (idx === -1) {
    // processing maps to preparing step
    if (status === "processing") return 2;
    return 0;
  }
  return idx;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PedidoPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // ─── Paso 1: Buscar el pedido por order_number o id (sin nested items) ───
      let orderData: Record<string, unknown> | null = null;

      // Intentar por order_number primero
      const { data: byNumber } = await supabase
        .from("orders")
        .select("id, user_id, order_number, status, total, customer_name, customer_email, shipping_address, shipping_company, tracking_number, tracking_url, created_at")
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (byNumber) {
        orderData = byNumber;
      } else {
        // Fallback: buscar por id (compatibilidad hacia atrás)
        const { data: byId } = await supabase
          .from("orders")
          .select("id, user_id, order_number, status, total, customer_name, customer_email, shipping_address, shipping_company, tracking_number, tracking_url, created_at")
          .eq("id", orderNumber)
          .maybeSingle();
        orderData = byId;
      }

      if (!orderData) {
        setOrder(null);
        setLoading(false);
        return;
      }

      // ─── Seguridad: solo el dueño o admin puede ver el pedido ────────────
      if (user && orderData.user_id && orderData.user_id !== user.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!profile || profile.role !== "admin") {
          setOrder(null);
          setLoading(false);
          return;
        }
      }

      // ─── Paso 2: Obtener order_items por separado (evitar RLS en nested) ───
      const orderId = orderData.id as string;
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("id, product_name, product_slug, image_url, quantity, unit_price, subtotal, color_name, size")
        .eq("order_id", orderId);

      if (itemsError) {
        console.warn("[PEDIDO_PAGE] Error cargando order_items:", itemsError.message);
      }

      const orderItems: OrderItem[] = (itemsData ?? []).map((item) => ({
        id: item.id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        image_url: item.image_url,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        color_name: item.color_name,
        size: item.size,
      }));

      // ─── Paso 3: Combinar pedido + items ─────────────────────────────────
      const combined: Order = {
        id: orderId,
        user_id: orderData.user_id as string | undefined,
        order_number: orderData.order_number as string | null,
        status: orderData.status as string,
        total: orderData.total as number,
        customer_name: orderData.customer_name as string | null,
        customer_email: orderData.customer_email as string | null,
        shipping_address: orderData.shipping_address as Record<string, string> | null,
        shipping_company: orderData.shipping_company as string | null,
        tracking_number: orderData.tracking_number as string | null,
        tracking_url: orderData.tracking_url as string | null,
        created_at: orderData.created_at as string,
        order_items: orderItems,
      };

      console.log("[PEDIDO_PAGE] Pedido cargado:", combined.order_number, "con", orderItems.length, "items");
      setOrder(combined);
    } catch (err) {
      console.error("[PEDIDO_PAGE] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleConfirmDelivery = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${order.order_number ?? order.id}/confirm-delivery`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setOrder((prev) => prev ? { ...prev, status: "delivered" } : null);
      } else {
        alert(data.error ?? "Error al confirmar entrega");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setConfirming(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-electric border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pedido no encontrado</h2>
          <p className="text-white/50 text-sm mb-6">No se ha encontrado el pedido con esa referencia.</p>
          <Link href="/mis-pedidos">
            <Button className="bg-electric hover:bg-electric/90 text-white font-semibold">
              Ver mis pedidos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIdx = getTimelineIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const orderRef = order.order_number ?? order.id.substring(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="h-20" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
            title="Volver al Inicio"
          >
            <Home className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Pedido #{orderRef}</h1>
            <p className="text-white/50 mt-0.5 text-sm">{formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[#1e293b] rounded-2xl border border-white/[0.08] p-6 mb-6">
          <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-5">Estado del pedido</h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-semibold">Pedido cancelado</p>
                <p className="text-white/40 text-xs mt-0.5">Si crees que es un error, contacta con nosotros.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 hidden sm:block">
                <div
                  className="h-full bg-lime transition-all duration-700"
                  style={{ width: `${(currentIdx / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="flex justify-between relative">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                          isCompleted
                            ? isCurrent
                              ? "bg-lime/20 border-lime text-lime scale-110 shadow-[0_0_15px_rgba(170,255,0,0.3)]"
                              : "bg-lime/10 border-lime/50 text-lime"
                            : "bg-white/5 border-white/10 text-white/20"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-2 text-center font-medium ${
                          isCompleted ? "text-white" : "text-white/30"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracking info */}
          {order.status === "shipped" && (order.shipping_company || order.tracking_number || order.tracking_url) && (
            <div className="mt-6 bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Datos de seguimiento</h3>
              <div className="space-y-1.5 text-sm">
                {order.shipping_company && (
                  <p className="text-white/70"><span className="text-white/40">Empresa:</span> {order.shipping_company}</p>
                )}
                {order.tracking_number && (
                  <p className="text-white/70"><span className="text-white/40">Seguimiento:</span> <span className="text-lime font-semibold">{order.tracking_number}</span></p>
                )}
              </div>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 bg-lime hover:bg-lime/90 text-deep font-bold text-xs px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver seguimiento
                </a>
              )}
            </div>
          )}

          {/* Confirm delivery button */}
          {order.status === "shipped" && (
            <div className="mt-4">
              <Button
                onClick={handleConfirmDelivery}
                disabled={confirming}
                className="w-full sm:w-auto bg-electric hover:bg-electric/90 text-white font-semibold"
              >
                {confirming ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    He recibido mi pedido
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="bg-[#1e293b] rounded-2xl border border-white/[0.08] p-6 mb-6">
          <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Productos</h2>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white/[0.03] rounded-xl p-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name ?? ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{item.product_name ?? "Producto"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.color_name && <span className="text-white/40 text-xs">{item.color_name}</span>}
                      {item.size && <span className="text-white/40 text-xs">Talla {item.size}</span>}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{item.quantity} x {Number(item.unit_price).toFixed(2)} euros</p>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">{Number(item.subtotal).toFixed(2)} euros</p>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <span className="text-white/50 font-medium">Total</span>
                <span className="text-xl font-black text-white">{Number(order.total).toFixed(2)} euros</span>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] rounded-xl p-4 text-center">
              <Package className="h-6 w-6 text-white/15 mx-auto mb-2" />
              <p className="text-white/30 text-sm">Sin datos de productos (pedido antiguo)</p>
            </div>
          )}
        </div>

        {/* Shipping address */}
        {order.shipping_address && (
          <div className="bg-[#1e293b] rounded-2xl border border-white/[0.08] p-6 mb-6">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">Direccion de envio</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              {order.shipping_address.street}<br />
              {order.shipping_address.city}, {order.shipping_address.province}<br />
              {order.shipping_address.postal_code} - {order.shipping_address.country}
            </p>
          </div>
        )}

        {/* Help */}
        <div className="text-center py-4">
          <p className="text-white/30 text-xs">
            Necesitas ayuda?{" "}
            <a href="mailto:pedidos@tiendafitnesspro.es" className="text-electric hover:text-electric/80 transition-colors">
              pedidos@tiendafitnesspro.es
            </a>{" "}
            - WhatsApp{" "}
            <span className="text-green-400">633 184 354</span>
          </p>
        </div>
      </div>
    </div>
  );
}
