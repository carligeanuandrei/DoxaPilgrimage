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
import HeroSection from "@/components/home/hero-section";
import FeaturedPilgrimages from "@/components/home/featured-pilgrimages";
import DestinationsSection from "@/components/home/destinations-section";
import PromoBannersSection from "@/components/home/promo-banners-section";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";
import { Pilgrimage } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

// Varianta clasică a paginii de acasă, utilizată cât timp nu există pagină editabilă
function HomePageContent() {
  // Obținem pelerinajele promovate (featured)
  const { data: featuredPilgrimages = [] } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages', 'featured'],
    select: (pilgrimages) => pilgrimages.filter(p => p.featured).slice(0, 3)
  });

  return (
    <div>
      <HeroSection />
      
      {featuredPilgrimages.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="bg-amber-50 py-2">
            <FeaturedPilgrimages pilgrimages={featuredPilgrimages} />
          </div>
          <Separator className="my-4" />
        </>
      )}
      
      <DestinationsSection />
      <PromoBannersSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
}

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  
  // Încercăm să verificăm dacă există deja o pagină home în baza de date
  const { 
    data: pageData,
    isLoading: isLoadingPage,
    error
  } = useQuery({
    queryKey: ['/api/pages/type/home'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/pages/type/home');
        if (!res.ok) {
          if (res.status === 404) {
            return null;
          }
          throw new Error('Eroare la încărcarea paginii');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching homepage:', error);
        return null;
      }
    },
    retry: 1
  });

  // Mutație pentru crearea paginii home dacă nu există
  const createHomePage = useMutation({
    mutationFn: async () => {
      const pageData = {
        title: "Home",
        slug: "home",
        pageType: "home",
        content: JSON.stringify({ sections: createDefaultSections() }),
        isPublished: true,
        createdBy: null // Important: acest câmp trebuie să fie null pentru a permite crearea paginii
      };
      
      console.log("Creating home page:", pageData);
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Eroare la crearea paginii');
      }
      
      return response;
    },
    onSuccess: () => {
      // Arătăm toast doar prima dată per sesiune
      const hasShownToast = sessionStorage.getItem('hasShownHomePageToast') === 'true';
      if (!hasShownToast) {
        toast({
          title: "Pagină creată",
          description: "Pagina de start a fost creată cu succes.",
        });
        sessionStorage.setItem('hasShownHomePageToast', 'true');
      }
      
      // Invalidăm query-ul și resetăm starea
      queryClient.invalidateQueries({ queryKey: ['/api/pages/type/home'] });
      setIsCreatingPage(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut crea pagina: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error creating page:", error);
      setIsCreatingPage(false);
      // Ștergem flag-ul pentru a permite încercarea din nou
      localStorage.removeItem('alreadyTriedToCreateHome');
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
    // Încercăm să creăm pagina doar dacă:
    // 1. Datele sunt încărcate
    // 2. Suntem admin
    // 3. Nu există deja pagina
    // 4. Nu suntem deja în proces de creare
    // 5. Nu am încercat deja să creăm pagina
    const alreadyTriedToCreate = localStorage.getItem('alreadyTriedToCreateHome') === 'true';
    
    if (!isLoadingPage && isAdmin && !pageData && !isCreatingPage && !alreadyTriedToCreate) {
      setIsCreatingPage(true);
      localStorage.setItem('alreadyTriedToCreateHome', 'true');
      createHomePage.mutate();
    }
  }, [isLoadingPage, pageData, isAdmin, isCreatingPage]);

  // Afișează loading în timp ce verificăm dacă pagina există
  if (isLoadingPage || createHomePage.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Dacă există pagina editabilă (creată anterior), o folosim
  if (pageData && pageData.id) {
    return <EditablePage pageType="home" />;
  }
  
  // Dacă suntem admin și am încercat să creăm pagina dar nu am reușit, afișăm un buton pentru a încerca din nou
  if (isAdmin && createHomePage.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-red-500">Nu s-a putut crea pagina editabilă</p>
        <Button 
          onClick={() => {
            setIsCreatingPage(true);
            createHomePage.mutate();
          }}
        >
          Încearcă din nou
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reîncarcă pagina
        </Button>
      </div>
    );
  }
  
  // Altfel afișăm conținutul normal
  return <HomePageContent />;
}
