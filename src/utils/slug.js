/**
 * Converte texto em slug amigável para URL.
 * Ex: "Honda CB 500" -> "honda-cb-500"
 */
export function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') // remove caracteres especiais
    .replace(/-+/g, '-') // múltiplos hífens -> um
    .replace(/^-|-$/g, ''); // trim hífens das pontas
}

/**
 * Gera slug completo de uma moto (marca-modelo-ano).
 * Ex: { marca: "Honda", modelo: "CB 500", ano: 2024 } -> "honda-cb-500-2024"
 */
export function motoSlug(marca, modelo, ano) {
  const m = slugify(String(marca ?? ''));
  const mod = slugify(String(modelo ?? ''));
  const a = String(ano ?? '').replace(/\D/g, '');
  if (!m || !mod || !a) return '';
  return `${m}-${mod}-${a}`;
}
