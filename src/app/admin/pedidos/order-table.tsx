"use client";

import { useState } from "react";
import {
  ChevronRight,
  Eye,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderWithItems {
  id: string;
  user_id: string | null;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, string> | null;
  shipping_company: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_slug: string;
    product_name: string;
    color_name: string | null;
    size: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

interface OrderTableProps {
  orders: OrderWithItems[];
  statusLabels: Record<string, string>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  processing: "bg-purple-500/15 text-purple-400",
  shipped: "bg-electric/15 text-electric",
  delivered: "bg-lime/15 text-lime",
  cancelled: "bg-red-500/15 text-red-400",
};

const allStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderTable({ orders, statusLabels }: OrderTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [shippingCompany, setShippingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          shipping_company: shippingCompany || undefined,
          tracking_number: trackingNumber || undefined,
          tracking_url: trackingUrl || undefined,
        }),
      });
      if (res.ok) {
        // Reload to reflect changes
        window.location.reload();
      } else {
        const data = await res.json();
        console.error("[Admin] Error updating order:", data.error);
        alert("Error al actualizar el pedido: " + (data.error || "Error desconocido"));
      }
    } catch (err) {
      console.error("[Admin] Error updating order:", err);
      alert("Error de conexión al actualizar el pedido");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const shortId = order.id.substring(0, 8).toUpperCase();
        const isExpanded = expandedOrder === order.id;
        const itemsCount = order.order_items?.length ?? 0;

        return (
          <Card key={order.id} className="bg-mid-gray border-white/5 overflow-hidden">
            {/* Order header — always visible */}
            <button
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              className="w-full text-left"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white/50" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">#{shortId}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {formatDate(order.created_at)} · {itemsCount} {itemsCount === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{Number(order.total).toFixed(2)} €</p>
                      <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusColors[order.status] || "bg-white/10 text-white/50"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-white/20 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </CardContent>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-white/5 p-5 space-y-5">
                {/* Customer info */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Cliente</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-white/40">Nombre:</span>{" "}
                      <span className="text-white">{order.customer_name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Email:</span>{" "}
                      <span className="text-electric">{order.customer_email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Teléfono:</span>{" "}
                      <span className="text-white">{order.customer_phone || "—"}</span>
                    </div>
                  </div>
                  {order.shipping_address && (
                    <p className="text-sm text-white/50 mt-2">
                      {order.shipping_address.street}, {order.shipping_address.city},{" "}
                      {order.shipping_address.province} {order.shipping_address.postal_code}
                    </p>
                  )}
                </div>

                {/* Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Productos</h4>
                    <div className="rounded-xl bg-dark-gray border border-white/5 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-white/40">
                            <th className="text-left p-3">Producto</th>
                            <th className="text-center p-3">Cant.</th>
                            <th className="text-right p-3">Precio</th>
                            <th className="text-right p-3">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.order_items.map((item) => (
                            <tr key={item.id} className="border-b border-white/5 last:border-0">
                              <td className="p-3 text-white">
                                {item.product_name}
                                <span className="text-white/40 text-xs ml-1">
                                  {item.color_name ? `${item.color_name}` : ""}
                                  {item.size ? ` · Talla ${item.size}` : ""}
                                </span>
                              </td>
                              <td className="p-3 text-center text-white/60">{item.quantity}</td>
                              <td className="p-3 text-right text-white/60">{Number(item.unit_price).toFixed(2)} €</td>
                              <td className="p-3 text-right text-white font-semibold">{Number(item.subtotal).toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Status change */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Cambiar estado</h4>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        disabled={updating === order.id || order.status === status}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          order.status === status
                            ? statusColors[status] + " ring-1 ring-current"
                            : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                        } disabled:opacity-50`}
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          statusLabels[status]
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking info */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">
                    <Truck className="h-4 w-4 inline mr-1" />
                    Información de envío
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-white/50 text-xs">Empresa de envío</Label>
                      <Input
                        placeholder="Correos, Seur, MRW..."
                        defaultValue={order.shipping_company || ""}
                        onChange={(e) => setShippingCompany(e.target.value)}
                        className="bg-dark-gray border-white/10 text-white text-sm placeholder:text-white/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/50 text-xs">Nº seguimiento</Label>
                      <Input
                        placeholder="1234567890"
                        defaultValue={order.tracking_number || ""}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="bg-dark-gray border-white/10 text-white text-sm placeholder:text-white/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/50 text-xs">URL seguimiento</Label>
                      <Input
                        placeholder="https://..."
                        defaultValue={order.tracking_url || ""}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        className="bg-dark-gray border-white/10 text-white text-sm placeholder:text-white/20"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, order.status)}
                    disabled={updating === order.id}
                    className="mt-3 bg-electric hover:bg-electric/90 text-white font-semibold rounded-lg"
                  >
                    {updating === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Guardar datos de envío"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
