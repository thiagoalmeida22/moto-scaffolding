const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motoinfo.com.br";

export async function generateMetadata({ params }) {
  const { marca, modelo, ano } = await params;
  const canonical = `/motos/${marca}/${modelo}/${ano}`;
  return {
    alternates: {
      canonical,
    },
    openGraph: {
      url: `${SITE_URL}${canonical}`,
    },
  };
}

export default function FichaLayout({ children }) {
  return children;
}
