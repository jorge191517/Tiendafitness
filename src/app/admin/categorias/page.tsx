"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Power,
  PowerOff,
  Check,
  X,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/lib/supabase/types";

export default function CategoriasPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New category form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit category
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch {
      setError("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug: slugify(newName.trim()),
          description: newDescription.trim() || null,
          active: true,
        }),
      });

      if (res.ok) {
        setNewName("");
        setNewDescription("");
        setShowNewForm(false);
        fetchCategories();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear la categoría");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: slugify(editName.trim()),
          description: editDescription.trim() || null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchCategories();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar la categoría");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active }),
      });

      if (res.ok) {
        fetchCategories();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar la categoría");
      }
    } catch {
      setError("Error de conexión");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteId(null);
        fetchCategories();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar la categoría");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-deep">
      <div className="h-20" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Categorías
              </h1>
              <p className="text-white/50 mt-0.5 text-sm">
                {categories.length} categoría{categories.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-electric hover:bg-electric/90 text-white font-bold shadow-[0_0_20px_rgba(0,153,255,0.3)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* New Category Form */}
        {showNewForm && (
          <Card className="bg-mid-gray border-electric/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-electric" />
                Crear Nueva Categoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Nombre *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre de la categoría"
                    className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus:border-electric focus:ring-electric/30"
                  />
                  {newName && (
                    <p className="text-white/30 text-xs">
                      Slug: {slugify(newName)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Descripción</Label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Descripción opcional"
                    className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus:border-electric focus:ring-electric/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="bg-electric hover:bg-electric/90 text-white font-bold"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Crear
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewName("");
                    setNewDescription("");
                  }}
                  className="text-white/50 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-electric" />
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="rounded-2xl bg-mid-gray border border-white/5 p-12 text-center">
            <FolderOpen className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No hay categorías registradas</p>
            <p className="text-white/30 text-sm mt-2">
              Crea tu primera categoría para organizar los productos
            </p>
            <Button
              onClick={() => setShowNewForm(true)}
              className="mt-4 bg-electric hover:bg-electric/90 text-white font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Categoría
            </Button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className={`bg-mid-gray border-white/5 transition-all duration-300 ${
                  !cat.active ? "opacity-50" : ""
                }`}
              >
                {editingId === cat.id ? (
                  /* Edit Mode */
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-xs">Nombre</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-white/8 border-white/18 text-white text-sm focus:border-electric focus:ring-electric/30"
                      />
                      {editName && (
                        <p className="text-white/30 text-xs">
                          Slug: {slugify(editName)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-xs">Descripción</Label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="bg-white/8 border-white/18 text-white text-sm focus:border-electric focus:ring-electric/30 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={saving || !editName.trim()}
                        className="bg-electric hover:bg-electric/90 text-white text-xs h-8"
                      >
                        {saving ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="text-white/50 hover:text-white text-xs h-8"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  /* View Mode */
                  <>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-white text-sm font-bold truncate">
                            {cat.name}
                          </CardTitle>
                          <p className="text-white/30 text-xs mt-0.5">{cat.slug}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(cat)}
                            className="h-7 w-7 p-0 text-white/30 hover:text-electric hover:bg-electric/10"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(cat.id)}
                            className="h-7 w-7 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      {cat.description ? (
                        <p className="text-white/40 text-xs line-clamp-2 mb-3">
                          {cat.description}
                        </p>
                      ) : (
                        <p className="text-white/20 text-xs italic mb-3">
                          Sin descripción
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            cat.active
                              ? "bg-lime/10 text-lime"
                              : "bg-white/5 text-white/30"
                          }`}
                        >
                          {cat.active ? "Activa" : "Inactiva"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-xs">
                            {cat.active ? "Desactivar" : "Activar"}
                          </span>
                          <Switch
                            checked={cat.active}
                            onCheckedChange={() => toggleActive(cat)}
                            className="data-[state=checked]:bg-lime"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Delete Dialog */}
        <Dialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <DialogContent className="bg-mid-gray border-white/15 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Eliminar categoría</DialogTitle>
              <DialogDescription className="text-white/50">
                ¿Estás seguro de que quieres eliminar esta categoría? Los productos
                asociados quedarán sin categoría asignada. Esta acción no se puede
                deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteId(null)}
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
    </div>
  );
}
