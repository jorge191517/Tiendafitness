import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package, FolderOpen, ShoppingCart, Plus, TrendingUp, Users, BarChart3 } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const [productsRes, categoriesRes, ordersRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Productos", count: productsRes.count ?? 0, icon: Package, href: "/admin/productos", color: "text-electric", bgHover: "hover:border-electric/30" },
    { label: "Categorías", count: categoriesRes.count ?? 0, icon: FolderOpen, href: "/admin/categorias", color: "text-lime", bgHover: "hover:border-lime/30" },
    { label: "Pedidos", count: ordersRes.count ?? 0, icon: ShoppingCart, href: "/admin/pedidos", color: "text-yellow-400", bgHover: "hover:border-yellow-400/30" },
  ];

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Panel Admin
            </h1>
            <p className="text-white/50 mt-1">Gestión de TiendaFitnessPro</p>
          </div>
          <Link
            href="/admin/productos/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric hover:bg-electric/90 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,153,255,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group rounded-2xl bg-mid-gray border border-white/5 ${stat.bgHover} transition-all duration-300 p-6 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-mid-gray border border-white/5 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-electric" />
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              href="/admin/productos"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-electric/10 border border-white/10 hover:border-electric/30 text-white/70 hover:text-white transition-all duration-300 text-sm font-medium text-center"
            >
              Gestionar Productos
            </Link>
            <Link
              href="/admin/categorias"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-lime/10 border border-white/10 hover:border-lime/30 text-white/70 hover:text-white transition-all duration-300 text-sm font-medium text-center"
            >
              Gestionar Categorías
            </Link>
            <Link
              href="/admin/pedidos"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/30 text-white/70 hover:text-white transition-all duration-300 text-sm font-medium text-center"
            >
              Gestionar Pedidos
            </Link>
            <Link
              href="/admin/productos/new"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-electric/10 border border-white/10 hover:border-electric/30 text-white/70 hover:text-white transition-all duration-300 text-sm font-medium text-center"
            >
              Añadir Producto
            </Link>
            <Link
              href="/"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-300 text-sm font-medium text-center"
            >
              Ver Tienda
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-mid-gray border border-white/5 p-6">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-lime" />
              Resumen de Inventario
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Desde aquí puedes gestionar todos los aspectos de tu tienda online.
              Añade nuevos productos, organiza las categorías y controla los pedidos
              de forma sencilla.
            </p>
          </div>
          <div className="rounded-2xl bg-mid-gray border border-white/5 p-6">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              Ayuda
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Para editar un producto existente, navega a la sección de productos y
              haz clic en el botón de editar. Puedes activar o desactivar productos
              sin eliminarlos para mantener el historial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
