"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  LogIn,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import Link from "next/link";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  processing: "bg-purple-500/15 text-purple-400",
  shipped: "bg-electric/15 text-electric",
  delivered: "bg-lime/15 text-lime",
  cancelled: "bg-red-500/15 text-red-400",
};

const statusIcons: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: Clock,
};

export default function MisPedidosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchOrders(user.id, user.email);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchOrders = async (userId: string, userEmail?: string) => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Buscar pedidos por user_id O por customer_email (para guest checkout que luego se loguea)
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Primero intentar por user_id
      const { data: userOrders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && userOrders && userOrders.length > 0) {
        setOrders(userOrders as Order[]);
      } else if (userEmail) {
        // Si no hay pedidos con user_id, buscar por email (para pedidos guest)
        const { data: emailOrders, error: emailError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", userEmail)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!emailError && emailOrders) {
          setOrders(emailOrders as Order[]);
        }
      }
    } catch (err) {
      console.error("[MisPedidos] Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  // No logueado
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-mid-gray border-white/5">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-electric" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
              Mis Pedidos
            </h2>
            <p className="text-white/60 mb-8">
              Inicia sesión para ver tus pedidos y hacer seguimiento de tus envíos.
            </p>
            <Button
              asChild
              className="bg-electric hover:bg-electric/90 text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.3)]"
            >
              <Link href="/auth/login">
                <LogIn className="h-5 w-5 mr-2" />
                Iniciar Sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Mis <span className="text-electric">Pedidos</span>
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              Consulta el estado de tus pedidos
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-electric animate-spin" />
          </div>
        )}

        {/* No orders */}
        {!loading && orders.length === 0 && (
          <Card className="bg-mid-gray border-white/5">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No tienes pedidos todavía</h3>
              <p className="text-white/50 text-sm mb-6">
                Cuando realices tu primera compra, aparecerá aquí.
              </p>
              <Button
                asChild
                className="bg-electric hover:bg-electric/90 text-white font-bold rounded-xl"
              >
                <Link href="/productos">Ver Productos</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              const shortId = order.id.substring(0, 8).toUpperCase();
              return (
                <a key={order.id} href={`/pedido/${shortId}`}>
                  <Card className="bg-mid-gray border-white/5 hover:border-electric/20 transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-electric/10 transition-colors">
                            <StatusIcon className="h-5 w-5 text-white/50 group-hover:text-electric transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              Pedido #{shortId}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">
                              {Number(order.total).toFixed(2)} €
                            </p>
                            <span
                              className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusColors[order.status]}`}
                            >
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-electric transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
