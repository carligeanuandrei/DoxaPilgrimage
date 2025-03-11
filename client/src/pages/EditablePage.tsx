import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Edit, Loader2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/use-auth";
import { Button } from '@/components/ui/button';
import { SectionEditor, Section } from '@/components/inline-editor/SectionEditor';

interface EditablePageProps {
  slug?: string;
  pageType?: string;
}

export default function EditablePage({ slug, pageType }: EditablePageProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [pageSections, setPageSections] = useState<Section[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Verifică dacă modul de editare este activat
  useEffect(() => {
    const editModeEnabled = localStorage.getItem('editModeEnabled') === 'true';
    if (editModeEnabled && isAdmin) {
      setIsEditing(true);
      // Elimină flag-ul după ce l-am citit pentru a nu rămâne permanent în modul de editare
      localStorage.removeItem('editModeEnabled');
    }
  }, [isAdmin]);

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
          // Asigurăm-ne că secțiunile au formatul corect
          const formattedSections = Array.isArray(content.sections) 
            ? content.sections.map((section: any) => ({
                id: section.id || `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: section.type || 'text',
                content: section.content || { text: 'Conținut implicit' },
                styles: section.styles || {}
              }))
            : [];
          
          setPageSections(formattedSections);
          console.log("Loaded page sections:", formattedSections);
        } catch (e) {
          console.error('Error parsing page content:', e);
          setPageSections([]);
        }
      } else if (pageType && !slug && isAdmin) {
        // Dacă suntem admin și este o pagină de tip care nu există, o creăm
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
      } else if (slug && !pageData && error && isAdmin) {
        // Dacă suntem admin și încercăm să accesăm o pagină cu slug care nu există, o creăm
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
  }, [pageData, isLoading, pageType, slug, isInitialized, error, isAdmin]);

  // Actualizăm conținutul paginii când se schimbă secțiunile
  const handleSectionsChange = (sections: Section[]) => {
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
      {/* Afișăm informații despre pagină doar pentru administratori */}
      {isAdmin && pageData && (
        <div className={`p-2 mb-4 text-xs border-b ${isEditing ? "bg-yellow-50 text-yellow-800" : "bg-gray-50 text-gray-500"}`}>
          <div className="container mx-auto flex items-center justify-between">
            <div>
              {isEditing && <span className="font-bold text-sm mr-2 text-yellow-600">MOD EDITARE ACTIV</span>}
              <strong>Pagină:</strong> {pageData.title} | 
              <strong>Slug:</strong> {pageData.slug} | 
              <strong>Tip:</strong> {pageData.pageType}
            </div>
            {pageData.updatedAt && (
              <div>
                {isEditing && (
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline" 
                    size="sm" 
                    className="mr-2 text-xs h-6 py-0 border-yellow-600 text-yellow-600 hover:bg-yellow-100"
                  >
                    Închide modul editare
                  </Button>
                )}
                <strong>Actualizat:</strong> {new Date(pageData.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Indicator mod editare */}
      {isAdmin && isEditing && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white py-2 px-4 rounded-full shadow-lg z-50 flex items-center">
          <Edit className="h-4 w-4 mr-2" />
          Mod editare activ
        </div>
      )}
      
      {/* Editorul de secțiuni nou */}
      <SectionEditor 
        sections={pageSections}
        onChange={handleSectionsChange}
        initialEditMode={isEditing}
      />
    </div>
  );
}