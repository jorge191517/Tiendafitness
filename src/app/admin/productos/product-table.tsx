"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Power, PowerOff, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductDB, Category } from "@/lib/supabase/types";

interface ProductWithCategory extends ProductDB {
  category: Category | null;
}

interface ProductTableProps {
  products: ProductWithCategory[];
}

const stockStatusLabels: Record<string, { label: string; color: string }> = {
  in_stock: { label: "En stock", color: "text-lime" },
  low_stock: { label: "Poco stock", color: "text-yellow-400" },
  out_of_stock: { label: "Agotado", color: "text-red-400" },
};

const badgeLabels: Record<string, string> = {
  OFERTA: "Oferta",
  NUEVO: "Nuevo",
  "MÁS VENDIDO": "Más vendido",
  "TOP VALORADO": "Top valorado",
};

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleActive(product: ProductWithCategory) {
    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar el producto");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setLoadingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-mid-gray border border-white/5 p-12 text-center">
        <p className="text-white/50 text-lg">No hay productos registrados</p>
        <Link
          href="/admin/productos/new"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-electric hover:bg-electric/90 text-white font-bold rounded-xl transition-all duration-300 text-sm"
        >
          Crear primer producto
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-mid-gray border border-white/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-white/50">Producto</TableHead>
            <TableHead className="text-white/50">Categoría</TableHead>
            <TableHead className="text-white/50">Precio</TableHead>
            <TableHead className="text-white/50">Stock</TableHead>
            <TableHead className="text-white/50">Badge</TableHead>
            <TableHead className="text-white/50 text-center">Destacado</TableHead>
            <TableHead className="text-white/50 text-center">Estado</TableHead>
            <TableHead className="text-white/50 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockInfo = stockStatusLabels[product.stock_status] || stockStatusLabels.in_stock;
            const isLoading = loadingId === product.id;

            return (
              <TableRow
                key={product.id}
                className="border-white/5 hover:bg-white/[0.02]"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white/5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <span className="text-white/20 text-xs">—</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium text-sm truncate max-w-[200px]">
                        {product.name}
                      </p>
                      <p className="text-white/30 text-xs">{product.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-white/60 text-sm">
                    {product.category?.name || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="text-white font-semibold text-sm">
                      {product.price.toFixed(2)} €
                    </span>
                    {product.old_price && (
                      <span className="text-white/30 text-xs line-through ml-1">
                        {product.old_price.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${stockInfo.color}`}>
                    {stockInfo.label}
                  </span>
                  <span className="text-white/30 text-xs ml-1">
                    ({product.stock_quantity})
                  </span>
                </TableCell>
                <TableCell>
                  {product.badge ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-electric/10 text-electric text-xs font-medium">
                      {badgeLabels[product.badge] || product.badge}
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {product.featured ? (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mx-auto" />
                  ) : (
                    <Star className="h-4 w-4 text-white/10 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                      product.active
                        ? "bg-lime/10 text-lime"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {product.active ? (
                      <>
                        <Eye className="h-3 w-3" /> Activo
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Inactivo
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/productos/${product.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-white/50 hover:text-electric hover:bg-electric/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(product)}
                      disabled={isLoading}
                      className={`h-8 w-8 p-0 ${
                        product.active
                          ? "text-lime/70 hover:text-red-400 hover:bg-red-400/10"
                          : "text-white/30 hover:text-lime hover:bg-lime/10"
                      }`}
                    >
                      {product.active ? (
                        <PowerOff className="h-3.5 w-3.5" />
                      ) : (
                        <Power className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
