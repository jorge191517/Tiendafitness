/**
 * Script de importación masiva de productos desde CSV.
 * 
 * USO: npx tsx src/scripts/import-products-csv.ts <archivo.csv>
 * 
 * Columnas esperadas:
 * name, slug, category, description, price, old_price, image_url, badge, stock_quantity, featured, active
 * 
 * El script:
 * - Valida los datos
 * - Crea la categoría si no existe
 * - Inserta o actualiza el producto por slug
 * - Muestra resumen final
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno. Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface CSVRow {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: string;
  old_price: string;
  image_url: string;
  badge: string;
  stock_quantity: string;
  featured: string;
  active: string;
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    console.error('❌ El CSV está vacío o no tiene datos.');
    process.exit(1);
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['name', 'slug', 'category', 'price'];
  
  for (const req of requiredHeaders) {
    if (!headers.includes(req)) {
      console.error(`❌ Columna requerida faltante: ${req}`);
      process.exit(1);
    }
  }

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;
    
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row as CSVRow);
  }

  return rows;
}

async function importProducts(csvPath: string) {
  console.log('🚀 Iniciando importación de productos desde CSV...\n');
  console.log(`📄 Archivo: ${csvPath}\n`);

  // Leer CSV
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Archivo no encontrado: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  
  console.log(`📊 ${rows.length} productos encontrados en el CSV.\n`);

  // Cache de categorías
  const categoryCache: Record<string, string> = {}; // slug -> uuid
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    // Validar datos
    if (!row.name || !row.slug || !row.category || !row.price) {
      console.error(`  ⏭️  Fila omitida por datos incompletos: ${row.name || 'SIN NOMBRE'}`);
      skipped++;
      continue;
    }

    const price = parseFloat(row.price);
    if (isNaN(price) || price < 0) {
      console.error(`  ⏭️  Precio inválido para: ${row.name}`);
      skipped++;
      continue;
    }

    // Obtener o crear categoría
    let categoryId = categoryCache[row.category];
    if (!categoryId) {
      // Buscar categoría existente
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', row.category)
        .single();
      
      if (existingCat) {
        categoryId = existingCat.id;
        categoryCache[row.category] = categoryId;
      } else {
        // Crear categoría nueva
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert({
            name: row.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            slug: row.category,
            active: true,
          })
          .select('id')
          .single();
        
        if (catError || !newCat) {
          console.error(`  ❌ No se pudo crear categoría "${row.category}": ${catError?.message}`);
          errors++;
          continue;
        }
        categoryId = newCat.id;
        categoryCache[row.category] = categoryId;
        console.log(`  📁 Nueva categoría creada: ${row.category}`);
      }
    }

    // Insertar o actualizar producto
    const productData = {
      category_id: categoryId,
      name: row.name,
      slug: row.slug,
      description: row.description || null,
      price: price,
      old_price: row.old_price ? parseFloat(row.old_price) : null,
      image_url: row.image_url || null,
      badge: row.badge || null,
      stock_quantity: parseInt(row.stock_quantity || '100', 10),
      stock_status: parseInt(row.stock_quantity || '100', 10) > 0 ? 'in_stock' : 'out_of_stock',
      featured: row.featured?.toLowerCase() === 'true',
      active: row.active?.toLowerCase() !== 'false',
    };

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', row.slug)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('slug', row.slug);
      
      if (error) {
        console.error(`  ❌ Error actualizando "${row.name}":`, error.message);
        errors++;
      } else {
        updated++;
        console.log(`  🔄 Actualizado: ${row.name}`);
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);
      
      if (error) {
        console.error(`  ❌ Error creando "${row.name}":`, error.message);
        errors++;
      } else {
        created++;
        console.log(`  ✅ Creado: ${row.name}`);
      }
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE IMPORTACIÓN:');
  console.log(`  Productos creados: ${created}`);
  console.log(`  Productos actualizados: ${updated}`);
  console.log(`  Filas omitidas: ${skipped}`);
  console.log(`  Errores: ${errors}`);
  console.log('='.repeat(50));
}

const csvFile = process.argv[2];
if (!csvFile) {
  console.error('❌ Uso: npx tsx src/scripts/import-products-csv.ts <archivo.csv>');
  process.exit(1);
}

importProducts(path.resolve(csvFile)).catch(console.error);
