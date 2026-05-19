# Guía de Subida de Productos — TiendaFitnessPro

Esta guía explica cómo subir productos a tu tienda usando diferentes métodos.

---

## Requisitos Previos

1. Tener un proyecto de Supabase configurado en [supabase.com](https://supabase.com)
2. Haber ejecutado `schema.sql` y `rls.sql` en el SQL Editor de Supabase
3. Haber configurado las variables de entorno en `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

---

## Método 1: Panel Admin (Recomendado para pocos productos)

1. Accede a `/admin` en tu tienda
2. Haz clic en **"Nuevo Producto"**
3. Rellena el formulario con los datos del producto
4. El slug se genera automáticamente a partir del nombre
5. Sube la imagen del producto
6. Guarda el producto

**Ventajas:**
- Interfaz visual intuitiva
- Vista previa inmediata
- No requiere conocimientos técnicos

---

## Método 2: Seed Inicial (Datos de demostración)

Si es la primera vez que configuras la tienda, puedes cargar los productos de ejemplo:

```bash
npx tsx src/scripts/seed-products.ts
```

Este script:
- Crea las 5 categorías por defecto (Fitness y Gym, Pádel, Ropa Deportiva, Accesorios, Suplementos)
- Inserta los 8 productos de ejemplo
- Se puede ejecutar varias veces sin duplicar datos (usa `upsert` por slug)
- Actualiza los datos si el producto ya existe

---

## Método 3: Importación Masiva por CSV (Recomendado para catálogos grandes)

### Preparar el archivo CSV

Crea un archivo CSV con estas columnas obligatorias:

| Columna | Obligatoria | Descripción | Ejemplo |
|---------|-------------|-------------|---------|
| `name` | ✅ | Nombre del producto | Set de Bandas de Resistencia Pro |
| `slug` | ✅ | URL-friendly (sin espacios, minúsculas) | set-bandas-resistencia-pro |
| `category` | ✅ | Slug de la categoría | fitness-gym |
| `price` | ✅ | Precio actual en euros | 29.99 |
| `description` | ❌ | Descripción del producto | Set completo de 5 bandas... |
| `old_price` | ❌ | Precio anterior (tachado) | 49.99 |
| `image_url` | ❌ | URL de la imagen | https://... |
| `badge` | ❌ | Etiqueta: OFERTA, NUEVO, MÁS VENDIDO, TOP VALORADO | OFERTA |
| `stock_quantity` | ❌ | Unidades disponibles (default: 100) | 100 |
| `featured` | ❌ | Producto destacado: true/false (default: false) | true |
| `active` | ❌ | Producto activo: true/false (default: true) | true |

### Ejemplo de CSV

```csv
name,slug,category,description,price,old_price,image_url,badge,stock_quantity,featured,active
Set de Bandas Pro,set-bandas-pro,fitness-gym,Set de 5 bandas,29.99,49.99,https://...,OFERTA,100,true,true
Pala Pádel Pro,pala-padel-pro,padel,Pala de carbono,189.99,,,,50,true,true
```

### Ejecutar la importación

```bash
npx tsx src/scripts/import-products-csv.ts ruta/al/archivo.csv
```

### Plantilla de CSV

Usa el archivo `docs/products-template.csv` como plantilla. Contiene productos de ejemplo con el formato correcto.

### Notas importantes

- Las categorías se crean automáticamente si no existen
- Si un producto ya existe (mismo slug), se actualiza en lugar de duplicarse
- El script muestra un resumen al finalizar: productos creados, actualizados, omitidos y errores
- Puedes ejecutar el script varias veces de forma segura

---

## Método 4: Subir productos por SQL (Avanzado)

Si prefieres usar SQL directamente, puedes ejecutar consultas en el SQL Editor de Supabase:

```sql
-- Insertar un producto
INSERT INTO public.products (name, slug, category_id, description, price, old_price, image_url, badge, stock_quantity, stock_status, featured, active)
VALUES (
  'Nombre del Producto',
  'slug-del-producto',
  (SELECT id FROM public.categories WHERE slug = 'fitness-gym'),
  'Descripción del producto',
  29.99,
  49.99,
  'https://imagen-url.com/foto.jpg',
  'OFERTA',
  100,
  'in_stock',
  true,
  true
);
```

---

## Crear el Primer Administrador

Después de configurar Supabase:

1. Regístrate en `/auth/register` con tu email
2. Confirma tu email si es necesario
3. En el SQL Editor de Supabase, ejecuta:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'TU-USER-UUID';
```

Para encontrar tu UUID:

```sql
SELECT id, email FROM auth.users;
```

4. Ahora puedes acceder a `/admin`

---

## Estructura de Imágenes

### Supabase Storage (Recomendado)

1. Crea un bucket llamado `product-images` en Supabase Dashboard → Storage
2. Configura el bucket como público para que las imágenes sean accesibles
3. Sube imágenes desde el panel admin o mediante la API

### URLs Externas

También puedes usar URLs de imágenes externas (Unsplash, tu CDN, etc.) en el campo `image_url`.

---

## Solución de Problemas

### "Faltan variables de entorno"
→ Configura `.env.local` con tus credenciales de Supabase

### "Error de permisos RLS"
→ Asegúrate de haber ejecutado `rls.sql` y de estar autenticado como admin

### "Categoría no encontrada"
→ Las categorías deben existir antes de asignar productos. Ejecuta `seed.sql` o créalas desde el panel admin

### "El producto ya existe"
→ Usa un slug diferente o el sistema actualizará el producto existente
