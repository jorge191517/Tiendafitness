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
    <div className="space-y-4">
      {/* Vista móvil: Tarjetas para pantallas inferiores a lg */}
      <div className="lg:hidden space-y-4">
        {products.map((product) => {
          const stockInfo = stockStatusLabels[product.stock_status] || stockStatusLabels.in_stock;
          const isLoading = loadingId === product.id;
          const badgeLabel = product.badge ? (badgeLabels[product.badge] || product.badge) : null;

          return (
            <div
              key={product.id}
              className="rounded-2xl bg-mid-gray border border-white/5 p-4 space-y-4 shadow-lg"
            >
              {/* Encabezado: Miniatura + Nombre + Categoría */}
              <div className="flex gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white/5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-white/20 text-xs">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
                  <p className="text-white/40 text-xs truncate mt-0.5">{product.slug}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {product.category?.name || "Sin cat."}
                    </span>
                    {badgeLabel && (
                      <span className="text-[10px] font-bold text-electric bg-electric/10 px-2 py-0.5 rounded border border-electric/10">
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid de precios, stock, destacado y estado */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-white/5 text-sm">
                <div>
                  <p className="text-white/40 text-xs">Precio</p>
                  <p className="text-white font-semibold mt-0.5">
                    {product.price.toFixed(2)} €
                    {product.old_price && (
                      <span className="text-white/30 text-xs line-through ml-1.5">
                        {product.old_price.toFixed(2)} €
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Stock</p>
                  <p className={`font-semibold mt-0.5 ${stockInfo.color}`}>
                    {stockInfo.label}
                    <span className="text-white/30 text-xs font-normal ml-1">
                      ({product.stock_quantity})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Destacado</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {product.featured ? (
                      <>
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-white/70 text-xs">Sí</span>
                      </>
                    ) : (
                      <>
                        <Star className="h-3.5 w-3.5 text-white/10" />
                        <span className="text-white/30 text-xs">No</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Estado</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold mt-1 border ${
                      product.active
                        ? "bg-lime/10 text-lime border-lime/20"
                        : "bg-white/5 text-white/30 border-white/10"
                    }`}
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {/* Botones de acción expandidos */}
              <div className="flex items-center gap-3">
                <Link href={`/admin/productos/${product.id}/edit`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full h-10 border-white/15 text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => toggleActive(product)}
                  disabled={isLoading}
                  className={`flex-1 h-10 text-xs font-bold gap-2 ${
                    product.active
                      ? "border-red-500/20 text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                      : "border-lime/20 text-lime/80 hover:text-lime hover:bg-lime/10"
                  }`}
                >
                  {product.active ? (
                    <>
                      <PowerOff className="h-3.5 w-3.5" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5" />
                      Activar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista de escritorio: Tabla estándar */}
      <div className="hidden lg:block rounded-2xl bg-mid-gray border border-white/5 overflow-hidden">
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
    </div>
  );
}
