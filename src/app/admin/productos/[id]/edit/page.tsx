"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/slugify";
import type { Category, ProductDB } from "@/lib/supabase/types";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  slug: z.string().min(1, "El slug es obligatorio"),
  category_id: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio debe ser positivo"),
  old_price: z.coerce.number().min(0).optional().or(z.literal("")),
  image_url: z.string().optional(),
  badge: z.string().optional(),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  stock_status: z.enum(["in_stock", "low_stock", "out_of_stock"]).default("in_stock"),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<ProductDB | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (nameValue && nameValue !== product?.name) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, setValue, product?.name]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories"),
        ]);

        if (productRes.ok) {
          const productData = await productRes.json();
          const p = productData.data as ProductDB;
          setProduct(p);
          reset({
            name: p.name,
            slug: p.slug,
            category_id: p.category_id || "",
            description: p.description || "",
            price: p.price,
            old_price: p.old_price ?? ("" as unknown as undefined),
            image_url: p.image_url || "",
            badge: p.badge || "",
            stock_quantity: p.stock_quantity,
            stock_status: p.stock_status,
            featured: p.featured,
            active: p.active,
          });
        } else {
          setError("No se pudo cargar el producto");
        }

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(catData.data || []);
        }
      } catch {
        setError("Error de conexión al cargar datos");
      } finally {
        setInitializing(false);
      }
    }
    fetchData();
  }, [id, reset]);

  async function onSubmit(values: ProductForm) {
    setLoading(true);
    setError(null);

    try {
      const body = {
        ...values,
        category_id: values.category_id || null,
        description: values.description || null,
        old_price: values.old_price ? Number(values.old_price) : null,
        image_url: uploadedImageUrl || values.image_url || null,
        badge: values.badge || null,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/productos");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar el producto");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/productos");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar el producto");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-electric" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-lg mb-4">Producto no encontrado</p>
          <Link
            href="/admin/productos"
            className="text-electric hover:text-electric/80 text-sm"
          >
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/productos"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                Editar Producto
              </h1>
              <p className="text-white/50 mt-0.5 text-sm">{product.name}</p>
            </div>
          </div>

          {/* Delete */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-mid-gray border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Eliminar producto</DialogTitle>
                <DialogDescription className="text-white/50">
                  ¿Estás seguro de que quieres eliminar &quot;{product.name}&quot;?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteOpen(false)}
                  className="text-white/50 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-mid-gray border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Nombre *</Label>
                  <Input
                    {...register("name")}
                    placeholder="Nombre del producto"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Slug *</Label>
                  <Input
                    {...register("slug")}
                    placeholder="slug-del-producto"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30"
                  />
                  {errors.slug && (
                    <p className="text-red-400 text-xs">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Categoría</Label>
                <Select
                  defaultValue={product.category_id || undefined}
                  onValueChange={(val) =>
                    setValue("category_id", val === "__none__" ? "" : val)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-mid-gray border-white/10">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="text-white/70 focus:text-white focus:bg-white/10"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Descripción</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Descripción del producto..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Imagen del Producto</Label>
                <ImageUpload
                  currentImageUrl={product.image_url || undefined}
                  onImageUploaded={(url) => setUploadedImageUrl(url)}
                  onImageRemoved={() => setUploadedImageUrl(null)}
                />
                <p className="text-white/20 text-[10px]">
                  O introduce una URL manualmente:
                </p>
                <Input
                  {...register("image_url")}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-mid-gray border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-base">Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Precio actual (€) *</Label>
                  <Input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30"
                  />
                  {errors.price && (
                    <p className="text-red-400 text-xs">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Precio anterior (€)</Label>
                  <Input
                    {...register("old_price")}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Badge */}
          <Card className="bg-mid-gray border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Stock y Etiqueta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Cantidad en stock</Label>
                  <Input
                    {...register("stock_quantity")}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-electric focus:ring-electric/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Estado de stock</Label>
                  <Select
                    defaultValue={product.stock_status}
                    onValueChange={(val) =>
                      setValue("stock_status", val as "in_stock" | "low_stock" | "out_of_stock")
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-mid-gray border-white/10">
                      <SelectItem value="in_stock" className="text-white/70 focus:text-white focus:bg-white/10">
                        En stock
                      </SelectItem>
                      <SelectItem value="low_stock" className="text-white/70 focus:text-white focus:bg-white/10">
                        Poco stock
                      </SelectItem>
                      <SelectItem value="out_of_stock" className="text-white/70 focus:text-white focus:bg-white/10">
                        Agotado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Etiqueta (Badge)</Label>
                <Select
                  defaultValue={product.badge || undefined}
                  onValueChange={(val) =>
                    setValue("badge", val === "__none__" ? "" : val)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                    <SelectValue placeholder="Sin etiqueta" />
                  </SelectTrigger>
                  <SelectContent className="bg-mid-gray border-white/10">
                    <SelectItem value="OFERTA" className="text-white/70 focus:text-white focus:bg-white/10">
                      OFERTA
                    </SelectItem>
                    <SelectItem value="NUEVO" className="text-white/70 focus:text-white focus:bg-white/10">
                      NUEVO
                    </SelectItem>
                    <SelectItem value="MÁS VENDIDO" className="text-white/70 focus:text-white focus:bg-white/10">
                      MÁS VENDIDO
                    </SelectItem>
                    <SelectItem value="TOP VALORADO" className="text-white/70 focus:text-white focus:bg-white/10">
                      TOP VALORADO
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card className="bg-mid-gray border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-base">Visibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white/70 text-sm">Producto destacado</Label>
                  <p className="text-white/30 text-xs mt-0.5">
                    Aparecerá en la sección de destacados
                  </p>
                </div>
                <Switch
                  defaultChecked={product.featured}
                  onCheckedChange={(checked) => setValue("featured", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white/70 text-sm">Producto activo</Label>
                  <p className="text-white/30 text-xs mt-0.5">
                    Los productos inactivos no se muestran en la tienda
                  </p>
                </div>
                <Switch
                  defaultChecked={product.active}
                  onCheckedChange={(checked) => setValue("active", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-electric hover:bg-electric/90 text-white font-bold px-6 shadow-[0_0_20px_rgba(0,153,255,0.3)]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Cambios
            </Button>
            <Link
              href="/admin/productos"
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
