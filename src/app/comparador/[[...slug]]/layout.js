const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motoinfo.com.br";
const VS_SEP = "-vs-";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugParam = resolvedParams?.slug;
  const slugStr = Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";

  if (!slugStr || slugStr.trim() === "") {
    return {};
  }

  const motoSlugs = slugStr.split(VS_SEP).filter(Boolean);
  if (motoSlugs.length < 2) {
    return {};
  }

  const canonicalSlugs = [...motoSlugs].sort((a, b) => a.localeCompare(b));
  const canonicalPath = `/comparador/${canonicalSlugs.join(VS_SEP)}`;

  return {
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: `${SITE_URL}${canonicalPath}`,
    },
  };
}

export default function ComparadorSlugLayout({ children }) {
  return children;
}
