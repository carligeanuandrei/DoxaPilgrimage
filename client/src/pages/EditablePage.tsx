import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/use-auth";
import { Button } from '@/components/ui/button';
import { PageController } from '@/components/inline-editor/PageController';
import { SectionEditor } from '@/components/inline-editor/SectionEditor';
import { InlineEditable } from '@/components/inline-editor/InlineEditable';

interface EditablePageProps {
  slug?: string;
  pageType?: string;
}

export default function EditablePage({ slug, pageType }: EditablePageProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [pageSections, setPageSections] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Încercăm să obținem pagina după slug dacă există
  const { 
    data: pageData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: slug ? [`/api/pages/slug/${slug}`] : [`/api/pages/type/${pageType}`],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', slug ? `/api/pages/slug/${slug}` : `/api/pages/type/${pageType}`);
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Error fetching page:', error);
        // Dacă este o pagină de tip, am putea crea-o dacă nu există
        if (pageType && error instanceof Response && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    enabled: !!(slug || pageType),
  });

  // Mutație pentru actualizarea paginii
  const updatePageMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!pageData || !pageData.id) throw new Error('Nu există o pagină pentru actualizare');
      return apiRequest('PUT', `/api/pages/${pageData.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Pagină actualizată',
        description: 'Conținutul paginii a fost actualizat cu succes.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/slug/${slug}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/type/${pageType}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare la actualizare',
        description: error.message || 'A apărut o eroare la actualizarea paginii.',
        variant: 'destructive',
      });
    },
  });

  // Creăm o pagină nouă
  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating new page with data:", data);
      return apiRequest('POST', '/api/pages', data);
    },
    onSuccess: (response) => {
      response.json().then(data => {
        toast({
          title: 'Pagină creată',
          description: 'Pagina a fost creată cu succes.',
        });
        console.log("Page created successfully:", data);
        // Actualizăm starea locală fără redirecționare
        queryClient.invalidateQueries({ queryKey: [`/api/pages/slug/${data.slug}`] });
        setPageSections([]);
      });
    },
    onError: (error: Error) => {
      console.error("Error creating page:", error);
      toast({
        title: 'Eroare la creare',
        description: error.message || 'A apărut o eroare la crearea paginii.',
        variant: 'destructive',
      });
    },
  });

  // Inițializăm pagina dacă nu există
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      if (pageData) {
        try {
          // Dacă pagina există, încărcăm secțiunile din JSON
          const content = pageData.content ? JSON.parse(pageData.content) : { sections: [] };
          setPageSections(content.sections || []);
          console.log("Loaded page sections:", content.sections || []);
        } catch (e) {
          console.error('Error parsing page content:', e);
          setPageSections([]);
        }
      } else if (pageType && !slug) {
        // Dacă este o pagină de tip și nu există, o creăm
        const defaultTitle = pageType.charAt(0).toUpperCase() + pageType.slice(1);
        const newPage = {
          title: defaultTitle,
          slug: pageType.toLowerCase(),
          pageType: pageType,
          content: JSON.stringify({ sections: [] }),
          isPublished: true,
        };
        console.log("Creating type page:", newPage);
        createPageMutation.mutate(newPage);
      } else if (slug && !pageData && error) {
        // Dacă încercăm să accesăm o pagină cu slug care nu există, o creăm
        const newPage = {
          title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          slug: slug,
          pageType: 'custom',
          content: JSON.stringify({ sections: [] }),
          isPublished: true,
        };
        console.log("Creating page for unknown slug:", newPage);
        createPageMutation.mutate(newPage);
      }
      setIsInitialized(true);
    }
  }, [pageData, isLoading, pageType, slug, isInitialized, error]);

  // Actualizăm conținutul paginii când se schimbă secțiunile
  const handleSectionsChange = (sections: any[]) => {
    setPageSections(sections);
    
    // Salvăm automat modificările în baza de date
    if (pageData && pageData.id) {
      const updatedContent = JSON.stringify({ sections });
      updatePageMutation.mutate({ content: updatedContent });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verificăm dacă suntem în proces de creare a unei pagini noi
  const isCreatingNewPage = error && slug && !isInitialized;
  
  if (error && !(pageType && !slug) && !isCreatingNewPage) {
    // Verificăm autentificarea ca administrator
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Pagina nu a fost găsită</h1>
        <p className="text-gray-600 mb-6">Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.</p>
        
        {isAdmin && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => {
                // Creăm manual pagina cu slugul curent
                const newPage = {
                  title: slug!.charAt(0).toUpperCase() + slug!.slice(1).replace(/-/g, ' '),
                  slug: slug,
                  pageType: 'custom',
                  content: JSON.stringify({ sections: [] }),
                  isPublished: true,
                };
                createPageMutation.mutate(newPage);
              }}
            >
              Creează această pagină
            </Button>
          </div>
        )}
        
        <Button onClick={() => setLocation('/')}>
          Înapoi la pagina principală
        </Button>
      </div>
    );
  }

  return (
    <div className="editable-page">
      {/* Page Controller pentru administratori */}
      <PageController 
        pageId={pageData?.id}
        pageTitle={pageData?.title}
        pageSlug={pageData?.slug}
        pageType={pageData?.pageType}
        pageContent={pageData?.content}
        isEditable={true}
      />
      
      {/* Editor de secțiuni */}
      <SectionEditor 
        sections={pageSections}
        onChange={handleSectionsChange}
      />
      
      {/* Dacă nu există secțiuni, afișăm un mesaj pentru administratori */}
      {pageSections.length === 0 && (
        <div className="py-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Pagină goală</h2>
          <p className="text-gray-600 mb-6">Această pagină nu are încă conținut. Activați modul de editare pentru a adăuga secțiuni.</p>
        </div>
      )}
    </div>
  );
}