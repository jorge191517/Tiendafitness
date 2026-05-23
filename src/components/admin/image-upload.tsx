"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  /** URL actual de la imagen (para editar producto existente) */
  currentImageUrl?: string;
  /** Callback cuando se selecciona/sube una nueva imagen */
  onImageUploaded: (url: string) => void;
  /** Callback cuando se elimina la imagen */
  onImageRemoved?: () => void;
}

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no permitido. Solo PNG, JPEG y WebP.");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      setError("El archivo supera el límite de 2 MB.");
      return;
    }

    // Mostrar preview local inmediatamente
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Subir al servidor
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Reemplazar preview local con URL pública
        URL.revokeObjectURL(localPreview);
        setPreview(data.url);
        onImageUploaded(data.url);
      } else {
        setError(data.error || "Error al subir la imagen");
        // Revertir preview
        URL.revokeObjectURL(localPreview);
        setPreview(currentImageUrl ?? null);
      }
    } catch {
      setError("Error de conexión al subir la imagen");
      URL.revokeObjectURL(localPreview);
      setPreview(currentImageUrl ?? null);
    } finally {
      setUploading(false);
      // Reset input para poder re-subir el mismo archivo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageRemoved?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="relative w-full max-w-xs">
          <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-deep/60 rounded-xl flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-electric" />
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      {!preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-electric/50 bg-white/[0.02] hover:bg-white/[0.04] flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-electric" />
              <span className="text-white/40 text-xs">Subiendo...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-electric/10 transition-colors">
                <Upload className="h-5 w-5 text-white/30 group-hover:text-electric transition-colors" />
              </div>
              <span className="text-white/40 text-xs font-medium">Subir imagen</span>
              <span className="text-white/20 text-[10px]">PNG, JPEG, WebP · Máx. 2 MB</span>
            </>
          )}
        </button>
      )}

      {/* Change image button (when preview exists) */}
      {preview && !uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs"
        >
          <ImageIcon className="h-3 w-3 mr-1.5" />
          Cambiar imagen
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}
