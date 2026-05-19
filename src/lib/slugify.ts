/**
 * Utilidad para generar slugs URL-friendly a partir de texto.
 * Permite generar slugs automáticamente en vez de hardcodearlos.
 *
 * Ejemplo:
 *   slugify("Set de Bandas de Resistencia Pro")
 *   → "set-de-bandas-de-resistencia-pro"
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                    // Separar tildes de sus letras
    .replace(/[\u0300-\u036f]/g, "")     // Eliminar tildes
    .replace(/[^\w\s-]/g, "")            // Eliminar caracteres especiales
    .trim()
    .replace(/[\s-]+/g, "-")             // Espacios y guiones múltiples → un guion
    .replace(/^-+|-+$/g, "");            // Eliminar guiones al inicio/fin
}
