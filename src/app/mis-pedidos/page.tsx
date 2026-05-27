"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Eye, ShoppingBag, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_name: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  color_name: string | null;
  size: string | null;
}

interface Order {
  id: string;
  order_number: string | null;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  preparing: { label: "En preparación", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  processing: { label: "En proceso", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  shipped: { label: "Enviado", color: "bg-lime/15 text-lime border-lime/30" },
  delivered: { label: "Entregado", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelado", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function getStatusStyle(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
}

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);

      // ─── Paso 1: Obtener pedidos del usuario (sin nested order_items) ───
      // RLS en order_items puede bloquear el nested select, así que
      // consultamos orders primero y order_items por separado.
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (ordersError || !ordersData || ordersData.length === 0) {
        console.log("[MIS_PEDIDOS] No se encontraron pedidos:", ordersError?.message ?? "0 resultados");
        setOrders([]);
        setLoading(false);
        return;
      }

      // ─── Paso 2: Obtener order_items para todos los pedidos ─────────────
      const orderIds = ordersData.map((o) => o.id);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("id, order_id, product_name, image_url, quantity, unit_price, subtotal, color_name, size")
        .in("order_id", orderIds);

      if (itemsError) {
        console.warn("[MIS_PEDIDOS] Error cargando order_items:", itemsError.message);
        // Mostrar pedidos sin items en lugar de ocultarlos
      }

      // ─── Paso 3: Agrupar items por order_id ─────────────────────────────
      const itemsByOrderId = new Map<string, OrderItem[]>();
      for (const item of itemsData ?? []) {
        const oid = item.order_id;
        if (!itemsByOrderId.has(oid)) itemsByOrderId.set(oid, []);
        itemsByOrderId.get(oid)!.push({
          id: item.id,
          product_name: item.product_name,
          image_url: item.image_url,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          color_name: item.color_name,
          size: item.size,
        });
      }

      // ─── Paso 4: Combinar ───────────────────────────────────────────────
      const combined: Order[] = ordersData.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total: o.total,
        created_at: o.created_at,
        order_items: itemsByOrderId.get(o.id) ?? [],
      }));

      console.log("[MIS_PEDIDOS] Pedidos cargados:", combined.length, "con items");
      setOrders(combined);
      setLoading(false);
    }
    load();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-electric border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center max-w-md w-full">
          <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Inicia sesión</h2>
          <p className="text-white/50 text-sm mb-6">Necesitas iniciar sesión para ver tus pedidos.</p>
          <Link href="/auth/login">
            <Button className="bg-electric hover:bg-electric/90 text-white font-semibold">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="h-20" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Mis Pedidos</h1>
            <p className="text-white/50 mt-0.5 text-sm">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="bg-[#1e293b] rounded-2xl border border-white/[0.08] p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white/60 font-semibold mb-2">Aún no tienes pedidos</h3>
            <p className="text-white/30 text-sm mb-6">Explora nuestro catálogo y realiza tu primera compra.</p>
            <Link href="/productos">
              <Button className="bg-lime hover:bg-lime/90 text-deep font-semibold">
                Ver productos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
              const firstImage = order.order_items?.find((i) => i.image_url)?.image_url;
              const orderRef = order.order_number ?? order.id.substring(0, 8).toUpperCase();

              return (
                <Link
                  key={order.id}
                  href={`/pedido/${orderRef}`}
                  className="block bg-[#1e293b] rounded-2xl border border-white/[0.08] hover:border-white/10 transition-all duration-300 p-5"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      {firstImage ? (
                        <img src={firstImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold text-sm">#{orderRef}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-white/40 text-xs">
                        <span>{itemCount} artícul{itemCount !== 1 ? "os" : "o"}</span>
                        <span>·</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>

                    {/* Total + CTA */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold">{Number(order.total).toFixed(2)} €</p>
                      <div className="flex items-center gap-1 mt-1 text-electric text-xs font-medium">
                        <Eye className="h-3 w-3" />
                        Ver detalle
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
