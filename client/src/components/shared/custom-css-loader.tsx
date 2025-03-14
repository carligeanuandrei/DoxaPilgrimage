import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Component pentru încărcarea și aplicarea CSS-ului personalizat din CMS.
 * Acesta va încărca automat CSS-ul global și cel pentru mobile și le va aplica
 * în pagină folosind tag-uri style.
 */
export default function CustomCssLoader() {
  // Încărcăm CSS-ul global din CMS
  const { data: globalCssData } = useQuery({
    queryKey: ['/api/cms/custom_css_global'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/cms/custom_css_global');
        return response.data;
      } catch (error) {
        // Dacă nu există CSS global, nu afișăm erori - este opțional
        console.debug('CSS Global nedetectat, se ignoră.');
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Încărcăm CSS-ul pentru dispozitive mobile
  const { data: mobileCssData } = useQuery({
    queryKey: ['/api/cms/custom_css_mobile'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/cms/custom_css_mobile');
        return response.data;
      } catch (error) {
        // CSS-ul pentru mobile e opțional, deci nu arătăm erori
        console.debug('CSS Mobile nedetectat, se ignoră.');
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Aplicăm CSS-ul global când este încărcat
  useEffect(() => {
    if (globalCssData && globalCssData.value) {
      // Verificăm dacă există deja un element style pentru CSS global
      let styleElement = document.getElementById('global-custom-css');
      
      // Dacă nu există, îl creăm
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'global-custom-css';
        document.head.appendChild(styleElement);
      }
      
      // Actualizăm conținutul
      styleElement.textContent = globalCssData.value;
    }
  }, [globalCssData]);

  // Aplicăm CSS-ul pentru mobile când este încărcat
  useEffect(() => {
    if (mobileCssData && mobileCssData.value) {
      // Verificăm dacă există deja un element style pentru CSS mobile
      let styleElement = document.getElementById('mobile-custom-css');
      
      // Dacă nu există, îl creăm
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'mobile-custom-css';
        document.head.appendChild(styleElement);
      }
      
      // Actualizăm conținutul
      styleElement.textContent = mobileCssData.value;
    }
  }, [mobileCssData]);

  // Acest component nu renderizează nimic vizibil
  return null;
}