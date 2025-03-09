import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { CmsContent } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Context pentru datele CMS
const CmsContentContext = createContext<{
  cmsData: Record<string, string>;
  isLoading: boolean;
  isError: boolean;
  refreshCmsData: () => Promise<void>;
}>({
  cmsData: {},
  isLoading: true,
  isError: false,
  refreshCmsData: async () => {}
});

export function CmsContentProvider({ children }: { children: ReactNode }) {
  const [cmsData, setCmsData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  // Funcție pentru încărcarea datelor CMS
  const fetchCmsData = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/cms');
      const data = await response.json() as CmsContent[];
      
      // Transformă array-ul în obiect pentru acces mai ușor prin cheie
      const dataObject: Record<string, string> = {};
      data.forEach(item => {
        dataObject[item.key] = item.value;
      });
      
      setCmsData(dataObject);
      setIsError(false);
    } catch (error) {
      console.error('Error fetching CMS data:', error);
      setIsError(true);
      toast({
        title: 'Eroare la încărcarea conținutului',
        description: 'Nu s-a putut încărca conținutul CMS. Vă rugăm reîncărcați pagina.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Încarcă datele inițial
  useEffect(() => {
    fetchCmsData();
    
    // Setează un interval pentru a reîncărca datele periodic
    const intervalId = setInterval(() => {
      fetchCmsData();
    }, 5000); // Verifică la fiecare 5 secunde
    
    return () => clearInterval(intervalId);
  }, []);

  // Permite reîmprospătarea manuală a datelor
  const refreshCmsData = async () => {
    await fetchCmsData();
  };

  return (
    <CmsContentContext.Provider value={{ cmsData, isLoading, isError, refreshCmsData }}>
      {children}
    </CmsContentContext.Provider>
  );
}

// Hook pentru utilizarea conținutului CMS
export function useCmsContent() {
  const context = useContext(CmsContentContext);
  
  if (!context) {
    throw new Error('useCmsContent trebuie utilizat în interiorul unui CmsContentProvider');
  }
  
  return context;
}

// Componentă care afișează conținut din CMS
interface CmsTextProps {
  contentKey: string;
  fallback?: string;
  className?: string;
}

export function CmsText({ contentKey, fallback = '', className = '' }: CmsTextProps) {
  const { cmsData, isLoading } = useCmsContent();
  
  if (isLoading) {
    return <span className={className}>{fallback}</span>;
  }
  
  return <span className={className}>{cmsData[contentKey] || fallback}</span>;
}

// Componentă care afișează HTML din CMS
interface CmsHtmlProps {
  contentKey: string;
  fallback?: string;
  className?: string;
}

export function CmsHtml({ contentKey, fallback = '', className = '' }: CmsHtmlProps) {
  const { cmsData, isLoading } = useCmsContent();
  
  if (isLoading) {
    return <div className={className}>{fallback}</div>;
  }
  
  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: cmsData[contentKey] || fallback }}
    />
  );
}

// Componentă care afișează imagini din CMS
interface CmsImageProps {
  contentKey: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
}

export function CmsImage({ contentKey, fallbackSrc = '', alt = '', className = '' }: CmsImageProps) {
  const { cmsData, isLoading } = useCmsContent();
  
  if (isLoading) {
    return fallbackSrc ? <img src={fallbackSrc} alt={alt} className={className} /> : null;
  }
  
  const src = cmsData[contentKey] || fallbackSrc;
  
  if (!src) {
    return null;
  }
  
  return <img src={src} alt={alt} className={className} />;
}