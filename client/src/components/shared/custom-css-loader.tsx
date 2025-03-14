import { useEffect, useState } from 'react';

/**
 * Componenta responsabilă pentru încărcarea și aplicarea CSS-ului personalizat global și pentru mobil
 * CSS-ul este încărcat dinamic și injectat în pagină
 */
export default function CustomCssLoader() {
  const [globalCssLoaded, setGlobalCssLoaded] = useState(false);
  const [mobileCssLoaded, setMobileCssLoaded] = useState(false);

  // Încărcăm CSS-ul global
  useEffect(() => {
    const loadGlobalCss = async () => {
      try {
        const response = await fetch('/api/cms/custom_css_global');
        if (response.ok) {
          const content = await response.json();
          if (content && content.value) {
            // Injectăm CSS-ul global în pagină
            const styleElement = document.createElement('style');
            styleElement.id = 'custom-global-css';
            styleElement.textContent = content.value;
            document.head.appendChild(styleElement);
            setGlobalCssLoaded(true);
          }
        } else {
          console.log('Nu există CSS global personalizat.');
        }
      } catch (error) {
        console.error('Eroare la încărcarea CSS-ului global:', error);
      }
    };

    // Încărcăm CSS-ul pentru mobile
    const loadMobileCss = async () => {
      try {
        const response = await fetch('/api/cms/custom_css_mobile');
        if (response.ok) {
          const content = await response.json();
          if (content && content.value) {
            // Injectăm CSS-ul pentru mobile în pagină
            const styleElement = document.createElement('style');
            styleElement.id = 'custom-mobile-css';
            styleElement.textContent = `@media (max-width: 768px) { ${content.value} }`;
            document.head.appendChild(styleElement);
            setMobileCssLoaded(true);
          }
        } else {
          console.log('Nu există CSS pentru mobile personalizat.');
        }
      } catch (error) {
        console.error('Eroare la încărcarea CSS-ului pentru mobile:', error);
      }
    };

    // Eliminăm stilurile existente pentru a evita duplicate la reîncărcare
    const existingGlobalStyle = document.getElementById('custom-global-css');
    if (existingGlobalStyle) {
      existingGlobalStyle.remove();
    }

    const existingMobileStyle = document.getElementById('custom-mobile-css');
    if (existingMobileStyle) {
      existingMobileStyle.remove();
    }

    loadGlobalCss();
    loadMobileCss();

    // La dezmontarea componentei, curățăm stilurile
    return () => {
      const globalStyle = document.getElementById('custom-global-css');
      if (globalStyle) {
        globalStyle.remove();
      }

      const mobileStyle = document.getElementById('custom-mobile-css');
      if (mobileStyle) {
        mobileStyle.remove();
      }
    };
  }, []);

  // Componenta nu render-ează nimic vizibil
  return null;
}