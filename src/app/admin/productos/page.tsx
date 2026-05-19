import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, ArrowLeft } from "lucide-react";
import ProductTable from "./product-table";
import type { ProductDB, Category } from "@/lib/supabase/types";

interface ProductWithCategory extends ProductDB {
  category: Category | null;
}

export default async function ProductosPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false });

  const productList = (products as ProductWithCategory[] | null) ?? [];

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
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                Productos
              </h1>
              <p className="text-white/50 mt-0.5 text-sm">
                {productList.length} producto{productList.length !== 1 ? "s" : ""} registrado{productList.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/admin/productos/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric hover:bg-electric/90 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,153,255,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Link>
        </div>

        {/* Product Table */}
        <ProductTable products={productList} />
      </div>
    </div>
  );
}
