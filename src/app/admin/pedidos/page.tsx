"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/lib/supabase/types";
import {
  updateOrderStatus,
  updateOrderTracking,
  resendOrderEmail,
} from "./actions";
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Package,
  Loader2,
  AlertCircle,
  Search,
  ExternalLink,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/* ──────────────────────────────────────────
   Status Config
   ────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pendiente",
    color: "#FFB800",
    bg: "rgba(255,184,0,0.15)",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmado",
    color: "#0099FF",
    bg: "rgba(0,153,255,0.15)",
    icon: CheckCircle,
  },
  processing: {
    label: "En preparación",
    color: "#FF8C00",
    bg: "rgba(255,140,0,0.15)",
    icon: Package,
  },
  shipped: {
    label: "Enviado",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.15)",
    icon: Truck,
  },
  delivered: {
    label: "Entregado",
    color: "#00CC66",
    bg: "rgba(0,204,102,0.15)",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    color: "#FF4444",
    bg: "rgba(255,68,68,0.15)",
    icon: AlertCircle,
  },
};

const STATUS_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"];

function getNextStatuses(current: string): string[] {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1) return STATUS_FLOW;
  return STATUS_FLOW.slice(idx + 1);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(n: number): string {
  return n.toFixed(2) + " €";
}

/* ──────────────────────────────────────────
   Status Badge Component
   ────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

/* ──────────────────────────────────────────
   Stats Card Component
   ────────────────────────────────────────── */

function StatsCard({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-[1.02]"
      style={{ backgroundColor: "rgba(11,17,32,0.8)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-black text-white">{count}</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Order Detail Panel Component
   ────────────────────────────────────────── */

function OrderDetailPanel({ order }: { order: OrderWithItems }) {
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [tracking, setTracking] = useState({
    shipping_company: order.shipping_company || "",
    tracking_number: order.tracking_number || "",
    tracking_url: order.tracking_url || "",
    admin_notes: order.admin_notes || "",
  });

  const addr = order.shipping_address as {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
  } | null;

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    setMessage(null);
    const result = await updateOrderStatus(order.id, newStatus);
    if (result.success) {
      setMessage({ type: "success", text: `Estado actualizado a ${STATUS_CONFIG[newStatus]?.label || newStatus}` });
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage({ type: "error", text: result.error || "Error al actualizar estado" });
    }
    setSaving(false);
  };

  const handleSaveTracking = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateOrderTracking(order.id, tracking);
    if (result.success) {
      setMessage({ type: "success", text: "Datos de seguimiento guardados" });
    } else {
      setMessage({ type: "error", text: result.error || "Error al guardar" });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleResendEmail = async () => {
    setResending(true);
    setMessage(null);
    const result = await resendOrderEmail(order.id);
    if (result.success) {
      setMessage({ type: "success", text: "Email reenviado correctamente" });
    } else {
      setMessage({ type: "error", text: result.error || "Error al reenviar email" });
    }
    setResending(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 space-y-6">
      {/* Message */}
      {message && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{
            backgroundColor:
              message.type === "success"
                ? "rgba(0,204,102,0.15)"
                : "rgba(255,68,68,0.15)",
            color: message.type === "success" ? "#00CC66" : "#FF4444",
          }}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Customer & Shipping Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div
          className="rounded-xl p-4 border border-white/5"
          style={{ backgroundColor: "rgba(5,8,22,0.5)" }}
        >
          <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-[#0099FF]" />
            Datos del Cliente
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Nombre</span>
              <span className="text-white font-medium">
                {order.customer_name || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Email</span>
              <span className="text-[#0099FF] font-medium">
                {order.customer_email || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Teléfono</span>
              <span className="text-white font-medium">
                {order.customer_phone || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div
          className="rounded-xl p-4 border border-white/5"
          style={{ backgroundColor: "rgba(5,8,22,0.5)" }}
        >
          <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#AAFF00]" />
            Dirección de Envío
          </h4>
          {addr ? (
            <div className="text-sm text-white/80 leading-relaxed">
              <p>{addr.street}</p>
              <p>
                {addr.city}
                {addr.province ? `, ${addr.province}` : ""}
              </p>
              <p>
                {addr.postal_code}
                {addr.country ? ` — ${addr.country}` : ""}
              </p>
            </div>
          ) : (
            <p className="text-white/30 text-sm">No especificada</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div
        className="rounded-xl border border-white/5 overflow-hidden"
        style={{ backgroundColor: "rgba(5,8,22,0.5)" }}
      >
        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider px-4 pt-4 pb-2 flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-[#FF8C00]" />
          Productos del Pedido
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2 text-white/40 font-medium">
                  Producto
                </th>
                <th className="text-center px-4 py-2 text-white/40 font-medium">
                  Cant.
                </th>
                <th className="text-right px-4 py-2 text-white/40 font-medium">
                  Precio
                </th>
                <th className="text-right px-4 py-2 text-white/40 font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(order.order_items || []).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name || "Producto"}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-white/20" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">
                          {item.product_name || "Producto"}
                        </p>
                        {(item.color_name || item.size) && (
                          <p className="text-white/30 text-xs">
                            {[item.color_name, item.size ? `Talla ${item.size}` : ""]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-4 py-3 text-white/60">
                    {item.quantity}
                  </td>
                  <td className="text-right px-4 py-3 text-white/60">
                    {formatPrice(Number(item.unit_price))}
                  </td>
                  <td className="text-right px-4 py-3 text-white font-semibold">
                    {formatPrice(Number(item.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end px-4 py-3 border-t border-white/5">
          <span className="text-white/50 mr-3">Total:</span>
          <span className="text-xl font-black text-white">
            {formatPrice(Number(order.total))}
          </span>
        </div>
      </div>

      {/* Status Change */}
      <div
        className="rounded-xl p-4 border border-white/5"
        style={{ backgroundColor: "rgba(5,8,22,0.5)" }}
      >
        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3">
          Cambiar Estado
        </h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const isActive = order.status === status;
            return (
              <button
                key={status}
                onClick={() => !isActive && handleStatusChange(status)}
                disabled={saving || isActive}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: isActive ? cfg.color : "rgba(255,255,255,0.5)",
                  backgroundColor: isActive ? cfg.bg : "transparent",
                  borderColor: isActive ? cfg.color : "rgba(255,255,255,0.1)",
                  boxShadow: isActive ? `0 0 12px ${cfg.color}33` : "none",
                }}
              >
                {cfg.label}
              </button>
            );
          })}
          {order.status !== "cancelled" && (
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border disabled:opacity-50"
              style={{
                color: "#FF4444",
                backgroundColor: "transparent",
                borderColor: "rgba(255,68,68,0.3)",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Tracking & Notes */}
      <div
        className="rounded-xl p-4 border border-white/5"
        style={{ backgroundColor: "rgba(5,8,22,0.5)" }}
      >
        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-[#00D4FF]" />
          Seguimiento y Notas
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">
              Transportista
            </label>
            <Input
              value={tracking.shipping_company}
              onChange={(e) =>
                setTracking({ ...tracking, shipping_company: e.target.value })
              }
              placeholder="Ej: Correos, SEUR, DHL..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#0099FF]/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">
              Nº de Seguimiento
            </label>
            <Input
              value={tracking.tracking_number}
              onChange={(e) =>
                setTracking({ ...tracking, tracking_number: e.target.value })
              }
              placeholder="Ej: 1234567890ABC"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#0099FF]/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">
              URL de Seguimiento
            </label>
            <Input
              value={tracking.tracking_url}
              onChange={(e) =>
                setTracking({ ...tracking, tracking_url: e.target.value })
              }
              placeholder="https://www.correos.es/..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#0099FF]/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Notas de Admin
            </label>
            <Textarea
              value={tracking.admin_notes}
              onChange={(e) =>
                setTracking({ ...tracking, admin_notes: e.target.value })
              }
              placeholder="Notas internas sobre este pedido..."
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#0099FF]/50 resize-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSaveTracking}
            disabled={saving}
            className="bg-[#0099FF] hover:bg-[#0099FF]/90 text-white font-bold gap-2 shadow-[0_0_20px_rgba(0,153,255,0.3)]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Seguimiento
          </Button>
          <Button
            onClick={handleResendEmail}
            disabled={resending}
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 gap-2"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Reenviar Email
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Order Row Component
   ────────────────────────────────────────── */

function OrderRow({ order }: { order: OrderWithItems }) {
  const [expanded, setExpanded] = useState(false);

  const itemCount = (order.order_items || []).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const orderNumber = order.order_number || order.id.substring(0, 8);

  return (
    <div
      className="rounded-2xl border border-white/10 overflow-hidden transition-all duration-300"
      style={{ backgroundColor: "rgba(11,17,32,0.8)" }}
    >
      {/* Main Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Order info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/5 items-center justify-center shrink-0">
              <ShoppingCart className="h-5 w-5 text-[#0099FF]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-sm">
                  #{orderNumber}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                <span className="truncate">
                  {order.customer_name || "Cliente"}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline truncate">
                  {order.customer_email || ""}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Meta */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-white/40 text-xs">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">
                {formatPrice(Number(order.total))}
              </p>
              <p className="text-white/30 text-xs">
                {itemCount} art{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-white/30">
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile date */}
        <div className="md:hidden mt-1 text-xs text-white/30">
          {formatDate(order.created_at)}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 sm:px-6 pb-6">
          <OrderDetailPanel order={order} />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────── */

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check admin access
  useEffect(() => {
    async function checkAdmin() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setOrders((data as OrderWithItems[]) || []);
      }
    } catch {
      setError("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin === true) {
      fetchOrders();
    }
  }, [isAdmin, fetchOrders]);

  // Access denied
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120]">
        <div className="h-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-[#0b1120]/80 border border-white/10 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF4444]/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-[#FF4444]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Acceso Denegado
              </h2>
              <p className="text-white/50 text-sm max-w-md">
                No tienes permisos de administrador para acceder a esta sección.
                Si crees que es un error, contacta con el soporte.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-300 border border-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la Tienda
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading auth check
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#0099FF] animate-spin" />
      </div>
    );
  }

  // Compute stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      (order.order_number || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (order.customer_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (order.customer_email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120]">
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
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Pedidos
              </h1>
              <p className="text-white/50 mt-0.5 text-sm">
                {orders.length} pedido{orders.length !== 1 ? "s" : ""} en total
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Total Pedidos"
            count={stats.total}
            color="#0099FF"
            icon={ShoppingCart}
          />
          <StatsCard
            label="Pendientes"
            count={stats.pending}
            color="#FFB800"
            icon={Clock}
          />
          <StatsCard
            label="Enviados"
            count={stats.shipped}
            color="#00D4FF"
            icon={Truck}
          />
          <StatsCard
            label="Entregados"
            count={stats.delivered}
            color="#00CC66"
            icon={CheckCircle}
          />
        </div>

        {/* Filters */}
        <Card className="bg-[#0b1120]/80 border border-white/10 rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nº pedido, nombre o email..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#0099FF]/50"
                />
              </div>
              {/* Status Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                    statusFilter === "all"
                      ? "bg-white/10 text-white border-white/20"
                      : "text-white/40 border-white/5 hover:text-white/60 hover:border-white/10"
                  }`}
                >
                  Todos
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                      statusFilter === key
                        ? "border-current"
                        : "border-white/5 hover:border-white/10"
                    }`}
                    style={{
                      color: statusFilter === key ? cfg.color : "rgba(255,255,255,0.4)",
                      backgroundColor:
                        statusFilter === key ? cfg.bg : "transparent",
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#0099FF] animate-spin" />
          </div>
        ) : error ? (
          <Card className="bg-[#0b1120]/80 border border-white/10 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-8 w-8 text-[#FF4444] mb-4" />
              <p className="text-white/50 text-sm">{error}</p>
              <Button
                onClick={fetchOrders}
                variant="outline"
                className="mt-4 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-[#0b1120]/80 border border-white/10 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-white/10 mb-4" />
              <p className="text-white/50 text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "No se encontraron pedidos con los filtros aplicados"
                  : "No hay pedidos todavía"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                  className="mt-4 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  Limpiar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Footer Info */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 text-center text-white/20 text-xs">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </div>
        )}
      </div>
    </div>
  );
}
