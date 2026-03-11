'use client';

import { useEffect, useRef } from 'react';

/**
 * Componente de bloco de anúncio AdSense Sidebar-Vertical.
 * Deve ser usado dentro das páginas que já carregam o script adsbygoogle.js (motos e comparador).
 */
export default function AdSidebar() {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle ||[]).push({});
      }
    } catch (e) {
      console.warn('AdSense push error:', e);
    }
  }, []);

  return (
    <div className="ad-sidebar">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1553103771237763"
        data-ad-slot="6604407807"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
