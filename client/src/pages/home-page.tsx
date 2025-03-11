import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import EditablePage from "./EditablePage";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SectionEditor, Section } from '@/components/inline-editor/SectionEditor';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isLoading, setIsLoading] = useState(true);
  
  // Încercăm să verificăm dacă există deja o pagină home în baza de date
  const { 
    data: pageData,
    isLoading: isLoadingPage,
    error
  } = useQuery({
    queryKey: ['/api/pages/type/home'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/pages/type/home');
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Error fetching homepage:', error);
        if (error instanceof Response && error.status === 404) {
          return null;
        }
        throw error;
      }
    }
  });

  // Mutație pentru crearea paginii home dacă nu există
  const createHomePage = useMutation({
    mutationFn: async () => {
      console.log("Creating type page:", {
        title: "Home",
        slug: "home",
        pageType: "home",
        content: JSON.stringify({ sections: createDefaultSections() }),
        isPublished: true
      });
      
      return apiRequest('POST', '/api/pages', {
        title: "Home",
        slug: "home",
        pageType: "home",
        content: JSON.stringify({ sections: createDefaultSections() }),
        isPublished: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Pagină creată",
        description: "Pagina de start a fost creată cu succes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages/type/home'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut crea pagina: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error creating page:", error);
    }
  });

  // Crează secțiunile implicite pentru pagina de start
  function createDefaultSections(): Section[] {
    return [
      {
        id: `section-${uuidv4()}`,
        type: 'hero',
        content: {
          title: 'Descoperă locuri sfinte',
          subtitle: 'Pelerinaje la cele mai frumoase mănăstiri și locuri sfinte din lume',
          backgroundImage: '/assets/hero-bg.jpg',
          height: 500
        },
        styles: {}
      },
      {
        id: `section-${uuidv4()}`,
        type: 'banners',
        content: {
          title: 'Pelerinaje promovate',
          subtitle: 'Călătorii spirituale organizate cu grijă pentru o experiență de neuitat',
          displayType: 'carousel',
          banners: [
            { 
              image: '/uploads/cms-1741550181915-677863924.jpg', 
              title: 'Pelerinaj în Israel', 
              description: 'Vizitați locurile sfinte', 
              linkUrl: '/pilgrimages' 
            },
            { 
              image: '/uploads/cms-1741552217090-810192220.JPG', 
              title: 'Muntele Athos', 
              description: 'O experiență spirituală unică', 
              linkUrl: '/pilgrimages' 
            },
            { 
              image: '/uploads/cms-1741552801504-427566340.JPG', 
              title: 'Mănăstirile din Moldova', 
              description: 'Descoperă frumusețea ortodoxă', 
              linkUrl: '/pilgrimages' 
            }
          ]
        },
        styles: {}
      },
      {
        id: `section-${uuidv4()}`,
        type: 'features',
        content: {
          title: 'De ce să alegi Doxa',
          features: [
            { title: 'Experiență autentică', text: 'Ghizi specializați cu cunoștințe profunde despre locurile vizitate', icon: '🛣️' },
            { title: 'Siguranță', text: 'Călătorii organizate cu grijă pentru siguranța și confortul dumneavoastră', icon: '🛡️' },
            { title: 'Comunitate', text: 'Întâlniți oameni cu aceleași valori și interese spirituale', icon: '🤝' }
          ]
        },
        styles: {}
      },
      {
        id: `section-${uuidv4()}`,
        type: 'cta',
        content: {
          title: 'Pregătit pentru o călătorie spirituală?',
          subtitle: 'Rezervă acum și beneficiază de ofertele noastre speciale pentru pelerinaje',
          buttonText: 'Descoperă pelerinaje',
          buttonUrl: '/pilgrimages',
          backgroundColor: '#f8f9fa',
          textColor: '#343a40'
        },
        styles: {}
      }
    ];
  }

  // Verifică dacă trebuie să creăm o pagină nouă
  useEffect(() => {
    if (!isLoadingPage && !pageData && !error && isAdmin) {
      createHomePage.mutate();
    }
    
    if (!isLoadingPage) {
      setIsLoading(false);
    }
  }, [isLoadingPage, pageData, isAdmin, error]);

  // Afișează loading în timp ce verificăm dacă pagina există
  if (isLoading || isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Pagina de start cu secțiuni editabile
  return <EditablePage pageType="home" />;
}
