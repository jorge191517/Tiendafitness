"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, Mail, RefreshCw, ChevronDown, ChevronUp, Eye, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_name: string | null;
  product_slug: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  color_name: string | null;
  size: string | null;
}

interface Order {
  id: string;
  order_number: string | null;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, string> | null;
  shipping_company: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  admin_note: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "preparing", label: "En preparación", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "shipped", label: "Enviado", color: "bg-lime/15 text-lime border-lime/30" },
  { value: "delivered", label: "Entregado", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/15 text-red-400 border-red-500/30" },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ orderId: string; type: "success" | "error"; msg: string } | null>(null);
  const [trackingForm, setTrackingForm] = useState<Record<string, { shipping_company: string; tracking_number: string; tracking_url: string }>>({});

  const showFeedback = (orderId: string, type: "success" | "error", msg: string) => {
    setFeedback({ orderId, type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? []);
      }
    } catch (err) {
      console.error("[ADMIN_PEDIDOS] Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const statusLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label ?? newStatus;
    if (!confirm(`¿Confirmas cambiar el estado del pedido a "${statusLabel}"?`)) return;

    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showFeedback(orderId, "success", `Estado cambiado a ${statusLabel}`);
      } else {
        showFeedback(orderId, "error", data.error ?? "Error al actualizar estado");
      }
    } catch {
      showFeedback(orderId, "error", "Error de conexión");
    } finally {
      setUpdating(null);
    }
  };

  const handleTrackingSave = async (orderId: string) => {
    setUpdating(orderId);
    const form = trackingForm[orderId];
    if (!form) return;
    try {
      const res = await fetch("/api/admin/orders/update-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, shipping_company: form.shipping_company || null, tracking_number: form.tracking_number || null, tracking_url: form.tracking_url || null }
              : o
          )
        );
        showFeedback(orderId, "success", "Seguimiento guardado");
      } else {
        showFeedback(orderId, "error", data.error ?? "Error al guardar seguimiento");
      }
    } catch {
      showFeedback(orderId, "error", "Error de conexión");
    } finally {
      setUpdating(null);
    }
  };

  const handleResendEmail = async (orderId: string) => {
    if (!confirm("¿Quieres reenviar los emails de este pedido?")) return;

    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(orderId, "success", "Emails reenviados");
      } else {
        showFeedback(orderId, "error", data.error ?? "Error al reenviar");
      }
    } catch {
      showFeedback(orderId, "error", "Error de conexión");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderRef: string) => {
    if (!confirm(`¿Seguro que quieres eliminar el pedido #${orderRef}? Esta acción no se puede deshacer.`)) return;

    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setExpandedOrderId(null);
      } else {
        showFeedback(orderId, "error", data.error ?? "Error al eliminar");
      }
    } catch {
      showFeedback(orderId, "error", "Error de conexión");
    } finally {
      setUpdating(null);
    }
  };

  // Initialize tracking form when expanding
  const toggleExpand = (order: Order) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(order.id);
      setTrackingForm((prev) => ({
        ...prev,
        [order.id]: {
          shipping_company: order.shipping_company ?? "",
          tracking_number: order.tracking_number ?? "",
          tracking_url: order.tracking_url ?? "",
        },
      }));
    }
  };

  // Filter orders
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      (o.order_number ?? "").toLowerCase().includes(term) ||
      (o.customer_name ?? "").toLowerCase().includes(term) ||
      (o.customer_email ?? "").toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Pedidos</h1>
              <p className="text-white/50 mt-0.5 text-sm">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Buscar por número, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-mid-gray border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-electric"
          >
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 text-electric animate-spin mr-3" />
            <span className="text-white/50">Cargando pedidos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-mid-gray/50 rounded-2xl border border-white/5 p-12 text-center">
            <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No hay pedidos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const statusStyle = getStatusStyle(order.status);
              const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
              const form = trackingForm[order.id];
              const orderRef = order.order_number ?? order.id.substring(0, 8).toUpperCase();

              return (
                <div key={order.id} className="bg-mid-gray/50 rounded-2xl border border-white/5 overflow-hidden">
                  {/* Order header row */}
                  <button
                    onClick={() => toggleExpand(order)}
                    className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold text-sm">
                          #{orderRef}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-white/40 text-xs">
                        <span>{order.customer_name ?? "Sin nombre"}</span>
                        <span>{itemCount} art.</span>
                        <span>{Number(order.total).toFixed(2)} €</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-white/30 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/30 flex-shrink-0" />
                    )}
                  </button>

                  {/* Feedback banner */}
                  {feedback && feedback.orderId === order.id && (
                    <div className={`px-6 py-2 text-xs font-medium ${feedback.type === "success" ? "bg-lime/10 text-lime" : "bg-red-500/10 text-red-400"}`}>
                      {feedback.msg}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-white/5 px-6 py-5 space-y-6">
                      {/* Customer info + Status change */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Datos del Cliente</h3>
                          <div className="space-y-1.5 text-sm">
                            <p className="text-white/70"><span className="text-white/40">Nombre:</span> {order.customer_name ?? "—"}</p>
                            <p className="text-white/70"><span className="text-white/40">Email:</span> {order.customer_email ?? "—"}</p>
                            <p className="text-white/70"><span className="text-white/40">Teléfono:</span> {order.customer_phone ?? "—"}</p>
                          </div>
                          {order.shipping_address && (
                            <div className="mt-3">
                              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Dirección</h4>
                              <p className="text-white/70 text-sm">
                                {order.shipping_address.street}<br />
                                {order.shipping_address.city}, {order.shipping_address.province}<br />
                                {order.shipping_address.postal_code} — {order.shipping_address.country}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status change */}
                        <div>
                          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Cambiar Estado</h3>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s.value}
                                disabled={updating === order.id}
                                onClick={() => handleStatusChange(order.id, s.value)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                                  order.status === s.value
                                    ? s.color
                                    : "bg-white/5 text-white/40 border-white/10 hover:text-white/70 hover:border-white/20"
                                } disabled:opacity-50`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updating === order.id}
                              onClick={() => handleResendEmail(order.id)}
                              className="border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs"
                            >
                              <Mail className="h-3 w-3 mr-1.5" />
                              Reenviar emails
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updating === order.id}
                              onClick={() => handleDeleteOrder(order.id, orderRef)}
                              className="border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1.5" />
                              Eliminar pedido
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      <div>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Productos ({itemCount})</h3>
                        {order.order_items && order.order_items.length > 0 ? (
                          <div className="space-y-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.product_name ?? ""} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-5 w-5 text-white/20" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{item.product_name ?? "Producto"}</p>
                                  <p className="text-white/40 text-xs">
                                    {item.color_name && <span>{item.color_name}</span>}
                                    {item.color_name && item.size && <span> · </span>}
                                    {item.size && <span>Talla {item.size}</span>}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-white text-sm font-semibold">{Number(item.total).toFixed(2)} €</p>
                                  <p className="text-white/40 text-xs">{item.quantity} × {Number(item.unit_price).toFixed(2)} €</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white/[0.02] rounded-xl p-4 text-center">
                            <Package className="h-6 w-6 text-white/15 mx-auto mb-2" />
                            <p className="text-white/30 text-sm">Sin datos de productos (pedido antiguo)</p>
                          </div>
                        )}
                      </div>

                      {/* Tracking */}
                      <div>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                          <Truck className="h-3.5 w-3.5 inline mr-1.5" />
                          Seguimiento de Envío
                        </h3>
                        {form && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-white/50 text-xs">Empresa</Label>
                              <Input
                                value={form.shipping_company}
                                onChange={(e) =>
                                  setTrackingForm((prev) => ({
                                    ...prev,
                                    [order.id]: { ...prev[order.id], shipping_company: e.target.value },
                                  }))
                                }
                                placeholder="Correos, Seur..."
                                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
                              />
                            </div>
                            <div>
                              <Label className="text-white/50 text-xs">Nº Seguimiento</Label>
                              <Input
                                value={form.tracking_number}
                                onChange={(e) =>
                                  setTrackingForm((prev) => ({
                                    ...prev,
                                    [order.id]: { ...prev[order.id], tracking_number: e.target.value },
                                  }))
                                }
                                placeholder="1234567890"
                                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
                              />
                            </div>
                            <div>
                              <Label className="text-white/50 text-xs">URL Seguimiento</Label>
                              <Input
                                value={form.tracking_url}
                                onChange={(e) =>
                                  setTrackingForm((prev) => ({
                                    ...prev,
                                    [order.id]: { ...prev[order.id], tracking_url: e.target.value },
                                  }))
                                }
                                placeholder="https://..."
                                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 h-9"
                              />
                            </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          disabled={updating === order.id}
                          onClick={() => handleTrackingSave(order.id)}
                          className="mt-3 bg-electric hover:bg-electric/90 text-white text-xs font-semibold h-8"
                        >
                          Guardar seguimiento
                        </Button>
                      </div>

                      {/* Admin note */}
                      {order.admin_note && (
                        <div>
                          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Nota interna</h3>
                          <p className="text-white/60 text-sm">{order.admin_note}</p>
                        </div>
                      )}

                      {/* View in storefront */}
                      <div className="flex justify-end">
                        <Link
                          href={`/pedido/${order.order_number ?? order.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-electric hover:text-electric/80 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver como cliente
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
