/**
 * Script de seed: inserta los productos locales en Supabase.
 * 
 * USO: npx tsx src/scripts/seed-products.ts
 * 
 * Requiere las variables de entorno configuradas en .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * 
 * Este script:
 * - Lee los productos desde src/data/products/
 * - Crea/actualiza las categorías en Supabase
 * - Inserta los productos en Supabase
 * - Evita duplicados usando slug
 * - Se puede reejecutar sin romper datos
 */

import { createClient } from '@supabase/supabase-js';
import { categories } from '../data/categories';
import { allProducts } from '../data/products';

// Cargar variables de entorno desde .env.local
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

async function seed() {
  console.log('🚀 Iniciando seed de TiendaFitnessPro...\n');

  // 1. Insertar categorías
  console.log('📦 Insertando categorías...');
  const categoryMap: Record<string, string> = {}; // slug -> uuid
  
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? null,
        active: true,
      }, { onConflict: 'slug' })
      .select('id')
      .single();
    
    if (error) {
      console.error(`  ❌ Error con categoría "${cat.name}":`, error.message);
      continue;
    }
    categoryMap[cat.slug] = data.id;
    console.log(`  ✅ Categoría: ${cat.name} (${data.id})`);
  }

  // 2. Insertar productos
  console.log('\n🛍️  Insertando productos...');
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const product of allProducts) {
    const categoryId = categoryMap[product.category] ?? null;
    
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', product.slug)
      .single();

    const productData = {
      category_id: categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      old_price: product.oldPrice ?? null,
      image_url: product.image,
      rating: product.rating,
      reviews_count: product.reviews,
      badge: product.badge ?? null,
      stock_status: product.stock ?? 'in_stock',
      stock_quantity: product.stock === 'out_of_stock' ? 0 : 100,
      featured: product.featured ?? false,
      active: true,
    };

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('slug', product.slug);
      
      if (error) {
        console.error(`  ❌ Error actualizando "${product.name}":`, error.message);
        errors++;
      } else {
        updated++;
        console.log(`  🔄 Actualizado: ${product.name}`);
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);
      
      if (error) {
        console.error(`  ❌ Error creando "${product.name}":`, error.message);
        errors++;
      } else {
        created++;
        console.log(`  ✅ Creado: ${product.name}`);
      }
    }
  }

  // 3. Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DEL SEED:');
  console.log(`  Categorías procesadas: ${Object.keys(categoryMap).length}`);
  console.log(`  Productos creados: ${created}`);
  console.log(`  Productos actualizados: ${updated}`);
  console.log(`  Errores: ${errors}`);
  console.log('='.repeat(50));

  if (errors === 0) {
    console.log('\n✅ Seed completado con éxito.');
  } else {
    console.log('\n⚠️  Seed completado con errores. Revisa los mensajes arriba.');
  }
}

seed().catch(console.error);
