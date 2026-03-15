import Link from "next/link";
import styles from "./page.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motoinfo.com.br";

export const metadata = {
  title: "Motoinfo - Seu portal de informações (Ficha técnica) de Motos",
  description:
    "Motoinfo é o seu principal parceiro para busca, comparação e ficha técnica de motos. Mais de 4000 ano-modelos com imagens e preços FIPE atualizados. Seu portal de informações de motocicletas!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Motoinfo - Seu portal de informações (Ficha técnica) de Motos",
    description:
      "Motoinfo é o seu principal parceiro para busca, comparação e ficha técnica de motos. Mais de 4000 ano-modelos com imagens e preços FIPE atualizados.",
    url: "/",
    siteName: "Motoinfo",
    type: "website",
  },
};

const schemaMarkup = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Motoinfo",
      description:
        "Portal de informações, ficha técnica, comparação e preços FIPE de motos. Mais de 4000 ano-modelos.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/motos?marca={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Motoinfo",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-azul-menor.png`,
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <div className={styles.page}>
        <main className={styles.main}>
          <h1 className={styles.h1}>
            Motoinfo - Seu portal de informações (Ficha técnica) de Motos
          </h1>

          <section className={styles.content} aria-labelledby="sobre-motoinfo">
            <h2 id="sobre-motoinfo" className={styles.h2}>
              Seu parceiro em informações de motocicletas
            </h2>
            <p className={styles.lead}>
              Motoinfo é o seu principal parceiro, para te auxiliar na busca,
              comparação, dados e ficha técnica de Motos!
            </p>
            <p>
              Contamos também com imagens de mais de 4000 Ano-Modelos de
              diferentes motocicletas, e estamos constantemente atualizando nosso
              banco de dados com novas entradas, e preços FIPE de motos
              atualizados!
            </p>
            <p>
              Se você é um amante de moto, ou está em dúvida de qual moto
              escolher, nosso site é o seu lar!
            </p>
          </section>

          <nav className={styles.ctas} aria-label="Navegação principal">
            <Link href="/motos" className={styles.primary}>
              Consultar Ficha Técnica
            </Link>
            <Link href="/comparador" className={styles.secondary}>
              Comparador de Motos
            </Link>
          </nav>
        </main>
      </div>
    </>
  );
}
