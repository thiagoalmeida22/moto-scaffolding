const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motoinfo.com.br";

export default function robots() {
  return {
    host: SITE_URL.replace(/\/$/, ""),
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/login", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
