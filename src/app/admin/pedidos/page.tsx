import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderTable from "./order-table";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function AdminPedidosPage() {
  const adminClient = await createAdminClient();

  const { data: orders } = await adminClient
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Gestión de <span className="text-electric">Pedidos</span>
              </h1>
              <p className="text-white/50 text-sm mt-0.5">
                {orders?.length ?? 0} pedidos registrados
              </p>
            </div>
          </div>
        </div>

        {/* Orders table */}
        {orders && orders.length > 0 ? (
          <OrderTable orders={orders} statusLabels={statusLabels} />
        ) : (
          <div className="rounded-2xl bg-mid-gray border border-white/5 p-12 text-center">
            <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No hay pedidos</h3>
            <p className="text-white/50 text-sm">Los pedidos aparecerán aquí cuando los clientes realicen compras.</p>
          </div>
        )}
      </div>
    </div>
  );
}
