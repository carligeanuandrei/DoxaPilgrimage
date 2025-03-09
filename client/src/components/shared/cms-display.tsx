import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { CmsContent } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pentru folosirea conținutului CMS în orice componentă
 * Acest hook realizează o cerere directă la API și ignoră cache-ul
 */
export function useCmsDirectFetch() {
  const [cmsData, setCmsData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Funcție pentru încărcarea datelor CMS direct de la API
  const fetchCmsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cms', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Eroare la încărcarea datelor CMS: ${response.status}`);
      }
      
      const data = await response.json() as CmsContent[];
      
      // Convertim array-ul în obiect pentru acces ușor prin cheie
      const dataObject: Record<string, string> = {};
      data.forEach(item => {
        dataObject[item.key] = item.value;
      });
      
      setCmsData(dataObject);
      setError(null);
    } catch (err) {
      console.error('Error fetching CMS data:', err);
      setError(err instanceof Error ? err : new Error('Eroare necunoscută'));
      toast({
        title: 'Eroare la încărcarea conținutului',
        description: 'Nu s-a putut încărca conținutul CMS. Vă rugăm reîncărcați pagina.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Încărcăm datele la montarea componentei și setăm polling
  useEffect(() => {
    fetchCmsData();
    
    // Setăm un interval pentru reîncărcarea datelor - foarte important pentru sincronizare
    const intervalId = setInterval(() => {
      fetchCmsData();
    }, 3000); // Verifică la fiecare 3 secunde
    
    return () => clearInterval(intervalId);
  }, []);

  return { 
    cmsData, 
    isLoading, 
    error, 
    refreshCmsData: fetchCmsData 
  };
}

/**
 * Componenta CmsText - afișează text simplu din CMS
 */
interface CmsTextProps {
  contentKey: string;
  fallback?: string;
  className?: string;
  refreshInterval?: number; // interval personalizat în ms
}

export function CmsText({ contentKey, fallback = '', className = '', refreshInterval }: CmsTextProps) {
  const [value, setValue] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cms/${contentKey}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setValue(data.value || fallback);
        } else {
          setValue(fallback);
        }
      } catch (err) {
        console.error(`Error fetching CMS content for ${contentKey}:`, err);
        setValue(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    
    // Dacă este specificat un interval, facem polling
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchContent, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [contentKey, fallback, refreshInterval]);

  if (isLoading) {
    return <span className={className}>{fallback}</span>;
  }

  return <span className={className}>{value}</span>;
}

/**
 * Componenta CmsHtml - afișează conținut HTML din CMS
 */
interface CmsHtmlProps {
  contentKey: string;
  fallback?: string;
  className?: string;
  refreshInterval?: number;
}

export function CmsHtml({ contentKey, fallback = '', className = '', refreshInterval }: CmsHtmlProps) {
  const [value, setValue] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cms/${contentKey}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setValue(data.value || fallback);
        } else {
          setValue(fallback);
        }
      } catch (err) {
        console.error(`Error fetching CMS content for ${contentKey}:`, err);
        setValue(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchContent, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [contentKey, fallback, refreshInterval]);

  if (isLoading) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: fallback }} />;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
}

/**
 * Componenta CmsImage - afișează imagini stocate în CMS
 */
interface CmsImageProps {
  contentKey: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  refreshInterval?: number;
}

export function CmsImage({ contentKey, fallbackSrc = '', alt = '', className = '', refreshInterval }: CmsImageProps) {
  const [src, setSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cms/${contentKey}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSrc(data.value || fallbackSrc);
        } else {
          setSrc(fallbackSrc);
        }
      } catch (err) {
        console.error(`Error fetching CMS content for ${contentKey}:`, err);
        setSrc(fallbackSrc);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchContent, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [contentKey, fallbackSrc, refreshInterval]);

  if (isLoading) {
    return fallbackSrc ? <img src={fallbackSrc} alt={alt} className={className} /> : null;
  }

  if (!src) {
    return null;
  }

  return <img src={src} alt={alt} className={className} />;
}