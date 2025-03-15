import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CmsContent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Tipul pentru datele CMS
type CmsData = {
  [key: string]: string;
};

// Context pentru datele CMS
type CmsContextType = {
  cmsData: CmsData;
  isLoading: boolean;
  error: Error | null;
  refreshCmsContent: () => Promise<void>;
};

const CmsContext = createContext<CmsContextType | null>(null);

// Provider pentru conținutul CMS - asigură că datele sunt disponibile în întreaga aplicație
export function CmsContentProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cmsData, setCmsData] = useState<CmsData>({});
  
  // Query pentru a prelua tot conținutul CMS
  const { data, isLoading, error, refetch } = useQuery<CmsContent[]>({
    queryKey: ["/api/cms"],
    refetchInterval: 2000, // Reîmprospătăm automat la fiecare 2 secunde
    refetchOnWindowFocus: true,
    staleTime: 1000, // Marcăm datele ca fiind expirate după 1 secundă
  });
  
  // Transformăm array-ul de conținut CMS într-un obiect cu key->value pentru acces ușor
  useEffect(() => {
    if (data) {
      const formattedData: CmsData = {};
      data.forEach((item) => {
        formattedData[item.key] = item.value;
      });
      setCmsData(formattedData);
    }
  }, [data]);
  
  // Funcție pentru reîmprospătarea manuală a conținutului
  const refreshCmsContent = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/cms"] });
      await refetch();
    } catch (err) {
      toast({
        title: "Eroare la reîmprospătarea conținutului",
        description: "Nu s-a putut actualiza conținutul CMS.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <CmsContext.Provider
      value={{
        cmsData,
        isLoading,
        error: error instanceof Error ? error : null,
        refreshCmsContent,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

// Hook custom pentru utilizarea conținutului CMS în orice componentă
export function useCmsContent() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCmsContent must be used within a CmsContentProvider");
  }
  return context;
}

// Componente pentru diferite tipuri de conținut CMS
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

interface CmsHtmlProps {
  contentKey: string;
  fallback?: string;
  className?: string;
}

export function CmsHtml({ contentKey, fallback = '', className = '' }: CmsHtmlProps) {
  const { cmsData, isLoading } = useCmsContent();
  
  if (isLoading) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: fallback }} />;
  }
  
  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: cmsData[contentKey] || fallback }} 
    />
  );
}

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