"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem, OrderStatus } from "@/lib/supabase/types";
import Link from "next/link";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const timelineSteps: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "Pedido recibido", icon: Clock },
  { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { key: "processing", label: "En preparación", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle2 },
];

const statusOrder: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function PedidoPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Buscar pedido — primero por ID exacto, luego por prefijo
      // El orderNumber es un short ID (8 primeros caracteres del UUID)
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .like("id", `${orderNumber}%`)
        .limit(1);

      if (error || !orders || orders.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const foundOrder = orders[0] as Order;
      setOrder(foundOrder);

      // Cargar items del pedido
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", foundOrder.id)
        .order("created_at", { ascending: true });

      if (orderItems) {
        setItems(orderItems as OrderItem[]);
      }
    } catch (err) {
      console.error("[Pedido] Error cargando pedido:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentStepIndex = (): number => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    return statusOrder.indexOf(order.status);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-electric animate-spin" />
      </div>
    );
  }

  // Not found
  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-mid-gray border-white/5">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Pedido no encontrado</h2>
            <p className="text-white/50 text-sm mb-6">
              No hemos podido encontrar el pedido #{orderNumber}
            </p>
            <Button asChild className="bg-electric hover:bg-electric/90 text-white font-bold rounded-xl">
              <Link href="/mis-pedidos">Ver Mis Pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const isCancelled = order.status === "cancelled";
  const address = order.shipping_address as { street: string; city: string; province: string; postal_code: string; country: string } | null;

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
            asChild
          >
            <Link href="/mis-pedidos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Pedido <span className="text-electric">#{orderNumber}</span>
            </h1>
            <p className="text-sm text-white/40 mt-0.5">{formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Timeline de seguimiento */}
        <Card className="bg-mid-gray border-white/5 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-6">Seguimiento del pedido</h2>

            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                <div>
                  <p className="font-semibold text-red-400">Pedido cancelado</p>
                  <p className="text-sm text-white/50">Este pedido ha sido cancelado.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      {/* Línea conectora */}
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-[19px] top-10 w-0.5 h-8 ${
                            index < currentStep ? "bg-electric" : "bg-white/10"
                          }`}
                        />
                      )}

                      {/* Círculo del step */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isCompleted
                            ? isCurrent
                              ? "bg-electric shadow-[0_0_20px_rgba(0,153,255,0.4)]"
                              : "bg-electric/20"
                            : "bg-white/5"
                        }`}
                      >
                        <StepIcon
                          className={`h-5 w-5 ${
                            isCompleted ? "text-electric" : "text-white/20"
                          }`}
                        />
                      </div>

                      {/* Label */}
                      <div className="pt-2 pb-6">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted ? "text-white" : "text-white/30"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-electric mt-0.5">Estado actual</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tracking info */}
            {order.tracking_number && (
              <div className="mt-4 p-4 rounded-xl bg-dark-gray border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-electric" />
                  <p className="text-sm font-semibold text-white">Información de envío</p>
                </div>
                {order.shipping_company && (
                  <p className="text-sm text-white/60">
                    Transportista: <span className="text-white">{order.shipping_company}</span>
                  </p>
                )}
                <p className="text-sm text-white/60">
                  Nº seguimiento: <span className="text-white font-mono">{order.tracking_number}</span>
                </p>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-electric hover:underline mt-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Seguimiento en tiempo real
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productos del pedido */}
        {items.length > 0 && (
          <Card className="bg-mid-gray border-white/5 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Productos</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-dark-gray overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{item.product_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.color_name && (
                          <span className="text-xs text-white/50">{item.color_name}</span>
                        )}
                        {item.size && (
                          <>
                            <span className="text-white/20">·</span>
                            <span className="text-xs text-white/50">Talla {item.size}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-white/40">{item.quantity} × {Number(item.unit_price).toFixed(2)} €</span>
                        <span className="text-sm font-bold text-white">{Number(item.subtotal).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/10 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-white/50 font-medium">Total</span>
                <span className="text-xl font-black text-white">{Number(order.total).toFixed(2)} €</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Datos del envío */}
        <Card className="bg-mid-gray border-white/5 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">Datos de envío</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-electric shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white">{order.customer_name}</p>
                  {address && (
                    <p className="text-sm text-white/50">
                      {address.street}<br />
                      {address.city}, {address.province}<br />
                      {address.postal_code} — {address.country}
                    </p>
                  )}
                </div>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-electric shrink-0" />
                  <p className="text-sm text-white/50">{order.customer_phone}</p>
                </div>
              )}
              {order.customer_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-electric shrink-0" />
                  <p className="text-sm text-white/50">{order.customer_email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
