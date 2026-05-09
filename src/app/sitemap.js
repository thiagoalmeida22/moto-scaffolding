import { slugify } from '@/utils/slug.js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motoinfo.com.br";

export const revalidate = 86400;

export default async function sitemap() {
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/motos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/comparador`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  let motoPages = [];
  try {
    const { default: dbPool } = await import('@/utils/database.js');
    const [rows] = await dbPool.query(
      `SELECT m.modelo, m.ano, marcas.nome AS marca
       FROM motos.motos AS m
       JOIN motos.marcas AS marcas ON m.marca = marcas.id
       ORDER BY marcas.nome, m.modelo, m.ano`
    );
    if (Array.isArray(rows) && rows.length > 0) {
      motoPages = rows.map((r) => ({
        url: `${SITE_URL}/motos/${slugify(r.marca)}/${slugify(r.modelo)}/${r.ano}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('[Sitemap] Erro ao buscar motos:', err?.message || err);
  }

  return [...staticPages, ...motoPages];
}
