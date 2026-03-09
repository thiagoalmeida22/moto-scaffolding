import Script from "next/script";

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
