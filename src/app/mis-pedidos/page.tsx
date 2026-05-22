"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronRight,
  ArrowLeft,
  Loader2,
  PackageX,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, OrderItem, OrderStatus } from "@/lib/supabase/types";

// ── Status Configuration ──────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: "Pendiente",
    color: "text-[#FFB800]",
    bgColor: "bg-[#FFB800]/10",
    icon: "🕐",
  },
  confirmed: {
    label: "Confirmado",
    color: "text-[#0099FF]",
    bgColor: "bg-[#0099FF]/10",
    icon: "✅",
  },
  processing: {
    label: "En preparación",
    color: "text-[#FF8C00]",
    bgColor: "bg-[#FF8C00]/10",
    icon: "📦",
  },
  shipped: {
    label: "Enviado",
    color: "text-[#00D4FF]",
    bgColor: "bg-[#00D4FF]/10",
    icon: "🚚",
  },
  delivered: {
    label: "Entregado",
    color: "text-[#00CC66]",
    bgColor: "bg-[#00CC66]/10",
    icon: "🎉",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-[#FF4444]",
    bgColor: "bg-[#FF4444]/10",
    icon: "❌",
  },
};

// ── Filter Tabs ───────────────────────────────────────────────────────
const tabs = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "shipped", label: "Enviados" },
  { key: "delivered", label: "Entregados" },
];

// ── Order with items type ─────────────────────────────────────────────
interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// ── Helper: Generate order number ─────────────────────────────────────
function generateOrderNumber(order: OrderWithItems): string {
  const date = new Date(order.created_at);
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const shortId = order.id.slice(0, 5).toUpperCase();
  return `TFP-${dateStr}-${shortId}`;
}

// ── Helper: Format date in Spanish ────────────────────────────────────
function formatDateES(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Helper: Filter orders by tab ──────────────────────────────────────
function filterOrders(orders: OrderWithItems[], tab: string): OrderWithItems[] {
  if (tab === "all") return orders;
  if (tab === "pending") {
    return orders.filter(
      (o) =>
        o.status === "pending" ||
        o.status === "confirmed" ||
        o.status === "processing"
    );
  }
  if (tab === "shipped") {
    return orders.filter((o) => o.status === "shipped");
  }
  if (tab === "delivered") {
    return orders.filter((o) => o.status === "delivered");
  }
  return orders;
}

// ── Skeleton Card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,153,255,0.05)]">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 bg-white/5" />
          <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
        </div>
        <Skeleton className="h-4 w-32 bg-white/5" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 bg-white/5" />
          <Skeleton className="h-4 w-16 bg-white/5" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-12 w-12 rounded-lg bg-white/5" />
          <Skeleton className="h-12 w-12 rounded-lg bg-white/5" />
          <Skeleton className="h-12 w-12 rounded-lg bg-white/5" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl bg-white/5" />
      </CardContent>
    </Card>
  );
}

// ── Empty State ───────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; subtitle: string }> = {
    all: {
      title: "Aún no tienes pedidos",
      subtitle: "Cuando realices tu primer pedido, aparecerá aquí.",
    },
    pending: {
      title: "Sin pedidos pendientes",
      subtitle: "No tienes pedidos pendientes de confirmación o preparación.",
    },
    shipped: {
      title: "Sin pedidos enviados",
      subtitle: "No tienes pedidos en camino en este momento.",
    },
    delivered: {
      title: "Sin pedidos entregados",
      subtitle: "Aún no tienes pedidos entregados.",
    },
  };

  const msg = messages[tab] || messages.all;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-[#0099FF]/5 border border-[#0099FF]/10 flex items-center justify-center mb-6">
        <PackageX className="h-10 w-10 text-[#0099FF]/40" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{msg.title}</h3>
      <p className="text-white/40 text-sm text-center max-w-sm mb-8">
        {msg.subtitle}
      </p>
      {tab === "all" && (
        <Button
          asChild
          className="bg-[#0099FF] hover:bg-[#0099FF]/90 text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.4)] transition-all duration-300"
        >
          <Link href="/productos">Explorar Productos</Link>
        </Button>
      )}
    </motion.div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}

// ── Product Thumbnails Row ────────────────────────────────────────────
function ProductThumbnails({ items }: { items: OrderItem[] }) {
  const maxVisible = 4;
  const visible = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((item, i) => {
        // image_url se guarda directamente en order_items (no usa FK a products)
        const imageUrl = item.image_url || null;
        return (
          <div
            key={item.id}
            className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-[#0b1120] shrink-0"
            style={{ zIndex: maxVisible - i }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.product_name || "Producto"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <Package className="h-4 w-4 text-white/20" />
              </div>
            )}
          </div>
        );
      })}
      {remaining > 0 && (
        <div
          className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-[#0b1120] shrink-0 bg-white/10 backdrop-blur flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-bold text-white/70">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────
function OrderCard({ order }: { order: OrderWithItems }) {
  // Usar order_number de la BD (formato TFP-YYYYMMDD-XXXXX)
  const orderNumber = order.order_number || generateOrderNumber(order);
  const formattedDate = formatDateES(order.created_at);
  const itemCount = order.order_items?.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const config = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      layout
    >
      <Card className="bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,153,255,0.05)] hover:shadow-[0_0_40px_rgba(0,153,255,0.1)] hover:border-white/15 transition-all duration-300 group">
        <CardContent className="p-5 space-y-4">
          {/* Top row: Order number + Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white tracking-wide">
                #{orderNumber}
              </h3>
              <p className="text-xs text-white/40 mt-0.5 capitalize">
                {formattedDate}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Price + Items count */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-black text-white">
                {order.total.toFixed(2)} €
              </p>
              <p className="text-xs text-white/40">
                {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
              </p>
            </div>
            <ProductThumbnails items={order.order_items || []} />
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Action button */}
          <Button
            asChild
            className="w-full bg-white/5 hover:bg-[#0099FF]/10 border border-white/10 hover:border-[#0099FF]/30 text-white/70 hover:text-[#0099FF] font-semibold rounded-xl transition-all duration-300 group-hover:bg-[#0099FF]/5"
          >
            <Link
              href={`/pedido/${orderNumber}`}
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Seguimiento
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────
export default function MisPedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);

  // ── Auth check & data fetch ───────────────────────────────────────
  const fetchOrders = useCallback(async (uid: string, email?: string) => {
    try {
      const supabase = createClient();

      // Query orders by user_id
      let query = supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        return;
      }

      let ordersData = (data as OrderWithItems[]) || [];

      // If no orders found and user has email, also try matching guest orders
      if (ordersData.length === 0 && email) {
        const { data: guestData, error: guestError } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("customer_email", email)
          .order("created_at", { ascending: false });

        if (!guestError && guestData) {
          ordersData = guestData as OrderWithItems[];
        }
      }

      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(
          `/auth/login?redirectTo=${encodeURIComponent("/mis-pedidos")}`
        );
        return;
      }
      setUserId(user.id);
      fetchOrders(user.id, user.email ?? undefined);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace(
          `/auth/login?redirectTo=${encodeURIComponent("/mis-pedidos")}`
        );
        return;
      }
      if (session.user.id !== userId) {
        setUserId(session.user.id);
        setLoading(true);
        fetchOrders(session.user.id, session.user.email ?? undefined);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders, router]);

  // ── Filtered orders ───────────────────────────────────────────────
  const filteredOrders = filterOrders(orders, activeTab);

  // ── Tab counts ────────────────────────────────────────────────────
  const tabCounts = {
    all: orders.length,
    pending: orders.filter(
      (o) =>
        o.status === "pending" ||
        o.status === "confirmed" ||
        o.status === "processing"
    ).length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#081224] to-[#0b1120]">
      {/* Spacer for fixed header */}
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* ── Back button ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white/40 hover:text-white hover:bg-white/5 -ml-2"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al Inicio
            </Link>
          </Button>
        </motion.div>

        {/* ── Header Section ───────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#0099FF]/10 border border-[#0099FF]/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-[#0099FF]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Mis <span className="text-[#0099FF]">Pedidos</span>
              </h1>
              {!loading && (
                <p className="text-sm text-white/40 mt-0.5">
                  {orders.length}{" "}
                  {orders.length === 1
                    ? "pedido realizado"
                    : "pedidos realizados"}
                </p>
              )}
              {loading && (
                <Skeleton className="h-4 w-32 bg-white/5 mt-1" />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Filter Tabs ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count =
                tabCounts[tab.key as keyof typeof tabCounts] || 0;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    whitespace-nowrap transition-all duration-300 shrink-0 cursor-pointer
                    ${
                      isActive
                        ? "bg-[#0099FF]/15 text-[#0099FF] border border-[#0099FF]/30 shadow-[0_0_20px_rgba(0,153,255,0.15)]"
                        : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70 hover:border-white/10"
                    }
                  `}
                >
                  {tab.label}
                  <span
                    className={`
                      text-xs px-1.5 py-0.5 rounded-md font-bold
                      ${
                        isActive
                          ? "bg-[#0099FF]/20 text-[#0099FF]"
                          : "bg-white/5 text-white/30"
                      }
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Loading State ────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Orders List ──────────────────────────────────────────── */}
        {!loading && (
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <motion.div
                key={activeTab}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Bottom help section ──────────────────────────────────── */}
        {!loading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-xs text-white/20">
              ¿Necesitas ayuda con un pedido?{" "}
              <Link
                href="/contacto"
                className="text-[#0099FF]/60 hover:text-[#0099FF] transition-colors underline underline-offset-2"
              >
                Contáctanos
              </Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
