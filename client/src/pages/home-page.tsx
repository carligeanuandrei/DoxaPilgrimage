import HeroSection from "@/components/home/hero-section";
import SearchBox from "@/components/home/search-box";
import FeaturedPilgrimages from "@/components/home/featured-pilgrimages";
import DestinationsSection from "@/components/home/destinations-section";
import PromoBannersSection from "@/components/home/promo-banners-section";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import EditablePage from "./EditablePage";
import { useAuth } from "@/hooks/use-auth";

// Varianta clasică a paginii de acasă ce va fi afișată dacă nu există o versiune editabilă
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [useEditablePage, setUseEditablePage] = useState(false);
  
  // Verifică dacă modul de editare este activat
  useEffect(() => {
    if (isAdmin) {
      const editModeEnabled = localStorage.getItem('editModeEnabled') === 'true';
      if (editModeEnabled) {
        setUseEditablePage(true);
        localStorage.removeItem('editModeEnabled');
      }
    }
  }, [isAdmin]);
  
  // Încercăm să verificăm dacă există deja o pagină home în baza de date
  const { 
    data: pageData, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/pages/type/home'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/pages/type/home');
        if (!res.ok) return null;
        return await res.json();
      } catch (error) {
        console.error('Error fetching home page:', error);
        return null;
      }
    },
    enabled: isAdmin,
  });
  
  // Dacă există deja o pagină home sau suntem în mod de editare, folosim EditablePage
  if ((pageData && pageData.id) || useEditablePage) {
    return <EditablePage pageType="home" />;
  }
  
  // Altfel afișăm conținutul normal
  return <HomePageContent />;
}
