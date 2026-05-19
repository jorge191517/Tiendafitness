-- ============================================
-- TIENDA FITNESS PRO — Datos Iniciales (Seed)
-- ============================================
-- Ejecutar DESPUÉS de schema.sql y rls.sql.
-- Inserta las categorías iniciales del catálogo.

INSERT INTO public.categories (name, slug, description, active) VALUES
  ('Fitness y Gym', 'fitness-gym', 'Equipamiento profesional para tu gimnasio: pesas, bandas, máquinas y más.', true),
  ('Pádel', 'padel', 'Palas, bolas y accesorios de pádel seleccionados para todos los niveles.', true),
  ('Ropa Deportiva', 'ropa-deportiva', 'Ropa técnica y calzado para correr, entrenar y competir.', true),
  ('Accesorios', 'accesorios', 'Relojes inteligentes, pulsómetros y complementos deportivos.', true),
  ('Suplementos', 'suplementos', 'Proteínas, BCAAs, vitaminas y suplementos para maximizar tu rendimiento.', true)
ON CONFLICT (slug) DO NOTHING;
