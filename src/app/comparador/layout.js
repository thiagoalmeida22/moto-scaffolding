import Script from "next/script";

export const metadata = {
  title: "Comparador de Motos - Motoinfo",
  alternates: {
    canonical: "/comparador",
  },
};

export default function ComparadorLayout({ children }) {
  return (
    <>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1553103771237763"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
