import Script from "next/script";

export const metadata = {
  title: "Ficha Técnica de Moto - Motoinfo",
  description:
    "Consulte ficha técnica de motos. Especificações, preço FIPE e fotos de mais de 4000 ano-modelos. - Motoinfo",
};

export default function MotosLayout({ children }) {
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
